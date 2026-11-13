<script setup lang="ts">
import { useDeals } from '../composables/useDeals';
import { hasDiscount, mainPrice } from '../utils/deals';
import type { Deal } from '../utils/deals';
import DealImage from './DealImage.vue';

/**
 * Deals tab: every live deal from the Google Sheet, grouped by launch day
 * (newest day first). Texts, prices, pictures and links come from the sheet.
 */
const { groups, status, refresh } = useDeals();

function linkAttrs(deal: Deal): Record<string, string> {
  return deal.link ? { href: deal.link, target: '_blank', rel: 'noopener noreferrer' } : {};
}

function priceLabel(deal: Deal): string {
  const price = mainPrice(deal);
  if (!price) return '';
  return hasDiscount(deal) ? `Sale price ${price}, regular price ${deal.regularPrice}` : `Price ${price}`;
}
</script>

<template>
  <div class="tt-deals">
    <template v-if="groups.length > 0">
      <section v-for="group in groups" :key="group.date" class="tt-deals-group">
        <div class="tt-deals-date" role="heading" aria-level="3">{{ group.label }}</div>

        <component
          :is="deal.link ? 'a' : 'div'"
          v-for="deal in group.deals"
          :key="deal.id"
          class="tt-deal-row"
          :class="{ 'is-link': !!deal.link }"
          v-bind="linkAttrs(deal)"
        >
          <DealImage class="tt-deal-row-thumb" :src="deal.image" :width="160" />

          <span class="tt-deal-row-text">
            <span class="tt-deal-row-title">{{ deal.name }}</span>
            <span v-if="deal.description" class="tt-deal-row-desc">{{ deal.description }}</span>
          </span>

          <span v-if="mainPrice(deal)" class="tt-deal-row-prices" role="group" :aria-label="priceLabel(deal)">
            <span class="tt-deal-price" aria-hidden="true">{{ mainPrice(deal) }}</span>
            <span v-if="hasDiscount(deal)" class="tt-deal-old-price" aria-hidden="true">{{ deal.regularPrice }}</span>
          </span>
        </component>
      </section>
    </template>

    <div v-else-if="status === 'error'" class="tt-deals-state" role="status">
      <p>Deals can't be loaded right now.</p>
      <button type="button" class="tt-deals-retry" @click="refresh(true)">Try again</button>
    </div>

    <div v-else-if="status === 'ready'" class="tt-deals-state" role="status">
      <p>No deals are live right now.</p>
    </div>

    <div v-else class="tt-deals-state" role="status">
      <span class="tt-deals-spinner" aria-hidden="true"></span>
      <p>Loading deals…</p>
    </div>
  </div>
</template>

<style lang="scss">
$deal-accent: #7b1f25;
$deal-accent-dark: #641920;

.tt-deals {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  text-align: left;

  .tt-deals-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
  }

  .tt-deals-date {
    margin: 0;
    padding: 0 2px;
    font-size: 11.5px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #8a97ab;
  }

  .tt-deal-row {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    margin: 0;
    padding: 9px 12px 9px 9px;
    background: #ffffff;
    border: 1px solid #e8ecf1;
    border-radius: 14px;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
    box-sizing: border-box;
    color: #0f172a;
    font-family: inherit;
    text-align: left;
    text-decoration: none;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;

    &.is-link {
      cursor: pointer;

      &:hover {
        transform: translateY(-1px);
        border-color: #dcc3c5;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.07);
        text-decoration: none;
      }

      &:active {
        transform: translateY(0);
      }

      &:focus-visible {
        outline: 2px solid $deal-accent;
        outline-offset: 2px;
      }
    }
  }

  .tt-deal-row-thumb {
    width: 46px;
    height: 46px;
    border-radius: 9px;
  }

  .tt-deal-row-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .tt-deal-row-title {
    font-size: 13.5px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.1px;
    color: #0f172a;
    overflow-wrap: anywhere;
  }

  .tt-deal-row-desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    color: #475569;
    overflow-wrap: anywhere;
  }

  .tt-deal-row-prices {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    flex-shrink: 0;
    max-width: 38%;
    text-align: right;
  }

  .tt-deal-price {
    font-size: 14.5px;
    font-weight: 800;
    line-height: 1.25;
    color: $deal-accent;
    white-space: nowrap;
  }

  .tt-deal-old-price {
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1.25;
    color: #94a3b8;
    text-decoration: line-through;
    white-space: nowrap;
  }

  .tt-deals-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 36px 16px;
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    text-align: center;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: #64748b;
    }
  }

  .tt-deals-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e8f0;
    border-top-color: $deal-accent;
    border-radius: 50%;
    animation: tt-deals-spin 0.8s linear infinite;
  }

  .tt-deals-retry {
    padding: 8px 18px;
    background: $deal-accent;
    border: none;
    border-radius: 10px;
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: $deal-accent-dark;
    }
  }
}

@keyframes tt-deals-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
