<script lang="ts">
// Shared by every appearance of the block on the page: once the visitor has moved
// the slider by hand, it does not slide by itself again until the page is reloaded.
let visitorTookOver = false;
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDeals } from '../composables/useDeals';
import { useOptions } from '../composables/useOptions';
import { hasDiscount, mainPrice } from '../utils/deals';
import type { Deal } from '../utils/deals';
import DealImage from './DealImage.vue';

/**
 * Home block: the latest daily drop as a slider of compact, numbered cards
 * (picture on the left, name, description and price on the right) with dots
 * under it. The slider moves by itself until the visitor moves it by hand.
 * Every text, price, picture and link is taken from the Google Sheet.
 */
const emit = defineEmits<{
  (e: 'showAll'): void;
}>();

const { featuredDeals, groups, newTodayCount, title, endLabel } = useDeals();
const options = useOptions();

const trackRef = ref<HTMLElement | null>(null);
const canScrollPrev = ref(false);
const canScrollNext = ref(false);

const slideCount = computed(() => featuredDeals.value.length);
// Changes only when the cards themselves change (not on every re-read of the sheet)
const slideKey = computed(() => featuredDeals.value.map((deal) => deal.id).join('|'));
/** Card nearest to the left edge. */
const activeIndex = ref(0);
/** Card a smooth scroll is heading to (so the dots and arrows answer at once). */
const targetIndex = ref<number | null>(null);
const shownIndex = computed(() => targetIndex.value ?? activeIndex.value);

/** Pause between two automatic slides (option `dealsAutoSlideSeconds`, default 4; 0 = off). */
const autoSlideMs = computed(() => {
  const seconds = Number(options.value?.dealsAutoSlideSeconds ?? 4);
  return Number.isFinite(seconds) && seconds > 0 ? Math.max(2, seconds) * 1000 : 0;
});

let slideTimer: number | undefined;
let settleTimer: number | undefined;
let hovered = false;
let touchX = 0;
let touchY = 0;

const headerNote = computed(() => {
  const parts: string[] = [];
  if (newTodayCount.value > 0) parts.push('New today');
  if (endLabel.value) parts.push(`${parts.length > 0 ? 'ends' : 'Ends'} ${endLabel.value}`);
  return parts.join(' · ');
});

// The picture area is drawn only when at least one of these deals has an image in the sheet
const hasImages = computed(() => featuredDeals.value.some((deal) => !!deal.image));

const totalDeals = computed(() => groups.value.reduce((sum, group) => sum + group.deals.length, 0));
const showAllLabel = computed(() =>
  totalDeals.value > featuredDeals.value.length ? 'Show more deals' : 'View all deals',
);

function priceLabel(deal: Deal): string {
  const price = mainPrice(deal);
  if (!price) return '';
  return hasDiscount(deal) ? `Sale price ${price}, regular price ${deal.regularPrice}` : `Price ${price}`;
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cardElements(): HTMLElement[] {
  return trackRef.value ? Array.from(trackRef.value.querySelectorAll<HTMLElement>('.tt-deal-card')) : [];
}

/** Reads the scroll position: which arrows are needed and which card is shown. */
function updatePosition() {
  const track = trackRef.value;
  const cards = cardElements();
  if (!track || cards.length === 0) {
    canScrollPrev.value = false;
    canScrollNext.value = false;
    activeIndex.value = 0;
    return;
  }
  canScrollPrev.value = track.scrollLeft > 4;
  canScrollNext.value = track.scrollLeft + track.clientWidth < track.scrollWidth - 4;

  let nearest = 0;
  if (!canScrollNext.value) {
    // the last card cannot reach the left edge: the end of the row is the last card
    nearest = canScrollPrev.value ? cards.length - 1 : 0;
  } else {
    let smallest = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
  }
  activeIndex.value = nearest;
}

/** A smooth scroll has arrived when no scroll event came for a moment. */
function armSettle(delay: number) {
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    targetIndex.value = null;
  }, delay);
}

function onScroll() {
  updatePosition();
  armSettle(160);
}

