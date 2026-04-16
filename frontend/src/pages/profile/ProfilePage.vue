<template>
  <div class="profile-page max-w-2xl">
    <h2 class="mb-6">My Profile</h2>
    <AppCard>
      <form @submit.prevent="saveProfile" class="flex-column gap-6">
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
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired, isValidEmail, minLength } from '@/utils/validators'

const authStore = useAuthStore()
const uiStore = useUIStore()
const isSaving = ref(false)

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
  }
})

const saveProfile = async () => {
  if (!validate(form)) return
  isSaving.value = true

  try {
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
@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
