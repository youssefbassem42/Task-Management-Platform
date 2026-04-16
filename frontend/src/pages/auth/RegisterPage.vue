<template>
  <div class="register-page">
    <h2 class="form-title">Create an account</h2>
    <p class="form-subtitle text-muted">Start collaborating on task boards.</p>

    <form @submit.prevent="handleRegister" class="auth-form">
      <AppInput
        v-model="form.name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        :error="errors.name"
      />
      <AppInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="john@example.com"
        :error="errors.email"
      />
      <AppInput
        v-model="form.password"
        label="Password"
        type="password"
        placeholder="••••••••"
        :error="errors.password"
      />

      <div class="form-actions mt-4">
        <AppButton type="submit" variant="primary" class="w-full" :loading="globalLoading">Sign up</AppButton>
      </div>
    </form>

    <p class="auth-footer text-center mt-6 text-sm text-muted">
      Already have an account? <router-link to="/login">Sign in</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'
import { storeToRefs } from 'pinia'

const form = reactive({ name: '', email: '', password: '' })
const { errors, validate } = useFormValidation({
  name: [{ validator: isRequired, message: 'Name is required' }],
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

const handleRegister = async () => {
  if (!validate(form)) return

  try {
    await authStore.register(form)
    uiStore.addToast('success', 'Account created successfully')
    router.push('/dashboard')
  } catch (err) {
    uiStore.addToast('error', err.message || 'Registration failed')
  }
}
</script>

<style scoped>
.form-title { margin-bottom: var(--space-1); font-size: var(--font-size-2xl); color: var(--c-text-primary); }
.form-subtitle { margin-bottom: var(--space-6); }
.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
</style>
