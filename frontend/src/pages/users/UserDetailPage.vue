<template>
  <div class="user-detail-page">
    <div v-if="userStore.isLoading" class="flex justify-center p-12"><AppSpinner /></div>
    <div v-else-if="userStore.error" class="text-danger">{{ userStore.error }}</div>
    <div v-else-if="user">
       <AppBreadcrumb :items="[{ label: 'Users', to: '/users' }, { label: user.name }]" class="mb-4" />
       <AppCard class="mb-6">
         <div class="profile-header flex gap-6 align-center">
            <AppAvatar :name="user.name" :src="user.profileImageUrl" size="xl" />
            <div>
               <h2 class="mb-1">{{ user.name }}</h2>
               <p class="text-muted mb-2">{{ user.email }}</p>
               <AppBadge :text="user.role" :variant="user.role === 'admin' ? 'admin' : 'primary'" />
            </div>
         </div>
       </AppCard>

       <h3 class="mb-4">Assigned Tasks</h3>
       <AppCard>
         <AppTable :columns="taskColumns" :data="userTasks">
            <template #status="{ value }">
              <AppBadge :text="value" />
            </template>
         </AppTable>
       </AppCard>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTaskStore } from '@/stores/taskStore'
import { formatDate } from '@/utils/formatters'

const route = useRoute()
const userStore = useUserStore()
const taskStore = useTaskStore()

const user = computed(() => userStore.currentUser)
const userTasks = ref([])

const taskColumns = [
  { label: 'Title', key: 'title' },
  { label: 'Status', key: 'status' },
  { label: 'Due Date', key: 'dueDate', formatter: val => formatDate(val) }
]

onMounted(async () => {
  try {
    await userStore.fetchUserById(route.params.id)
    if (taskStore.tasks.length === 0) {
      await taskStore.fetchTasks()
    }
    userTasks.value = taskStore.tasks.filter((task) =>
      task.assignedTo?.some((assignedUser) => (assignedUser._id || assignedUser) === route.params.id)
    )
  } catch (error) {
    userTasks.value = []
  }
})
</script>

<style scoped>
.profile-header { padding: var(--space-4) 0; }
</style>
