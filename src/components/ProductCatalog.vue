<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
const expandedIds = ref<Set<string>>(new Set());

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
}

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
            <p class="catalog-header-sub">Featured HealthyLine Therapy Mats</p>
          </div>
        </div>
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
          
          <div class="desc-wrapper">
            <p 
              class="product-desc" 
              :class="{ 'is-collapsed': !expandedIds.has(product.id) && (product.description?.length || 0) > 220 }"
            >
              {{ product.description }}
            </p>
            <button 
              v-if="(product.description?.length || 0) > 220"
              class="btn-toggle-desc" 
              @click="toggleExpand(product.id)"
            >
              {{ expandedIds.has(product.id) ? 'Show less ▲' : 'Read full description ▼' }}
            </button>
          </div>

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

            <button
              v-if="product.link"
              class="btn-view-product"
              @click="openProductPage(product.link)"
              title="View product details on HealthyLine"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>View Mat</span>
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
    height: 175px;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      max-width: 92%;
      max-height: 92%;
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

    .desc-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-desc {
      margin: 0;
      font-size: 12.5px;
      color: #475569;
      line-height: 1.5;

      &.is-collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .btn-toggle-desc {
      background: none;
      border: none;
      padding: 0;
      font-size: 11.5px;
      font-weight: 600;
      color: #1a3b3d;
      cursor: pointer;
      text-align: left;
      margin-top: 2px;
      align-self: flex-start;

      &:hover {
        text-decoration: underline;
        color: #255457;
      }
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
        padding: 10px 14px;
        min-height: 40px;

        &:hover {
          background: #255457;
          border-color: #255457;
        }
      }

      .btn-view-product {
        background: #f8fafc;
        color: #1e293b;
        border: 1px solid #cbd5e1;
        padding: 10px 14px;
        min-height: 40px;

        &:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
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
