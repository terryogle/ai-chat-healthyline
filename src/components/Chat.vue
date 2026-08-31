<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import ProductCatalog from './ProductCatalog.vue';
import SeriesComparison from './SeriesComparison.vue';
import ChatInput from './input/ChatInput.vue';
import ConfirmPrivacy from './input/ConfirmPrivacy.vue';
import SelectProvince from './input/SelectProvince.vue';
import Datepicker from './input/Datepicker.vue';
import SpecialInput from './input/SpecialInput.vue';
import OrderAuthCard from './OrderAuthCard.vue';
import { useChat } from '../composables/useChat';
import { useOptions } from '../composables/useOptions';
import type { ChatAction, ChatMessage as ChatMessageType } from '../types';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const chatBodyRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

const chatStore = useChat();
const options = useOptions();
const { messages, currentSessionId, waitingForResponse, sendMessage, startNewSession } = chatStore;

const activeTab = ref<'home' | 'messages' | 'catalog' | 'compare'>('home');
const compareInitialA = ref<string>('taj');
const compareInitialB = ref<string>('platinum');
const showOrderAuthCard = ref(false);

const hasUserMessages = computed(() => messages.value.some(m => m.sender === 'user'));

const starterSuggestions = [
  { icon: '✨', title: 'What are you looking to improve?', desc: '', query: 'What can HealthyLine mats help with for health, energy and recovery?' },
  { icon: '⚡', title: 'How do these mats work?', desc: '', query: 'How do PEMF and Far Infrared gemstone mats work?' },
  { icon: '🌿', title: 'What can these mats help with?', desc: '', query: 'What symptoms, pain relief, and wellness goals can these mats help with?' },
  { icon: '🎯', title: 'Help me find the right mat', desc: '', query: 'Help me find the right mat for my needs and lifestyle' }
];

const showPrivacyForm = ref(false);
const currentPrivacyAction = ref<ChatAction | null>(null);

const showProvinceForm = ref(false);
const currentProvinceAction = ref<ChatAction | null>(null);

const showDatePicker = ref(false);
const currentDatePickerAction = ref<ChatAction | null>(null);

const showInputComponent = ref(false);
const currentInputAction = ref<ChatAction | null>(null);

const lastProcessedMessageId = ref<string | null>(null);

const headerTitle = computed(() => options.value?.title || 'HealthyLine');
const headerSubtitle = computed(() => {
  if (activeTab.value === 'compare') return 'Series & Technology Matrix';
  if (activeTab.value === 'catalog') return 'Best Sellers & Gemstone Mats';
  if (activeTab.value === 'messages') return 'How can we help?';
  return options.value?.subtitle || 'Chat with AI Assistant';
});

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
}

function scrollToTop() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = 0;
    }
  });
}

