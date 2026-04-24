<template>
  <div class="chat-wrapper">
    <div class="chat-container">

      <!-- People Sidebar -->
      <aside class="chat-sidebar" :class="{ 'mobile-hidden': selectedUserId }">
        <div class="sidebar-header">
          <h2>Messages</h2>
          <span class="material-symbols-outlined icon-muted">chat</span>
        </div>

        <div class="sidebar-search">
          <div class="search-box">
            <span class="material-symbols-outlined search-icon">search</span>
            <input v-model="searchQuery" type="text" placeholder="Search people…" />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="sidebar-list">
          <div v-if="messageStore.membersLoading && !sidebarEntries.length" class="sidebar-empty">
            <AppSpinner />
          </div>

          <div v-else-if="!sidebarEntries.length && !searchQuery" class="sidebar-empty">
            <div class="empty-icon-box"><span class="material-symbols-outlined">group</span></div>
            <p class="empty-title">No mutual members</p>
            <p class="empty-desc">Join a board and invite team members to start conversations.</p>
          </div>

          <div v-else-if="!filteredEntries.length && searchQuery" class="sidebar-empty">
            <span class="material-symbols-outlined" style="font-size:2rem;opacity:.3">search_off</span>
            <p class="empty-desc">No results for "{{ searchQuery }}"</p>
          </div>

          <div v-else class="entries">
            <button
              v-for="entry in filteredEntries"
              :key="entry.user._id"
              class="entry-btn"
              :class="{ active: selectedUserId === entry.user._id }"
              @click="selectConversation(entry.user._id)"
            >
              <div class="avatar-wrap">
                <div class="avatar">
                  <img v-if="entry.user.avatar" :src="entry.user.avatar" />
                  <span v-else>{{ entry.user.name?.charAt(0) }}</span>
                </div>
                <span v-if="entry.unreadCount > 0" class="unread-badge">{{ entry.unreadCount > 9 ? '9+' : entry.unreadCount }}</span>
              </div>
              <div class="entry-info">
                <div class="entry-top">
                  <p class="entry-name">{{ entry.user.name }}</p>
                  <span v-if="entry.lastMessage" class="entry-time">{{ formatTimeAgo(entry.lastMessage.createdAt) }}</span>
                </div>
                <p v-if="entry.lastMessage" class="entry-preview" :class="{ unread: entry.unreadCount > 0 }">
                  {{ isSentByMe(entry.lastMessage) ? 'You: ' : '' }}{{ entry.lastMessage.text }}
                </p>
                <p v-else class="entry-preview muted">
                  {{ entry.sharedBoards?.length ? entry.sharedBoards.slice(0, 2).join(', ') : 'Mutual board member' }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- Chat Area -->
      <section class="chat-main" :class="{ 'mobile-hidden': !selectedUserId }">

        <div v-if="!selectedUserId" class="chat-placeholder">
          <div class="placeholder-icon"><span class="material-symbols-outlined">forum</span></div>
          <p class="placeholder-title">Welcome to Chat</p>
          <p class="placeholder-desc">Select a person from the sidebar to start chatting.</p>
        </div>

        <template v-else>
          <div class="chat-header">
            <button class="back-btn" @click="selectedUserId = null">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <router-link :to="`/members/${selectedUserId}`" class="header-user">
              <div class="avatar small">
                <img v-if="chatPartner?.avatar" :src="chatPartner?.avatar" />
                <span v-else>{{ chatPartner?.name?.charAt(0) }}</span>
              </div>
              <div class="header-user-info">
                <p class="header-name">{{ chatPartner?.name }}</p>
                <p class="header-email">{{ chatPartner?.email }}</p>
              </div>
            </router-link>
          </div>

          <div ref="messagesContainer" class="messages-area">
            <div v-if="messageStore.isLoading && !messageStore.currentMessages.length" class="sidebar-empty">
              <AppSpinner />
            </div>
            <template v-else>
              <div v-if="messageStore.currentMessages.length === 0" class="chat-placeholder" style="padding:3rem 1rem">
                <div class="placeholder-icon small"><span class="material-symbols-outlined">waving_hand</span></div>
                <p class="placeholder-title" style="font-size:.875rem">Start the conversation</p>
                <p class="placeholder-desc">Send a message to {{ chatPartner?.name || 'this user' }}.</p>
              </div>

              <template v-for="(msg, index) in messageStore.currentMessages" :key="msg._id">
                <div v-if="showDateSeparator(index)" class="date-separator">
                  <span>{{ formatDateLabel(msg.createdAt) }}</span>
                </div>
                <div class="bubble-row" :class="isSentByMe(msg) ? 'sent' : 'received'">
                  <div class="bubble" :class="isSentByMe(msg) ? 'bubble-sent' : 'bubble-received'">
                    <p class="bubble-text">{{ msg.text }}</p>
                    <p class="bubble-time">{{ formatTime(msg.createdAt) }}</p>
                  </div>
                </div>
              </template>
            </template>
          </div>

          <div class="input-bar">
            <form @submit.prevent="handleSend" class="input-form">
              <div class="input-wrap">
                <textarea
                  v-model="newMessage"
                  placeholder="Type a message…"
                  rows="1"
                  @keydown.enter.exact.prevent="handleSend"
                  @input="autoResize"
                  ref="messageInput"
                ></textarea>
              </div>
              <button type="submit" :disabled="!newMessage.trim() || messageStore.isSending" class="send-btn">
                <span v-if="messageStore.isSending" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span v-else class="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMessageStore } from '@/stores/messageStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUIStore } from '@/stores/uiStore'
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import userService from '@/api/userService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const messageStore = useMessageStore()
const notificationStore = useNotificationStore()
const uiStore = useUIStore()

const selectedUserId = ref(route.params.userId || null)
const newMessage = ref('')
const messagesContainer = ref(null)
const messageInput = ref(null)
const searchQuery = ref('')
const fallbackUser = ref(null)

const isSentByMe = (msg) => {
  if (!msg || !authStore.user) return false
  const senderId = msg.senderId?._id || msg.senderId
  return String(senderId) === String(authStore.user._id)
}

const sidebarEntries = computed(() => {
  const convMap = new Map()
  for (const conv of messageStore.conversations) {
    if (conv.user?._id) {
      convMap.set(conv.user._id, {
        user: conv.user, lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0, sharedBoards: []
      })
    }
  }
  for (const member of messageStore.mutualMembers) {
    if (member._id === authStore.user?._id) continue
    if (convMap.has(member._id)) {
      convMap.get(member._id).sharedBoards = member.sharedBoards || []
    } else {
      convMap.set(member._id, {
        user: { _id: member._id, name: member.name, email: member.email, avatar: member.avatar },
        lastMessage: null, unreadCount: 0, sharedBoards: member.sharedBoards || []
      })
    }
  }
  return Array.from(convMap.values()).sort((a, b) => {
    if (a.lastMessage && !b.lastMessage) return -1
    if (!a.lastMessage && b.lastMessage) return 1
    if (a.lastMessage && b.lastMessage) return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    return (a.user.name || '').localeCompare(b.user.name || '')
  })
})

const filteredEntries = computed(() => {
  if (!searchQuery.value.trim()) return sidebarEntries.value
  const q = searchQuery.value.trim().toLowerCase()
  return sidebarEntries.value.filter(e => e.user.name?.toLowerCase().includes(q) || e.user.email?.toLowerCase().includes(q))
})

const chatPartner = computed(() => {
  if (!selectedUserId.value) return null
  const entry = sidebarEntries.value.find(e => e.user._id === selectedUserId.value)
  return entry?.user || fallbackUser.value || null
})

onMounted(async () => {
  await Promise.allSettled([messageStore.fetchConversations(), messageStore.fetchMutualMembers()])
  if (selectedUserId.value) {
    if (!chatPartner.value) {
      try { fallbackUser.value = await userService.getUserById(selectedUserId.value) } catch {}
    }
    await loadMessages(selectedUserId.value)
  }
})

watch(() => route.params.userId, async (newId) => {
  if (newId && newId !== selectedUserId.value) {
    selectedUserId.value = newId
    await loadMessages(newId)
  }
})

const selectConversation = async (userId) => {
  selectedUserId.value = userId
  router.replace(`/chat/${userId}`)
  await loadMessages(userId)
}

const loadMessages = async (userId) => {
  try {
    await messageStore.fetchMessages(userId)
    scrollToBottom()
    nextTick(() => messageInput.value?.focus())
  } catch (err) { uiStore.addToast('error', err.message || 'Failed to load messages') }
}

const handleSend = async () => {
  const text = newMessage.value.trim()
  if (!text || !selectedUserId.value) return
  newMessage.value = ''
  if (messageInput.value) messageInput.value.style.height = 'auto'
  try {
    await messageStore.sendMessage(selectedUserId.value, text)
    scrollToBottom()
    messageStore.fetchConversations()
  } catch (err) {
    uiStore.addToast('error', err.message || 'Failed to send message')
    newMessage.value = text
  }
}

const scrollToBottom = () => { nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }) }
const autoResize = (e) => { const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
const formatTimeAgo = (d) => { try { return formatDistanceToNow(new Date(d), { addSuffix: false }) } catch { return '' } }
const formatTime = (d) => { try { return format(new Date(d), 'HH:mm') } catch { return '' } }
const formatDateLabel = (d) => { try { const dt = new Date(d); if (isToday(dt)) return 'Today'; if (isYesterday(dt)) return 'Yesterday'; return format(dt, 'MMMM d, yyyy') } catch { return '' } }
const showDateSeparator = (i) => { if (i === 0) return true; return !isSameDay(new Date(messageStore.currentMessages[i].createdAt), new Date(messageStore.currentMessages[i - 1].createdAt)) }

let pollTimer = null
watch(selectedUserId, (id) => {
  clearInterval(pollTimer)
  if (id) {
    pollTimer = setInterval(async () => {
      const prev = messageStore.currentMessages.length
      await messageStore.fetchMessages(id)
      await messageStore.fetchConversations()
      if (messageStore.currentMessages.length > prev) { scrollToBottom(); notificationStore.fetchNotifications() }
    }, 5000)
  }
})
onUnmounted(() => clearInterval(pollTimer))
</script>

<style scoped>
.chat-wrapper {
  height: calc(100vh - 7rem);
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  min-height: 0;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.7);
  background: rgba(255,255,255,.55);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

/* ── Sidebar ── */
.chat-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.45);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0,0,0,.06);
}
.sidebar-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1a1a2e);
  margin: 0;
}
.icon-muted { opacity: .4; font-size: 22px; }

