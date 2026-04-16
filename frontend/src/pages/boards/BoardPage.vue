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
        <AppButton v-if="boardStore.currentBoard.isOwner" variant="secondary" @click="inviteModalOpen = true">
          Invite
        </AppButton>
        <AppButton v-if="boardStore.currentBoard.isOwner" variant="secondary" @click="downloadBoardExport">
          Export Excel
        </AppButton>
        <AppButton v-if="boardStore.currentBoard.isOwner" @click="openCreateModal">New Task</AppButton>
        <AppButton v-if="boardStore.currentBoard.isOwner" variant="danger" @click="confirmDeleteBoard">
          Delete Board
        </AppButton>
      </div>
    </section>

    <section class="board-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="tab-chip"
        :class="{ active: activeTab === tab.value }"
        @click="setActiveTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </section>

    <section v-if="activeTab !== 'activity'" class="board-toolbar">
      <AppInput v-model="filters.search" label="Search" placeholder="Search title or description" />
      <AppSelect v-model="filters.status" label="Status" :options="statusFilterOptions" />
      <AppSelect v-model="filters.priority" label="Priority" :options="priorityFilterOptions" />
      <AppSelect v-model="filters.assigneeId" label="Assignee" :options="assigneeFilterOptions" />
      <label class="checkbox-row">
        <input v-model="filters.myTasks" type="checkbox" />
        <span>My Tasks</span>
      </label>
    </section>

    <section v-if="activeTab !== 'activity'" class="board-attachments-panel">
      <div class="section-head">
        <div>
          <h2>Board Files</h2>
          <p class="text-muted">Shared attachments for the whole board.</p>
        </div>

        <div class="upload-inline">
          <input ref="boardAttachmentInput" type="file" class="hidden-input" @change="handleBoardAttachmentSelect" />
          <AppButton variant="secondary" @click="boardAttachmentInput?.click()">Choose File</AppButton>
          <AppButton
            :loading="boardStore.attachmentsLoading"
            :disabled="!boardAttachmentFile"
            @click="uploadBoardAttachment"
          >
            Upload
          </AppButton>
        </div>
      </div>

      <div v-if="boardStore.boardAttachments.length" class="attachment-list">
        <article v-for="attachment in boardStore.boardAttachments" :key="attachment._id" class="attachment-card">
          <div class="attachment-main">
            <strong>{{ attachment.fileName }}</strong>
            <div class="attachment-meta">
              <AppAvatar :src="attachment.uploadedBy?.avatar" :name="attachment.uploadedBy?.name" size="sm" />
              <span>{{ attachment.uploadedBy?.name || 'Unknown user' }}</span>
              <span>{{ formatDate(attachment.createdAt, 'MMM dd, yyyy p') }}</span>
            </div>
          </div>
          <a :href="attachment.fileUrl" target="_blank" rel="noreferrer">Download</a>
        </article>
      </div>
      <AppEmptyState
        v-else
        title="No board files yet"
        description="Upload a shared file so everyone on the board can access it."
      />
    </section>

    <div v-if="activeTab === 'activity'" class="activity-panel">
      <div v-if="boardStore.activityLoading" class="loading-wrap">
        <AppSpinner size="3rem" />
      </div>

      <div v-else-if="boardStore.activity.length" class="activity-list">
        <article v-for="entry in boardStore.activity" :key="entry._id" class="activity-card">
          <AppAvatar :src="entry.userId?.avatar" :name="entry.userId?.name" size="md" />
          <div>
            <strong>{{ entry.userId?.name || 'Unknown user' }}</strong>
            <p>{{ entry.action }}</p>
            <span class="text-muted">{{ formatDate(entry.createdAt, 'MMM dd, yyyy p') }}</span>
          </div>
        </article>
      </div>
      <AppEmptyState
        v-else
        title="No activity yet"
        description="Task changes, comments, and joins will show up here."
      />
    </div>

    <div v-else-if="boardStore.boardLoading && !boardStore.tasks.length" class="loading-wrap">
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
            :draggable="!task.isArchived"
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
              <div class="assignee-pill">
                <AppAvatar :src="task.assigneeId?.avatar" :name="task.assigneeId?.name" size="sm" />
                <span>{{ task.assigneeId?.name || 'Unassigned' }}</span>
              </div>
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
      :attachments="selectedTaskAttachments"
      :loading="boardStore.taskMutationLoading || boardStore.commentsLoading"
      :attachment-loading="boardStore.attachmentsLoading"
      @save="saveTask"
      @status-change="changeStatus"
      @archive="toggleArchive"
      @delete="deleteTask"
      @comment="addComment"
      @attachment-upload="uploadTaskAttachment"
    />

    <AppModal v-model="inviteModalOpen" title="Invite people to this board">
      <div class="invite-panel" v-if="boardStore.currentBoard">
        <AppInput :model-value="inviteLink" label="Invite Link" readonly />
        <p class="text-muted">Anyone with access to this link can request to join this board.</p>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="inviteModalOpen = false">Close</AppButton>
        <AppButton @click="copyInviteLink">Copy Link</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

