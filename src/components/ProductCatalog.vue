<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useOptions } from '../composables/useOptions';
import { getCatalog } from '../utils/api';
import { CATALOG_PRODUCTS, PRODUCT_SERIES_LIST } from '../data/products';
import type { CatalogProduct } from '../types';

const emit = defineEmits<{
  (e: 'askQuestion', text: string): void;
  (e: 'compareSeries', seriesName: string): void;
}>();

const options = useOptions();

const products = ref<CatalogProduct[]>([]);
const categoryList = ref<string[]>(['All']);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

const selectedSeries = ref<string>('All');

function onSelectSeries(series: string) {
  selectedSeries.value = series;
}

async function loadCatalog() {
  isLoading.value = true;
  loadError.value = null;

  try {
    if (options.value) {
      const res = await getCatalog(options.value);
      if (res && res.items && res.items.length > 0) {
        products.value = res.items;
        categoryList.value = ['All', ...(res.categories || [])];
        isLoading.value = false;
        return;
      }
    }
  } catch (err) {
    console.warn('API catalog fetch failed, loading local verified bestseller catalog:', err);
  }

  // Graceful fallback to verified products
  products.value = CATALOG_PRODUCTS.map(p => ({
    id: p.product_id,
    name: p.name,
    category: p.category,
    description: p.short_description,
    image: p.image,
    link: p.link,
  }));
  categoryList.value = [...PRODUCT_SERIES_LIST];
  isLoading.value = false;
}

onMounted(() => {
  loadCatalog();
});

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    return (
      selectedSeries.value === 'All' ||
      product.category.toLowerCase().trim() === selectedSeries.value.toLowerCase().trim()
    );
  });
});

function handleAskQuestion(product: CatalogProduct) {
  emit('askQuestion', `Can you tell me more about ${product.name}?`);
}

function openProductPage(url: string) {
  if (url) {
    window.open(url, '_blank', 'noopener');
  }
}
</script>

<template>
  <div class="product-catalog">
    <!-- Header Spotlight -->
    <div class="catalog-header">
      <div class="catalog-title-group">
        <div class="title-with-badge">
          <div class="title-icon-star">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
            </svg>
          </div>
          <div>
            <h3>Best Sellers</h3>
            <p class="catalog-header-sub">Which Series is Right for You?</p>
          </div>
        </div>
        <div class="catalog-header-actions">
          <button 
            class="catalog-compare-btn" 
            @click="emit('compareSeries', selectedSeries !== 'All' ? selectedSeries : 'TAJ Series')"
            title="Open Series Comparison Matrix"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M16 3h5v5"/>
              <path d="M4 20L21 3"/>
              <path d="M21 16v5h-5"/>
              <path d="M15 15l6 6"/>
              <path d="M4 4l5 5"/>
            </svg>
            <span>Compare Series</span>
          </button>
        </div>
      </div>

      <!-- Series Filter Buttons Group -->
      <div class="series-button-group">
        <button
          v-for="series in categoryList"
          :key="series"
          class="series-filter-btn"
          :class="{ active: selectedSeries === series }"
          @click="onSelectSeries(series)"
        >
          {{ series }}
        </button>
      </div>
    </div>

    <!-- Product Cards List (Pinterest Grid) -->
    <div class="catalog-grid">
      <div v-if="isLoading" class="catalog-empty">
        <div class="loading-spinner"></div>
        <p>Loading best sellers...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="catalog-empty">
        <p>No products found matching your filter.</p>
        <button class="reset-filter-btn" @click="selectedSeries = 'All'">Show All Products</button>
      </div>

      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
      >
        <div class="product-image-wrapper">
          <img :src="product.image" :alt="product.name" loading="lazy" />
          <span class="product-category-badge">{{ product.category }}</span>
          <span class="product-bestseller-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
            </svg>
            Top Rated
          </span>
        </div>

        <div class="product-info">
          <h4 class="product-title">{{ product.name }}</h4>
          <p class="product-desc">{{ product.description }}</p>

          <!-- Action Buttons -->
          <div class="product-actions">
            <button
              class="btn-ask-question"
              @click="handleAskQuestion(product)"
              title="Ask AI Assistant about this product"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Ask AI</span>
            </button>


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-catalog {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.catalog-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

  .catalog-title-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 10px;

      .title-icon-star {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #fef3c7;
        border: 1px solid #fde68a;
        color: #d97706;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      h3 {
        margin: 0;
        font-size: 16.5px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.2px;
      }

      .catalog-header-sub {
        margin: 1px 0 0;
        font-size: 12px;
        color: #64748b;
        line-height: 1.2;
      }
    }

    .catalog-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;

      .catalog-compare-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #1a3b3d;
        color: #ffffff;
        border: none;
        padding: 4px 9px;
        border-radius: 14px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        svg {
          color: #d4af37;
        }

        &:hover {
          background: #275659;
        }
      }

      .catalog-count {
        font-size: 12px;
        color: #1a3b3d;
        background: #eef7f8;
        border: 1px solid #d4ebed;
        padding: 3px 8px;
        border-radius: 14px;
        font-weight: 700;
        white-space: nowrap;
      }
    }
  }

  .series-button-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
    width: 100%;

    .series-filter-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      line-height: 1.3;
      white-space: nowrap;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #0f172a;
      }

      &.active {
        background: #1a3b3d;
        color: #ffffff;
        border-color: #1a3b3d;
        box-shadow: 0 2px 6px rgba(26, 59, 61, 0.22);
      }
    }
  }
}

.catalog-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.catalog-empty {
  text-align: center;
  padding: 36px 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;

  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e8f0;
    border-top-color: #1a3b3d;
    border-radius: 50%;
    margin: 0 auto 12px;
    animation: spin 0.8s linear infinite;
  }

  p {
    margin: 0 0 12px;
    color: #64748b;
    font-size: 14px;
  }

  .reset-filter-btn {
    background: #1a3b3d;
    color: #fff;
    border: none;
    padding: 8px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #255457;
    }
  }
}

.product-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e8ecf1;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    border-color: #cbd5e1;
  }

  .product-image-wrapper {
    position: relative;
    width: 100%;
    height: 165px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transition: transform 0.35s ease;
    }

    &:hover img {
      transform: scale(1.06);
    }

    .product-category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(8px);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-bestseller-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      letter-spacing: 0.3px;
    }
  }

  .product-info {
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .product-title {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }

    .product-desc {
      margin: 0;
      font-size: 12.5px;
      color: #475569;
      line-height: 1.45;
    }

    .product-actions {
      display: flex;
      gap: 8px;
      margin-top: 6px;

      button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 9px 12px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-ask-question {
        background: #1a3b3d;
        color: #ffffff;
        border: 1px solid #1a3b3d;
        width: 100%;
        padding: 12px 16px;
        min-height: 42px;

        &:hover {
          background: #255457;
          border-color: #255457;
        }
      }


    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
