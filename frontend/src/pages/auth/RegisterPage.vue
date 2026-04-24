<template>
  <div class="flex flex-col">
    <div class="mb-8">
      <span class="inline-flex items-center rounded-full bg-secondary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-secondary">Create account</span>
      <h2 class="mt-4 font-['Sora'] text-[36px] font-[700] leading-[1.05] tracking-[-0.05em] text-on-surface">Create an account</h2>
      <p class="mt-3 max-w-sm text-sm leading-6 text-on-surface-variant">Join the future of fluid productivity with a calmer, sharper frontend aligned to the `/stitch` reference system.</p>
    </div>

    <div class="flex gap-4 mb-6">
      <button @click="loginWithGoogle" class="flex-1 flex justify-center items-center gap-2 py-3 bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-2xl text-on-surface font-medium hover:bg-surface-container-low transition-colors duration-200" type="button">
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
        </svg>
        Google
      </button>
      <button @click="loginWithGitHub" class="flex-1 flex justify-center items-center gap-2 py-3 bg-surface-container-lowest ring-1 ring-outline-variant/20 rounded-2xl text-on-surface font-medium hover:bg-surface-container-low transition-colors duration-200" type="button">
        <svg class="w-5 h-5 fill-on-surface" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
        </svg>
        GitHub
      </button>
    </div>

    <div class="relative flex items-center justify-center mb-6">
      <span class="bg-white px-4 text-xs font-label font-medium text-outline uppercase tracking-wider relative z-10">Or register with email</span>
      <div class="absolute w-full h-[1px] bg-outline-variant opacity-20"></div>
    </div>

    <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-label font-medium text-on-surface uppercase tracking-wider" for="name">Full Name</label>
        <div class="relative">
          <input 
            id="name" 
            v-model="form.name"
            class="w-full rounded-2xl border-none bg-surface-container-highest px-4 py-3 text-on-surface placeholder:text-outline shadow-inner transition-all duration-200 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 sm:text-sm" 
            :class="{'ring-2 ring-error/50 focus:ring-error': errors.name}"
            placeholder="Jane Doe" 
            type="text"
          />
        </div>
        <span v-if="errors.name" class="text-xs text-error font-medium">{{ errors.name }}</span>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-label font-medium text-on-surface uppercase tracking-wider" for="email">Email Address</label>
        <div class="relative">
          <input 
            id="email" 
            v-model="form.email"
            class="w-full rounded-2xl border-none bg-surface-container-highest px-4 py-3 text-on-surface placeholder:text-outline shadow-inner transition-all duration-200 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 sm:text-sm" 
            :class="{'ring-2 ring-error/50 focus:ring-error': errors.email}"
            placeholder="jane@example.com" 
            type="email"
          />
        </div>
        <span v-if="errors.email" class="text-xs text-error font-medium">{{ errors.email }}</span>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-label font-medium text-on-surface uppercase tracking-wider" for="password">Password</label>
        <div class="relative">
          <input 
            id="password" 
            v-model="form.password"
            class="w-full rounded-2xl border-none bg-surface-container-highest px-4 py-3 pr-12 font-mono tracking-widest text-on-surface placeholder:text-outline shadow-inner transition-all duration-200 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 sm:text-sm" 
            :class="{'ring-2 ring-error/50 focus:ring-error': errors.password}"
            placeholder="••••••••" 
            :type="showPassword ? 'text' : 'password'"
            @input="updatePasswordStrength"
          />
          <button @click="showPassword = !showPassword" aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors" type="button">
            <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
          </button>
        </div>
        <div class="rounded-[22px] border border-outline-variant/15 bg-surface-container-low/70 p-4 pt-3">
          <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Password checklist</p>
          <div class="grid grid-cols-2 gap-y-2 gap-x-2">
            <div class="flex items-center gap-1.5 transition-colors" :class="passwordStrength.length ? 'text-secondary' : 'text-on-surface-variant'">
                <span class="material-symbols-outlined text-[16px]" :style="passwordStrength.length ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.length ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span class="text-xs font-medium">8+ characters</span>
            </div>
            <div class="flex items-center gap-1.5 transition-colors" :class="passwordStrength.uppercase ? 'text-secondary' : 'text-on-surface-variant'">
                <span class="material-symbols-outlined text-[16px]" :style="passwordStrength.uppercase ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.uppercase ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span class="text-xs font-medium">1 uppercase</span>
            </div>
            <div class="flex items-center gap-1.5 transition-colors" :class="passwordStrength.number ? 'text-secondary' : 'text-on-surface-variant'">
                <span class="material-symbols-outlined text-[16px]" :style="passwordStrength.number ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.number ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span class="text-xs font-medium">1 number</span>
            </div>
            <div class="flex items-center gap-1.5 transition-colors" :class="passwordStrength.special ? 'text-secondary' : 'text-on-surface-variant'">
                <span class="material-symbols-outlined text-[16px]" :style="passwordStrength.special ? 'font-variation-settings: \'FILL\' 1;' : ''">{{ passwordStrength.special ? 'check_circle' : 'radio_button_unchecked' }}</span>
                <span class="text-xs font-medium">1 special char</span>
            </div>
          </div>
        </div>
        <span v-if="errors.password" class="text-xs text-error font-medium mt-1">{{ errors.password }}</span>
      </div>

      <button 
        type="submit" 
        :disabled="registerLoading"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary py-3.5 font-medium tracking-wide text-on-primary shadow-[0_20px_40px_-24px_rgba(0,74,198,0.8)] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <AppSpinner v-if="registerLoading" size="1rem" />
        Create Account
      </button>
    </form>

    <p class="mt-8 text-center text-sm font-body text-on-surface-variant">
        Already have an account? 
        <router-link to="/login" class="font-medium text-primary hover:text-primary-container transition-colors focus:outline-none focus:underline">Log in</router-link>
    </p>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'
