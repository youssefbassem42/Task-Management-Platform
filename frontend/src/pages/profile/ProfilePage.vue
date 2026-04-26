<template>
  <div class="max-w-4xl mx-auto pt-4 pb-12 w-full">
    <header class="mb-10 ml-2">
      <h1 class="text-3xl font-headline font-bold text-on-surface tracking-tight">Profile Settings</h1>
      <p class="text-on-surface-variant mt-2 font-medium">Manage your personal information and security preferences.</p>
    </header>
    
    <form @submit.prevent="saveProfile" class="bg-surface-container-low rounded-[2rem] p-4 flex flex-col gap-4">
      
      <!-- Personal Information Section -->
      <section class="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.02)] relative z-10">
        <h2 class="text-xl font-semibold text-on-surface mb-8 tracking-tight">Personal Information</h2>
        <div class="flex flex-col md:flex-row gap-10">
          
          <div class="flex flex-col items-center gap-4">
            <div class="relative w-32 h-32 rounded-full overflow-hidden group cursor-pointer ring-4 ring-surface bg-surface-container-high" @click="avatarInput?.click()">
              <input ref="avatarInput" type="file" accept="image/jpeg, image/png, image/jpg, image/webp" class="hidden" @change="handleFileChange" />
              <img v-if="avatarPreview || authStore.user?.avatar" :src="avatarPreview || authStore.user?.avatar" alt="Profile avatar" class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="w-full h-full flex justify-center items-center text-4xl text-on-surface font-bold uppercase bg-primary-container">
                  {{ (form.name || authStore.user?.name || 'U').charAt(0) }}
              </div>
              <div class="absolute inset-0 bg-surface-variant/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="material-symbols-outlined text-on-surface mb-1">photo_camera</span>
                <span class="text-xs font-medium text-on-surface">Change</span>
              </div>
            </div>
            <!-- Wait until we integrate a real delete endpoint if needed. For now just clear the current selection -->
            <button type="button" @click="removePhoto" class="text-sm font-medium text-primary hover:text-primary-container transition-colors">Remove Photo</button>
          </div>
          
          <div class="flex-1 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-on-surface-variant uppercase tracking-widest text-[11px]" for="fullName">Full Name</label>
              <input 
                id="fullName" 
                v-model="form.name"
                class="bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all border border-transparent focus:border-primary/20 shadow-inner w-full placeholder:text-slate-400 font-medium" 
                :class="{'ring-2 ring-error/50 focus:ring-error': errors.name}"
                type="text" 
                placeholder="Your name"
              />
              <span v-if="errors.name" class="text-xs text-error font-medium mt-1">{{ errors.name }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-on-surface-variant uppercase tracking-widest text-[11px]" for="email">Email Address</label>
              <!-- Disabling email based on visual mockup, but preserving backend logic if we do allow updates -->
              <input 
                id="email" 
                v-model="form.email"
                class="bg-surface rounded-xl px-4 py-3 text-on-surface-variant border-none w-full font-medium opacity-80 cursor-not-allowed ring-1 ring-outline-variant/10" 
                readonly 
                title="Email cannot be changed"
                type="email" 
              />
              <p class="text-xs text-on-surface-variant/70 mt-1">Email cannot be changed. Contact support for assistance.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Security Section -->
      <section class="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.02)] relative z-10">
        <h2 class="text-xl font-semibold text-on-surface mb-8 tracking-tight">Security</h2>
        <div class="max-w-md flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-on-surface-variant uppercase tracking-widest text-[11px]" for="oldPassword">Current Password</label>
            <input 
              id="oldPassword" 
              v-model="form.currentPassword"
              class="bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all border border-transparent shadow-inner w-full" 
              :class="{'ring-2 ring-error/50 focus:ring-error': errors.currentPassword}"
              placeholder="Enter current password" 
              type="password"
            />
            <span v-if="errors.currentPassword" class="text-xs text-error font-medium mt-1">{{ errors.currentPassword }}</span>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-sm font-semibold text-on-surface-variant uppercase tracking-widest text-[11px]" for="newPassword">New Password</label>
            <input 
              id="newPassword" 
              v-model="form.newPassword"
              class="bg-surface-container-highest rounded-xl px-4 py-3 text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all border border-transparent shadow-inner w-full" 
              :class="{'ring-2 ring-error/50 focus:ring-error': errors.newPassword}"
              placeholder="Minimum 8 characters" 
              type="password"
            />
            <span v-if="errors.newPassword" class="text-xs text-error font-medium mt-1">{{ errors.newPassword }}</span>
            <p v-else class="text-xs text-on-surface-variant/70 mt-1">Leave blank unless you want to change it.</p>
          </div>
        </div>
      </section>
      
      <!-- Save Button -->
      <div class="flex items-center justify-end pt-4 pr-2 relative">
         <span v-if="isSaving" class="absolute right-[200px] text-sm text-primary font-bold flex items-center gap-2">
           <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...
         </span>
         <button 
           type="submit"
           :disabled="isSaving"
           class="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-semibold rounded-full px-8 py-3 hover:saturate-150 transition-all duration-300 focus:ring-4 focus:ring-primary/20 shadow-[0px_8px_24px_rgba(37,99,235,0.25)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
         >
              Save Changes
         </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'

const authStore = useAuthStore()
const uiStore = useUIStore()
const isSaving = ref(false)

const avatarInput = ref(null)
const avatarFile = ref(null)
const avatarPreview = ref('')

const form = reactive({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: ''
})

const { errors, validate } = useFormValidation({
  name: [{ validator: isRequired, message: 'Name is required' }],
  email: [
    { validator: isRequired, message: 'Email is required' },
    { validator: isValidEmail, message: 'Invalid email' }
  ],
  currentPassword: [{ validator: (value) => !form.newPassword || (value && value.length > 0), message: 'Current password is required to set a new password' }],
  newPassword: [{ validator: (value) => !value || minLength(8)(value), message: 'Password must be at least 8 characters' }]
})

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name
    form.email = authStore.user.email
    avatarPreview.value = authStore.user.avatar || '../../assets/avatar-default.png'
  }
})

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if(file){
        avatarFile.value = file
    }
}

watch(avatarFile, (file) => {
  if (avatarPreview.value?.startsWith?.('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }

  avatarPreview.value = file instanceof File ? URL.createObjectURL(file) : authStore.user?.avatar || '../../assets/avatar-default.png'
})

onBeforeUnmount(() => {
  if (avatarPreview.value?.startsWith?.('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})

const removePhoto = () => {
    avatarFile.value = null
    avatarPreview.value = '../../assets/avatar-default.png'
    if(avatarInput.value) {
        avatarInput.value.value = ''
    }
}

const saveProfile = async () => {
  if (!validate(form)) return
  isSaving.value = true

  try {
    if (avatarFile.value instanceof File) {
      await authStore.uploadAvatar(avatarFile.value)
      avatarFile.value = null
    }

    const payload = {
      name: form.name,
      email: form.email
    }

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    await authStore.updateProfile(payload)
    form.currentPassword = ''
    form.newPassword = ''
    uiStore.addToast('success', 'Profile updated successfully')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update profile')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* No extra styles needed; mostly relying on Tailwind */
</style>
