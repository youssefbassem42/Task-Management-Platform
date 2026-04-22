<template>
  <div class="flex flex-col items-center text-center py-6">
    
    <div v-if="loading" class="flex flex-col items-center justify-center gap-4 py-8">
      <AppSpinner size="3rem" class="text-primary" />
      <h2 class="font-headline text-2xl font-bold text-on-surface">Verifying...</h2>
    </div>

    <div v-else class="flex flex-col items-center justify-center relative w-full">
        <!-- Optional subtle inner glow for depth -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-2xl rounded-full" :class="success ? 'bg-secondary-container/30' : 'bg-error-container/30'"></div>

        <!-- Iconography -->
        <div class="relative mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-sm" :class="success ? 'bg-secondary-container' : 'bg-error-container'">
            <span class="material-symbols-outlined text-5xl" :class="success ? 'text-on-secondary-container' : 'text-on-error-container'" style="font-variation-settings: 'FILL' 1;">
                {{ success ? 'check_circle' : 'error' }}
            </span>
        </div>

        <!-- Typography Hierarchy -->
        <h1 class="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mb-4">
            {{ success ? 'Account Verified' : 'Verification Failed' }}
        </h1>
        <p class="font-body text-lg text-on-surface-variant mb-12 max-w-xs mx-auto leading-relaxed">
            {{ message }}
        </p>

        <!-- Primary CTA Button (Tactile Command) -->
        <router-link 
            v-if="success"
            to="/login"
            class="block w-full py-4 px-6 rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary font-label text-base font-semibold tracking-wide hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 ease-out shadow-sm"
        >
            Go to Login
        </router-link>
        
        <router-link 
            v-else
            to="/register"
            class="block w-full py-4 px-6 rounded-xl bg-surface-variant text-on-surface font-label text-base font-semibold tracking-wide hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 ease-out shadow-sm"
        >
            Back to Register
        </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import authService from '@/api/authService';
import AppSpinner from '@/components/shared/AppSpinner.vue';

const route = useRoute();
const message = ref('Verifying your email please wait...');
const loading = ref(true);
const success = ref(false);

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    message.value = 'Invalid or missing verification token.';
    loading.value = false;
    return;
  }

  try {
    const res = await authService.verifyEmail(token);
    message.value = res.message || 'You are all set to start organizing your tasks.';
    success.value = true;
  } catch (error) {
    message.value = error.message || 'The link might be expired or invalid.';
  } finally {
    loading.value = false;
  }
});
</script>
