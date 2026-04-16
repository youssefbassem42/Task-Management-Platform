<template>
  <div class="board-page">
    <section class="board-header" v-if="boardStore.currentBoard">
      <div>
        <router-link class="back-link" to="/dashboard">← Back to boards</router-link>
        <h1>{{ boardStore.currentBoard.name }}</h1>
        <p class="text-muted">
          {{ boardStore.currentBoard.isOwner ? 'You own this board.' : 'You are collaborating on this board.' }}
        </p>
      </div>

      <div class="board-header-actions">
        <AppButton v-if="boardStore.currentBoard.isOwner" variant="secondary" @click="membersModalOpen = true">
          Manage Members
        </AppButton>
        <AppButton v-if="boardStore.currentBoard.isOwner" @click="openCreateModal">New Task</AppButton>
        <AppButton
          v-if="boardStore.currentBoard.isOwner"
          variant="danger"
          @click="confirmDeleteBoard"
        >
          Delete Board
        </AppButton>
      </div>
    </section>

    <section class="board-toolbar">
      <AppInput v-model="filters.search" label="Search" placeholder="Search by title" />

      <label class="checkbox-row">
        <input v-model="filters.myTasks" type="checkbox" />
        <span>My Tasks</span>
      </label>

      <label class="checkbox-row">
        <input v-model="filters.showArchived" type="checkbox" />
        <span>Archive tasks</span>
      </label>
    </section>

    <div v-if="boardStore.boardLoading && !boardStore.tasks.length" class="loading-wrap">
      <AppSpinner size="3rem" />
    </div>

    <div v-else class="kanban-grid">
      <section
        v-for="column in columns"
        :key="column.value"
        class="kanban-column"
        @dragover.prevent
        @drop="handleDrop(column.value)"
      >
        <header class="kanban-column-header">
          <div>
            <h2>{{ column.label }}</h2>
            <span>{{ groupedTasks[column.value].length }}</span>
          </div>
        </header>

        <div v-if="groupedTasks[column.value].length" class="kanban-cards">
          <article
            v-for="task in groupedTasks[column.value]"
            :key="task._id"
            class="task-card"
            :class="{ overdue: task.isOverdue }"
            draggable="true"
            @dragstart="handleDragStart(task)"
            @click="openTask(task)"
          >
            <div class="task-card-top">
              <AppBadge :text="task.priority" />
              <span v-if="task.isArchived" class="task-state">Archived</span>
              <span v-else-if="task.isOverdue" class="task-state overdue-label">Overdue</span>
            </div>

            <h3>{{ task.title }}</h3>
            <p class="task-description">{{ task.description || 'No description' }}</p>

            <div class="task-meta">
              <span>{{ task.assigneeId?.name || 'Unassigned' }}</span>
              <span>{{ task.dueDate ? formatDate(task.dueDate) : 'No due date' }}</span>
            </div>
          </article>
        </div>

        <AppEmptyState
          v-else
          :title="`No ${column.label.toLowerCase()} tasks`"
          description="Drag a task here or create a new one."
        />
      </section>
    </div>

    <TaskModal
      v-model="taskModalOpen"
      :task="selectedTask"
      :board="boardStore.currentBoard"
      :members="assignableMembers"
      :comments="selectedTaskComments"
      :loading="boardStore.taskMutationLoading || boardStore.commentsLoading"
      @save="saveTask"
      @status-change="changeStatus"
      @archive="toggleArchive"
      @delete="deleteTask"
      @comment="addComment"
    />

    <AppModal v-model="membersModalOpen" title="Board Members">
      <AppSelect
        v-model="memberIdsDraft"
        label="Members"
        :options="userStore.userOptions"
        multiple
      />

      <template #footer>
        <AppButton variant="ghost" @click="membersModalOpen = false">Cancel</AppButton>
        <AppButton :loading="boardStore.taskMutationLoading" @click="saveMembers">Save Members</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { formatDate } from '@/utils/formatters'
import TaskModal from '@/components/boards/TaskModal.vue'

const columns = [
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' }
]

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const confirmDialog = useConfirmDialog()

const taskModalOpen = ref(false)
const membersModalOpen = ref(false)
const selectedTask = ref(null)
const draggedTask = ref(null)
const memberIdsDraft = ref([])
const filters = ref({
  search: '',
  myTasks: false,
  showArchived: false
})

const assignableMembers = computed(() => {
  const boardMembers = boardStore.members || []
  return boardMembers.map((member) => ({
    value: member._id,
    label: `${member.name} (${member.email})`
  }))
})

const filteredTasks = computed(() => {
  const search = filters.value.search.trim().toLowerCase()

  return boardStore.tasks.filter((task) => {
    if (!filters.value.showArchived && task.isArchived) {
      return false
    }

    if (filters.value.myTasks && task.assigneeId?._id !== authStore.user?._id) {
      return false
    }

    if (!search) {
      return true
    }

    return task.title.toLowerCase().includes(search)
  })
})

const groupedTasks = computed(() =>
  columns.reduce((acc, column) => {
    acc[column.value] = filteredTasks.value.filter((task) => task.status === column.value)
    return acc
  }, {})
)

