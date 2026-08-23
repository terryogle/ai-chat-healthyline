<script setup lang="ts">
import { computed } from 'vue';
import VueMarkdown from 'vue-markdown-render';
import type { ChatMessage } from '../types';

const props = defineProps<{
  message: ChatMessage;
}>();

const classes = computed(() => {
  return {
    'tt-chat-message-from-user': props.message.sender === 'user',
    'tt-chat-message-from-bot': props.message.sender === 'bot',
  };
});

const hasActions = computed(() => {
  return !!props.message.actions && props.message.actions.length > 0;
});

function handleButtonClick(url: string) {
  if (url) {
    window.open(url, '_blank', 'noopener');
  }
}
</script>

<template>
  <div class="tt-chat-message" :class="classes">
    <div v-if="message.sender === 'bot'" class="bot-avatar-badge">
      <span class="sparkle">✦</span>
    </div>

    <div class="tt-chat-message-bubble">
      <div class="tt-chat-message-content">
        <VueMarkdown :source="message.text" />
      </div>

      <!-- Action buttons / links from Bot -->
      <div v-if="hasActions" class="tt-chat-message-actions">
        <template v-for="(action, index) in message.actions" :key="index">
          <button 
            v-if="action.type === 'button'" 
            class="tt-chat-action-button" 
            @click="handleButtonClick(action.action)"
          >
            <span>{{ action.label }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>

          <div v-else-if="action.type === 'checkbox'" class="tt-chat-action-checkbox">
            <input type="checkbox" :id="'action-checkbox-' + index" class="custom-checkbox" />
            <label :for="'action-checkbox-' + index">
              {{ action.label }}
              <a v-if="action.action" :href="action.action" target="_blank" rel="noopener">Details</a>
            </label>
          </div>
        </template>
      </div>

      <!-- Files preview -->
      <div v-if="message.files && message.files.length > 0" class="tt-chat-message-files">
        <div v-for="file in message.files" :key="file.name" class="tt-chat-message-file">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span>{{ file.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.tt-chat-message {
  display: flex;
  gap: 8px;
  max-width: 86%;
  margin-bottom: 14px;
  position: relative;
  animation: msgAppear 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.tt-chat-message-from-user {
    margin-left: auto;
    justify-content: flex-end;

    .tt-chat-message-bubble {
      background: linear-gradient(145deg, #1a3b3d 0%, #29575a 100%);
      color: #ffffff;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 4px 14px rgba(26, 59, 61, 0.22);

      p, span, li, strong {
        color: #ffffff !important;
      }

      :deep(a) {
        color: #99f6e4;
        text-decoration: underline;
      }
    }
  }

  &.tt-chat-message-from-bot {
    align-self: flex-start;

    .tt-chat-message-bubble {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e8ecf1;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }
  }

  .bot-avatar-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #eef7f8;
    border: 1px solid #d4ebed;
    color: #1a3b3d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .tt-chat-message-bubble {
    padding: 12px 16px;
    word-break: break-word;
    font-size: 14.5px;
    line-height: 1.5;
  }

  .tt-chat-message-content {
    :deep(p) {
      margin: 0.35em 0;
      &:first-child { margin-top: 0; }
      &:last-child { margin-bottom: 0; }
    }

    :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
      margin: 0.6em 0 0.3em;
      font-size: 1.1em;
      font-weight: 700;
    }

    :deep(ul), :deep(ol) {
      margin: 0.4em 0;
      padding-left: 1.3em;
    }

    :deep(li) {
      margin-bottom: 3px;
    }

    :deep(a) {
      color: #0d9488;
      font-weight: 600;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    :deep(strong) {
      font-weight: 700;
    }

    :deep(code) {
      background-color: rgba(0, 0, 0, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }

    :deep(pre) {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      margin: 8px 0;
    }
  }

  .tt-chat-message-actions {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .tt-chat-action-button {
      background: #1a3b3d;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(26, 59, 61, 0.2);

      &:hover {
        background: #255457;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 59, 61, 0.3);
      }
    }

    .tt-chat-action-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13.5px;

      input {
        margin-top: 3px;
        accent-color: #1a3b3d;
        width: 16px;
        height: 16px;
      }

      label {
        color: #334155;
        line-height: 1.4;

        a {
          margin-left: 6px;
          color: #0d9488;
          font-weight: 600;
          text-decoration: underline;
        }
      }
    }
  }

  .tt-chat-message-files {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .tt-chat-message-file {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      color: inherit;
    }
  }
}

@keyframes msgAppear {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>