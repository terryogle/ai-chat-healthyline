<script setup lang="ts">
import { ref, computed } from 'vue';
import { CATALOG_PRODUCTS, PRODUCT_SERIES_LIST, type Product } from '../data/products';

const emit = defineEmits<{
  (e: 'askQuestion', text: string): void;
}>();

const selectedSeries = ref<string>('All');
const searchQuery = ref<string>('');

const filteredProducts = computed(() => {
  return CATALOG_PRODUCTS.filter((product) => {
    const matchesSeries =
      selectedSeries.value === 'All' ||
      product.category.toLowerCase().trim() === selectedSeries.value.toLowerCase().trim() ||
      product.category.toLowerCase().includes(selectedSeries.value.toLowerCase());

    const q = searchQuery.value.toLowerCase().trim();
    const tagsStr = Array.isArray(product.search_tags) 
      ? product.search_tags.join(' ') 
      : (product.search_tags || '');

    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.short_description.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      tagsStr.toLowerCase().includes(q);

    return matchesSeries && matchesQuery;
  });
});

function handleAskQuestion(product: Product) {
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
        <h3>HealthyLine Catalog</h3>
        <span class="catalog-count">{{ filteredProducts.length }} items</span>
      </div>

      <!-- Search Input -->
      <div class="catalog-search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search catalog or models..." 
        />
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">&times;</button>
      </div>

      <!-- Series Filter Tags -->
      <div class="series-pills">
        <button
          v-for="series in PRODUCT_SERIES_LIST"
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
      <div v-if="filteredProducts.length === 0" class="catalog-empty">
        <p>No products found in this series.</p>
        <button class="reset-filter-btn" @click="selectedSeries = 'All'; searchQuery = ''">Show All Products</button>
      </div>

      <div
        v-for="product in filteredProducts"
        :key="product.product_id"
        class="product-card"
      >
        <div class="product-image-wrapper">
          <img :src="product.image" :alt="product.name" loading="lazy" />
          <span class="product-category-badge">{{ product.category }}</span>
        </div>

        <div class="product-info">
          <h4 class="product-title">{{ product.name }}</h4>
          <p class="product-desc">{{ product.short_description }}</p>

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
  gap: 10px;
  background: #ffffff;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #eef1f4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .catalog-title-group {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #212b36;
    }

    .catalog-count {
      font-size: 12px;
      color: #637381;
      background: #f4f6f8;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
  }

  .catalog-search {
    position: relative;
    display: flex;
    align-items: center;

    svg {
      position: absolute;
      left: 10px;
      color: #919eab;
    }

    input {
      width: 100%;
      padding: 8px 30px 8px 32px;
      border-radius: 8px;
      border: 1px solid #e0e6ed;
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: #3b626b;
        box-shadow: 0 0 0 3px rgba(59, 98, 107, 0.12);
      }
    }

    .clear-search {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      font-size: 16px;
      color: #919eab;
      cursor: pointer;
    }
  }

  .series-pills {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe4;
      border-radius: 4px;
    }

    .series-pill {
      white-space: nowrap;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #e5e8eb;
      background: #f8fafc;
      color: #454f5b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #eef2f5;
      }

      &.active {
        background: #3b626b;
        color: #ffffff;
        border-color: #3b626b;
        box-shadow: 0 2px 6px rgba(59, 98, 107, 0.25);
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
    height: 150px;
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
      transform: scale(1.04);
    }

    .product-category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(33, 43, 54, 0.82);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      color: #1a202c;
      line-height: 1.3;
    }

    .product-desc {
      margin: 0;
      font-size: 12px;
      color: #4a5568;
      line-height: 1.4;
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
