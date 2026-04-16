<template>
  <div class="profile-page max-w-2xl">
    <h2 class="mb-6">My Profile</h2>
    <AppCard>
      <form @submit.prevent="saveProfile" class="flex-column gap-6">
        <div class="avatar-section">
          <AppAvatar :src="avatarPreview" :name="form.name || authStore.user?.name" size="xl" />
          <div class="avatar-controls">
            <AppFileUpload
              v-model="avatarFile"
              label="Profile picture"
              accept="image/jpeg, image/png, image/jpg, image/webp"
            />
            <p class="text-muted">Upload a square image for the cleanest result.</p>
          </div>
        </div>

        <div class="grid-2 gap-4">
          <AppInput v-model="form.name" label="Full Name" placeholder="Your name" :error="errors.name" />
          <AppInput v-model="form.email" label="Email" type="email" placeholder="Your email" :error="errors.email" />
        </div>

        <AppInput
          v-model="form.password"
          label="New password"
          type="password"
          placeholder="Leave blank to keep current password"
        />

        <div class="flex justify-end mt-4">
          <AppButton type="submit" variant="primary" :loading="isSaving">Save Changes</AppButton>
        </div>
      </form>
    </AppCard>
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
const avatarFile = ref(null)
const avatarPreview = ref('')

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const { errors, validate } = useFormValidation({
  name: [{ validator: isRequired, message: 'Name is required' }],
  email: [
    { validator: isRequired, message: 'Email is required' },
    { validator: isValidEmail, message: 'Invalid email' }
  ],
  password: [{ validator: (value) => !value || minLength(6)(value), message: 'Password must be at least 6 characters' }]
})

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name
    form.email = authStore.user.email
    avatarPreview.value = authStore.user.avatar || ''
  }
})

watch(avatarFile, (file) => {
  if (avatarPreview.value?.startsWith?.('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }

  avatarPreview.value = file instanceof File ? URL.createObjectURL(file) : authStore.user?.avatar || ''
})

onBeforeUnmount(() => {
  if (avatarPreview.value?.startsWith?.('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
})

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

    if (form.password) {
      payload.password = form.password
    }

    await authStore.updateProfile(payload)
    form.password = ''
    uiStore.addToast('success', 'Profile updated successfully')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update profile')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.max-w-2xl { max-width: 42rem; margin: 0 auto; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
.avatar-section { display: flex; gap: var(--space-5); align-items: center; }
.avatar-controls { flex: 1; display: flex; flex-direction: column; gap: var(--space-2); }
@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .avatar-section { flex-direction: column; align-items: flex-start; } }
</style>
