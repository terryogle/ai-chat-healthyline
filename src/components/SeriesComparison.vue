<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

onMounted(() => {
  if (rootRef.value) {
    const parentScroll = rootRef.value.closest('.tt-chat-body');
    if (parentScroll) {
      parentScroll.scrollTop = 0;
    }
  }
});

// Selected series for Side-by-Side comparison (2 models)
const selectedIdA = ref<string>(props.initialSeriesIdA || 'taj');
const selectedIdB = ref<string>(props.initialSeriesIdB || 'platinum');

// Active info tooltip popup
const activeTooltip = ref<SpecDefinition | null>(null);

const seriesA = computed(() => HEALTHYLINE_SERIES.find(s => s.id === selectedIdA.value) || HEALTHYLINE_SERIES[3]);
const seriesB = computed(() => HEALTHYLINE_SERIES.find(s => s.id === selectedIdB.value) || HEALTHYLINE_SERIES[2]);

const visibleSpecs = computed(() => SPEC_DEFINITIONS);

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
  <div ref="rootRef" class="series-comparison-container">
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
            <p class="compare-subtitle">Tailor a mat to your unique wellness routine.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- SIDE-BY-SIDE SPLIT COMPARISON (2 Models Side-by-Side) -->
    <div class="split-comparison-view">
      
      <!-- Series Model Selector Cards -->
      <div class="models-header-grid">
        <!-- Series A -->
        <div class="model-picker-card">
          <div class="model-select-wrapper">
            <select v-model="selectedIdA" class="series-select-input">
              <option v-for="item in HEALTHYLINE_SERIES" :key="'a-' + item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- VS Divider Badge -->
        <div class="vs-badge">VS</div>

        <!-- Series B -->
        <div class="model-picker-card">
          <div class="model-select-wrapper">
            <select v-model="selectedIdB" class="series-select-input">
              <option v-for="item in HEALTHYLINE_SERIES" :key="'b-' + item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Comparison Rows List -->
      <div class="comparison-specs-list">
        
        <!-- Category: Core Energy Therapies -->
        <div class="spec-section-divider">
          <span>Core Technologies &amp; Light</span>
        </div>

        <template v-for="spec in visibleSpecs" :key="spec.key">
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
                <!-- Boolean spec -->
                <template v-if="typeof seriesA.specs[spec.key] === 'boolean'">
                  <span v-if="seriesA.specs[spec.key]" class="val-check">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Yes
                  </span>
                  <span v-else class="val-cross">✕ No</span>
                </template>

                <!-- String or Null spec -->
                <template v-else>
                  <span v-if="seriesA.specs[spec.key]" class="val-string" :class="{ highlight: spec.key === 'pemfMaxIntensity' || spec.key === 'pemfWaveType' }">
                    {{ seriesA.specs[spec.key] }}
                  </span>
                  <span v-else class="val-cross">✕ None</span>
                </template>
              </div>

              <!-- Series B Value -->
              <div class="spec-val-cell" :class="{ positive: seriesB.specs[spec.key] === true }">
                <!-- Boolean spec -->
                <template v-if="typeof seriesB.specs[spec.key] === 'boolean'">
                  <span v-if="seriesB.specs[spec.key]" class="val-check">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Yes
                  </span>
                  <span v-else class="val-cross">✕ No</span>
                </template>

                <!-- String or Null spec -->
                <template v-else>
                  <span v-if="seriesB.specs[spec.key]" class="val-string" :class="{ highlight: spec.key === 'pemfMaxIntensity' || spec.key === 'pemfWaveType' }">
                    {{ seriesB.specs[spec.key] }}
                  </span>
                  <span v-else class="val-cross">✕ None</span>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- Gemstones Summary Block -->
        <div class="spec-section-divider">
          <span>Gemstones</span>
        </div>

        <div class="spec-comparison-row is-diff">
          <div class="spec-label-col">
            <div class="label-text-box">
              <strong>Natural Gemstones</strong>
            </div>
          </div>
          <div class="spec-values-grid">
            <div class="spec-val-cell text-left-cell">
              <span class="gemstone-text">{{ seriesA.gemstones }}</span>
            </div>
            <div class="spec-val-cell text-left-cell">
              <span class="gemstone-text">{{ seriesB.gemstones }}</span>
            </div>
          </div>
        </div>
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
  height: 100%;
  width: 100%;
  background: #f8fafc;
  color: #1e293b;
  font-family: var(--tt-chat-font-family);
  overflow-y: auto;
  padding-bottom: 24px;

  /* Custom subtle scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
}

.comparison-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 16px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

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
        width: 34px;
        height: 34px;
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
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        line-height: 1.2;
      }

      .compare-subtitle {
        font-size: 11.5px;
        color: #64748b;
        margin: 2px 0 0;
        line-height: 1.2;
      }
    }
  }
}

/* SPLIT COMPARISON VIEW */
.split-comparison-view {
  padding: 12px 14px;
}

.models-header-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .model-picker-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 9px 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);

    .model-select-wrapper {
      display: flex;
      flex-direction: column;

      .series-select-input {
        width: 100%;
        padding: 7px 8px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #f8fafc;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        cursor: pointer;
        outline: none;

        &:focus {
          border-color: #1a3b3d;
          background: #ffffff;
        }
      }
    }
  }

  .vs-badge {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    color: #64748b;
  }
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