.sidebar-search {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,.05);
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,.04);
  border-radius: 12px;
  padding: 8px 12px;
}
.search-icon { font-size: 18px; opacity: .45; }
.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: .8125rem;
  outline: none;
  color: inherit;
}
.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  opacity: .4;
  padding: 0;
  display: flex;
}
.clear-btn .material-symbols-outlined { font-size: 16px; }

.sidebar-list { flex: 1; overflow-y: auto; }

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}
.empty-icon-box {
  width: 56px; height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(103,80,164,.12), rgba(103,80,164,.04));
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.empty-icon-box .material-symbols-outlined { font-size: 28px; color: rgba(103,80,164,.5); }
.empty-title { font-size: .875rem; font-weight: 600; margin: 0; }
.empty-desc { font-size: .75rem; color: rgba(0,0,0,.45); margin: 6px 0 0; max-width: 200px; line-height: 1.5; }

.entries { padding: 4px 0; }

.entry-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
  border-left: 3px solid transparent;
}
.entry-btn:hover { background: rgba(103,80,164,.04); }
.entry-btn.active {
  background: rgba(103,80,164,.07);
  border-left-color: #6750A4;
}

.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(103,80,164,.18), rgba(103,80,164,.08));
  font-size: .8125rem; font-weight: 700; text-transform: uppercase;
  color: #6750A4;
  border: 2px solid rgba(255,255,255,.8);
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar.small { width: 36px; height: 36px; font-size: .75rem; }

