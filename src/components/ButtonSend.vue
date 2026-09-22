<script setup lang="ts">
import { computed } from 'vue';
import { useOptions } from '../composables/useOptions';

const options = useOptions();
const customIcon = computed(() => options.value?.icons?.send);

defineProps<{
  disabled: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button 
    class="tt-chat-send-btn" 
    @click="$emit('click')" 
    :disabled="disabled"
    aria-label="Send message"
  >
    <img v-if="customIcon" :src="customIcon" alt="Send" class="custom-send-icon" />
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  </button>
</template>

<style lang="scss">
.tt-chat-send-btn {
  background: #1a3b3d;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(26, 59, 61, 0.3);
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #255457;
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(26, 59, 61, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #94a3b8;
    box-shadow: none;
  }

  svg {
    transform: translate(1px, -1px);
  }

  .custom-send-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
}
</style>