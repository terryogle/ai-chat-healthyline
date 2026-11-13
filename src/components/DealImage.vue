<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { sizedImageUrl } from '../utils/deals';

/**
 * Deal picture taken from the sheet's "Image" column.
 * While that cell is empty (or the picture fails to load) a neutral tag icon
 * is shown instead, so the layout stays the same and nothing is made up.
 */
const props = defineProps<{
  /** Image URL exactly as written in the sheet (may be empty). */
  src: string;
  /** Alternative text; leave empty when the deal name is printed next to it. */
  alt?: string;
  /** Rendition width requested from the CDN, in pixels. */
  width: number;
}>();

// 0 = resized rendition, 1 = original URL, 2 = could not be loaded
const stage = ref(0);

watch(
  () => props.src,
  () => {
    stage.value = 0;
  },
);

const resizedSrc = computed(() => sizedImageUrl(props.src, props.width));

const currentSrc = computed(() => {
  if (!props.src || stage.value >= 2) return '';
  return stage.value === 0 ? resizedSrc.value : props.src;
});

function handleError() {
  stage.value = stage.value === 0 && resizedSrc.value !== props.src ? 1 : 2;
}
</script>

<template>
  <span class="tt-deal-image" :class="{ 'is-empty': !currentSrc }">
    <img
      v-if="currentSrc"
      :src="currentSrc"
      :alt="alt || ''"
      loading="lazy"
      decoding="async"
      draggable="false"
      @error="handleError"
    />
    <svg
      v-else
      class="tt-deal-image-placeholder"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  </span>
</template>

<style lang="scss">
.tt-deal-image {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #eef1f5;
  box-sizing: border-box;
  flex-shrink: 0;

  img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    object-fit: contain;
  }

  &.is-empty {
    background: #faf5f5;
    border-color: #f1e4e5;
    color: rgba(123, 31, 37, 0.38);
  }

  .tt-deal-image-placeholder {
    width: 42%;
    height: 42%;
    max-width: 44px;
    max-height: 44px;
    min-width: 18px;
    min-height: 18px;
  }
}
</style>