const tabs = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Activity', value: 'activity' }
]

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const confirmDialog = useConfirmDialog()

const taskModalOpen = ref(false)
const inviteModalOpen = ref(false)
const selectedTask = ref(null)
const draggedTask = ref(null)
const activeTab = ref('active')
const boardAttachmentFile = ref(null)
const boardAttachmentInput = ref(null)
let filterDebounceId = null

const filters = ref({
  search: '',
  myTasks: false,
  status: '',
  priority: '',
  assigneeId: ''
})

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
]

const priorityFilterOptions = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }
]

const assignableMembers = computed(() => {
  const boardMembers = boardStore.members || []
  return boardMembers.map((member) => ({
    value: member._id,
    label: `${member.name} (${member.email})`
  }))
})

const assigneeFilterOptions = computed(() => [
  { value: '', label: 'All assignees' },
  ...assignableMembers.value
])

const groupedTasks = computed(() =>
  columns.reduce((acc, column) => {
    acc[column.value] = boardStore.tasks.filter((task) => task.status === column.value)
    return acc
  }, {})
)

const selectedTaskComments = computed(() => {
  if (!selectedTask.value?._id) return []
  return boardStore.commentsByTask[selectedTask.value._id] || []
})

const selectedTaskAttachments = computed(() => {
  if (!selectedTask.value?._id) return []
  return boardStore.attachmentsByTask[selectedTask.value._id] || []
})

const inviteLink = computed(() => {
  if (!boardStore.currentBoard?.inviteCode) return ''
  return `${window.location.origin}/boards/join/${boardStore.currentBoard.inviteCode}`
})

const taskQueryParams = computed(() => {
  const params = {
    archived: activeTab.value === 'archived'
  }

  if (filters.value.search.trim()) {
    params.q = filters.value.search.trim()
  }

  if (filters.value.status) {
    params.status = filters.value.status
  }

  if (filters.value.priority) {
    params.priority = filters.value.priority
  }

  if (filters.value.assigneeId && !filters.value.myTasks) {
    params.assigneeId = filters.value.assigneeId
  }

  if (filters.value.myTasks) {
    params.mine = true
  }

  return params
})

const fetchBoardShell = async () => {
  await Promise.all([boardStore.fetchBoard(route.params.id), userStore.fetchUsers()])
}

const fetchTaskWorkspace = async () => {
  await Promise.all([
    boardStore.fetchTasks(route.params.id, taskQueryParams.value),
    boardStore.fetchBoardAttachments(route.params.id)
  ])
}

const refreshCurrentView = async () => {
  if (activeTab.value === 'activity') {
    await Promise.all([fetchBoardShell(), boardStore.fetchBoardActivity(route.params.id)])
    return
  }

  await Promise.all([fetchBoardShell(), fetchTaskWorkspace()])
}

const scheduleTaskRefresh = () => {
  if (activeTab.value === 'activity') {
    return
  }

  window.clearTimeout(filterDebounceId)
  filterDebounceId = window.setTimeout(() => {
    fetchTaskWorkspace().catch((error) => {
      uiStore.addToast('error', error.message || 'Failed to refresh tasks')
    })
  }, 250)
}

const openCreateModal = () => {
  selectedTask.value = null
  taskModalOpen.value = true
}

const openTask = async (task) => {
  selectedTask.value = task
  taskModalOpen.value = true

  try {
    await Promise.all([
      boardStore.fetchComments(route.params.id, task._id),
      boardStore.fetchTaskAttachments(route.params.id, task._id)
    ])
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load task details')
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

    await fetchTaskWorkspace()
    taskModalOpen.value = false
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to save task')
  }
}

const changeStatus = async (status) => {
  if (!selectedTask.value?._id) return

  try {
    selectedTask.value = await boardStore.updateTaskStatus(route.params.id, selectedTask.value._id, status)
    await fetchTaskWorkspace()
    uiStore.addToast('success', 'Task status updated')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update task status')
  }
}

