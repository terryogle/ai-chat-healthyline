<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useOptions } from '../../composables/useOptions';
import { useChat } from '../../composables/useChat';
import ButtonSend from '../ButtonSend.vue';

const input = ref('');
const files = ref<FileList | null>(null);
const options = useOptions();
const { waitingForResponse } = useChat();
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const emit = defineEmits<{
  (e: 'send', text: string, files: File[]): void;
}>();

const isSubmitDisabled = computed(() => {
  return input.value.trim() === '' || waitingForResponse.value;
});

const placeholder = computed(() => {
  return options.value?.placeholder || 'Type your message...';
});

const allowFileUploads = computed(() => {
  return options.value?.allowFileUploads || false;
});

function onSubmit() {
  if (isSubmitDisabled.value) {
    return;
  }

  const messageText = input.value.trim();
  emit('send', messageText, Array.from(files.value || []));
  
  input.value = '';
  files.value = null;
  
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
      textareaRef.value.style.height = 'auto';
    }
  });
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    onSubmit();
  }
}

function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement;
  files.value = target.files;
}

function adjustHeight(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}
</script>

<template>
  <div class="tt-chat-input-wrapper">
    <div v-if="files && files.length > 0" class="tt-chat-files-preview">
      <div 
        v-for="(file, index) in Array.from(files)" 
        :key="index" 
        class="tt-chat-file-preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <span>{{ file.name }}</span>
      </div>
    </div>

    <div class="tt-chat-input-inner">
      <textarea 
        ref="textareaRef"
        v-model="input" 
        :placeholder="placeholder" 
        rows="1"
        @keydown="onKeydown" 
        @input="adjustHeight"
      ></textarea>

      <div class="tt-chat-input-controls">
        <input 
          v-if="allowFileUploads" 
          type="file" 
          id="file-upload" 
          @change="handleFileInput"
          :disabled="waitingForResponse" 
          class="tt-chat-file-input" 
        />
        <label 
          v-if="allowFileUploads" 
          for="file-upload" 
          class="tt-chat-file-button"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </label>

        <ButtonSend @click="onSubmit" :disabled="isSubmitDisabled" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.tt-chat-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.tt-chat-input-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 4px 6px 4px 14px;
  transition: all 0.2s ease;

  &:focus-within {
    background: #ffffff;
    border-color: #1a3b3d;
    box-shadow: 0 0 0 3px rgba(26, 59, 61, 0.1);
  }

  textarea {
    resize: none;
    border: none;
    padding: 8px 0;
    min-height: 36px;
    max-height: 120px;
    overflow-y: auto;
    font-family: inherit;
    font-size: 14.5px;
    line-height: 1.45;
    outline: none;
    background: transparent;
    color: #0f172a;
    box-shadow: none;
    flex: 1;
    height: auto;
    margin: 0;

    &::placeholder {
      font-style: normal;
      font-size: 14px;
      color: #94a3b8;
    }
  }

  .tt-chat-input-controls {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-bottom: 3px;
  }
}

.tt-chat-file-input {
  display: none;
}

.tt-chat-file-button {
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.15s ease;

  &:hover {
    color: #0f172a;
    background: #e2e8f0;
  }
}

.tt-chat-files-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 4px;
  margin-bottom: 4px;

  .tt-chat-file-preview {
    font-size: 11.5px;
    padding: 3px 8px;
    background: #eef7f8;
    border: 1px solid #d4ebed;
    color: #1a3b3d;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>