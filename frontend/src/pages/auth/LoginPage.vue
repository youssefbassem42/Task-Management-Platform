<template>
  <div class="flex flex-col">
    <div class="mb-8">
      <span class="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-on-primary-fixed">Sign in</span>
      <h2 class="mt-4 font-['Sora'] text-[36px] font-[700] leading-[1.05] tracking-[-0.05em] text-on-surface">Welcome back</h2>
      <p class="mt-3 max-w-sm text-sm leading-6 text-on-surface-variant">Log in to your workspace to continue managing boards, files, and high-priority delivery.</p>
    </div>

    <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider" for="email">Email Address</label>
        <div class="relative">
          <input 
            id="email" 
            v-model="form.email"
            class="w-full h-12 rounded-2xl border border-transparent bg-surface-container-highest px-4 text-on-surface placeholder:text-outline shadow-inner transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10" 
            :class="{'ring-2 ring-error/50 focus:ring-error': errors.email}"
            placeholder="name@company.com" 
            type="email"
          />
        </div>
        <span v-if="errors.email" class="text-xs text-error font-medium">{{ errors.email }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider" for="password">Password</label>
        <div class="relative">
          <input 
            id="password" 
            v-model="form.password"
            class="w-full h-12 rounded-2xl border border-transparent bg-surface-container-highest pl-4 pr-12 text-on-surface placeholder:text-outline shadow-inner transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10" 
            :class="{'ring-2 ring-error/50 focus:ring-error': errors.password}"
            placeholder="••••••••" 
            :type="showPassword ? 'text' : 'password'"
          />
          <button @click="showPassword = !showPassword" aria-label="Toggle password visibility" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface transition-colors focus:outline-none" type="button">
            <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
          </button>
        </div>
        <span v-if="errors.password" class="text-xs text-error font-medium">{{ errors.password }}</span>
      </div>

      <div class="flex items-center justify-between mt-[-8px]">
        <label class="flex items-center gap-2 cursor-pointer group">
          <div class="relative flex items-center justify-center w-5 h-5">
            <input type="checkbox" v-model="form.rememberMe" class="peer appearance-none w-5 h-5 rounded-[4px] border-2 border-outline-variant/50 bg-surface-container-highest checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 transition-all cursor-pointer" />
            <span class="material-symbols-outlined text-on-primary text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" style="font-variation-settings: 'FILL' 1;">check</span>
          </div>
          <span class="text-sm font-body text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
        </label>
        <router-link to="/forgot-password" class="text-sm font-body font-medium text-primary hover:text-primary-container transition-colors focus:outline-none focus:underline">Forgot password?</router-link>
      </div>

      <div v-if="unverifiedEmail" class="mt-1 rounded-[22px] border border-[#ffcc96] bg-tertiary-fixed/90 p-4 text-center shadow-sm">
        <div class="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/60 text-on-tertiary-fixed">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">mark_email_unread</span>
        </div>
        <p class="text-sm font-semibold text-on-tertiary-fixed">Your account is not verified yet.</p>
        <p class="mt-1 text-xs leading-5 text-on-tertiary-fixed/80">Resend the verification email and finish setup before signing in.</p>
        <button @click="handleResendVerification" :disabled="resendLoading" type="button" class="text-xs font-bold underline hover:text-primary-fixed disabled:opacity-50 transition-colors">
          {{ resendLoading ? 'Sending...' : 'Resend Verification Email' }}
        </button>
      </div>

      <button 
        type="submit" 
        :disabled="globalLoading || loginLoading"
        class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary text-on-primary font-label font-semibold tracking-wide shadow-[0_20px_40px_-24px_rgba(0,74,198,0.8)] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <AppSpinner v-if="globalLoading || loginLoading" size="1rem" />
        Sign In
      </button>
    </form>

    <div class="relative flex items-center justify-center py-6">
      <span class="relative z-10 bg-white px-4 text-xs font-label font-medium uppercase tracking-wider text-outline">Or continue with</span>
      <div class="absolute w-full h-[1px] bg-outline-variant opacity-20"></div>
    </div>

    <div class="flex flex-col gap-3">
      <button @click="loginWithGoogle" type="button" class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest font-label font-medium text-on-surface transition-colors duration-200 hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20">
        <svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
        </svg>
        Google
      </button>
      <button @click="loginWithGitHub" type="button" class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest font-label font-medium text-on-surface transition-colors duration-200 hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20">
        <svg class="h-5 w-5 fill-on-surface" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
        </svg>
        GitHub
      </button>
    </div>

    <p class="text-center text-sm font-body text-on-surface-variant mt-8">
        Don't have an account? 
        <router-link to="/register" class="font-medium text-primary hover:text-primary-container transition-colors focus:outline-none focus:underline">Sign up</router-link>
    </p>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'
import authService from '@/api/authService'
import AppSpinner from '@/components/shared/AppSpinner.vue'

const form = reactive({ email: '', password: '', rememberMe: false })
const unverifiedEmail = ref('')
const loginLoading = ref(false)
const resendLoading = ref(false)
const showPassword = ref(false)

const { errors, validate } = useFormValidation({
  email: [
    { validator: isRequired, message: 'Email is required' },
    { validator: isValidEmail, message: 'Invalid email address' }
  ],
  password: [
    { validator: isRequired, message: 'Password is required' }
  ]
})

const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()
const route = useRoute()
const { isLoading: globalLoading } = storeToRefs(authStore)

onMounted(() => {
  if (route.query.error) {
    uiStore.addToast('error', 'OAuth Authentication Failed. Please try again.');
  }
})

const backendUrl = import.meta.env.VITE_API_BASE_URL;

const loginWithGoogle = () => {
  window.location.href = `${backendUrl}/api/auth/google/callback`;
}

const loginWithGitHub = () => {
  window.location.href = `${backendUrl}/api/auth/callback/github`;
}

const handleLogin = async () => {
  if (!validate(form)) return
  
  unverifiedEmail.value = ''
  loginLoading.value = true
  
  try {
    await authStore.login(form.email, form.password, form.rememberMe)
    uiStore.addToast('success', 'Logged in successfully')
    router.push('/dashboard')
  } catch (err) {
    const errorMsg = err.message || 'Login failed'
    if (err.status === 403 && errorMsg.includes('verify')) {
      unverifiedEmail.value = form.email
    }
    uiStore.addToast('error', errorMsg)
  } finally {
    loginLoading.value = false
  }
}

const handleResendVerification = async () => {
  if (!unverifiedEmail.value) return
  resendLoading.value = true
  try {
    const res = await authService.resendVerification(unverifiedEmail.value)
    uiStore.addToast('success', res.message || 'Verification link sent!')
    unverifiedEmail.value = ''
  } catch (err) {
    uiStore.addToast('error', err.message || 'Failed to resend email')
  } finally {
    resendLoading.value = false
  }
}
</script>