const selectedTaskComments = computed(() => {
  if (!selectedTask.value?._id) return []
  return boardStore.commentsByTask[selectedTask.value._id] || []
})

const loadBoard = async () => {
  try {
    await Promise.all([
      boardStore.fetchBoardWorkspace(route.params.id, { archived: filters.value.showArchived }),
      userStore.fetchUsers()
    ])
    memberIdsDraft.value = boardStore.currentBoard?.memberIds || []
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load board')
    router.push('/dashboard')
  }
}

onMounted(loadBoard)

watch(
  () => route.params.id,
  () => {
    loadBoard()
  }
)

watch(
  () => filters.value.showArchived,
  async (showArchived) => {
    await boardStore.fetchTasks(route.params.id, { archived: showArchived })
  }
)

const openCreateModal = () => {
  selectedTask.value = null
  taskModalOpen.value = true
}

const openTask = async (task) => {
  selectedTask.value = task
  taskModalOpen.value = true

  try {
    await boardStore.fetchComments(route.params.id, task._id)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load comments')
  }
}

const saveTask = async (payload) => {
  try {
    if (selectedTask.value?._id) {
      selectedTask.value = await boardStore.updateTask(route.params.id, selectedTask.value._id, payload)
      uiStore.addToast('success', 'Task updated successfully')
    } else {
      await boardStore.createTask(route.params.id, payload)
      uiStore.addToast('success', 'Task created successfully')
    }

    taskModalOpen.value = false
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to save task')
  }
}

const changeStatus = async (status) => {
  if (!selectedTask.value?._id) return

  try {
    const updatedTask = await boardStore.updateTaskStatus(route.params.id, selectedTask.value._id, status)
    selectedTask.value = updatedTask
    uiStore.addToast('success', 'Task status updated')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update task status')
  }
}

const toggleArchive = async (isArchived) => {
  if (!selectedTask.value?._id) return

  try {
    const updatedTask = await boardStore.archiveTask(route.params.id, selectedTask.value._id, isArchived)
    selectedTask.value = updatedTask
    uiStore.addToast('success', isArchived ? 'Task archived' : 'Task restored')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update archive state')
  }
}

const deleteTask = async () => {
  if (!selectedTask.value?._id) return

  try {
    await boardStore.deleteTask(route.params.id, selectedTask.value._id)
    uiStore.addToast('success', 'Task deleted successfully')
    taskModalOpen.value = false
    selectedTask.value = null
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to delete task')
  }
}

const addComment = async (content) => {
  if (!selectedTask.value?._id) return

  try {
    await boardStore.addComment(route.params.id, selectedTask.value._id, content)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to add comment')
  }
}

const saveMembers = async () => {
  try {
    await boardStore.saveBoardMembers(route.params.id, memberIdsDraft.value)
    uiStore.addToast('success', 'Board members updated')
    membersModalOpen.value = false
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update members')
  }
}

const confirmDeleteBoard = () => {
  confirmDialog.open({
    title: 'Delete Board',
    message: 'Delete this board and all of its tasks? This action cannot be undone.',
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await boardStore.deleteBoard(route.params.id)
        uiStore.addToast('success', 'Board deleted')
        router.push('/dashboard')
      } catch (error) {
        uiStore.addToast('error', error.message || 'Failed to delete board')
      }
    }
  })
}

const handleDragStart = (task) => {
  draggedTask.value = task
}

const handleDrop = async (status) => {
  if (!draggedTask.value || draggedTask.value.status === status || draggedTask.value.isArchived) {
    draggedTask.value = null
    return
  }

  try {
    await boardStore.updateTaskStatus(route.params.id, draggedTask.value._id, status)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to move task')
  } finally {
    draggedTask.value = null
  }
}
</script>

<style scoped>
.board-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-2);
  color: var(--c-primary);
}

.board-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: flex-start;
}

.board-header h1 {
  margin: 0;
}

.board-header-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.board-toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 360px) auto auto;
  gap: var(--space-4);
  align-items: end;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--c-text-secondary);
}

.kanban-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: start;
}

.kanban-column {
  background: var(--c-bg);
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  min-height: 400px;
}

.kanban-column-header {
  margin-bottom: var(--space-4);
}

.kanban-column-header div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-column-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.task-card {
  padding: var(--space-4);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  background: var(--c-bg-surface);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--c-primary-light);
}

.task-card.overdue {
  border-color: var(--c-danger);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.15);
}

.task-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.task-card h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-md);
}

.task-description {
  margin: 0 0 var(--space-4);
  color: var(--c-text-secondary);
  font-size: var(--font-size-sm);
}

.task-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--c-text-muted);
  font-size: var(--font-size-xs);
}

.task-state {
  font-size: var(--font-size-xs);
  color: var(--c-text-muted);
}

.overdue-label {
  color: var(--c-danger);
  font-weight: 600;
}

.loading-wrap {
  padding: var(--space-10);
  display: flex;
  justify-content: center;
}

@media (max-width: 1100px) {
  .kanban-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .board-header {
    flex-direction: column;
  }

  .board-header-actions,
  .board-toolbar {
    grid-template-columns: 1fr;
    width: 100%;
  }
}
</style>
