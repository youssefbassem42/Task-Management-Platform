<template>
  <div class="join-page">
    <AppModal v-model="modalOpen" title="Join board" @close="goBack">
      <div v-if="isLoading" class="join-state">
        <AppSpinner />
      </div>

      <div v-else-if="board" class="join-card">
        <AppAvatar :src="board.owner?.avatar" :name="board.owner?.name || board.name" size="lg" />
        <div>
          <h2>{{ board.name }}</h2>
          <p class="text-muted">
            {{ board.isMember ? 'You already have access to this board.' : `Owner: ${board.owner?.name || 'Unknown'}` }}
          </p>
        </div>
      </div>

      <p v-else class="text-muted">This invite link is no longer valid.</p>

      <template #footer>
        <AppButton variant="ghost" @click="goBack">Deny</AppButton>
        <AppButton
          v-if="board"
          :loading="joining"
          @click="joinBoard"
        >
          {{ board.isMember ? 'Open board' : 'Join' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUIStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const uiStore = useUIStore()

const modalOpen = ref(true)
const board = ref(null)
const isLoading = ref(true)
const joining = ref(false)

const goBack = () => {
  const fallbackRoute = board.value?._id ? `/boards/${board.value._id}` : '/dashboard'
  router.push(fallbackRoute)
}

const loadInvite = async () => {
  isLoading.value = true

  try {
    const response = await boardStore.fetchBoardInvite(route.params.inviteCode)
    board.value = response.board
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to open invite')
    board.value = null
  } finally {
    isLoading.value = false
  }
}

const joinBoard = async () => {
  if (!board.value) {
    goBack()
    return
  }

  joining.value = true

  try {
    const response = await boardStore.joinBoardByInvite(route.params.inviteCode)
    uiStore.addToast('success', response.joined ? 'Joined board successfully' : 'Opening board')
    router.push(`/boards/${response.board._id}`)
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to join board')
  } finally {
    joining.value = false
  }
}

onMounted(loadInvite)
</script>

<style scoped>
.join-page {
  min-height: 100vh;
}

.join-state {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.join-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.join-card h2 {
  margin: 0 0 var(--space-1);
}
</style>