function goTo(index: number) {
  const track = trackRef.value;
  const cards = cardElements();
  if (!track || cards.length === 0) return;
  const next = Math.min(Math.max(index, 0), cards.length - 1);
  targetIndex.value = next;
  // only the row itself is scrolled (never the chat or the page)
  track.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' });
  armSettle(500);
}

function stopAuto() {
  window.clearInterval(slideTimer);
  slideTimer = undefined;
}

/** Slides by itself, last card -> first card, until the visitor takes over. */
function startAuto() {
  stopAuto();
  if (visitorTookOver || hovered || autoSlideMs.value === 0 || slideCount.value < 2 || reducedMotion()) return;
  slideTimer = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    goTo((shownIndex.value + 1) % slideCount.value);
  }, autoSlideMs.value);
}

/** The visitor moved the slider (arrow, dot, sideways swipe): from now on it only moves by hand. */
function takeOver() {
  visitorTookOver = true;
  stopAuto();
}

/** Sideways scrolling with a trackpad or a wheel. */
function onWheel(event: WheelEvent) {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) takeOver();
}

/** A finger is on the slider: nothing moves under it. */
function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  touchX = touch.clientX;
  touchY = touch.clientY;
  stopAuto();
}

/** A sideways swipe takes the slider over; scrolling the chat up or down does not. */
function onTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  const sideways = Math.abs(touch.clientX - touchX);
  if (sideways > 10 && sideways > Math.abs(touch.clientY - touchY)) takeOver();
}

/** Keyboard users: nothing moves once the focus is inside the slider. */
function onFocusIn(event: FocusEvent) {
  try {
    if (event.target instanceof Element && event.target.matches(':focus-visible')) takeOver();
  } catch {
    takeOver();
  }
}

/** The mouse rests on the block: wait, so that the card does not run away. */
function onPointerHover(event: PointerEvent, value: boolean) {
  if (event.pointerType !== 'mouse') return;
  hovered = value;
  if (value) stopAuto();
  else startAuto();
}

function step(direction: 1 | -1) {
  takeOver();
  goTo(shownIndex.value + direction);
}

function pick(index: number) {
  takeOver();
  goTo(index);
}

watch(slideKey, () => {
  nextTick(() => {
    if (trackRef.value) trackRef.value.scrollLeft = 0;
    targetIndex.value = null;
    updatePosition();
    startAuto();
  });
});

watch(autoSlideMs, startAuto);

onMounted(() => {
  nextTick(() => {
    updatePosition();
    startAuto();
  });
  window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePosition);
  window.clearTimeout(settleTimer);
  stopAuto();
});
</script>

