<template>
  <div class="dashboard-page">
    <section class="page-header">
      <div>
        <h1>Your Boards</h1>
        <p class="text-muted">Create focused boards, invite teammates, and track progress in one place.</p>
      </div>
      <AppButton @click="createModalOpen = true">New Board</AppButton>
    </section>

    <section class="board-grid" v-if="boardStore.boards.length">
      <AppCard
        v-for="board in boardStore.boards"
        :key="board._id"
        hoverable
        @click="openBoard(board._id)"
      >
        <template #header>
          <div class="board-card-header">
            <div>
              <h3 class="board-title">{{ board.name }}</h3>
              <p class="text-muted board-meta">{{ board.isOwner ? 'Owner' : 'Member' }}</p>
            </div>
            <AppBadge :text="`${board.completedTasks}/${board.totalTasks || 0} done`" />
          </div>
        </template>

        <div class="board-progress">
          <div class="board-progress-bar">
            <span :style="{ width: `${boardStore.boardProgress(board)}%` }"></span>
          </div>
          <div class="board-progress-labels">
            <span>{{ board.totalTasks || 0 }} active tasks</span>
            <span>{{ boardStore.boardProgress(board) }}%</span>
          </div>
        </div>
      </AppCard>
    </section>

    <AppEmptyState
      v-else-if="!boardStore.boardsLoading"
      title="No boards yet"
      description="Create your first board to start organizing tasks."
    >
      <template #action>
        <AppButton @click="createModalOpen = true">Create Board</AppButton>
      </template>
    </AppEmptyState>

    <div v-else class="loading-wrap">
      <AppSpinner size="3rem" />
    </div>

    <AppModal v-model="createModalOpen" title="Create Board">
      <form class="board-form" @submit.prevent="submitBoard">
        <AppInput v-model="form.name" label="Board name" placeholder="Product launch" />
        <AppSelect
          v-model="form.memberIds"
          label="Members"
          :options="userStore.userOptions"
          multiple
        />
      </form>

      <template #footer>
        <AppButton variant="ghost" @click="createModalOpen = false">Cancel</AppButton>
        <AppButton :loading="boardStore.taskMutationLoading" @click="submitBoard">Create</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { useUIStore } from '@/stores/uiStore'

const boardStore = useBoardStore()
const userStore = useUserStore()
const uiStore = useUIStore()
const router = useRouter()

const createModalOpen = ref(false)
const form = reactive({
  name: '',
  memberIds: []
})

onMounted(async () => {
  try {
    await Promise.all([boardStore.fetchBoards(), userStore.fetchUsers()])
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load boards')
  }
})

const openBoard = (boardId) => {
  router.push(`/boards/${boardId}`)
}

const submitBoard = async () => {
  if (!form.name.trim()) {
    uiStore.addToast('error', 'Board name is required')
    return
  }

  try {
    const board = await boardStore.createBoard({
      name: form.name,
      memberIds: form.memberIds
    })
    form.name = ''
    form.memberIds = []
    createModalOpen.value = false
    uiStore.addToast('success', 'Board created successfully')
    router.push(`/boards/${board._id}`)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to create board')
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.board-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.board-title {
  margin: 0;
}

.board-meta {
  margin: var(--space-1) 0 0;
}

.board-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.board-progress-bar {
  height: 10px;
  background: var(--c-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.board-progress-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), #10b981);
}

.board-progress-labels {
  display: flex;
  justify-content: space-between;
  color: var(--c-text-muted);
  font-size: var(--font-size-sm);
}

.loading-wrap {
  padding: var(--space-10);
  display: flex;
  justify-content: center;
}

.board-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
