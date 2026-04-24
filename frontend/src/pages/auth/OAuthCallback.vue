<template>
  <div class="flex h-screen w-full items-center justify-center bg-surface">
    <div class="flex flex-col items-center gap-4">
      <AppSpinner size="3rem" />
      <p class="text-on-surface-variant font-medium">Authenticating...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import AppSpinner from '@/components/shared/AppSpinner.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

onMounted(async () => {
  const token = route.query.token;
  
  if (token) {
    authStore.setToken(token, true);
    try {
      await authStore.fetchProfile();
      uiStore.addToast('success', 'Logged in successfully via OAuth');
      router.push('/dashboard');
    } catch (error) {
      uiStore.addToast('error', 'Failed to fetch profile. Please try again.');
      router.push('/login');
    }
  } else {
    uiStore.addToast('error', 'Authentication failed. No token received.');
    router.push('/login');
  }
});
</script>
