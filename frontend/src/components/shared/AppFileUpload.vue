<template>
  <div class="app-file-upload">
    <label v-if="label" class="app-label">{{ label }}</label>
    <div class="upload-area" @click="triggerFileInput" :class="{ 'has-file': preview || modelValue, 'has-error': error }">
      <input type="file" ref="fileInput" class="hidden-input" :accept="accept" @change="onFileChange" />
      <template v-if="preview">
        <div class="preview-container">
          <img :src="preview" alt="Preview" class="image-preview" />
          <button type="button" class="remove-btn" @click.stop="clearFile">&times;</button>
        </div>
      </template>
      <template v-else-if="modelValue && typeof modelValue === 'string'">
        <div class="preview-container">
          <img :src="modelValue" alt="Current Image" class="image-preview" />
          <div class="overlay-text">Click to change</div>
        </div>
      </template>
      <div v-else class="upload-placeholder text-muted">
        <div class="icon"><span class="material-symbols-outlined">cloud_upload</span></div>
        <p>Click to upload {{ accept.includes('image') ? 'image' : 'file' }}</p>
        <span class="text-xs">Max size: {{ maxSizeMB }}MB</span>
      </div>
    </div>
    <span v-if="error || uploadError" class="error-msg">{{ error || uploadError }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

const props = defineProps({
  label: String,
  modelValue: [File, String],
  accept: { type: String, default: 'image/jpeg, image/png' },
  maxSizeMB: { type: Number, default: 5 },
  error: String
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const { file, preview, error: uploadError, handleFileChange, clearFile: doClear } = useFileUpload({ maxSizeMB: props.maxSizeMB, accept: props.accept })

const triggerFileInput = () => fileInput.value?.click()

const onFileChange = (e) => {
  handleFileChange(e)
  if (!uploadError.value) {
    emit('update:modelValue', file.value)
  }
}

const clearFile = () => {
  doClear()
  if (fileInput.value) fileInput.value.value = ''
  emit('update:modelValue', null)
}
</script>

<style scoped>
.app-file-upload { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; }
.app-label { font-size: var(--font-size-xs); font-weight: 700; color: var(--c-text-secondary); text-transform: uppercase; letter-spacing: 0.12em; }
.hidden-input { display: none; }
.upload-area {
  border: 2px dashed var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(242,244,246,0.92));
  position: relative;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center; min-height: 120px;
}
.upload-area:hover { border-color: rgba(37, 99, 235, 0.4); background: rgba(219, 225, 255, 0.45); }
.upload-area.has-file { padding: 0; border-style: solid; border-color: var(--c-border-light); }
.has-error { border-color: rgba(186, 26, 26, 0.35); background: rgba(255, 218, 214, 0.4); }
.preview-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.image-preview { max-width: 100%; max-height: 200px; object-fit: contain; }
.remove-btn { 
  position: absolute; top: var(--space-2); right: var(--space-2);
  background: var(--c-danger); color: white; border: none; border-radius: 50%;
  width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.overlay-text { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(25, 28, 30, 0.58); color: white; padding: var(--space-1); font-size: var(--font-size-xs); }
.upload-placeholder { color: var(--c-text-secondary); }
.icon { font-size: var(--font-size-2xl); margin-bottom: var(--space-2); display: inline-flex; justify-content: center; color: var(--c-primary); }
.error-msg { font-size: var(--font-size-xs); color: var(--c-danger); font-weight: 600; }
</style>
