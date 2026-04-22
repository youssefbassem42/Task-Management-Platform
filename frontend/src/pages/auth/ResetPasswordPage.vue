<template>
  <div class="flex flex-col relative overflow-hidden">
    
    <!-- Step Indicator (Optional visual parity with design) -->
    <div class="mb-4">
      <span class="font-label text-xs uppercase tracking-[0.05em] text-outline font-semibold">Step 2</span>
    </div>

    <!-- Header Text -->
    <h2 class="text-[32px] leading-tight font-headline font-bold tracking-tight text-on-surface mb-3">Create New Password</h2>
    <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-8">
        Your new password must be unique and adhere to our security requirements.
    </p>

    <!-- Error Message -->
    <div v-if="error" class="p-4 mb-4 bg-[#fee2e2] text-[#ef4444] rounded-xl shadow-sm">
      <h3 class="text-sm font-medium">{{ error }}</h3>
    </div>

    <!-- Success Message & CTA -->
    <div v-if="successMsg" class="flex flex-col gap-4">
        <div class="p-4 bg-secondary text-white rounded-xl shadow-sm">
            <h3 class="text-sm font-medium">{{ successMsg }}</h3>
        </div>
        <router-link to="/login" class="w-full bg-gradient-to-br from-primary-container to-primary text-on-primary-container rounded-xl px-6 py-4 font-label font-medium text-base hover:brightness-110 focus:ring-[4px] focus:ring-primary/20 focus:outline-none transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2">
            Go to Login
        </router-link>
    </div>

    <!-- Form Section -->
    <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-6">

      <!-- New Password -->
      <div class="flex flex-col gap-2">
        <label class="font-label text-sm font-medium text-on-surface" for="new-password">New Password</label>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
          <input 
            id="new-password" 
            v-model="password"
            @input="updatePasswordStrength"
            required
            class="w-full bg-surface-container-highest rounded-lg pl-12 pr-12 py-3.5 text-on-surface placeholder:text-outline border border-transparent focus:bg-surface-container-lowest focus:ring-[4px] focus:ring-primary/20 focus:border-primary/20 focus:outline-none transition-all duration-200" 
            placeholder="••••••••" 
            :type="showPassword ? 'text' : 'password'"
          />
          <button @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
            <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
          </button>
        </div>
      </div>

      <!-- Password Validation Checklist -->
      <div class="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3">
        <div class="flex items-center gap-3" :class="passwordStrength.length ? 'text-secondary' : 'text-on-surface-variant'">
            <span class="material-symbols-outlined text-[20px]" :style="passwordStrength.length ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.length ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span class="font-body text-sm" :class="passwordStrength.length ? 'text-on-surface' : ''">At least 8 characters long</span>
        </div>
        <div class="flex items-center gap-3" :class="passwordStrength.uppercase ? 'text-secondary' : 'text-on-surface-variant'">
            <span class="material-symbols-outlined text-[20px]" :style="passwordStrength.uppercase ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.uppercase ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span class="font-body text-sm" :class="passwordStrength.uppercase ? 'text-on-surface' : ''">Contains an uppercase letter</span>
        </div>
        <div class="flex items-center gap-3" :class="passwordStrength.number ? 'text-secondary' : 'text-on-surface-variant'">
            <span class="material-symbols-outlined text-[20px]" :style="passwordStrength.number ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.number ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span class="font-body text-sm" :class="passwordStrength.number ? 'text-on-surface' : ''">Contains a number</span>
        </div>
        <div class="flex items-center gap-3" :class="passwordStrength.special ? 'text-secondary' : 'text-on-surface-variant'">
            <span class="material-symbols-outlined text-[20px]" :style="passwordStrength.special ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.special ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span class="font-body text-sm" :class="passwordStrength.special ? 'text-on-surface' : ''">Contains a special character</span>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="flex flex-col gap-2">
        <label class="font-label text-sm font-medium text-on-surface" for="confirm-password">Confirm Password</label>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock_reset</span>
          <input 
            id="confirm-password" 
            v-model="confirmPassword"
            required
            class="w-full bg-surface-container-highest rounded-lg pl-12 pr-4 py-3.5 text-on-surface placeholder:text-outline border border-transparent focus:bg-surface-container-lowest focus:ring-[4px] focus:ring-primary/20 focus:border-primary/20 focus:outline-none transition-all duration-200" 
            placeholder="••••••••" 
            type="password"
          />
        </div>
      </div>

      <div class="mt-4">
        <button 
            type="submit" 
            :disabled="loading || !isPasswordValid || password !== confirmPassword"
            class="w-full rounded-xl px-6 py-4 font-label font-medium text-base transition-all duration-200 flex items-center justify-center gap-2"
            :class="(isPasswordValid && password === confirmPassword) ? 'bg-gradient-to-br from-primary-container to-primary text-on-primary-container hover:brightness-110 shadow-[0_4px_12px_rgba(37,99,235,0.2)]' : 'bg-surface-variant text-outline cursor-not-allowed'"
        >
            <AppSpinner v-if="loading" size="1rem" />
            Update Password
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import authService from '@/api/authService';
import AppSpinner from '@/components/shared/AppSpinner.vue'

const route = useRoute();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const successMsg = ref('');
const token = ref('');
const showPassword = ref(false);

const passwordStrength = reactive({
    length: false,
    uppercase: false,
    number: false,
    special: false
})

const isPasswordValid = computed(() => passwordStrength.length && passwordStrength.uppercase && passwordStrength.number && passwordStrength.special)

const updatePasswordStrength = () => {
    const p = password.value
    passwordStrength.length = p.length >= 8
    passwordStrength.uppercase = /[A-Z]/.test(p)
    passwordStrength.number = /[0-9]/.test(p)
    passwordStrength.special = /[^A-Za-z0-9]/.test(p)
}

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Ensure you clicked the full link.';
  }
});

const handleSubmit = async () => {
  if (!password.value || !confirmPassword.value) return;
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  
  if (!token.value) {
    error.value = 'No token provided.';
    return;
  }
  
  error.value = '';
  successMsg.value = '';
  loading.value = true;
  
  try {
    const res = await authService.resetPassword(token.value, password.value);
    successMsg.value = res.message || 'Password reset successfully.';
  } catch (err) {
    error.value = err.message || 'Failed to reset password.';
  } finally {
    loading.value = false;
  }
};
</script>