import authService from '@/api/authService'
import AppSpinner from '@/components/shared/AppSpinner.vue'

const form = reactive({ name: '', email: '', password: '' })
const showPassword = ref(false)
const registerLoading = ref(false)
const passwordStrength = reactive({
    length: false,
    uppercase: false,
    number: false,
    special: false
})

const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()
const { isLoading: globalLoading } = storeToRefs(authStore)

const backendUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000';

const loginWithGoogle = () => {
  window.location.href = `${backendUrl}/api/auth/google/callback`;
}

const loginWithGitHub = () => {
  window.location.href = `${backendUrl}/api/auth/github`;
}

const validatePasswordComplexity = (val) => {
    return passwordStrength.length && passwordStrength.uppercase && passwordStrength.number && passwordStrength.special
}

const { errors, validate } = useFormValidation({
  name: [{ validator: isRequired, message: 'Name is required' }],
  email: [
    { validator: isRequired, message: 'Email is required' },
    { validator: isValidEmail, message: 'Invalid email address' }
  ],
  password: [
    { validator: isRequired, message: 'Password is required' },
    { validator: minLength(8), message: 'Password must be at least 8 characters' },
    { validator: validatePasswordComplexity, message: 'Password does not meet complexity requirements' }
  ]
})

const updatePasswordStrength = () => {
    const p = form.password
    passwordStrength.length = p.length >= 8
    passwordStrength.uppercase = /[A-Z]/.test(p)
    passwordStrength.number = /[0-9]/.test(p)
    passwordStrength.special = /[^A-Za-z0-9]/.test(p)
}

const handleRegister = async () => {
  if (!validate(form)) return

  registerLoading.value = true
  try {
    const data = await authService.register(form)
    uiStore.addToast('success', data.message || 'Registration successful! Please check your email to verify your account.')
    router.push('/login')
  } catch (err) {
    uiStore.addToast('error', err.message || 'Registration failed')
  } finally {
    registerLoading.value = false
  }
}
</script>