async function handleSendMessage(text: string, files: File[] = []) {
  activeTab.value = 'messages';
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

function handleOrderAuthSubmit(data: { mode: 'email', value: string, verificationCode?: string }) {
  showOrderAuthCard.value = false;
  activeTab.value = 'messages';
  const text = `I'd like to check orders for ${data.value}`;
  handleSendMessage(text);
}

async function handleReload() {
  if (startNewSession) {
    try {
      await startNewSession();
      showOrderAuthCard.value = false;
      showPrivacyForm.value = false;
      showProvinceForm.value = false;
      showDatePicker.value = false;
      showInputComponent.value = false;
      currentPrivacyAction.value = null;
      currentProvinceAction.value = null;
      currentDatePickerAction.value = null;
      currentInputAction.value = null;
      lastProcessedMessageId.value = null;
      activeTab.value = 'home';
      scrollToBottom();
    } catch (error) {
      console.error("handleReload error:", error);
    }
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

async function handleNewChat() {
  isMenuOpen.value = false;
  await handleReload();
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
}

function switchTab(tab: 'home' | 'messages' | 'catalog' | 'compare') {
  activeTab.value = tab;
  if (tab === 'messages') {
    scrollToBottom();
  } else {
    scrollToTop();
  }
}

function handleOpenCompare(seriesName?: string) {
  if (seriesName) {
    const s = seriesName.toLowerCase();
    if (s.includes('rainbow') || s.includes('chakra')) {
      compareInitialA.value = 'rainbow-chakra';
    } else if (s.includes('jet')) {
      compareInitialA.value = 'jet';
    } else if (s.includes('soft')) {
      compareInitialA.value = 'soft';
    } else if (s.includes('mesh')) {
      compareInitialA.value = 'mesh';
    } else if (s.includes('tao')) {
      compareInitialA.value = 'tao';
    } else if (s.includes('platinum')) {
      compareInitialA.value = 'platinum';
    } else {
      compareInitialA.value = 'taj';
    }
  }
  switchTab('compare');
}

watch(messages, (newMessages) => {
  if (activeTab.value === 'messages') {
    scrollToBottom();
  }
  
  if (newMessages.length > 0) {
    const latestMessage = newMessages[newMessages.length - 1];
    checkMessageForSpecialActions(latestMessage);
  }
}, { deep: true });

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
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
  } catch (error) {
    console.error('Error initializing chat:', error);
    if (chatStore.startNewSession) {
      await chatStore.startNewSession();
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="tt-chat">
    <!-- Header -->
    <div class="tt-chat-header">
      <div class="header-brand-box">
        <div class="online-status-dot" title="Online">
          <span class="dot-pulse"></span>
          <span class="dot-core"></span>
        </div>
        <div class="header-info">
          <div class="title-row">
            <h2>{{ headerTitle }}</h2>
            <span class="verified-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              AI
            </span>
          </div>
          <p>{{ headerSubtitle }}</p>
        </div>
      </div>

      <div class="header-actions">
        <!-- 3-Dots Menu Container -->
        <div ref="menuRef" class="header-menu-container">
          <button 
            class="header-action-btn more-btn" 
            :class="{ active: isMenuOpen }"
            @click.stop="toggleMenu" 
            title="More options" 
            aria-label="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
            </svg>
          </button>

          <!-- Dropdown Popover -->
          <transition name="menu-pop">
            <div v-if="isMenuOpen" class="header-dropdown-menu">
              <button class="dropdown-item" @click="isMenuOpen = false; switchTab('home'); showOrderAuthCard = true">
                <span class="dropdown-item-label">My Orders</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-item-icon">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </button>

              <button class="dropdown-item" @click="handleNewChat">
                <span class="dropdown-item-label">New Chat</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-item-icon">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>

              <a 
                class="dropdown-item" 
                href="https://healthyline.com/pages/frequently-asked-questions" 
                target="_blank" 
                rel="noopener noreferrer"
                @click="isMenuOpen = false"
              >
                <span class="dropdown-item-label">FAQ</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-item-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </a>

              <a 
                class="dropdown-item" 
                href="https://healthyline.com/pages/support" 
                target="_blank" 
                rel="noopener noreferrer"
                @click="isMenuOpen = false"
              >
                <span class="dropdown-item-label">Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-item-icon">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </a>
            </div>
          </transition>
        </div>

        <!-- Close Button -->
        <button class="header-action-btn close-btn" @click="emit('close')" title="Close chat" aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Body Scroll Container -->
    <div ref="chatBodyRef" class="tt-chat-body" :class="{ 'is-compare-tab': activeTab === 'compare' }">
      <!-- HOME VIEW -->
      <div v-if="activeTab === 'home'" class="tt-chat-home-view">
        <div class="welcome-box">
          
          <!-- Order Auth Card Modal when My Orders is clicked -->
          <OrderAuthCard 
            v-if="showOrderAuthCard" 
            @submit="handleOrderAuthSubmit" 
            @cancel="showOrderAuthCard = false" 
          />

          <!-- Ask a Question Hero Card (Pinterest Spotlight) -->
          <div 
            v-if="!showOrderAuthCard" 
            class="spotlight-card" 
            role="button"
            tabindex="0"
            @click="switchTab('messages')"
            @keydown.enter="switchTab('messages')"
            @keydown.space.prevent="switchTab('messages')"
          >
            <div class="spotlight-content">
              <strong class="spotlight-title">Ask a question</strong>
              <p class="spotlight-desc">✦ AI Agent and team can help</p>
            </div>
            <div class="spotlight-action">
              <button class="action-cta-btn" aria-label="Start chat and ask a question" title="Start chat">
                <span class="cta-label">Chat now</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="cta-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Navigation Cards Grid (2x2) -->
          <div v-if="!showOrderAuthCard" class="pinterest-cards-section">
            <div class="section-label">Explore &amp; Services</div>

            <div class="cards-duo-grid">
              <!-- BEST SELLERS -->
              <button class="duo-card" @click="switchTab('catalog')">
                <div class="duo-icon-box best-sellers-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
                  </svg>
                </div>
                <div class="duo-info">
                  <strong>Best Sellers</strong>
                  <small>Explore top mats</small>
                </div>
              </button>

              <!-- COMPARE SERIES -->
              <button class="duo-card" @click="switchTab('compare')">
                <div class="duo-icon-box compare-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 3h5v5"/>
                    <path d="M4 20L21 3"/>
                    <path d="M21 16v5h-5"/>
                    <path d="M15 15l6 6"/>
                    <path d="M4 4l5 5"/>
                  </svg>
                </div>
                <div class="duo-info">
                  <strong>Compare Series</strong>
                  <small>Side-by-side specs</small>
                </div>
              </button>

              <!-- MY ORDERS -->
              <button class="duo-card" @click="showOrderAuthCard = true">
                <div class="duo-icon-box order-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div class="duo-info">
                  <strong>My Orders</strong>
                  <small>Track &amp; manage</small>
                </div>
              </button>

              <!-- PARTNER WITH US -->
              <button class="duo-card" @click="handleSendMessage('I want to partner with HealthyLine')">
                <div class="duo-icon-box partner-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div class="duo-info">
                  <strong>Partnership</strong>
                  <small>Collab inquiries</small>
                </div>
              </button>
            </div>
          </div>

          <!-- POPULAR QUESTIONS / STARTER CHIPS -->
          <div v-if="!showOrderAuthCard" class="starter-topics-section">
            <div class="section-label">Recommended Topics</div>
            <div class="starter-grid">
              <button 
                v-for="(item, idx) in starterSuggestions"
                :key="idx"
                class="topic-chip-card"
                @click="handleSendMessage(item.title)"
              >
                <div class="topic-chip-header">
                  <span class="topic-icon">{{ item.icon }}</span>
                  <span class="topic-title">{{ item.title }}</span>
                </div>
                <p v-if="item.desc" class="topic-desc">{{ item.desc }}</p>
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <!-- CATALOG VIEW -->
      <div v-else-if="activeTab === 'catalog'" class="tt-chat-catalog-view">
        <ProductCatalog 
          @askQuestion="handleSendMessage" 
          @compareSeries="handleOpenCompare"
        />
      </div>

      <!-- SERIES COMPARISON VIEW -->
      <div v-else-if="activeTab === 'compare'" class="tt-chat-compare-view">
        <SeriesComparison 
          :initialSeriesIdA="compareInitialA" 
          :initialSeriesIdB="compareInitialB" 
          @askQuestion="handleSendMessage" 
          @selectCatalogSeries="handleOpenCompare"
        />
      </div>

      <!-- MESSAGES VIEW -->
      <div v-else class="tt-chat-messages-view">
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />

        <div v-if="!hasUserMessages" class="empty-messages-prompt">
          <div class="starter-header">
            <h3>How can we help you today?</h3>
            <p>Select a quick topic or type your message below:</p>
          </div>

          <div class="starter-suggestions">
            <button 
              v-for="(suggestion, idx) in starterSuggestions" 
              :key="idx"
              class="suggestion-chip"
              @click="handleSendMessage(suggestion.query)"
            >
              <span class="chip-icon">{{ suggestion.icon }}</span>
              <div class="chip-text-group">
                <span class="chip-title">{{ suggestion.title }}</span>
                <span class="chip-sub">{{ suggestion.desc }}</span>
              </div>
              <svg class="chip-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="waitingForResponse" class="tt-chat-typing">
          <div class="tt-chat-typing-dot"></div>
          <div class="tt-chat-typing-dot"></div>
          <div class="tt-chat-typing-dot"></div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="tt-chat-footer">
      <div v-if="activeTab === 'messages'" class="footer-input-section">
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

      <!-- BOTTOM NAVIGATION BAR (Home, Messages, Catalog, Compare) -->
      <div class="bottom-nav-bar">
        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'home' }"
          @click="switchTab('home')"
        >
          <div class="nav-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span>Home</span>
        </button>

        <button 
          class="nav-tab-btn" 
          :class="{ active: activeTab === 'messages' }"
          @click="switchTab('messages')"
        >
          <div class="nav-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span v-if="messages.length > 0" class="messages-badge">{{ messages.length }}</span>
          </div>
          <span>Messages</span>
        </button>

        <button 
          class="nav-tab-btn nav-catalog-btn"
          :class="{ active: activeTab === 'catalog' }"
          @click="switchTab('catalog')"
        >
          <div class="nav-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span>Best Sellers</span>
        </button>

        <button 
          class="nav-tab-btn nav-compare-btn"
          :class="{ active: activeTab === 'compare' }"
          @click="switchTab('compare')"
        >
          <div class="nav-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 3h5v5"/>
              <path d="M4 20L21 3"/>
              <path d="M21 16v5h-5"/>
              <path d="M15 15l6 6"/>
              <path d="M4 4l5 5"/>
            </svg>
          </div>
          <span>Compare</span>
        </button>
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
  background: #ffffff;
  font-family: var(--tt-chat-font-family);
  z-index: 99;
  
  &-header {
    position: relative;
    z-index: 50;
    padding: 14px 18px;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-brand-box {
      display: flex;
      align-items: center;
      gap: 10px;

      .online-status-dot {
        position: relative;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transform: translateY(-4px);

        .dot-core {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
          z-index: 2;
        }

        .dot-pulse {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.45);
          animation: status-ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }
      }

      .header-info {
        display: flex;
        flex-direction: column;

        .title-row {
          display: flex;
          align-items: center;
          gap: 6px;

          h2 {
            margin: 0;
            font-size: 16.5px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.2px;
            line-height: 1.2;
          }

          .verified-pill {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            background: #eef7f8;
            border: 1px solid #d4ebed;
            color: #1a3b3d;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 10px;
          }
        }

        p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.2;
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      position: relative;

      .header-menu-container {
        position: relative;
      }

      .header-action-btn {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        color: #334155;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;

        svg {
          display: block;
          width: 18px;
          height: 18px;
        }

        &.more-btn {
          color: #334155;

          &:hover, &.active {
            background: #e2e8f0;
            color: #0f172a;
            border-color: #cbd5e1;
          }
        }

        &.close-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);

          svg {
            display: block;
            width: 17px;
            height: 17px;
            stroke: #475569;
            transition: stroke 0.15s ease, transform 0.15s ease;
          }

          &:hover {
            background: #ef4444;
            color: #ffffff;
            border-color: #ef4444;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            transform: scale(1.06);

            svg {
              stroke: #ffffff;
              transform: rotate(90deg);
            }
          }

          &:active {
            transform: scale(0.94);
          }
        }
      }

      .header-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 170px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.08);
        padding: 4px;
        display: flex;
        flex-direction: column;
        z-index: 100;

        .dropdown-item {
          width: 100%;
          background: transparent;
          border: none;
          border-radius: 8px;
          padding: 9px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          text-decoration: none;
          box-sizing: border-box;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;

          .dropdown-item-label {
            font-size: 13.5px;
            font-weight: 500;
            color: #1e293b;
          }

          .dropdown-item-icon {
            color: #64748b;
            flex-shrink: 0;
            transition: color 0.15s ease;
          }

          &:hover {
            background: #f1f5f9;

            .dropdown-item-label {
              color: #0f172a;
              font-weight: 600;
            }

            .dropdown-item-icon {
              color: #1a3b3d;
            }
          }

          &:active {
            background: #e2e8f0;
          }
        }
      }
    }
  }
  
  &-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: #fafbfc;

    &.is-compare-tab {
      padding: 0;
    }
  }
  
  &-catalog-view {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 4px 0 20px;
  }

  &-compare-view {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 0 0 20px;
  }

  &-messages-view {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &-footer {
    border-top: 1px solid #f1f5f9;
    background: #ffffff;

    .footer-input-section {
      padding: 12px 16px;
    }
  }
  
  &-typing {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    width: fit-content;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px 16px 16px 4px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    
    &-dot {
      width: 6px;
      height: 6px;
      background: #1a3b3d;
      border-radius: 50%;
      margin: 0 3px;
      animation: tt-chat-typing 1.2s infinite ease-in-out;
      
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
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-4px); opacity: 1; }
}

