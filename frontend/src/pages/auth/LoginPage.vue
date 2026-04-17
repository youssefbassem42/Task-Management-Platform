<template>
  <div class="login-page">
    <h2 class="form-title">Welcome back</h2>
    <p class="form-subtitle text-muted">Please enter your details to sign in.</p>
    
    <form @submit.prevent="handleLogin" class="auth-form">
      <AppInput 
        v-model="form.email" 
        label="Email" 
        type="email" 
        placeholder="Enter your email" 
        :error="errors.email"
      />
      <AppInput 
        v-model="form.password" 
        label="Password" 
        type="password" 
        placeholder="••••••••" 
        :error="errors.password"
      />
      <div class="flex items-center justify-between mt-2 mb-4">
        <div class="text-sm">
          <router-link to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </router-link>
        </div>
      </div>
      
      <div class="form-actions">
        <AppButton type="submit" variant="primary" class="w-full" :loading="globalLoading || loginLoading">Sign in</AppButton>
      </div>

      <div v-if="unverifiedEmail" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded text-center">
        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Your account is not verified yet.
        </p>
        <AppButton @click="handleResendVerification" variant="secondary" size="sm" :loading="resendLoading" type="button">
          Resend Verification Email
        </AppButton>
      </div>
    </form>
    
    <p class="auth-footer text-center mt-6 text-sm text-muted">
      Don't have an account? <router-link to="/register">Sign up</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'
import { storeToRefs } from 'pinia'
import authService from '@/api/authService'

const form = reactive({ email: '', password: '' })
const unverifiedEmail = ref('')
const loginLoading = ref(false)
const resendLoading = ref(false)
const { errors, validate } = useFormValidation({
  email: [
    { validator: isRequired, message: 'Email is required' },
    { validator: isValidEmail, message: 'Invalid email address' }
  ],
  password: [
    { validator: isRequired, message: 'Password is required' },
    { validator: minLength(6), message: 'Password must be at least 6 characters' }
  ]
})

const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()
const { isLoading: globalLoading } = storeToRefs(authStore)

const handleLogin = async () => {
  if (!validate(form)) return
  
  unverifiedEmail.value = ''
  loginLoading.value = true
  
  try {
    await authStore.login(form.email, form.password)
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

<style scoped>
.form-title { margin-bottom: var(--space-1); font-size: var(--font-size-2xl); color: var(--c-text-primary); }
.form-subtitle { margin-bottom: var(--space-6); }
.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
</style>