<template>
  <section
    v-if="featuredDeals.length > 0"
    class="tt-deals-home"
    :aria-label="title"
    @pointerenter="onPointerHover($event, true)"
    @pointerleave="onPointerHover($event, false)"
  >
    <div class="tt-deals-home-head">
      <span class="tt-deals-home-title">
        <span class="tt-deals-home-dot" aria-hidden="true"></span>
        {{ title }}
      </span>
      <span v-if="headerNote" class="tt-deals-home-note">{{ headerNote }}</span>
    </div>

    <div
      class="tt-deals-home-slider"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.passive="startAuto"
      @touchcancel.passive="startAuto"
      @wheel.passive="onWheel"
      @focusin="onFocusIn"
    >
    <div class="tt-deals-home-carousel">
      <div
        ref="trackRef"
        class="tt-deals-home-track"
        :class="{ 'is-single': slideCount === 1 }"
        @scroll.passive="onScroll"
      >
        <article
          v-for="(deal, index) in featuredDeals"
          :key="deal.id"
          class="tt-deal-card"
          :class="{ 'is-link': !!deal.link }"
        >
          <!-- picture on the left, name / description / price on the right -->
          <div class="tt-deal-card-main">
            <DealImage v-if="hasImages" class="tt-deal-card-image" :src="deal.image" :width="240" />
            <!-- number of the slide: on the corner of the picture, or before the text -->
            <span
              v-if="slideCount > 1"
              class="tt-deal-card-num"
              :class="{ 'is-inline': !hasImages }"
              aria-hidden="true"
            >{{ index + 1 }}</span>

            <div class="tt-deal-card-body">
              <div class="tt-deal-card-title">{{ deal.name }}</div>
              <div v-if="deal.description" class="tt-deal-card-desc">{{ deal.description }}</div>

              <div v-if="mainPrice(deal)" class="tt-deal-card-prices" role="group" :aria-label="priceLabel(deal)">
                <span class="tt-deal-price" aria-hidden="true">{{ mainPrice(deal) }}</span>
                <span v-if="hasDiscount(deal)" class="tt-deal-old-price" aria-hidden="true">{{ deal.regularPrice }}</span>
              </div>
            </div>
          </div>

          <!-- The link from the sheet ("Frontend" column). Its ::after covers the
               whole card, so a click anywhere on the card opens the deal. -->
          <a
            v-if="deal.link"
            class="tt-deal-card-cta"
            :href="deal.link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`View Deal: ${deal.name}`"
          >
            <span>View Deal</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </article>
      </div>

      <button
        v-if="canScrollPrev"
        type="button"
        class="tt-deals-home-arrow is-prev"
        aria-label="Previous deal"
        @click="step(-1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        v-if="canScrollNext"
        type="button"
        class="tt-deals-home-arrow is-next"
        aria-label="Next deal"
        @click="step(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- one dot per slide; the long one is the slide on screen -->
    <div v-if="slideCount > 1" class="tt-deals-home-pager">
      <button
        v-for="(deal, index) in featuredDeals"
        :key="deal.id"
        type="button"
        class="tt-deals-home-page"
        :class="{ 'is-active': index === shownIndex }"
        :aria-label="`Show deal ${index + 1} of ${slideCount}`"
        :aria-current="index === shownIndex ? 'true' : undefined"
        @click="pick(index)"
      ></button>
    </div>
    </div>

    <button type="button" class="tt-deals-home-more" @click="emit('showAll')">
      <span>{{ showAllLabel }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  </section>
</template>

<style lang="scss">
$deal-accent: #7b1f25;
$deal-accent-dark: #641920;

.tt-deals-home {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  text-align: left;

  .tt-deals-home-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 0 2px;
  }

  .tt-deals-home-title {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: $deal-accent;
  }

  .tt-deals-home-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $deal-accent;
    box-shadow: 0 0 0 0 rgba(123, 31, 37, 0.55);
    flex-shrink: 0;
    animation: ttDealsHomePulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .tt-deals-home-note {
    flex-shrink: 0;
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1.3;
    color: #64748b;
    white-space: nowrap;
  }

  .tt-deals-home-slider {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .tt-deals-home-carousel {
    position: relative;
    min-width: 0;
  }

  .tt-deals-home-track {
    display: flex;
    align-items: stretch;
    gap: 10px;
    margin: 0 -16px;
    padding: 2px 16px 6px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 16px;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tt-deal-card {
    /* the "View Deal" link stretches over the whole card (see ::after below) */
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 0 0 88%;
    min-width: 0;
    margin: 0;
    padding: 12px;
    background: #ffffff;
    border: 1px solid #e8ecf1;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    box-sizing: border-box;
    scroll-snap-align: start;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &.is-link:hover {
      border-color: #e3c9cb;
      box-shadow: 0 4px 14px rgba(123, 31, 37, 0.08);
    }
  }

  .tt-deals-home-track.is-single .tt-deal-card {
    flex-basis: 100%;
  }

  /* grows so that the button sits at the bottom of every card */
  .tt-deal-card-main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .tt-deal-card-image {
    width: 96px;
    height: 96px;
    border-radius: 12px;
  }

  /* number of the slide, on the top left corner of the picture */
  .tt-deal-card-num {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    margin: 0;
    padding: 0 3px;
    background: $deal-accent;
    border: 2px solid #ffffff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
    box-sizing: border-box;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    pointer-events: none;

    /* cards without pictures: the number stands before the text */
    &.is-inline {
      position: static;
      flex-shrink: 0;
      margin: -1px -2px 0 0;
      border-width: 0;
      box-shadow: none;
    }
  }

  .tt-deal-card-body {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
  }

  .tt-deal-card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.15px;
    color: #0f172a;
    overflow-wrap: anywhere;
  }

  .tt-deal-card-desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    margin: 3px 0 0;
    font-size: 12.5px;
    font-weight: 400;
    line-height: 1.4;
    color: #475569;
    overflow-wrap: anywhere;
  }

  .tt-deal-card-prices {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px 8px;
    margin: 6px 0 0;
  }

  .tt-deal-price {
    font-size: 16px;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.2px;
    color: $deal-accent;
    white-space: nowrap;
  }

  .tt-deal-old-price {
    font-size: 12.5px;
    font-weight: 500;
    line-height: 1.25;
    color: #94a3b8;
    text-decoration: line-through;
    white-space: nowrap;
  }

  .tt-deal-card-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    margin: 10px 0 0;
    padding: 8px 14px;
    background: $deal-accent;
    border: none;
    border-radius: 11px;
    box-sizing: border-box;
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s ease;

    /* the whole card is the link */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: 16px;
    }

    &:hover {
      background: $deal-accent-dark;
      color: #ffffff;
      text-decoration: none;
    }

    &:focus-visible {
      outline: 2px solid $deal-accent;
      outline-offset: 2px;
    }

    svg {
      flex-shrink: 0;
    }
  }

  .tt-deals-home-arrow {
    position: absolute;
    /* vertical centre of the cards (the track has 2px / 6px of padding) */
    top: calc(50% - 2px);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    margin: 0;
    padding: 0;
    transform: translateY(-50%);
    background: $deal-accent;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.22);
    color: #ffffff;
    cursor: pointer;
    transition: background 0.15s ease;

    &.is-prev {
      left: -8px;
    }

    &.is-next {
      right: -8px;
    }

    &:hover {
      background: $deal-accent-dark;
    }

    &:focus-visible {
      outline: 2px solid $deal-accent;
      outline-offset: 2px;
    }
  }

  /* dots under the slider */
  .tt-deals-home-pager {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 0 0 -4px;
    padding: 0;
  }

  .tt-deals-home-page {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    border-radius: 6px;
    box-shadow: none;
    appearance: none;
    cursor: pointer;

    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: #b0868a;
      transition: width 0.25s ease, background 0.25s ease;
    }

    &:hover::before {
      background: #96666b;
    }

    &.is-active::before {
      width: 18px;
      background: $deal-accent;
    }

    &:focus-visible {
      outline: 2px solid $deal-accent;
      outline-offset: -2px;
    }
  }

  .tt-deals-home-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    margin: 0;
    padding: 9px 14px;
    background: #ffffff;
    border: 1px solid #e3c9cb;
    border-radius: 12px;
    box-sizing: border-box;
    color: $deal-accent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
      background: #fbf4f4;
      border-color: #d1a9ac;
    }

    &:focus-visible {
      outline: 2px solid $deal-accent;
      outline-offset: 2px;
    }

    svg {
      flex-shrink: 0;
    }
  }
}

@keyframes ttDealsHomePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(123, 31, 37, 0.55);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(123, 31, 37, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(123, 31, 37, 0);
  }
}

/* Phones: a little more room for the text */
@media (max-width: 430px) {
  .tt-deals-home {
    .tt-deal-card {
      flex-basis: 90%;
      padding: 10px;
    }

    .tt-deal-card-main {
      gap: 10px;
    }

    .tt-deal-card-image {
      width: 80px;
      height: 80px;
      border-radius: 10px;
    }
  }
}

/* Narrow phones: a smaller picture, so that the description is not cut */
@media (max-width: 360px) {
  .tt-deals-home {
    .tt-deal-card {
      flex-basis: 92%;
    }

    .tt-deal-card-image {
      width: 64px;
      height: 64px;
    }

    .tt-deal-card-desc {
      -webkit-line-clamp: 4;
      line-clamp: 4;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-deals-home .tt-deals-home-dot {
    animation: none;
  }

  .tt-deals-home .tt-deals-home-page::before {
    transition: none;
  }
}
</style>