const toggleArchive = async (isArchived) => {
  if (!selectedTask.value?._id) return

  try {
    selectedTask.value = await boardStore.archiveTask(route.params.id, selectedTask.value._id, isArchived)
    await fetchTaskWorkspace()
    uiStore.addToast('success', isArchived ? 'Task archived' : 'Task restored')
    taskModalOpen.value = false
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update archive state')
  }
}

const deleteTask = async () => {
  if (!selectedTask.value?._id) return

  try {
    await boardStore.deleteTask(route.params.id, selectedTask.value._id)
    await fetchTaskWorkspace()
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
    await boardStore.fetchBoardActivity(route.params.id)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to add comment')
  }
}

const uploadTaskAttachment = async (file) => {
  if (!selectedTask.value?._id || !file) return

  try {
    await boardStore.uploadTaskAttachment(route.params.id, selectedTask.value._id, file)
    await boardStore.fetchBoardActivity(route.params.id)
    uiStore.addToast('success', 'Attachment uploaded')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to upload attachment')
  }
}

const handleBoardAttachmentSelect = (event) => {
  boardAttachmentFile.value = event.target.files?.[0] || null
}

const uploadBoardAttachment = async () => {
  if (!boardAttachmentFile.value) return

  try {
    await boardStore.uploadBoardAttachment(route.params.id, boardAttachmentFile.value)
    await boardStore.fetchBoardActivity(route.params.id)
    uiStore.addToast('success', 'Board file uploaded')
    boardAttachmentFile.value = null
    if (boardAttachmentInput.value) {
      boardAttachmentInput.value.value = ''
    }
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to upload board file')
  }
}

const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    uiStore.addToast('success', 'Invite link copied')
  } catch (error) {
    uiStore.addToast('error', 'Failed to copy invite link')
  }
}

const downloadBoardExport = async () => {
  try {
    const blob = await boardStore.exportBoard(route.params.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${boardStore.currentBoard?.name || 'board'}-report.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to export board')
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
    await fetchTaskWorkspace()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to move task')
  } finally {
    draggedTask.value = null
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

onMounted(async () => {
  try {
    await refreshCurrentView()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load board')
    router.push('/dashboard')
  }
})

watch(
  () => route.params.id,
  async () => {
    try {
      await refreshCurrentView()
    } catch (error) {
      uiStore.addToast('error', error.message || 'Failed to load board')
      router.push('/dashboard')
    }
  }
)

watch(
  () => activeTab.value,
  async () => {
    try {
      await refreshCurrentView()
    } catch (error) {
      uiStore.addToast('error', error.message || 'Failed to switch view')
    }
  }
)

watch(
  () => JSON.stringify(filters.value),
  () => {
    scheduleTaskRefresh()
  }
)

onBeforeUnmount(() => {
  window.clearTimeout(filterDebounceId)
})
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

.board-header-actions,
.board-tabs {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.board-tabs {
  padding: var(--space-1);
  border-radius: var(--radius-full);
  background: var(--c-bg);
  width: fit-content;
}

.tab-chip {
  border: none;
  border-radius: var(--radius-full);
  padding: 0.625rem 1rem;
  background: transparent;
  color: var(--c-text-secondary);
  font-weight: 600;
}

.tab-chip.active {
  background: var(--c-primary);
  color: white;
}

.board-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(160px, 1fr)) auto;
  gap: var(--space-4);
  align-items: end;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  font-size: var(--font-size-sm);
  color: var(--c-text-secondary);
}

.board-attachments-panel,
.activity-panel {
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-lg);
  background: var(--c-bg-surface);
  padding: var(--space-4);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: center;
  margin-bottom: var(--space-4);
}

.section-head h2 {
  margin: 0 0 var(--space-1);
}

.upload-inline {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.hidden-input {
  display: none;
}

.attachment-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.attachment-card,
.activity-card {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: center;
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background: var(--c-bg);
}

.attachment-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.attachment-meta,
.assignee-pill {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--c-text-muted);
  font-size: var(--font-size-xs);
}

.activity-card {
  justify-content: flex-start;
}

.activity-card p {
  margin: var(--space-1) 0;
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

.invite-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.loading-wrap {
  padding: var(--space-10);
  display: flex;
  justify-content: center;
}

@media (max-width: 1200px) {
  .board-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kanban-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .board-header,
  .section-head,
  .attachment-card,
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .board-toolbar,
  .upload-inline {
    grid-template-columns: 1fr;
    width: 100%;
  }
}
</style>
