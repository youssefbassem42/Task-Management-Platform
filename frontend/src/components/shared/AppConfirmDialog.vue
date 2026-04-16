<template>
  <AppModal v-model="uiStore.dialogState.isOpen" :title="uiStore.dialogState.title" size="sm">
    <p>{{ uiStore.dialogState.message }}</p>
    <template #footer>
      <AppButton variant="ghost" @click="uiStore.close">{{ uiStore.dialogState.cancelText }}</AppButton>
      <AppButton variant="primary" @click="confirm">{{ uiStore.dialogState.confirmText }}</AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

const uiStore = useConfirmDialog()

const confirm = async () => {
  if (uiStore.dialogState.onConfirm) {
    await uiStore.dialogState.onConfirm()
  }
}
</script>
