<template>
  <div class="task-detail-page">
    <div v-if="taskStore.isLoading" class="flex justify-center p-12"><AppSpinner /></div>
    <div v-else-if="taskStore.error" class="text-danger">{{ taskStore.error }}</div>
    <div v-else-if="task">
      
      <div class="page-header mb-6 flex justify-between align-center">
        <div>
          <AppBreadcrumb :items="[{ label: 'Tasks', to: '/tasks' }, { label: task.title }]" />
          <h2 class="mt-2">{{ task.title }}</h2>
        </div>
        <div class="actions flex gap-2" v-if="authStore.permissions.canManageTasks">
          <AppButton variant="ghost" @click="$router.push(`/tasks/${task._id}/edit`)">Edit Task</AppButton>
        </div>
      </div>

      <div class="grid detail-grid gap-6">
        <div class="main-col">
          <AppCard title="Description" class="mb-6">
            <p v-if="task.description" class="whitespace-pre-wrap">{{ task.description }}</p>
            <p v-else class="text-muted italic">No description provided.</p>
          </AppCard>
          
          <AppCard title="Checklist" class="mb-6">
             <div v-if="task.todoChecklist && task.todoChecklist.length > 0" class="flex-column gap-2">
               <div v-for="(item, idx) in task.todoChecklist" :key="idx" class="flex gap-2 align-center">
                 <input type="checkbox" :checked="item.completed" :disabled="taskStore.mutationLoading || !canUpdateTask" @change="toggleTodo(idx, $event.target.checked)" />
                 <span :class="{ 'line-through text-muted': item.completed }">{{ item.text }}</span>
               </div>
             </div>
             <div v-else class="text-muted text-sm pb-2">No checklist items.</div>
             
             <div class="mt-4 flex gap-2">
               <AppInput v-model="newTodoText" placeholder="Add new item..." @keyup.enter="addTodo" class="flex-grow" :disabled="!canUpdateTask" />
               <AppButton @click="addTodo" :loading="taskStore.mutationLoading" :disabled="!canUpdateTask">Add</AppButton>
             </div>
          </AppCard>
        </div>

        <div class="side-col">
          <AppCard title="Details">
            <ul class="details-list">
              <li>
                <span class="label">Status</span>
                <AppSelect v-model="taskStatus" :options="statusOptions" @update:modelValue="updateStatus" v-if="canUpdateTask" />
                <AppBadge v-else :text="task.status" />
              </li>
              <li>
                <span class="label">Priority</span>
                <AppBadge :text="task.priority" />
              </li>
              <li>
                <span class="label">Due Date</span>
                <span>{{ formatDate(task.dueDate) }}</span>
              </li>
              <li>
                <span class="label">Assigned To</span>
                <div class="flex gap-1 flex-wrap">
                  <AppAvatar v-for="u in task.assignedTo" :key="u._id" :name="u.name" size="sm" />
                  <span v-if="!task.assignedTo?.length" class="text-muted">Unassigned</span>
                </div>
              </li>
            </ul>
          </AppCard>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { formatDate } from '@/utils/formatters'
import { TASK_STATUS } from '@/utils/constants'

const route = useRoute()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const newTodoText = ref('')
const taskStatus = ref('')

const task = computed(() => taskStore.currentTask)
const statusOptions = Object.values(TASK_STATUS).map(v => ({ label: v, value: v }))
const canUpdateTask = computed(() => {
  if (authStore.isAdmin) {
    return true
  }

  return task.value?.assignedTo?.some((user) => (user._id || user) === authStore.user?._id) || false
})

onMounted(async () => {
  try {
    await taskStore.fetchTaskById(route.params.id)
    if (task.value) {
      taskStatus.value = task.value.status
    }
  } catch(e) {
    uiStore.addToast('error', 'Failed to load task')
  }
})

const updateStatus = async () => {
  try {
    await taskStore.updateTaskStatus(task.value._id, taskStatus.value)
    uiStore.addToast('success', 'Status updated')
  } catch (e) {
    uiStore.addToast('error', 'Failed to update status')
    taskStatus.value = task.value.status // revert
  }
}

const toggleTodo = async (idx, completed) => {
  if (!canUpdateTask.value) return
  const updatedChecklist = JSON.parse(JSON.stringify(task.value.todoChecklist))
  updatedChecklist[idx].completed = completed
  saveChecklist(updatedChecklist)
}

const addTodo = async () => {
  if (!canUpdateTask.value) return
  if (!newTodoText.value.trim()) return
  const updatedChecklist = task.value.todoChecklist ? JSON.parse(JSON.stringify(task.value.todoChecklist)) : []
  updatedChecklist.push({ text: newTodoText.value.trim(), completed: false })
  await saveChecklist(updatedChecklist)
  newTodoText.value = ''
}

const saveChecklist = async (updatedChecklist) => {
  try {
    await taskStore.updateTaskChecklist(task.value._id, updatedChecklist)
    uiStore.addToast('success', 'Checklist updated')
  } catch (e) {
    uiStore.addToast('error', 'Failed to update checklist')
  }
}
</script>

<style scoped>
.detail-grid { grid-template-columns: 2fr 1fr; }
.details-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-4); }
.details-list li { display: flex; flex-direction: column; gap: var(--space-1); }
.details-list .label { font-size: var(--font-size-sm); color: var(--c-text-secondary); font-weight: 500; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-through { text-decoration: line-through; }
.flex-grow { flex-grow: 1; }

@media (max-width: 1024px) {
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
