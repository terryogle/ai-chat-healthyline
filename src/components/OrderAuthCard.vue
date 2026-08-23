<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { useChat } from '../composables/useChat';
import { useOptions } from '../composables/useOptions';
import { requestOtp, verifyOtp } from '../utils/api';

const emit = defineEmits<{
  (e: 'submit', data: { mode: 'email'; value: string; verificationCode?: string }): void;
  (e: 'cancel'): void;
}>();

const chatStore = useChat();
const options = useOptions();

const email = ref('');
const step = ref<'input' | 'otp'>('input');
const otpCode = ref(['', '', '', '', '', '']);
const otpInputs = ref<(HTMLInputElement | null)[]>([]);

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const infoMessage = ref<string | null>(null);
const resendCooldown = ref(0);
let cooldownTimer: any = null;

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
});

const canSubmitInput = computed(() => isEmailValid.value && !isLoading.value);
const fullOtpCode = computed(() => otpCode.value.join(''));
const isOtpValid = computed(() => fullOtpCode.value.length === 6 && /^\d+$/.test(fullOtpCode.value));

function startCooldown(seconds = 30) {
  resendCooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--;
    } else {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

async function handleSendOtp() {
  if (!isEmailValid.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = null;
  infoMessage.value = null;

  try {
    let sessionId = chatStore.currentSessionId.value;
    if (!sessionId && chatStore.startNewSession) {
      sessionId = await chatStore.startNewSession();
    }
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
    }

    const chatOptions = options.value || { webhookUrl: '' };
    const response = await requestOtp(email.value.trim(), sessionId, chatOptions);

    if (response && response.success !== false) {
      step.value = 'otp';
      infoMessage.value = response.message || 'We sent a 6-digit verification code to your email.';
      otpCode.value = ['', '', '', '', '', ''];
      startCooldown(30);

      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0]?.focus();
        }
      });
    } else {
      errorMessage.value = response?.message || "We couldn't find an account with this email.";
    }
  } catch (err: any) {
    console.error('requestOtp error:', err);
    errorMessage.value = 'Network error while sending verification code. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function handleOtpInput(index: number, event: Event) {
  errorMessage.value = null;
  const target = event.target as HTMLInputElement;
  const val = target.value;

  if (val.length > 1) {
    // Handle pasted content
    const digits = val.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => {
      if (i < 6) otpCode.value[i] = d;
    });

    const nextIndex = Math.min(digits.length, 5);
    nextTick(() => {
      otpInputs.value[nextIndex]?.focus();
    });

    if (digits.length === 6) {
      handleVerifyOtp();
    }
    return;
  }

  // Only allow digits
  if (val && !/^\d$/.test(val)) {
    otpCode.value[index] = '';
    return;
  }

  otpCode.value[index] = val;

  if (val && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1]?.focus();
    });
  }

  // Auto-submit when the last digit is typed
  if (val && index === 5 && isOtpValid.value) {
    handleVerifyOtp();
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (!otpCode.value[index] && index > 0) {
      otpInputs.value[index - 1]?.focus();
    }
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');
  
  if (digits.length > 0) {
    digits.forEach((d, i) => {
      if (i < 6) otpCode.value[i] = d;
    });

    const focusIdx = Math.min(digits.length, 5);
    nextTick(() => {
      otpInputs.value[focusIdx]?.focus();
    });

    if (digits.length === 6) {
      handleVerifyOtp();
    }
  }
}

