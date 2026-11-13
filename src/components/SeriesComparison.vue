<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  HEALTHYLINE_SERIES, 
  SPEC_DEFINITIONS, 
  type SeriesSpecItem, 
  type SpecDefinition 
} from '../data/seriesComparison';

const props = defineProps<{
  initialSeriesIdA?: string;
  initialSeriesIdB?: string;
}>();

const emit = defineEmits<{
  (e: 'askQuestion', query: string): void;
  (e: 'selectCatalogSeries', seriesName: string): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const isScrolled = ref(false);
let scrollContainer: HTMLElement | null = null;

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  if (target) {
    isScrolled.value = target.scrollTop > 35;
  }
}

onMounted(() => {
  if (rootRef.value) {
    scrollContainer = rootRef.value.closest('.tt-chat-body');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
  }
});

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});

// Selected series for Side-by-Side comparison (2 models)
const selectedIdA = ref<string>(props.initialSeriesIdA || 'jet');
const selectedIdB = ref<string>(props.initialSeriesIdB || '');

watch(() => props.initialSeriesIdA, (newVal) => {
  if (newVal) selectedIdA.value = newVal;
});
watch(() => props.initialSeriesIdB, (newVal) => {
  if (newVal !== undefined) selectedIdB.value = newVal;
});

// Active info tooltip popup
const activeTooltip = ref<SpecDefinition | null>(null);

const seriesA = computed(() => HEALTHYLINE_SERIES.find(s => s.id === selectedIdA.value) || HEALTHYLINE_SERIES[0]);
const seriesB = computed(() => selectedIdB.value ? (HEALTHYLINE_SERIES.find(s => s.id === selectedIdB.value) || null) : null);

const coreSpecs = computed(() => SPEC_DEFINITIONS.filter(s => s.category === 'core'));
const pemfSpecs = computed(() => SPEC_DEFINITIONS.filter(s => s.category === 'pemf'));
const physicalSpecs = computed(() => SPEC_DEFINITIONS.filter(s => s.category === 'physical'));

function handleAskAbout(series: SeriesSpecItem) {
  emit('askQuestion', `Can you explain the key benefits and health applications of the ${series.name}?`);
}

function openExternal(url: string) {
  if (url) {
    window.open(url, '_blank', 'noopener');
  }
}

function showSpecInfo(def: SpecDefinition) {
  activeTooltip.value = def;
}

function closeSpecInfo() {
  activeTooltip.value = null;
}
</script>

