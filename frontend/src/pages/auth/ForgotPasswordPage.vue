<template>
  <div>
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Enter your email to receive a password reset link
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="successMsg" class="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
              {{ successMsg }}
            </h3>
          </div>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ error }}
            </h3>
          </div>
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div class="mt-1">
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Send Reset Link
        </button>
      </div>
      
      <div class="text-sm text-center mt-4">
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Back to login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '@/api/authService';

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
