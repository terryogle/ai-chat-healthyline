<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import IconLoader from './IconLoader.vue';
import ChatInput from './input/ChatInput.vue';
import ConfirmPrivacy from './input/ConfirmPrivacy.vue';
import SelectProvince from './input/SelectProvince.vue';
import Datepicker from './input/Datepicker.vue';
import SpecialInput from './input/SpecialInput.vue';
import { useChat } from '../composables/useChat';
import { useOptions } from '../composables/useOptions';
import type { ChatAction, ChatMessage as ChatMessageType } from '../types';

const chatBodyRef = ref<HTMLElement | null>(null);
const chatStore = useChat();
const options = useOptions();
const { messages, currentSessionId, waitingForResponse, sendMessage, startNewSession } = chatStore;

const showPrivacyForm = ref(false);
const currentPrivacyAction = ref<ChatAction | null>(null);

const showProvinceForm = ref(false);
const currentProvinceAction = ref<ChatAction | null>(null);

const showDatePicker = ref(false);
const currentDatePickerAction = ref<ChatAction | null>(null);

const showInputComponent = ref(false);
const currentInputAction = ref<ChatAction | null>(null);

const lastProcessedMessageId = ref<string | null>(null);
const currentCallbackValue = ref<string | null>(null);

const title = computed(() => options.value?.title || 'Chat');
const subtitle = computed(() => options.value?.subtitle || 'How can I help you today?');

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
}

async function handleSendMessage(text: string, files: File[] = []) {
  if (!currentSessionId.value && startNewSession) {
    try {
      await startNewSession();
    } catch (error) {
      console.error("startNewSession():", error);
    }
  }
  
  try {
    await sendMessage(text, files);
  } catch (error) {
    console.error("sendMessage():", error);
  }
}

function checkMessageForSpecialActions(message: ChatMessageType): void {
  if (message.id === lastProcessedMessageId.value) {
    return;
  }
  
  if (message?.actions && Array.isArray(message.actions)) {
    const privacyAction = message.actions.find(
      action => action && action.type === 'privacy'
    );
    
    if (privacyAction) {
      currentPrivacyAction.value = privacyAction;
      showPrivacyForm.value = true;
      lastProcessedMessageId.value = message.id;
      return;
    }
    
    const provinceAction = message.actions.find(
      action => action && action.type === 'select_province'
    );
    
    if (provinceAction) {
      currentProvinceAction.value = provinceAction;
      showProvinceForm.value = true;
      lastProcessedMessageId.value = message.id;
      return;
    }
    
    const datePickerAction = message.actions.find(
      action => action && action.type === 'datepicker'
    );
    
    if (datePickerAction) {
      currentDatePickerAction.value = datePickerAction;
      showDatePicker.value = true;
      lastProcessedMessageId.value = message.id;
      return;
    }
    
    const inputAction = message.actions.find(
      action => action && action.type.startsWith('input_type_')
    );
    
    if (inputAction) {
      currentInputAction.value = inputAction;
      showInputComponent.value = true;
      lastProcessedMessageId.value = message.id;
      return;
    }
  }
}

async function handlePrivacyConfirm(privacyAccepted: boolean) {
  if (!currentSessionId.value && startNewSession) {
    try { await startNewSession(); } catch (error) { console.error(error); }
  }
  try {
    await sendMessage('', [], privacyAccepted);
    showPrivacyForm.value = false;
    currentPrivacyAction.value = null;
  } catch (error) { console.error(error); }
}

async function handleProvinceSelect(province: string) {
  if (!currentSessionId.value && startNewSession) {
    try { await startNewSession(); } catch (error) { console.error(error); }
  }
  try {
    await sendMessage(province, []);
    showProvinceForm.value = false;
    currentProvinceAction.value = null;
  } catch (error) { console.error(error); }
}

async function handleDateSelect(date: string) {
  if (!currentSessionId.value && startNewSession) {
    try { await startNewSession(); } catch (error) { console.error(error); }
  }
  try {
    await sendMessage(date, []);
    showDatePicker.value = false;
    currentDatePickerAction.value = null;
  } catch (error) { console.error(error); }
}

async function handleInputSubmit(value: string) {
  if (!currentSessionId.value && startNewSession) {
    try { await startNewSession(); } catch (error) { console.error(error); }
  }
  try {
    await sendMessage(value, []);
    showInputComponent.value = false;
    currentInputAction.value = null;
  } catch (error) { console.error(error); }
}

watch(messages, (newMessages) => {
  scrollToBottom();
  
  if (newMessages.length > 0) {
    const latestMessage = newMessages[newMessages.length - 1];
    checkMessageForSpecialActions(latestMessage);
  }
}, { deep: true });

onMounted(async () => {
  try {
    if (options.value?.loadPreviousSession !== false && chatStore.loadPreviousSession) {
      await chatStore.loadPreviousSession();
    } 
    else if (chatStore.startNewSession) {
      await chatStore.startNewSession();
    }

    if (!currentSessionId.value && startNewSession) {
      await startNewSession();
    }
    
    if (messages.value.length > 0) {
      const latestMessage = messages.value[messages.value.length - 1];
      checkMessageForSpecialActions(latestMessage);
    }
    
    scrollToBottom();
  } catch (error) {
    console.error('Error initializing chat:', error);
    if (chatStore.startNewSession) {
      await chatStore.startNewSession();
    }
  }
});
</script>

