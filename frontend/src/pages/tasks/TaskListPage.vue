<template>
  <div class="task-list-page">
    <TaskFilterBar
      v-model="activeFilter"
      :tabs="filterTabs"
      :show-create="authStore.permissions.canManageTasks"
      @create="$router.push('/tasks/create')"
      @update:modelValue="setFilter"
    />

    <div class="toolbar">
      <AppInput v-model="searchTerm" label="Search tasks" placeholder="Search by title, description or status" />
    </div>

    <AppCard>
      <AppTable
        :columns="columns"
        :data="taskStore.paginatedTasks"
        :loading="taskStore.listLoading"
        hoverable
        :sort-key="taskStore.filters.sortKey"
        :sort-direction="taskStore.filters.sortDirection"
        @sort="taskStore.setSort"
        @row-click="goToTask"
      >
        <template #status="{ value }">
          <AppBadge :text="value" />
        </template>
        <template #priority="{ value }">
          <AppBadge :text="value" />
        </template>
        <template #assignedTo="{ value }">
          <div class="flex gap-1">
            <AppAvatar v-for="user in value" :key="user._id || user" :name="user.name || 'U'" size="sm" />
          </div>
        </template>
        <template v-if="authStore.permissions.canManageTasks" #actions="{ row }">
          <div class="flex gap-2" @click.stop>
            <AppButton size="sm" variant="ghost" @click.stop="editTask(row._id)">Edit</AppButton>
            <AppButton size="sm" variant="danger" @click.stop="confirmDelete(row._id)">Delete</AppButton>
          </div>
        </template>
      </AppTable>

      <AppPagination
        :current-page="taskStore.pagination.currentPage"
        :total-pages="taskStore.totalPages"
        @update:currentPage="taskStore.setPage($event)"
      />
    </AppCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useAuthStore } from '@/stores/authStore'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUIStore } from '@/stores/uiStore'
import TaskFilterBar from '@/components/tasks/TaskFilterBar.vue'
import { formatDate } from '@/utils/formatters'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const confirmDialog = useConfirmDialog()
const searchTerm = ref(taskStore.filters.search)

const filterTabs = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' }
]

const activeFilter = computed(() => taskStore.filters.status)

onMounted(async () => {
  try {
    await taskStore.fetchTasks({ status: taskStore.filters.status })
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load tasks')
  }
})

const syncSearch = useDebounceFn((value) => {
  taskStore.setSearch(value)
}, 250)

watch(searchTerm, (value) => {
  syncSearch(value)
})

const columns = computed(() => {
  const cols = [
    { label: 'Title', key: 'title', sortable: true },
    { label: 'Status', key: 'status', sortable: true },
    { label: 'Priority', key: 'priority', sortable: true },
    { label: 'Due Date', key: 'dueDate', sortable: true, formatter: (val) => formatDate(val) }
  ]

  if (authStore.permissions.canManageTasks) {
    cols.push({ label: 'Assigned To', key: 'assignedTo' })
    cols.push({ label: 'Actions', key: 'actions' })
  }

  return cols
})

const setFilter = async (value) => {
  taskStore.setFilter(value)
  await taskStore.fetchTasks({ status: value })
}

const goToTask = (row) => {
  router.push(`/tasks/${row._id}`)
}

const editTask = (id) => {
  router.push(`/tasks/${id}/edit`)
}

const confirmDelete = (id) => {
  confirmDialog.open({
    title: 'Delete Task',
    message: 'Are you sure you want to delete this task? This action cannot be undone.',
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await taskStore.deleteTask(id)
        uiStore.addToast('success', 'Task deleted successfully')
      } catch (error) {
        uiStore.addToast('error', error.message || 'Failed to delete task')
      }
    }
  })
}
</script>

<style scoped>
.toolbar {
  margin-bottom: var(--space-4);
}
</style>
