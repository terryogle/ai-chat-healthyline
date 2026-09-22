<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOptions } from '../composables/useOptions';
import IconLoader from './IconLoader.vue';

const options = useOptions();

const tooltipClosed = ref(false);

const tooltip = computed(() => ({
  show: options.value?.showTooltip && !tooltipClosed.value,
  text: options.value?.tooltipText || "Got questions? We're here 24/7"
}));

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const iconName = computed(() => props.isOpen ? 'closeChat' : 'openChat');

function toggleChat() {
  emit('toggle');
  tooltipClosed.value = true;
}

function closeTooltip(e: Event) {
  e.stopPropagation();
  tooltipClosed.value = true;
}
</script>

<template>
  <div class="tt-chat-toggle-container">
    <transition name="tooltip-fade">
      <div class="tt-chat-tooltip" v-if="tooltip.show && !isOpen" @click="toggleChat">
        <div class="tooltip-badge">
          <span class="pulse-dot"></span>
          <span>Online</span>
        </div>
        <p class="tooltip-text">{{ tooltip.text }}</p>
        <button class="tooltip-close" @click="closeTooltip" title="Close" aria-label="Close tooltip">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>

    <button 
      class="tt-chat-toggle" 
      :class="{ 'is-open': isOpen }" 
      @click="toggleChat"
      :aria-label="isOpen ? 'Close chat' : 'Open chat'"
    >
      <span class="toggle-glow"></span>
      <div class="icon-box">
        <IconLoader :name="iconName" className="tt-chat-toggle-icon" />
      </div>
    </button>
  </div>
</template>

<style lang="scss">
.tt-chat-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  position: relative;
}

.tt-chat-tooltip {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 12px 14px 12px 16px;
  max-width: 260px;
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-right: 4px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16);
  }

  /* Triangle Pointer */
  &:after {
    content: '';
    position: absolute;
    bottom: -7px;
    right: 22px;
    width: 14px;
    height: 14px;
    background: #ffffff;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transform: rotate(45deg);
  }

  .tooltip-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #0d9488;

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
      animation: pulseGreen 2s infinite;
    }
  }

  .tooltip-text {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.35;
    font-weight: 600;
    color: #1e293b;
    padding-right: 16px;
  }

  .tooltip-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: #94a3b8;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
  }
}

@keyframes pulseGreen {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

.tt-chat-toggle {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a3b3d, #255457);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px -4px rgba(26, 59, 61, 0.4), 0 4px 10px -2px rgba(26, 59, 61, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;

  &:hover {
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 14px 30px -4px rgba(26, 59, 61, 0.5), 0 6px 14px -2px rgba(26, 59, 61, 0.3);
  }

  &:active {
    transform: scale(0.96);
  }

  &.is-open {
    background: #0f172a;
    box-shadow: 0 8px 20px -2px rgba(15, 23, 42, 0.3);
  }

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .tt-chat-toggle-icon {
    width: 26px;
    height: 26px;
    display: block;
    color: #ffffff;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
}
</style>