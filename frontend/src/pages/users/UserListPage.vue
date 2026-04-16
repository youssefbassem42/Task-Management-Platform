<template>
  <div class="user-list-page">
    <div class="page-header mb-6 flex justify-between">
      <div>
        <h2>Team Members</h2>
        <p class="text-muted">Admin-only team directory with reporting and account controls.</p>
      </div>
      <AppButton variant="primary" @click="downloadReport" :loading="isDownloading" v-if="authStore.isAdmin">
        Export Report
      </AppButton>
    </div>

    <div class="toolbar">
      <AppInput v-model="searchTerm" label="Search team members" placeholder="Search by name, email or role" />
    </div>

    <AppCard>
      <AppTable
        :columns="columns"
        :data="userStore.paginatedUsers"
        :loading="userStore.isLoading"
        hoverable
        :sort-key="userStore.filters.sortKey"
        :sort-direction="userStore.filters.sortDirection"
        @sort="userStore.setSort"
        @row-click="goToUser"
      >
        <template #name="{ row }">
          <div class="flex gap-3 align-center">
            <AppAvatar :name="row.name" :src="row.profileImageUrl" size="md" />
            <div class="flex-column">
              <span class="font-medium">{{ row.name }}</span>
              <span class="text-xs text-muted">{{ row.email }}</span>
            </div>
          </div>
        </template>
        <template #role="{ value }">
          <AppBadge :text="value" :variant="value === 'admin' ? 'admin' : 'primary'" />
        </template>
        <template #actions="{ row }">
          <AppButton size="sm" variant="danger" @click.stop="confirmDelete(row._id)" :disabled="row._id === authStore.user._id">
            Delete
          </AppButton>
        </template>
      </AppTable>

      <AppPagination
        :current-page="userStore.pagination.currentPage"
        :total-pages="userStore.totalPages"
        @update:currentPage="userStore.setPage"
      />
    </AppCard>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useDownload } from '@/composables/useDownload'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import reportService from '@/api/reportService'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const confirmDialog = useConfirmDialog()
const { isDownloading, downloadBlob } = useDownload()
const searchTerm = ref(userStore.filters.search)

onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load users')
  }
})

const syncSearch = useDebounceFn((value) => {
  userStore.setSearch(value)
}, 250)

watch(searchTerm, (value) => {
  syncSearch(value)
})

const columns = [
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Role', key: 'role', sortable: true },
  { label: 'Actions', key: 'actions' }
]

const goToUser = (row) => {
  router.push(`/users/${row._id}`)
}

const confirmDelete = (id) => {
  confirmDialog.open({
    title: 'Delete User',
    message: 'Are you sure you want to delete this user?',
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await userStore.deleteUser(id)
        uiStore.addToast('success', 'User deleted')
      } catch (error) {
        uiStore.addToast('error', error.message || 'Failed to delete user')
      }
    }
  })
}

const downloadReport = () => {
  downloadBlob(() => reportService.exportUsersReport(), 'users-report')
}
</script>

<style scoped>
.toolbar {
  margin-bottom: var(--space-4);
}
</style>
