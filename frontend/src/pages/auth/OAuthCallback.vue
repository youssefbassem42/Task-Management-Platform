<template>
  <div class="flex h-screen w-full items-center justify-center bg-surface">
    <div v-if="!isProcessing" class="flex flex-col items-center gap-4">
      <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <span class="material-symbols-outlined text-error" style="font-variation-settings: 'FILL' 1;">error</span>
      </div>
      <p class="text-center text-on-surface font-medium">{{ errorMessage }}</p>
      <button
        @click="handleRetry"
        class="mt-4 px-6 py-2 rounded-full bg-primary text-on-primary font-medium hover:brightness-110 transition-all"
      >
        Back to Login
      </button>
    </div>
    <div v-else class="flex flex-col items-center gap-4">
      <AppSpinner size="3rem" />
      <p class="text-on-surface-variant font-medium">Authenticating...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import AppSpinner from '@/components/shared/AppSpinner.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const isProcessing = ref(true);
const errorMessage = ref('');

const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // JWT basic validation: should have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

const handleRetry = () => {
  router.push('/login');
};

onMounted(async () => {
  try {
    const token = route.query.token;
    
    // Edge case 1: Missing token
    if (!token) {
      errorMessage.value = 'Authentication failed: No token received. Please try again.';
      isProcessing.value = false;
      uiStore.addToast('error', 'Authentication failed. No token received.');
      return;
    }

    // Edge case 2: Invalid token format
    if (!validateToken(token)) {
      errorMessage.value = 'Authentication failed: Invalid token format. Please try again.';
      isProcessing.value = false;
      uiStore.addToast('error', 'Invalid token received.');
      return;
    }

    // Set token before fetching profile
    authStore.setToken(token, true);
    
    // Edge case 3: Failed profile fetch
    try {
      await authStore.fetchProfile();
      uiStore.addToast('success', 'Logged in successfully via OAuth');
      router.push('/dashboard');
    } catch (profileError) {
      // ✅ NEW: Handle specific error codes
      const errorCode = profileError?.errorCode;
      
      if (errorCode === 'TOKEN_INVALID' || errorCode === 'TOKEN_EXPIRED') {
        // Token is invalid/expired - must logout
        authStore.logout();
        errorMessage.value = 'Your token is invalid or expired. Please log in again.';
        uiStore.addToast('error', 'Token invalid or expired.');
      } else if (errorCode === 'USER_NOT_FOUND') {
        // User doesn't exist - must logout
        authStore.logout();
        errorMessage.value = 'User account not found. Please contact support.';
        uiStore.addToast('error', 'Account not found.');
      } else {
        // Temporary error (server issue, cold start, etc)
        // IMPORTANT: Do NOT delete token on profile fetch failure
        // Token may still be valid, profile fetch might fail due to temporary server issues
        console.warn('[OAuth] Profile fetch failed (temporary):', profileError?.message);
        errorMessage.value = 'Failed to fetch profile. Please try logging in again.';
        uiStore.addToast('error', 'Failed to fetch profile data.');
      }
      isProcessing.value = false;
    }
  } catch (error) {
    console.error('[OAuth] Unexpected error:', error);
    console.warn('[OAuth] Token status:', {
      inLocalStorage: !!localStorage.getItem('taskmanager_token'),
      inSessionStorage: !!sessionStorage.getItem('taskmanager_token'),
      inStore: !!authStore.token
    });
    errorMessage.value = 'An unexpected error occurred. Please try again.';
    isProcessing.value = false;
    uiStore.addToast('error', error?.message || 'Authentication error.');
  }
});
</script>
