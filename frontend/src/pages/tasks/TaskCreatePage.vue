<template>
  <div class="task-form-page">
    <div class="page-header mb-6">
      <AppBreadcrumb :items="[{ label: 'Tasks', to: '/tasks' }, { label: isEdit ? 'Edit Task' : 'New Task' }]" />
      <h2 class="mt-2">{{ isEdit ? 'Edit Task' : 'Create New Task' }}</h2>
    </div>

    <AppCard class="max-w-2xl">
      <form @submit.prevent="submitForm" class="flex-column gap-4">
        <AppInput v-model="form.title" label="Task Title" placeholder="Enter task title" :error="errors.title" />
        
        <div class="form-group flex-column gap-1">
          <label class="app-label">Description</label>
          <textarea v-model="form.description" class="app-textarea" rows="4" placeholder="Task description..."></textarea>
        </div>

        <div class="grid-2 gap-4">
          <AppSelect v-model="form.status" label="Status" :options="statusOptions" :error="errors.status" />
          <AppSelect v-model="form.priority" label="Priority" :options="priorityOptions" :error="errors.priority" />
        </div>

        <div class="grid-2 gap-4">
          <AppInput v-model="form.dueDate" label="Due Date" type="date" :error="errors.dueDate" />
          <AppSelect
            v-model="form.assignedTo"
            label="Assign Team Members"
            :options="userOptions"
            :error="errors.assignedTo"
            multiple
            :disabled="userStore.isLoading || isSubmitting"
          />
        </div>

        <p class="text-muted text-sm">Select one or more assignees to match the backend array contract.</p>

        <div class="flex justify-end gap-2 mt-4">
          <AppButton type="button" variant="ghost" @click="$router.push('/tasks')">Cancel</AppButton>
          <AppButton type="submit" variant="primary" :loading="isSubmitting">{{ isEdit ? 'Save Changes' : 'Create Task' }}</AppButton>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { isRequired } from '@/utils/validators'
import { TASK_STATUS, TASK_PRIORITY } from '@/utils/constants'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()
const userStore = useUserStore()
const uiStore = useUIStore()

const isEdit = computed(() => !!route.params.id)
const taskId = route.params.id

const form = reactive({
  title: '',
  description: '',
  status: TASK_STATUS.PENDING,
  priority: TASK_PRIORITY.MEDIUM,
  dueDate: '',
  assignedTo: []
})

const { errors, validate } = useFormValidation({
  title: [{ validator: isRequired, message: 'Title is required' }],
  dueDate: [{ validator: isRequired, message: 'Due date is required' }],
  assignedTo: [{ validator: (value) => Array.isArray(value) && value.length > 0, message: 'Select at least one assignee' }]
})

const statusOptions = Object.values(TASK_STATUS).map(v => ({ label: v, value: v }))
const priorityOptions = Object.values(TASK_PRIORITY).map(v => ({ label: v, value: v }))
const userOptions = computed(() => userStore.userOptions)

const isSubmitting = ref(false)

onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load users')
  }
  
  if (isEdit.value) {
    try {
      const task = await taskStore.fetchTaskById(taskId)
      form.title = task.title
      form.description = task.description
      form.status = task.status
      form.priority = task.priority
      form.dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      form.assignedTo = task.assignedTo?.map((user) => user._id || user) || []
    } catch (e) {
       uiStore.addToast('error', 'Failed to load task')
       router.push('/tasks')
    }
  }
})

const submitForm = async () => {
  if (!validate(form)) return
  
  isSubmitting.value = true
  try {
    const payload = { ...form, assignedTo: [...form.assignedTo] }

    if (isEdit.value) {
      await taskStore.updateTask(taskId, payload)
      uiStore.addToast('success', 'Task updated successfully')
    } else {
      await taskStore.createTask(payload)
      uiStore.addToast('success', 'Task created successfully')
    }
    router.push('/tasks')
  } catch (e) {
    uiStore.addToast('error', e.message || 'Failed to save task')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.app-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--c-text-secondary); }
.app-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  font-family: inherit;
  resize: vertical;
  outline: none;
}
.app-textarea:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-alpha); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
.max-w-2xl { max-width: 42rem; margin: 0 auto; }
@media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
