<script setup lang="ts">
import { computed } from 'vue';
import { useDeals } from '../composables/useDeals';

/**
 * Slim sale banner at the top of the Deals tab: the sale title and its last day.
 * The title comes from the widget options, the date from the Google Sheet.
 */
const { title, endLabel } = useDeals();

const label = computed(() => (endLabel.value ? `${title.value}, ends ${endLabel.value}` : title.value));
</script>

<template>
  <div class="tt-deals-banner" role="note" :aria-label="label">
    <span class="tt-deals-banner-dot" aria-hidden="true"></span>
    <span class="tt-deals-banner-title" aria-hidden="true">{{ title }}</span>
    <span v-if="endLabel" class="tt-deals-banner-end" aria-hidden="true">Ends {{ endLabel }}</span>
  </div>
</template>

<style lang="scss">
.tt-deals-banner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  min-height: 36px;
  margin: 0;
  padding: 7px 14px;
  box-sizing: border-box;
  background: linear-gradient(100deg, #641920 0%, #7b1f25 45%, #9b2a32 100%);
  color: #ffffff;
  text-align: left;

  .tt-deals-banner-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
    animation: ttDealsBannerPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .tt-deals-banner-title {
    min-width: 0;
    overflow: hidden;
    font-size: 12.5px;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: 1px;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .tt-deals-banner-end {
    flex-shrink: 0;
    margin-left: auto;
    padding: 3px 10px;
    background: #ffffff;
    border-radius: 999px;
    color: #7b1f25;
    font-size: 10.5px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    white-space: nowrap;
  }
}

@keyframes ttDealsBannerPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-deals-banner .tt-deals-banner-dot {
    animation: none;
  }
}
</style>
