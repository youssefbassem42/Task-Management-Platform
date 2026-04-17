<template>
  <div>
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Verify Your Account</h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center my-6">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="text-center">
      <router-link
        v-if="success"
        to="/login"
        class="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Go to Login
      </router-link>
      <router-link
        v-else
        to="/register"
        class="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
    message.value = res.message || 'Account successfully verified!';
    success.value = true;
  } catch (error) {
    message.value = error.message || 'Verification failed. The link might be expired or invalid.';
  } finally {
    loading.value = false;
  }
});
</script>