.welcome-box {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 4px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  /* Top AI status badge */
  .home-top-badge-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0;

    .home-top-badge {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 600;
      color: #132e30;
      background: rgba(19, 46, 48, 0.06);
      border: 1px solid rgba(19, 46, 48, 0.1);
      padding: 7px 14px;
      border-radius: 12px;
      letter-spacing: 0.1px;
      text-align: center;

      .sparkle-icon {
        font-size: 13px;
        color: #d4af37;
      }
    }
  }

  /* Spotlight Ask Hero Card */
  .spotlight-card {
    position: relative;
    width: 100%;
    background: linear-gradient(135deg, #132e30 0%, #1a3b3d 60%, #245255 100%);
    color: #ffffff;
    border-radius: 20px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 24px -4px rgba(19, 46, 48, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(26, 59, 61, 0) 70%);
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -4px rgba(19, 46, 48, 0.55), 0 0 0 1.5px rgba(212, 175, 55, 0.4);

      .action-cta-btn {
        background: #ffffff;
        color: #132e30;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        transform: scale(1.04);

        .cta-icon {
          transform: translateX(2px);
        }
      }
    }

    &:focus-visible {
      outline: 2px solid #5eead4;
      outline-offset: 2px;
    }

    .spotlight-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
      z-index: 1;

      .spotlight-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #5eead4;
        background: rgba(94, 234, 212, 0.12);
        border: 1px solid rgba(94, 234, 212, 0.25);
        padding: 2px 8px;
        border-radius: 20px;
        width: fit-content;
        margin-bottom: 2px;

        .sparkle-icon {
          font-size: 12px;
          color: #d4af37;
        }
      }

      .spotlight-title {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.25;
        color: #ffffff;
      }

      .spotlight-desc {
        margin: 0;
        font-size: 12.5px;
        color: rgba(255, 255, 255, 0.88);
      }
    }

    .spotlight-action {
      z-index: 1;
      flex-shrink: 0;

      .action-cta-btn {
        padding: 9px 15px;
        border-radius: 9999px;
        background: #ffffff;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #132e30;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.35);
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;

        .cta-label {
          line-height: 1;
        }

        .cta-icon {
          transition: transform 0.2s ease;
        }

        &:hover {
          background: #f8fafc;
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.97);
        }
      }
    }
  }

  .section-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #64748b;
    margin-bottom: 10px;
    text-align: left;
  }

  .pinterest-cards-section {
    display: flex;
    flex-direction: column;

    .cards-duo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .duo-card {
        background: #ffffff;
        border: 1px solid #e8ecf1;
        border-radius: 16px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        cursor: pointer;
        text-align: left;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        height: 100%;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }

        &:active {
          transform: translateY(0);
        }

        .duo-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.best-sellers-icon {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
          }

          &.compare-icon {
            background: #e6f4f1;
            color: #0d655f;
            border: 1px solid #ccebe6;
          }

          &.order-icon {
            background: #eef7f8;
            color: #1a3b3d;
            border: 1px solid #d4ebed;
          }

          &.partner-icon {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
          }
        }

        .duo-info {
          display: flex;
          flex-direction: column;
          gap: 2px;

          strong {
            font-size: 13.5px;
            font-weight: 700;
            color: #0f172a;
          }

          small {
            font-size: 11.5px;
            color: #64748b;
            line-height: 1.2;
          }
        }
      }
    }
  }

  .starter-topics-section {
    display: flex;
    flex-direction: column;

    .starter-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .topic-chip-card {
        background: #ffffff;
        border: 1px solid #e8ecf1;
        border-radius: 14px;
        padding: 12px 14px;
        text-align: left;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        min-height: 68px;
        transition: all 0.2s ease;

        &:hover {
          background: #f8fafc;
          border-color: #1a3b3d;
          transform: translateY(-1px);
        }

        .topic-chip-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          .topic-icon {
            font-size: 16px;
            line-height: 1.2;
            flex-shrink: 0;
          }

          .topic-title {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
            line-height: 1.35;
          }
        }

        .topic-desc {
          margin: 0;
          font-size: 11px;
          color: #64748b;
          line-height: 1.3;
        }
      }
    }
  }
}