<template>
  <div ref="rootRef" class="series-comparison-container" :class="{ 'has-scrolled': isScrolled }">
    <!-- STICKY TOP COMPARISON BAR (Header + Series Pickers) -->
    <div class="sticky-comparison-bar" :class="{ 'is-scrolled': isScrolled }">
      <!-- Header & Controls Bar -->
      <div class="comparison-header">
        <div class="comparison-title-row">
          <div class="title-with-icon">
            <div class="compare-icon-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3h5v5"/>
                <path d="M4 20L21 3"/>
                <path d="M21 16v5h-5"/>
                <path d="M15 15l6 6"/>
                <path d="M4 4l5 5"/>
              </svg>
            </div>
            <div>
              <h3 class="compare-title">Compare HealthyLine Series</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Choose Series Selector Bar -->
      <div class="sticky-models-panel">
        <!-- Series Model Selector Cards -->
        <div class="models-header-grid">
          <!-- Series A -->
          <div class="model-picker-card">
            <!-- Synced Image Preview for Series A -->
            <div class="model-image-preview">
              <img :src="seriesA.image" :alt="seriesA.name" class="model-thumb-img" />
            </div>
            <div class="model-select-wrapper">
              <select v-model="selectedIdA" class="series-select-input" aria-label="Choose Series A">
                <option v-for="item in HEALTHYLINE_SERIES" :key="'a-' + item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- VS Divider Badge -->
          <div class="vs-badge" :class="{ 'is-active': !!seriesB }">VS</div>

          <!-- Series B (Highlighted when unselected) -->
          <div 
            class="model-picker-card series-b-picker" 
            :class="{ 'needs-selection-highlight': !seriesB, 'is-selected': !!seriesB }"
          >
            <!-- Synced Image Preview for Series B (or placeholder when not selected) -->
            <div class="model-image-preview" :class="{ 'is-empty': !seriesB }">
              <img v-if="seriesB" :src="seriesB.image" :alt="seriesB.name" class="model-thumb-img" />
              <div v-else class="model-thumb-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Select 2nd Series</span>
              </div>
            </div>
            <div class="model-select-wrapper">
              <select 
                v-model="selectedIdB" 
                class="series-select-input" 
                :class="{ 'placeholder-selected': !selectedIdB }"
                aria-label="Choose Series B"
              >
                <option value="" disabled selected>— Choose 2nd Series —</option>
                <option v-for="item in HEALTHYLINE_SERIES" :key="'b-' + item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN VIEW: Comparison Specs Table drops down when 2nd series is chosen -->
    <transition name="specs-dropdown">
      <div v-if="seriesB" key="full-comparison" class="split-comparison-view">

        <!-- Comparison Rows List -->
        <div class="comparison-specs-list">
          
          <!-- Category 1: Core Energy Therapies & Light -->
          <div class="spec-section-divider">
            <span>Core Technologies &amp; Light</span>
          </div>

          <template v-for="spec in coreSpecs" :key="spec.key">
            <div class="spec-comparison-row">
              <!-- Spec Label with Info Icon -->
              <div class="spec-label-col" @click="showSpecInfo(spec)">
                <div class="label-text-box">
                  <strong>{{ spec.label }}</strong>
                  <button class="info-bubble-btn" title="Learn more about this therapy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Value Columns -->
              <div class="spec-values-grid">
                <!-- Series A Value -->
                <div class="spec-val-cell" :class="{ positive: seriesA.specs[spec.key] === true }">
                  <template v-if="typeof seriesA.specs[spec.key] === 'boolean'">
                    <span v-if="seriesA.specs[spec.key]" class="val-check">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Yes
                    </span>
                    <span v-else class="val-cross">✕ No</span>
                  </template>
                </div>

                <!-- Series B Value -->
                <div class="spec-val-cell" :class="{ positive: seriesB.specs[spec.key] === true }">
                  <template v-if="typeof seriesB.specs[spec.key] === 'boolean'">
                    <span v-if="seriesB.specs[spec.key]" class="val-check">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Yes
                    </span>
                    <span v-else class="val-cross">✕ No</span>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <!-- Category 2: PEMF Biohacking Specifications -->
          <div class="spec-section-divider">
            <span>PEMF Biohacking Specifications</span>
          </div>

          <template v-for="spec in pemfSpecs" :key="spec.key">
            <div class="spec-comparison-row">
              <!-- Spec Label with Info Icon -->
              <div class="spec-label-col" @click="showSpecInfo(spec)">
                <div class="label-text-box">
                  <strong>{{ spec.label }}</strong>
                  <button class="info-bubble-btn" title="Learn more about this therapy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Value Columns -->
              <div class="spec-values-grid">
                <!-- Series A Value -->
                <div class="spec-val-cell" :class="{ positive: !!seriesA.specs[spec.key] }">
                  <span v-if="seriesA.specs[spec.key]" class="val-string" :class="{ highlight: spec.key === 'pemfMaxIntensity' || spec.key === 'pemfWaveType' }">
                    {{ seriesA.specs[spec.key] }}
                  </span>
                  <span v-else class="val-cross">✕ None</span>
                </div>

                <!-- Series B Value -->
                <div class="spec-val-cell" :class="{ positive: !!seriesB.specs[spec.key] }">
                  <span v-if="seriesB.specs[spec.key]" class="val-string" :class="{ highlight: spec.key === 'pemfMaxIntensity' || spec.key === 'pemfWaveType' }">
                    {{ seriesB.specs[spec.key] }}
                  </span>
                  <span v-else class="val-cross">✕ None</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Category 3: Physical Build & Flexibility -->
          <div class="spec-section-divider">
            <span>Mat Flexibility</span>
          </div>

          <template v-for="spec in physicalSpecs" :key="spec.key">
            <div class="spec-comparison-row">
              <!-- Spec Label with Info Icon -->
              <div class="spec-label-col" @click="showSpecInfo(spec)">
                <div class="label-text-box">
                  <strong>{{ spec.label }}</strong>
                  <button class="info-bubble-btn" title="Learn more about this feature">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Value Columns -->
              <div class="spec-values-grid">
                <!-- Series A Value -->
                <div class="spec-val-cell">
                  <span class="val-string">{{ seriesA.specs[spec.key] }}</span>
                </div>

                <!-- Series B Value -->
                <div class="spec-val-cell">
                  <span class="val-string">{{ seriesB.specs[spec.key] }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Action Cards for Compared Series -->
        <div class="action-footer-grid">
          <div class="series-card-action">
            <button class="ask-btn" @click="handleAskAbout(seriesA)">
              <span class="sparkle">✦</span> Ask about {{ seriesA.shortName }}
            </button>
          </div>

          <div class="series-card-action">
            <button class="ask-btn" @click="handleAskAbout(seriesB)">
              <span class="sparkle">✦</span> Ask about {{ seriesB.shortName }}
            </button>
          </div>
        </div>

      </div>
    </transition>

    <!-- SPEC INFO MODAL / POPUP -->
    <transition name="fade">
      <div v-if="activeTooltip" class="spec-info-backdrop" @click="closeSpecInfo">
        <div class="spec-info-card" @click.stop>
          <div class="info-card-header">
            <div class="info-title-group">
              <span class="info-tag">Therapy Guide</span>
              <h4>{{ activeTooltip.label }}</h4>
            </div>
            <button class="close-info-btn" @click="closeSpecInfo">✕</button>
          </div>
          <div class="info-card-body">
            <p>{{ activeTooltip.description }}</p>
          </div>
          <div class="info-card-footer">
            <button class="info-action-btn" @click="emit('askQuestion', `Can you explain how ${activeTooltip.label} works in HealthyLine mats and its benefits?`); closeSpecInfo();">
              <span class="sparkle">✦</span> Ask AI about this therapy
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style lang="scss">
.series-comparison-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  background: #f8fafc;
  color: #1e293b;
  font-family: var(--tt-chat-font-family);
  padding-bottom: 24px;
  position: relative;
}