async function handleVerifyOtp() {
  if (!isOtpValid.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = null;

  try {
    let sessionId = chatStore.currentSessionId.value;
    if (!sessionId && chatStore.startNewSession) {
      sessionId = await chatStore.startNewSession();
    }
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
    }

    const chatOptions = options.value || { webhookUrl: '' };
    const response = await verifyOtp(email.value.trim(), fullOtpCode.value, sessionId, chatOptions);

    if (response && response.success !== false) {
      emit('submit', {
        mode: 'email',
        value: email.value.trim(),
        verificationCode: fullOtpCode.value,
      });
    } else {
      errorMessage.value = response?.message || 'Incorrect verification code. Please try again.';
      otpCode.value = ['', '', '', '', '', ''];
      nextTick(() => {
        otpInputs.value[0]?.focus();
      });
    }
  } catch (err: any) {
    console.error('verifyOtp error:', err);
    errorMessage.value = 'Failed to verify code. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

function handleBack() {
  errorMessage.value = null;
  infoMessage.value = null;
  if (step.value === 'otp') {
    step.value = 'input';
  } else {
    emit('cancel');
  }
}
</script>

<template>
  <div class="order-auth-card">
    <div class="card-header">
      <button class="back-link" @click="handleBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>{{ step === 'otp' ? 'Change email' : 'Back' }}</span>
      </button>
    </div>

    <!-- ERROR BANNER -->
    <div v-if="errorMessage" class="feedback-banner error-banner">
      <svg class="banner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- INFO BANNER -->
    <div v-if="infoMessage && step === 'otp'" class="feedback-banner info-banner">
      <svg class="banner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ infoMessage }}</span>
    </div>

    <!-- STEP 1: EMAIL INPUT -->
    <template v-if="step === 'input'">
      <h3 class="card-title">Existing customer?</h3>
      <p class="card-hint">
        Enter your purchase email. We will send a secure verification code to check your order status.
      </p>

      <div class="form-group">
        <label class="form-label">Your email</label>
        <input 
          v-model="email" 
          type="email" 
          class="form-input" 
          placeholder="example@domain.com"
          :disabled="isLoading"
          @keyup.enter="handleSendOtp"
          autofocus
        />
      </div>

      <button 
        class="submit-btn" 
        :disabled="!canSubmitInput"
        @click="handleSendOtp"
      >
        <span v-if="isLoading" class="btn-content">
          <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          Sending code...
        </span>
        <span v-else class="btn-content">
          Send Verification Code
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </button>
    </template>

    <!-- STEP 2: OTP VERIFICATION (NO FAKE AUTOFILL) -->
    <template v-else>
      <h3 class="card-title">Enter Verification Code</h3>
      <p class="card-subtitle">
        Please enter the 6-digit code sent to <strong>{{ email }}</strong>
      </p>

      <div class="otp-inputs-container" @paste="handleOtpPaste">
        <input 
          v-for="(_, index) in 6" 
          :key="index"
          :ref="(el) => (otpInputs[index] = el as HTMLInputElement)"
          v-model="otpCode[index]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="otp-box"
          :disabled="isLoading"
          @input="handleOtpInput(index, $event)"
          @keydown="handleOtpKeydown(index, $event)"
        />
      </div>

      <button 
        class="submit-btn" 
        :disabled="!isOtpValid || isLoading"
        @click="handleVerifyOtp"
      >
        <span v-if="isLoading" class="btn-content">
          <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          Verifying code...
        </span>
        <span v-else class="btn-content">
          Verify &amp; View Orders
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </button>

      <div class="resend-box">
        Didn't receive code? 
        <button 
          v-if="resendCooldown === 0" 
          class="resend-link" 
          :disabled="isLoading"
          @click="handleSendOtp"
        >
          Resend Code
        </button>
        <span v-else class="resend-timer">
          Resend in {{ resendCooldown }}s
        </span>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.order-auth-card {
  background: #ffffff;
  border: 1px solid #e8ecf1;
  border-radius: 20px;
  padding: 20px 22px 22px;
  box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.06);
  margin-bottom: 16px;
  text-align: left;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;

  .back-link {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px 4px 0;
    border-radius: 6px;
    transition: color 0.15s ease;

    &:hover {
      color: #0f172a;
    }
  }
}

.card-title {
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.card-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.45;
}

.card-subtitle {
  font-size: 13.5px;
  color: #475569;
  margin: 0 0 18px;
  line-height: 1.4;

  strong {
    color: #0f172a;
    word-break: break-all;
  }
}

.feedback-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.35;
  margin-bottom: 14px;

  .banner-icon {
    flex-shrink: 0;
  }

  &.error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  &.info-banner {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  .form-label {
    font-size: 13.5px;
    font-weight: 600;
    color: #334155;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    font-size: 14.5px;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
      border-color: #1a3b3d;
      box-shadow: 0 0 0 3px rgba(26, 59, 61, 0.12);
    }

    &::placeholder {
      color: #94a3b8;
    }

    &:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }
  }
}

.submit-btn {
  width: 100%;
  background: #1a3b3d;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 13px 18px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(26, 59, 61, 0.25);
  margin-bottom: 14px;

  &:hover:not(:disabled) {
    background: #255457;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(26, 59, 61, 0.35);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .spinner-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.otp-inputs-container {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 20px;

  .otp-box {
    width: 46px;
    height: 52px;
    border: 1.5px solid #cbd5e1;
    border-radius: 12px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #1a3b3d;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(26, 59, 61, 0.15);
    }

    &:disabled {
      background: #e2e8f0;
      cursor: not-allowed;
    }
  }
}

.resend-box {
  font-size: 13px;
  color: #64748b;
  text-align: center;

  .resend-link {
    background: transparent;
    border: none;
    color: #0d9488;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    margin-left: 4px;

    &:hover:not(:disabled) {
      color: #0f766e;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .resend-timer {
    color: #94a3b8;
    margin-left: 4px;
    font-weight: 500;
  }
}
</style>
