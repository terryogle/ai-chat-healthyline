<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useOptions } from '../composables/useOptions';
import { getCatalog } from '../utils/api';
import type { CatalogProduct } from '../types';

const emit = defineEmits<{
  (e: 'askQuestion', text: string): void;
}>();

const options = useOptions();

const products = ref<CatalogProduct[]>([]);
const categoryList = ref<string[]>(['All']);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

const selectedSeries = ref<string>('All');

async function loadCatalog() {
  isLoading.value = true;
  loadError.value = null;

  if (!options.value) {
    loadError.value = 'Chat options are not available yet.';
    isLoading.value = false;
    return;
  }

  try {
    const res = await getCatalog(options.value);
    products.value = res.items || [];
    categoryList.value = ['All', ...(res.categories || [])];
  } catch (err) {
    console.error('Failed to load catalog:', err);
    loadError.value = 'Could not load best sellers. Please try again later.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCatalog);

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSeries =
      selectedSeries.value === 'All' ||
      product.category.toLowerCase().trim() === selectedSeries.value.toLowerCase().trim();

    return matchesSeries;
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
            <p class="catalog-header-sub">Top customer favorites &amp; wellness mats</p>
          </div>
        </div>
        <span class="catalog-count">{{ filteredProducts.length }} items</span>
      </div>

      <!-- Series Filter Tags (built dynamically from the sheet) -->
      <div class="series-pills">
        <button
          v-for="series in categoryList"
          :key="series"
          class="series-pill"
          :class="{ active: selectedSeries === series }"
          @click="selectedSeries = series"
        >
          {{ series }}
        </button>
      </div>
    </div>

    <!-- Product Cards List -->
    <div class="catalog-grid">
      <div v-if="isLoading" class="catalog-empty">
        <p>Loading best sellers...</p>
      </div>

      <div v-else-if="loadError" class="catalog-empty">
        <p>{{ loadError }}</p>
        <button class="reset-filter-btn" @click="loadCatalog">Try Again</button>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="catalog-empty">
        <p>No products found in this series.</p>
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
            Best Seller
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
              title="Ask AI Assistant about this item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Ask AI</span>
            </button>

            <button
              class="btn-product-details"
              @click="openProductPage(product.link)"
              title="Open product page in new tab"
            >
              <span>View Product</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
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
  gap: 12px;
  width: 100%;
}

.catalog-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #eef1f4;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

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
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #fef9c3;
        border: 1px solid #fef08a;
        color: #ca8a04;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      h3 {
        margin: 0;
        font-size: 17px;
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

    .catalog-count {
      font-size: 12px;
      color: #3b626b;
      background: #eef7f8;
      border: 1px solid #d4ebed;
      padding: 3px 10px;
      border-radius: 14px;
      font-weight: 700;
      white-space: nowrap;
    }
  }

  .series-pills {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 0 6px;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 6px;
    }

    .series-pill {
      white-space: nowrap;
      padding: 9px 16px;
      border-radius: 24px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      &.active {
        background: #3b626b;
        color: #ffffff;
        border-color: #3b626b;
        box-shadow: 0 3px 8px rgba(59, 98, 107, 0.28);
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
  padding: 30px 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;

  p {
    margin: 0 0 10px;
    color: #64748b;
    font-size: 14px;
  }

  .reset-filter-btn {
    background: #3b626b;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
}

.product-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #eef1f5;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.09);
    border-color: #d1dadf;
  }

  .product-image-wrapper {
    position: relative;
    width: 100%;
    height: 155px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .product-category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-bestseller-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      letter-spacing: 0.3px;
    }
  }

  .product-info {
    padding: 14px;
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
      font-size: 12px;
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
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-ask-question {
        background: #f1f5f9;
        color: #1e293b;
        border: 1px solid #cbd5e1;

        &:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }
      }

      .btn-product-details {
        background: #3b626b;
        color: #ffffff;
        border: 1px solid #3b626b;

        &:hover {
          background: #2f4f56;
          border-color: #2f4f56;
        }
      }
    }
  }
}
</style>