.sticky-comparison-bar {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  transition: box-shadow 0.3s ease;

  &.is-scrolled {
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);

    .comparison-header {
      padding: 8px 14px 4px;

      .compare-icon-badge {
        width: 26px;
        height: 26px;

        svg {
          width: 15px;
          height: 15px;
        }
      }

      .compare-title {
        font-size: 13.5px;
      }
    }

    .sticky-models-panel {
      padding: 2px 12px 8px;
    }

    .model-picker-card {
      padding: 4px 6px;

      .model-image-preview {
        height: 0 !important;
        min-height: 0 !important;
        margin-bottom: 0 !important;
        padding: 0 !important;
        opacity: 0 !important;
        border-width: 0 !important;
        border-color: transparent !important;
        pointer-events: none;
        visibility: hidden;
      }
    }
  }
}

.comparison-header {
  background: #ffffff;
  padding: 12px 14px 8px;
  transition: padding 0.25s ease;

  .comparison-title-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;

      .compare-icon-badge {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: linear-gradient(135deg, #1a3b3d 0%, #29575a 100%);
        color: #d4af37;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(26, 59, 61, 0.2);
      }

      .compare-title {
        font-size: 14.5px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        line-height: 1.2;
      }

      .compare-subtitle {
        font-size: 11px;
        color: #64748b;
        margin: 2px 0 0;
        line-height: 1.2;
      }
    }
  }
}

.sticky-models-panel {
  padding: 0 12px 10px;
  background: #ffffff;

  .models-selector-instruction {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 2px 8px;
    font-size: 11.5px;
    font-weight: 700;
    color: #475569;

    .instruction-icon {
      color: #059669;
      font-size: 12px;
    }

    .instruction-text {
      letter-spacing: 0.2px;
    }
  }
}

