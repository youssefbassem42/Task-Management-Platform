<template>
  <div class="flex flex-col h-full bg-surface">
    <!-- Board Header -->
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 shrink-0 pl-2" v-if="boardStore.currentBoard">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
           <router-link to="/boards" class="text-on-surface-variant hover:text-primary mb-1">
             <span class="material-symbols-outlined ml-[-8px]">arrow_back</span>
           </router-link>
           <h1 class="text-[32px] leading-tight font-headline font-bold text-on-surface tracking-tight">{{ boardStore.currentBoard.name }}</h1>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Progress</span>
            <div class="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full bg-secondary rounded-full" :style="{ width: `${localBoardProgress}%` }"></div>
            </div>
            <span class="text-xs font-medium text-on-surface-variant">{{ localBoardProgress }}%</span>
          </div>
          <div class="hidden sm:flex items-center">
            <div class="flex -space-x-2">
                 <!--  Avatars Setup  -->
               <img v-if="userStore.users.length" :src="userStore.users[0]?.avatar" class="w-8 h-8 rounded-full ghost-border object-cover bg-surface-container-lowest" />
            </div> 
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-4">
        <div class="flex items-center gap-3">
          <button v-if="boardStore.currentBoard.isOwner" @click="downloadBoardExport" class="px-4 py-2.5 text-sm font-semibold text-on-surface border border-outline-variant rounded-xl hover:bg-surface-variant/50 transition-colors shadow-sm bg-surface-container-lowest">
            Export Report
          </button>
          <button v-if="boardStore.currentBoard.isOwner" @click="inviteModalOpen = true" class="px-4 py-2.5 text-sm font-semibold bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">person_add</span> Invite
          </button>
          <button v-if="boardStore.currentBoard.isOwner" @click="confirmDeleteBoard" class="w-10 h-10 rounded-xl border border-error/50 text-error hover:bg-error hover:text-on-error transition-colors flex items-center justify-center bg-surface-container-lowest shadow-sm" title="Delete Board">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>

        <div class="flex bg-surface-container-low rounded-full p-1 border border-surface-container-highest">
          <button v-for="tab in tabs" :key="tab.value" @click="setActiveTab(tab.value)" class="px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-colors capitalize" :class="activeTab === tab.value ? 'bg-surface-container-lowest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'">
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="boardStore.currentBoard" class="mb-6 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Board Notes</p>
          <p class="mt-1 text-sm text-on-surface-variant">Shared notes for everyone on this board.</p>
        </div>
        <button
          v-if="boardStore.currentBoard.isOwner"
          @click="saveBoardDescription"
          class="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition hover:bg-primary/90"
        >
          Save Notes
        </button>
      </div>
      <textarea
        v-model="boardDescriptionDraft"
        :readonly="!boardStore.currentBoard.isOwner"
        class="mt-4 min-h-[96px] w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
        placeholder="Add notes, links, delivery context, or reminders for all board members."
      ></textarea>
    </div>

    <div v-if="activeTab !== 'activity'" class="mb-6 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-sm">
      <div class="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
        <span class="material-symbols-outlined text-[16px]">search</span>
        <span class="font-medium">{{ uiStore.globalSearchQuery ? `Searching: ${uiStore.globalSearchQuery}` : 'Use top search for task title/keywords' }}</span>
      </div>

      <select v-model="filters.priority" class="rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none">
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select v-model="filters.dueWindow" class="rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none">
        <option value="">All due dates</option>
        <option value="today">Due today</option>
        <option value="this_week">Due this week</option>
        <option value="overdue">Overdue</option>
        <option value="no_due_date">No due date</option>
      </select>

      <label class="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm text-on-surface">
        <input v-model="filters.myTasks" type="checkbox" class="rounded border-outline-variant/40 text-primary focus:ring-primary/20" />
        Assigned to me
      </label>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex gap-6 overflow-hidden relative">
      
      <!-- Loading Board State -->
      <div v-if="boardStore.boardLoading && !boardStore.tasks.length" class="flex items-center justify-center w-full h-full">
        <AppSpinner size="3rem" />
      </div>

      <!-- Activity Tab -->
      <div v-else-if="activeTab === 'activity'" class="flex-1 overflow-y-auto w-full bg-surface-container-lowest p-6 rounded-2xl">
        <div class="flex flex-col gap-3">
          <AppEmptyState v-if="!boardStore.activity.length" title="No activity yet" description="Task changes, comments, and joins will show up here." />
          <article v-else v-for="entry in boardStore.activity" :key="entry._id" class="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low">
             <div class="w-8 h-8 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase">
               <img v-if="entry.userId?.avatar" :src="entry.userId.avatar" :alt="entry.userId?.name || 'Activity user'" class="w-full h-full object-cover" />
               <span v-else>{{ entry.userId?.name?.charAt(0) || 'U' }}</span>
             </div>
             <div>
               <strong class="text-on-surface text-sm">{{ entry.userId?.name || 'Unknown user' }}</strong>
               <p class="text-sm text-on-surface-variant my-1">{{ entry.action }}</p>
               <span class="text-xs text-on-surface-variant/70">{{ formatDate(entry.createdAt, 'MMM dd, yyyy p') }}</span>
             </div>
          </article>
        </div>
      </div>

      <div v-else-if="activeTab === 'timeline'" class="flex-1 overflow-auto rounded-2xl bg-surface-container-lowest p-6">
        <div class="min-w-[980px]">
          <div class="grid" :style="{ gridTemplateColumns: `260px repeat(${timelineDays.length}, minmax(56px, 1fr))` }">
            <div class="sticky left-0 z-10 bg-surface-container-lowest pb-3 pr-4 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Task</div>
            <div
              v-for="day in timelineDays"
              :key="day.key"
              class="border-b border-l border-outline-variant/10 pb-3 text-center text-xs font-semibold text-on-surface-variant"
            >
              <div>{{ day.label }}</div>
              <div class="mt-1 text-[11px]">{{ day.day }}</div>
            </div>

            <template v-for="task in timelineTasks" :key="task._id">
              <div class="sticky left-0 z-10 flex items-center gap-2 border-t border-outline-variant/10 bg-surface-container-lowest py-3 pr-4">
                <span class="text-lg">{{ task.emoji || '🗂️' }}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-on-surface">{{ task.title }}</p>
                  <p class="truncate text-[11px] text-on-surface-variant">{{ taskTimelineLabel(task) }}</p>
                </div>
              </div>
              <div
                class="relative border-l border-t border-outline-variant/10"
                :style="{ gridColumn: `2 / span ${timelineDays.length}` }"
              >
                <div
                  class="absolute top-1/2 h-8 -translate-y-1/2 rounded-full px-3 text-xs font-semibold text-white shadow-sm"
                  :class="timelineBarClass(task.priority)"
                  :style="timelineBarStyle(task)"
                >
                  <span class="inline-flex h-full items-center">{{ task.emoji || '•' }} {{ task.title }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Kanban Canvas -->
      <div v-else class="flex-1 flex gap-6 overflow-x-auto pb-6 hide-scrollbar items-start h-full">
        <!-- Columns -->
        <div 
          v-for="column in columns" 
          :key="column.value"
          class="flex flex-col w-[295px] shrink-0 bg-surface-container-low rounded-2xl p-3 pb-4 transition-all"
          @dragover.prevent
          @drop="handleDrop(column.value)"
        >
          <div class="flex items-center justify-between px-3 py-3 mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :class="getColumnColor(column.value)"></span>
              <h2 class="font-headline font-bold text-on-surface tracking-wide text-sm">{{ column.label }}</h2>
            </div>
            <span class="bg-surface-variant text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">{{ groupedTasks[column.value]?.length || 0 }}</span>
          </div>

          <!-- Cards List -->
          <div class="flex flex-col gap-3 min-h-[100px]">
            <AppEmptyState v-if="!groupedTasks[column.value]?.length" :title="`No tasks`" description="Drag tasks here." class="opacity-50 !p-4" />
            
            <div 
              v-for="task in groupedTasks[column.value]" 
              :key="task._id"
              :draggable="!task.isArchived"
              @dragstart="handleDragStart(task)"
              @click="openTask(task)"
              style="cursor: grab"
              class="rounded-xl p-4 flex flex-col gap-3 hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)] transition-all duration-300 group ring-1 ring-outline-variant/15 relative overflow-hidden bg-surface-container-lowest"
            >
              <div class="absolute top-0 left-0 w-full h-1" :class="getColumnColor(task.status)"></div>
              <div class="flex justify-between items-start mt-1">
                <div class="flex items-center gap-2">
                  <span class="text-lg leading-none">{{ task.emoji || '📝' }}</span>
                  <span 
                    class="text-[10px] font-label font-bold uppercase tracking-widest px-2.5 py-1 rounded-full w-max"
                    :class="getPriorityClass(task.priority)"
                  >
                    {{ task.priority }}
                  </span>
                </div>
                <button class="text-on-surface-variant opacity-0 hover:text-primary group-hover:opacity-100 transition-all"><span class="material-symbols-outlined text-[16px]">edit</span></button>
              </div>
              
              <h3 class="font-headline font-semibold text-on-surface leading-snug text-[15px]" :class="{ 'line-through text-on-surface-variant': task.status === 'DONE' }">
                {{ task.title }}
              </h3>

              <div v-if="task.keywords?.length" class="flex flex-wrap gap-1">
                <span v-for="keyword in task.keywords.slice(0, 3)" :key="keyword" class="rounded-full bg-primary-fixed px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-primary-fixed">
                  {{ keyword }}
                </span>
              </div>

              <div v-if="task.totalChecklistCount" class="rounded-xl bg-surface-container-low p-2.5">
                <div class="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
                  <span class="inline-flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Subtasks
                  </span>
                  <span>{{ task.completedChecklistCount }}/{{ task.totalChecklistCount }}</span>
                </div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div class="h-full rounded-full bg-secondary" :style="{ width: `${task.totalChecklistCount ? (task.completedChecklistCount / task.totalChecklistCount) * 100 : 0}%` }"></div>
                </div>
                <div class="mt-2 space-y-1">
                  <div v-for="item in task.checklist.slice(0, 2)" :key="item._id || item.text" class="flex items-center gap-2 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-[14px]" :class="item.completed ? 'text-secondary' : 'text-outline'">{{ item.completed ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    <span class="truncate" :class="{ 'line-through': item.completed }">{{ item.text }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-1">
                <div class="flex items-center gap-2">
                  <div class="flex -space-x-1.5" v-if="task.assigneeIds?.length">
                    <div v-for="assignee in task.assigneeIds.slice(0, 3)" :key="assignee._id" class="w-6 h-6 rounded-full ring-2 ring-surface-container-lowest bg-surface-variant overflow-hidden flex items-center justify-center text-[9px] font-bold text-on-surface uppercase">
                      <img v-if="assignee.avatar" :src="assignee.avatar" :alt="assignee.name" class="w-full h-full object-cover" />
                      <span v-else>{{ assignee.name?.charAt(0) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-on-surface-variant">
                  <span class="text-[11px] font-medium flex items-center gap-1" :class="task.isOverdue ? 'text-error' : ''">
                    <span class="material-symbols-outlined text-[14px]">calendar_today</span> 
                    {{ formatDate(task.dueDate) || 'No Date' }}
                  </span>
                </div>
              </div>
            </div>
            
            <button @click="openCreateModal" v-if="column.value === 'TODO' && activeTab === 'active' && boardStore.currentBoard?.isOwner" class="w-full py-2.5 mt-1 flex items-center justify-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 rounded-lg transition-colors border border-dashed border-outline-variant/50">
                <span class="material-symbols-outlined text-[18px]">add</span> Add Task
            </button>
          </div>
        </div>
      </div>

      <!-- Files Sidebar -->
      <div v-if="activeTab !== 'activity'" class="hidden xl:flex w-80 shrink-0 bg-surface-container-low rounded-2xl p-4 flex-col gap-4 overflow-y-auto h-full relative z-10">
        <div class="flex justify-between items-center">
            <h2 class="font-headline font-bold text-on-surface text-sm">Board Files</h2>
            <AppSpinner v-if="boardStore.attachmentsLoading" size="1rem" />
        </div>
        
        <!-- Upload Area -->
        <input ref="boardAttachmentInput" type="file" class="hidden" @change="handleBoardAttachmentSelect" />
        <div @click="boardAttachmentInput?.click()" class="border-2 border-dashed border-outline-variant/50 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-lowest">
            <span class="material-symbols-outlined text-on-surface-variant">cloud_upload</span>
            <p class="text-xs text-on-surface-variant font-medium">Click to <span class="text-primary">upload files</span></p>
            <p v-if="boardAttachmentFile" class="text-xs font-bold text-primary mt-2">{{ boardAttachmentFile.name }} (Ready to upload)</p>
        </div>
        <button v-if="boardAttachmentFile" @click="uploadBoardAttachment" class="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90">Confirm Upload</button>

        <!-- File List -->
        <div class="flex flex-col gap-2">
            <AppEmptyState v-if="!boardStore.boardAttachments.length" title="No files" class="!px-0 !py-4" />
            <div 
              v-for="attachment in boardStore.boardAttachments" 
              :key="attachment._id"
              class="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg ghost-border"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[18px]">description</span></div>
                    <div class="flex flex-col">
                        <span class="text-xs font-semibold text-on-surface truncate w-32" :title="attachment.fileName">{{ attachment.fileName }}</span>
                        <span class="text-[10px] text-on-surface-variant">{{ formatDate(attachment.createdAt) }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                  <a :href="attachment.fileUrl" target="_blank" class="text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[16px]">download</span></a>
                  <button
                    v-if="canDeleteBoardAttachment(attachment)"
                    @click="deleteBoardAttachment(attachment)"
                    type="button"
                    class="text-on-surface-variant hover:text-error transition-colors"
                    title="Delete file"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
            </div>
        </div>

        <div class="mt-2 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-on-surface">Unassigned Tasks</h3>
              <p class="text-[11px] text-on-surface-variant">Tasks stay here until assigned, then move into workflow columns.</p>
            </div>
            <span class="rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{{ unassignedTasks.length }}</span>
          </div>
          <div class="space-y-2">
            <AppEmptyState v-if="!unassignedTasks.length" title="No unassigned tasks" class="!px-0 !py-4" />
            <button
              v-for="task in unassignedTasks"
              :key="task._id"
              @click="openTask(task)"
              class="w-full rounded-xl border border-outline-variant/10 bg-surface-container-low p-3 text-left transition hover:border-primary/20 hover:bg-white"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate text-sm font-semibold text-on-surface">{{ task.emoji || '📌' }} {{ task.title }}</span>
                <span class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" :class="getPriorityClass(task.priority)">{{ task.priority }}</span>
              </div>
              <p class="mt-2 text-[11px] text-on-surface-variant">{{ task.totalChecklistCount ? `${task.completedChecklistCount}/${task.totalChecklistCount} subtasks done` : 'Assign this task to place it on the board.' }}</p>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
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
      @attachment-delete="deleteTaskAttachment"
    />

    <AppModal v-model="inviteModalOpen" title="Invite people to this board">
      <div class="invite-panel bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20" v-if="boardStore.currentBoard">
        <AppInput :model-value="inviteLink" label="Invite Link" readonly />
        <p class="text-xs text-on-surface-variant mt-2">Anyone with access to this link can request to join this board.</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 w-full mt-4">
          <AppButton variant="ghost" @click="inviteModalOpen = false">Close</AppButton>
          <AppButton @click="copyInviteLink" variant="primary">Copy Link</AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addDays, differenceInCalendarDays, eachDayOfInterval, endOfDay, format, isSameDay, startOfDay } from 'date-fns'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { formatDate } from '@/utils/formatters'
import TaskModal from '@/components/boards/TaskModal.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppModal from '@/components/shared/AppModal.vue'
import AppInput from '@/components/shared/AppInput.vue'
import AppButton from '@/components/shared/AppButton.vue'

const columns = [
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' }
]

const tabs = [
  { label: 'Board', value: 'active' },
  { label: 'Timeline', value: 'timeline' },
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
const boardDescriptionDraft = ref('')
const boardAttachmentFile = ref(null)
const boardAttachmentInput = ref(null)
let filterDebounceId = null

const filters = ref({
  myTasks: false,
  priority: '',
  dueWindow: ''
})

const getColumnColor = (status) => {
  if (status === 'TODO') return 'bg-primary'
  if (status === 'IN_PROGRESS') return 'bg-tertiary-container'
  if (status === 'DONE') return 'bg-secondary'
  return 'bg-outline'
}

const getPriorityClass = (priority) => {
  if (priority === 'HIGH') return 'bg-error-container text-on-error-container'
  if (priority === 'MEDIUM') return 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
  if (priority === 'LOW') return 'bg-primary-fixed text-on-primary-fixed'
  return 'bg-surface-variant text-on-surface-variant'
}

const assignableMembers = computed(() => {
  const boardMembers = boardStore.members || []
  return boardMembers.map((member) => ({
    value: member._id,
    label: `${member.name} (${member.email})`
  }))
})

const groupedTasks = computed(() =>
  columns.reduce((acc, column) => {
    acc[column.value] = boardStore.tasks.filter(
      (task) => task.status === column.value && (task.assigneeIds?.length || 0) > 0
    )
    return acc
  }, {})
)
const unassignedTasks = computed(() => boardStore.tasks.filter((task) => !(task.assigneeIds?.length)))

const localBoardProgress = computed(() => {
  const tasks = boardStore.tasks || []
  if (!tasks.length) return 0

  let total = 0
  let completed = 0

  tasks.forEach((task) => {
    const checklist = Array.isArray(task.checklist) ? task.checklist : []
    if (checklist.length > 0) {
      total += checklist.length
      completed += checklist.filter((item) => item.completed).length
    } else {
      total += 1
      if (task.status === 'DONE') completed += 1
    }
  })

  return total > 0 ? Math.round((completed / total) * 100) : 0
})
const timelineDays = computed(() => {
  const start = startOfDay(new Date())
  return eachDayOfInterval({ start, end: addDays(start, 13) }).map((date) => ({
    key: format(date, 'yyyy-MM-dd'),
    label: format(date, 'EEE'),
    day: format(date, 'd'),
    date
  }))
})
const timelineTasks = computed(() => boardStore.tasks.filter((task) => !task.isArchived))

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

  if (uiStore.globalSearchQuery.trim()) {
    params.q = uiStore.globalSearchQuery.trim()
  }

  if (filters.value.myTasks) {
    params.mine = true
  }

  if (filters.value.priority) {
    params.priority = filters.value.priority
  }

  if (filters.value.dueWindow) {
    params.dueWindow = filters.value.dueWindow
  }

  return params
})

const fetchBoardShell = async () => {
  await Promise.all([boardStore.fetchBoard(route.params.id), userStore.fetchUsers()])
  boardDescriptionDraft.value = boardStore.currentBoard?.description || ''
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

const addComment = async (payload) => {
  if (!selectedTask.value?._id) return

  try {
    await boardStore.addComment(route.params.id, selectedTask.value._id, payload)
    await boardStore.fetchComments(route.params.id, selectedTask.value._id)
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

const deleteTaskAttachment = async (attachment) => {
  if (!selectedTask.value?._id || !attachment?._id) return

  try {
    await boardStore.deleteTaskAttachment(route.params.id, selectedTask.value._id, attachment._id)
    await boardStore.fetchBoardActivity(route.params.id)
    uiStore.addToast('success', 'Attachment deleted')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to delete attachment')
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

const deleteBoardAttachment = async (attachment) => {
  if (!attachment?._id) return

  try {
    await boardStore.deleteBoardAttachment(route.params.id, attachment._id)
    await boardStore.fetchBoardActivity(route.params.id)
    uiStore.addToast('success', 'Board file deleted')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to delete board file')
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
        router.push('/boards')
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

const saveBoardDescription = async () => {
  if (!boardStore.currentBoard?.isOwner) return

  try {
    await boardStore.updateBoard(route.params.id, {
      name: boardStore.currentBoard.name,
      description: boardDescriptionDraft.value
    })
    uiStore.addToast('success', 'Board notes updated')
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to update board notes')
  }
}

const canDeleteBoardAttachment = (attachment) => {
  if (!attachment?.uploadedBy?._id || !authStore.user?._id) {
    return boardStore.currentBoard?.isOwner
  }

  return boardStore.currentBoard?.isOwner || attachment.uploadedBy._id === authStore.user._id
}

const timelineBarClass = (priority) => {
  if (priority === 'HIGH') return 'bg-error'
  if (priority === 'MEDIUM') return 'bg-tertiary-container'
  return 'bg-primary'
}

const getTaskTimelineRange = (task) => {
  const fallbackStart = startOfDay(new Date(task.startDate || task.createdAt || Date.now()))
  const start = startOfDay(new Date(task.startDate || task.dueDate || fallbackStart))
  const end = endOfDay(new Date(task.dueDate || task.startDate || fallbackStart))
  return { start, end }
}

const timelineBarStyle = (task) => {
  const days = timelineDays.value
  if (!days.length) return {}

  const { start, end } = getTaskTimelineRange(task)
  const gridStart = Math.max(0, differenceInCalendarDays(start, days[0].date))
  const gridEnd = Math.min(days.length - 1, differenceInCalendarDays(end, days[0].date))
  const span = Math.max(1, gridEnd - gridStart + 1)
  const left = `calc(${(gridStart / days.length) * 100}% + 0.25rem)`
  const width = `calc(${(span / days.length) * 100}% - 0.5rem)`

  return {
    left,
    width
  }
}

const taskTimelineLabel = (task) => {
  const { start, end } = getTaskTimelineRange(task)
  return isSameDay(start, end) ? format(start, 'MMM d') : `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}

onMounted(async () => {
  try {
    await refreshCurrentView()
  } catch (error) {
    uiStore.addToast('error', error.message || 'Failed to load board')
    router.push('/boards')
  }
})

watch(
  () => route.params.id,
  async () => {
    try {
      await refreshCurrentView()
    } catch (error) {
      uiStore.addToast('error', error.message || 'Failed to load board')
      router.push('/boards')
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

watch(
  () => uiStore.globalSearchQuery,
  () => {
    scheduleTaskRefresh()
  }
)

onBeforeUnmount(() => {
  window.clearTimeout(filterDebounceId)
})
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.ghost-border {
  @apply ring-1 ring-outline-variant/15;
}
</style>