<template>
  <div class="tt-chat">
    <div class="tt-chat-header">
      <h2>HealthyLine AI Assistant</h2>
      <p>How can I help you today?</p>
    </div>
    
    <div ref="chatBodyRef" class="tt-chat-body">
      <div v-if="messages.length === 0" class="tt-chat-empty">
        <div class="welcome-box">
          <div class="quick-card">
            <h3 class="quick-title">Quick links</h3>

            <button class="quick-item" @click="handleSendMessage('I need help with my order')">
              <div class="quick-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div class="quick-item-text">
                <strong>My Orders</strong>
                <small>Track and manage orders</small>
              </div>
              <div class="quick-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>

            <button class="quick-item" @click="handleSendMessage('I want help finding the right PEMF mat')">
              <div class="quick-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div class="quick-item-text">
                <strong>Product Help</strong>
                <small>Find the right mat</small>
              </div>
              <div class="quick-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>

            <button class="quick-item" @click="handleSendMessage('I want to return my product or get a refund')">
              <div class="quick-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </div>
              <div class="quick-item-text">
                <strong>Returns &amp; Refunds</strong>
                <small>Start a return or get refund</small>
              </div>
              <div class="quick-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>

            <button class="quick-item" @click="handleSendMessage('I want to partner with HealthyLine')">
              <div class="quick-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <div class="quick-item-text">
                <strong>Partner With Us</strong>
                <small>Sponsorship &amp; collab inquiries</small>
              </div>
              <div class="quick-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>

            <button class="quick-item" @click="handleSendMessage('I have another question')">
              <div class="quick-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="quick-item-text">
                <strong>Select another topic</strong>
              </div>
              <div class="quick-item-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          </div>

        </div>
      </div>
      
      <template v-else>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
        
        <div v-if="waitingForResponse" class="tt-chat-typing">
          <div class="tt-chat-typing-dot"></div>
          <div class="tt-chat-typing-dot"></div>
          <div class="tt-chat-typing-dot"></div>
        </div>
      </template>
    </div>
    
    <div class="tt-chat-footer">
      <div v-if="showPrivacyForm" class="tt-chat-privacy-container">
        <ConfirmPrivacy 
          :privacyUrl="currentPrivacyAction?.action"
          @confirm="handlePrivacyConfirm"
        />
      </div>
      
      <div v-else-if="showProvinceForm" class="tt-chat-province-container">
        <SelectProvince 
          @select="handleProvinceSelect"
        />
      </div>
      
      <div v-else-if="showDatePicker" class="tt-chat-datepicker-container">
        <Datepicker 
          :label="currentDatePickerAction?.label"
          @select="handleDateSelect"
        />
      </div>
      
      <div v-else-if="showInputComponent" class="tt-chat-input-component-container">
        <SpecialInput 
          :inputType="currentInputAction?.type || 'input_type_text'"
          :label="currentInputAction?.label"
          @submit="handleInputSubmit"
        />
      </div>
      
      <div v-else class="tt-chat-input-container">
        <ChatInput @send="handleSendMessage" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.tt-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--tt-chat-bg, #fff);
  font-family: var(--tt-chat-font-family);
  z-index: 99;
  
  &-header {
    position: relative;
    padding: 15px;
    background-color: var(--tt-chat-header-bg, #f5f5f5);
    border-bottom: 1px solid var(--tt-chat-light-shade-100);
    
    h2 {
      margin: 0 0 5px 0;
      font-size: 26px;
      line-height: 31px;
      font-weight: 600;
      color: var(--tt-chat-header-color, #333);
      position: relative;
      z-index: 1;
    }
    
    p {
      margin: 0 0 10px 0;
      font-size: 18px;
      line-height: 22px;      
      color: var(--tt-chat-subheader-color, #666);
      position: relative;
      z-index: 1;
    }
  }
  
  &-body {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
  }
  
  &-empty {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
  }
  
  &-footer {
    border-top: 1px solid var(--tt-chat-light-shade-100);
  }
  
  &-typing {
    display: flex;
    padding: 10px;
    max-width: 60px;
    background-color: var(--tt-chat-bot-bg, #f5f5f5);
    border-radius: 10px;
    margin-bottom: 10px;
    align-self: flex-start;
    
    &-dot {
      width: 8px;
      height: 8px;
      background: #888;
      border-radius: 50%;
      margin: 0 3px;
      animation: tt-chat-typing 1s infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
  
  &-privacy-container,
  &-province-container,
  &-datepicker-container,
  &-input-component-container,
  &-input-container {
    width: 100%;
  }
}

@keyframes tt-chat-typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.welcome-box {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 10px 4px 30px;
  text-align: left;

  .quick-card {
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 16px;
    padding: 18px 18px 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .quick-title {
    font-size: 16px;
    font-weight: 700;
    color: #24262b;
    margin: 0 0 10px;
  }

  .quick-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.15s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #fafafa;
    }

    &-icon {
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      border: 1px solid #ececec;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #24262b;
    }

    &-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      strong {
        font-size: 15px;
        font-weight: 700;
        color: #24262b;
        line-height: 1.2;
      }

      small {
        font-size: 13px;
        color: #7a7a7a;
        margin-top: 3px;
        line-height: 1.3;
      }
    }

    &-arrow {
      flex-shrink: 0;
      color: #b5b5b5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