.models-header-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 8px;
  margin-bottom: 0;

  .model-picker-card {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 6px 7px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    &:hover {
      border-color: #cbd5e1;
      background: #ffffff;
    }

    .model-image-preview {
      width: 100%;
      height: 125px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 8px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  margin-bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.25s ease,
                  padding 0.35s ease,
                  border-width 0.25s ease,
                  visibility 0.35s ease;
      will-change: height, opacity, margin-bottom;

      .model-thumb-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        padding: 4px;
        transition: transform 0.25s ease;
      }

      &:hover .model-thumb-img {
        transform: scale(1.05);
      }

      &.is-empty {
        background: #fffbeb;
        border: 1.5px dashed #fcd34d;
      }

      .model-thumb-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #d97706;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        padding: 8px;

        svg {
          width: 30px;
          height: 30px;
          opacity: 0.8;
        }
      }
    }

    .model-select-wrapper {
      display: flex;
      flex-direction: column;

      .series-select-input {
        width: 100%;
        padding: 6px 7px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        color: #0f172a;
        cursor: pointer;
        outline: none;
        transition: all 0.15s ease;

        &.placeholder-selected {
          color: #94a3b8;
          font-weight: 600;
        }

        &:focus {
          border-color: #1a3b3d;
          box-shadow: 0 0 0 2px rgba(26, 59, 61, 0.12);
        }
      }
    }

    /* 2nd Series Selector Highlighted State */
    &.needs-selection-highlight {
      background: #fffbeb;
      border: 1.5px solid #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18), 0 2px 8px rgba(245, 158, 11, 0.15);
      animation: pulseAttention 2s infinite cubic-bezier(0.4, 0, 0.6, 1);

      .series-select-input {
        border-color: #f59e0b;
        background: #ffffff;
        color: #b45309;
        font-weight: 700;

        &:focus {
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
        }
      }
    }
  }

  .vs-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5px;
    font-weight: 800;
    color: #64748b;
    align-self: center;
    transition: all 0.2s ease;

    &.is-active {
      background: #1a3b3d;
      color: #ffffff;
      border-color: #1a3b3d;
    }
  }
}

/* SPLIT COMPARISON VIEW */
.split-comparison-view {
  padding: 12px 14px;
}

.comparison-specs-list {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  overflow: hidden;

  .spec-section-divider {
    background: #f1f5f9;
    padding: 7px 14px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #475569;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;

    &:first-child {
      border-top: none;
    }
  }

  .spec-comparison-row {
    display: flex;
    flex-direction: column;
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s ease;

    &:last-child {
      border-bottom: none;
    }

    &.is-diff {
      background: #fafcff;
    }

    .spec-label-col {
      cursor: pointer;
      margin-bottom: 6px;

      .label-text-box {
        display: inline-flex;
        align-items: center;
        gap: 6px;

        strong {
          font-size: 12px;
          color: #334155;
          font-weight: 600;
        }

        .info-bubble-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;

          &:hover {
            color: #1a3b3d;
          }
        }
      }
    }

    .spec-values-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .spec-val-cell {
        background: #f8fafc;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        display: flex;
        align-items: center;
        min-height: 32px;

        &.positive {
          background: #f0fdf4;
          border-color: #dcfce7;
        }

        .val-check {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #15803d;
          font-weight: 700;

          svg {
            color: #16a34a;
          }
        }

        .val-cross {
          color: #94a3b8;
          font-weight: 500;
        }

        .val-string {
          color: #1e293b;
          font-weight: 600;

          &.highlight {
            color: #0369a1;
            font-weight: 700;
          }
        }

        &.text-left-cell {
          align-items: flex-start;
          padding: 8px 10px;

          .gemstone-text {
            font-size: 11px;
            color: #334155;
            line-height: 1.35;
          }

          .best-for-text {
            font-size: 11px;
            color: #0f172a;
            line-height: 1.35;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.action-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;

  .series-card-action {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .ask-btn {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #1a3b3d;
      background: #1a3b3d;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s ease;

      .sparkle {
        color: #d4af37;
      }

      &:hover {
        background: #254e51;
      }
    }
  }
}

/* SPEC INFO MODAL */
.spec-info-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  .spec-info-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 360px;
    overflow: hidden;
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    .info-card-header {
      padding: 16px 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      .info-title-group {
        .info-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        h4 {
          margin: 6px 0 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
      }

      .close-info-btn {
        border: none;
        background: #f1f5f9;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;

        &:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
      }
    }

    .info-card-body {
      padding: 14px 16px;

      p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: #475569;
      }
    }

    .info-card-footer {
      padding: 12px 16px 16px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;

      .info-action-btn {
        width: 100%;
        padding: 9px;
        border-radius: 8px;
        border: 1px solid #1a3b3d;
        background: #1a3b3d;
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        .sparkle {
          color: #d4af37;
        }

        &:hover {
          background: #254e51;
        }
      }
    }
  }
}

@keyframes pulseAttention {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2), 0 2px 8px rgba(245, 158, 11, 0.15);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.35), 0 4px 12px rgba(245, 158, 11, 0.25);
  }
}

.specs-dropdown-enter-active,
.specs-dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.specs-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.specs-dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
