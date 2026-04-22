<template>
  <div class="space-y-8">
    <section class="rounded-[34px] border border-white/70 bg-white/82 p-7 shadow-[0_24px_50px_-30px_rgba(0,37,102,0.55)]">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-on-primary-fixed">Boards</span>
          <h1 class="mt-4 font-['Sora'] text-4xl font-[700] tracking-[-0.05em] text-on-surface">Manage your team’s workspaces.</h1>
        </div>
        <button 
          @click="createModalOpen = true"
          class="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary px-6 py-3 text-sm font-medium text-on-primary shadow-[0_20px_40px_-24px_rgba(0,74,198,0.8)] transition duration-200 hover:brightness-110 active:scale-95"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Create Board
        </button>
      </div>
    </section>

    <div v-if="boardStore.boardsLoading" class="flex justify-center p-10">
      <AppSpinner size="3rem" />
    </div>

    <div v-else-if="boardStore.boards.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="board in boardStore.boards" 
        :key="board._id"
        @click="openBoard(board._id)"
        class="group flex min-h-[260px] cursor-pointer flex-col gap-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_45px_-32px_rgba(0,37,102,0.5)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-34px_rgba(0,37,102,0.65)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-['Sora'] text-xl font-[700] tracking-[-0.03em] text-on-surface transition-colors group-hover:text-primary">
              {{ board.name }}
            </h2>
            <p class="mt-2 text-xs text-on-surface-variant">
              {{ board.isOwner ? 'Owner' : 'Member' }}
            </p>
          </div>
          <span class="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {{ board.totalTasks || 0 }} Tasks
          </span>
        </div>

        <div class="rounded-[26px] bg-surface-container-low p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Progress</p>
              <p class="mt-2 text-3xl font-black tracking-[-0.05em]" :class="getProgressColorText(boardStore.boardProgress(board))">
                {{ boardStore.boardProgress(board) }}%
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="getProgressBubble(boardStore.boardProgress(board))">
              <span class="material-symbols-outlined text-[22px]">{{ getProgressIcon(boardStore.boardProgress(board)) }}</span>
            </div>
          </div>
          <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
             <div class="h-full rounded-full transition-all duration-500" :class="getProgressColorFill(boardStore.boardProgress(board))" :style="{ width: `${boardStore.boardProgress(board)}%` }"></div>
          </div>
        </div>

        <div class="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-4">
          <div class="flex -space-x-2">
            <div 
              class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-container text-xs font-bold text-on-primary"
            >
              {{ board.name.charAt(0) }}
            </div>
          </div>
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant transition group-hover:text-primary">
            Open board
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>

    <AppEmptyState
      v-else
      title="No boards yet"
      description="Create your first board to start organizing tasks."
      class="mt-10"
    >
      <template #action>
        <AppButton @click="createModalOpen = true" variant="primary">Create Board</AppButton>
      </template>
    </AppEmptyState>

    <AppModal v-model="createModalOpen" title="Create Board">
      <form class="flex flex-col gap-4 rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-4" @submit.prevent="submitBoard">
        <AppInput v-model="form.name" label="Board name" placeholder="E.g., Product launch" />
      </form>
      <template #footer>
        <div class="flex justify-end gap-2 w-full mt-4">
          <AppButton variant="ghost" @click="createModalOpen = false">Cancel</AppButton>
          <AppButton :loading="boardStore.taskMutationLoading" @click="submitBoard" variant="primary">Create</AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUIStore } from '@/stores/uiStore'
import AppButton from '@/components/shared/AppButton.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppModal from '@/components/shared/AppModal.vue'
import AppInput from '@/components/shared/AppInput.vue'

const boardStore = useBoardStore()
const uiStore = useUIStore()
const router = useRouter()

const createModalOpen = ref(false)
const form = reactive({
  name: '',
})

onMounted(async () => {
  try {
    await boardStore.fetchBoards()
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
    })
    form.name = ''
    createModalOpen.value = false
    uiStore.addToast('success', 'Board created successfully')
    router.push(`/boards/${board._id}`)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to create board')
  }
}

const getProgressColorText = (progress) => {
  if (progress === 100) return 'text-secondary'; // Secondary/Done
  if (progress > 0) return 'text-tertiary-container'; // Orange/In Progress
  return 'text-primary';
}

const getProgressColorFill = (progress) => {
  if (progress === 100) return 'bg-secondary';
  if (progress > 0) return 'bg-tertiary-container';
  return 'bg-primary';
}

const getProgressBubble = (progress) => {
  if (progress === 100) return 'bg-secondary-fixed text-secondary'
  if (progress > 0) return 'bg-tertiary-fixed text-on-tertiary-fixed'
  return 'bg-primary-fixed text-on-primary-fixed'
}

const getProgressIcon = (progress) => {
  if (progress === 100) return 'check_circle'
  if (progress > 0) return 'trending_up'
  return 'radio_button_unchecked'
}
</script>
