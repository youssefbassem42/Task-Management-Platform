<template>
  <div class="flex flex-col relative overflow-hidden">
    <!-- Subtle top highlight for depth matching the specific Forgot Password design -->
    <div class="absolute -top-8 -left-8 -right-8 h-1 bg-gradient-to-r from-primary-container to-primary opacity-20 hidden"></div>
    
    <!-- Header Text -->
    <h2 class="text-[32px] leading-tight font-headline font-bold tracking-tight text-on-surface mb-3">Forgot Password?</h2>
    <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-8">
        Enter the email address associated with your account, and we'll send you a secure link to reset your password.
    </p>

    <!-- Form Section -->
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">

      <!-- Success Message -->
      <div v-if="successMsg" class="p-4 bg-secondary text-white rounded-xl shadow-sm">
        <h3 class="text-sm font-medium">{{ successMsg }}</h3>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-[#fee2e2] text-[#ef4444] rounded-xl shadow-sm">
        <h3 class="text-sm font-medium">{{ error }}</h3>
      </div>
      
      <!-- Input Group: Email -->
      <div class="flex flex-col gap-2">
        <label class="font-label text-sm font-medium text-on-surface" for="email">Email Address</label>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
          <input 
            id="email" 
            v-model="email"
            required
            class="w-full bg-surface-container-highest rounded-lg pl-12 pr-4 py-3.5 text-on-surface placeholder:text-outline border border-transparent focus:bg-surface-container-lowest focus:ring-[4px] focus:ring-primary/20 focus:border-primary/20 focus:outline-none transition-all duration-200" 
            placeholder="name@company.com" 
            type="email"
          />
        </div>
      </div>

      <div class="flex flex-col gap-4 mt-2">
        <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-gradient-to-br from-primary-container to-primary text-on-primary-container rounded-xl px-6 py-4 font-label font-medium text-base hover:brightness-110 focus:ring-[4px] focus:ring-primary/20 focus:outline-none transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            <AppSpinner v-if="loading" size="1rem" />
            Send Reset Link
        </button>
        
        <router-link to="/login" class="w-full rounded-xl px-6 py-4 font-label font-medium text-sm text-primary hover:bg-surface-container-high transition-colors duration-200 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Return to log in
        </router-link>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '@/api/authService';
import AppSpinner from '@/components/shared/AppSpinner.vue'

const email = ref('');
const loading = ref(false);
const error = ref('');
const successMsg = ref('');

const handleSubmit = async () => {
  if (!email.value) return;
  
  error.value = '';
  successMsg.value = '';
  loading.value = true;
  
  try {
    const res = await authService.forgotPassword(email.value);
    successMsg.value = res.message || 'If that email exists in our system, a password reset link has been sent.';
  } catch (err) {
    error.value = err.message || 'Something went wrong. Please try again later.';
  } finally {
    loading.value = false;
  }
};
</script>