.empty-messages-prompt {
  padding: 20px 12px 12px;
  text-align: center;

  .starter-header {
    margin-bottom: 18px;

    .starter-icon-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #eef7f8;
      color: #1a3b3d;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
    }

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
    }

    p {
      font-size: 12.5px;
      color: #64748b;
      margin: 0;
    }
  }

  .starter-suggestions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .suggestion-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e8ecf1;
      border-radius: 14px;
      padding: 11px 14px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

      &:hover {
        border-color: #1a3b3d;
        background: #f8fafc;
        transform: translateY(-1px);

        .chip-arrow {
          color: #1a3b3d;
          transform: translateX(2px);
        }
      }

      .chip-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .chip-text-group {
        flex: 1;
        display: flex;
        flex-direction: column;

        .chip-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .chip-sub {
          font-size: 11.5px;
          color: #64748b;
        }
      }

      .chip-arrow {
        color: #cbd5e1;
        flex-shrink: 0;
        transition: all 0.2s ease;
      }
    }
  }
}

.bottom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-top: 1px solid #eef2f6;
  padding: 8px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  gap: 6px;
  box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.03);
  position: relative;
  z-index: 20;

  .nav-tab-btn {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    padding: 7px 4px;
    border-radius: 12px;
    position: relative;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.95);
      background: #e2e8f0;
    }

    &.active {
      background: #132e30;
      border-color: #132e30;
      color: #ffffff;
      box-shadow: 0 3px 10px rgba(19, 46, 48, 0.28);
      transform: translateY(-1px);

      .nav-icon-box {
        color: #d4af37;
      }

      span {
        color: #ffffff;
        font-weight: 700;
      }
    }

    .nav-icon-box {
      position: relative;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      transition: all 0.2s ease;

      svg {
        transition: transform 0.2s ease;
      }

      .messages-badge {
        position: absolute;
        top: -6px;
        right: -8px;
        min-width: 16px;
        height: 16px;
        background: #e11d48;
        color: #ffffff;
        font-size: 9px;
        font-weight: 800;
        padding: 0 4px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 5px rgba(225, 29, 72, 0.35);
      }
    }

    span {
      letter-spacing: 0.1px;
      transition: color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  }
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-6px);
}

@keyframes status-ping {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  50% {
    transform: scale(2.3);
    opacity: 0;
  }
  100% {
    transform: scale(2.3);
    opacity: 0;
  }
}
</style>
