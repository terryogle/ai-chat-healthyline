<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  (e: 'submit', data: { mode: 'email', value: string, verificationCode?: string }): void;
  (e: 'cancel'): void;
}>();

const email = ref('');

// Step 1: Input email, Step 2: Verification code
const step = ref<'input' | 'otp'>('input');
const otpCode = ref(['', '', '', '', '', '']);
const otpInputs = ref<(HTMLInputElement | null)[]>([]);
const isSendingCode = ref(false);
const pushNotificationReceived = ref(false);

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
});

const canSubmitInput = computed(() => isEmailValid.value);

const fullOtpCode = computed(() => otpCode.value.join(''));
const isOtpValid = computed(() => fullOtpCode.value.length === 6 && /^\d+$/.test(fullOtpCode.value));

function handleNextStep() {
  if (!canSubmitInput.value) return;

  // Email mode -> proceed to OTP step
  isSendingCode.value = true;
  setTimeout(() => {
    isSendingCode.value = false;
    step.value = 'otp';
    
    // Simulate push notification auto-fill in 1.2s for smooth demo
    setTimeout(() => {
      pushNotificationReceived.value = true;
      // Auto-fill OTP code from Push
      const sampleCode = ['8', '4', '9', '2', '0', '1'];
      sampleCode.forEach((num, idx) => {
        otpCode.value[idx] = num;
      });
    }, 1200);
  }, 600);
}

function handleOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  
  if (val.length > 1) {
    // Handle paste
    const digits = val.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => {
      otpCode.value[i] = d;
    });
    return;
  }

  otpCode.value[index] = val;

  if (val && index < 5 && otpInputs.value[index + 1]) {
    otpInputs.value[index + 1]?.focus();
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpCode.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
}

function handleVerifyAndSubmit() {
  if (!isOtpValid.value) return;
  
  emit('submit', {
    mode: 'email',
    value: email.value.trim(),
    verificationCode: fullOtpCode.value
  });
}
</script>

<template>
  <div class="order-auth-card">
    <div class="card-header">
      <button class="back-link" @click="step === 'otp' ? (step = 'input') : emit('cancel')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back</span>
      </button>
    </div>

    <!-- STEP 1: EMAIL INPUT -->
    <template v-if="step === 'input'">
      <h3 class="card-title">Existing customer?</h3>

      <div class="form-group">
        <label class="form-label">Your email</label>
        <input 
          v-model="email" 
          type="email" 
          class="form-input" 
          placeholder="Enter your email"
          @keyup.enter="handleNextStep"
          autofocus
        />
      </div>

      <button 
        class="submit-btn" 
        :disabled="!canSubmitInput || isSendingCode"
        @click="handleNextStep"
      >
        <span v-if="isSendingCode">Sending code...</span>
        <span v-else class="btn-content">
          Enter
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </button>
    </template>

    <!-- STEP 2: OTP VERIFICATION -->
    <template v-else>
      <h3 class="card-title">Enter Verification Code</h3>
      <p class="card-subtitle">
        We sent a 6-digit code to <strong>{{ email }}</strong>
      </p>

      <!-- Simulated Push Notification Banner -->
      <transition name="fade">
        <div v-if="pushNotificationReceived" class="push-alert">
          <div class="push-icon">📲</div>
          <div class="push-text">
            <strong>Push Code Auto-filled:</strong>
            <span>849201</span>
          </div>
        </div>
      </transition>

      <div class="otp-inputs-container">
        <input 
          v-for="(_, index) in 6" 
          :key="index"
          :ref="(el) => (otpInputs[index] = el as HTMLInputElement)"
          v-model="otpCode[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-box"
          @input="handleOtpInput(index, $event)"
          @keydown="handleOtpKeydown(index, $event)"
        />
      </div>

      <button 
        class="submit-btn" 
        :disabled="!isOtpValid"
        @click="handleVerifyAndSubmit"
      >
        <span class="btn-content">
          Verify &amp; View Orders
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </button>

      <div class="resend-box">
        Didn't receive code? 
        <button class="resend-link" @click="handleNextStep">Resend Code</button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.order-auth-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px 22px 22px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
    gap: 4px;
    padding: 0;

    &:hover {
      color: #0f172a;
    }
  }
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
  letter-spacing: -0.3px;
}

.card-subtitle {
  font-size: 14px;
  color: #475569;
  margin: -8px 0 18px;
  line-height: 1.4;

  strong {
    color: #0f172a;
  }
}

.form-group-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: #334155;
  }

  .form-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 15px;
    color: #0f172a;
    background: #ffffff;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
      border-color: #18181b;
      box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
}

.submit-btn {
  width: 100%;
  background: #18181b;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(24, 24, 27, 0.15);
  margin-bottom: 14px;

  &:hover:not(:disabled) {
    background: #27272a;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(24, 24, 27, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}

.toggle-mode-btn {
  background: transparent;
  border: none;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  width: 100%;
  text-align: center;
  transition: color 0.2s ease;

  &:hover {
    color: #0f172a;
    text-decoration: underline;
  }
}

/* OTP STYLES */
.push-alert {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  .push-icon {
    font-size: 20px;
  }

  .push-text {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #166534;

    strong {
      font-size: 13px;
    }

    span {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
    }
  }
}

.otp-inputs-container {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 20px;

  .otp-box {
    width: 44px;
    height: 48px;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #18181b;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.1);
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
    color: #0f172a;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    margin-left: 4px;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