.unread-badge {
  position: absolute;
  top: -2px; right: -2px;
  min-width: 18px; height: 18px;
  border-radius: 9px;
  background: #B3261E;
  color: #fff;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 0 2px #fff;
}

.entry-info { flex: 1; min-width: 0; }
.entry-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.entry-name { font-size: .8125rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.entry-time { font-size: .625rem; color: rgba(0,0,0,.35); flex-shrink: 0; }
.entry-preview {
  font-size: .75rem;
  color: rgba(0,0,0,.45);
  margin: 3px 0 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.entry-preview.unread { font-weight: 600; color: rgba(0,0,0,.75); }
.entry-preview.muted { font-style: italic; opacity: .6; }

/* ── Chat Main ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: rgba(250,248,255,.4);
}

.chat-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
.placeholder-icon {
  width: 80px; height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(103,80,164,.1), rgba(103,80,164,.03));
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.placeholder-icon .material-symbols-outlined { font-size: 40px; color: rgba(103,80,164,.35); }
.placeholder-icon.small { width: 56px; height: 56px; border-radius: 16px; margin-bottom: 12px; }
.placeholder-icon.small .material-symbols-outlined { font-size: 28px; }
.placeholder-title { font-size: 1.125rem; font-weight: 700; margin: 0; }
.placeholder-desc { font-size: .8125rem; color: rgba(0,0,0,.45); margin: 8px 0 0; max-width: 260px; line-height: 1.5; }

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.6);
  flex-shrink: 0;
}
.back-btn {
  display: none;
  background: none; border: none; cursor: pointer;
  padding: 4px; border-radius: 8px;
}
.back-btn:hover { background: rgba(0,0,0,.06); }
.header-user {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: inherit;
  min-width: 0; flex: 1;
}
.header-user:hover { opacity: .8; }
.header-user-info { min-width: 0; }
.header-name { font-size: .875rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.header-email { font-size: .6875rem; color: rgba(0,0,0,.4); margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-separator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.date-separator::before,
.date-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(0,0,0,.08);
}
.date-separator span {
  font-size: .625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: rgba(0,0,0,.3);
}

.bubble-row { display: flex; }
.bubble-row.sent { justify-content: flex-end; }
.bubble-row.received { justify-content: flex-start; }

.bubble {
  max-width: 70%;
  padding: 10px 16px;
  font-size: .8125rem;
  line-height: 1.55;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.bubble-sent {
  background: #6750A4;
  color: #fff;
  border-radius: 18px 18px 6px 18px;
}
.bubble-received {
  background: #fff;
  color: #1a1a2e;
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 18px 18px 18px 6px;
}
.bubble-text { margin: 0; white-space: pre-wrap; word-break: break-word; }
.bubble-time { margin: 4px 0 0; font-size: .625rem; text-align: right; opacity: .5; }

.input-bar {
  padding: 12px 20px 14px;
  border-top: 1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.5);
  flex-shrink: 0;
}
.input-form { display: flex; align-items: flex-end; gap: 10px; }
.input-wrap {
  flex: 1;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 20px;
  background: #fff;
  overflow: hidden;
  transition: border-color .15s, box-shadow .15s;
}
.input-wrap:focus-within {
  border-color: rgba(103,80,164,.35);
  box-shadow: 0 0 0 3px rgba(103,80,164,.08);
}
.input-wrap textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 16px;
  font-size: .8125rem;
  resize: none;
  outline: none;
  font-family: inherit;
  color: inherit;
  line-height: 1.5;
}

.send-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: none;
  background: #6750A4;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(103,80,164,.25);
  transition: all .15s;
}
.send-btn:hover { background: #5a4494; box-shadow: 0 4px 12px rgba(103,80,164,.35); }
.send-btn:active { transform: scale(.95); }
.send-btn:disabled { opacity: .3; cursor: not-allowed; box-shadow: none; }
.send-btn .material-symbols-outlined { font-size: 18px; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .chat-sidebar { width: 100%; border-right: none; }
  .mobile-hidden { display: none !important; }
  .back-btn { display: flex; }
  .messages-area { padding: 16px; }
  .input-bar { padding: 10px 12px 12px; }
  .bubble { max-width: 85%; }
}

@media (min-width: 769px) {
  .mobile-hidden { /* no-op on desktop */ }
}

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
