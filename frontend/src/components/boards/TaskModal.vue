<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8" @click.self="close(false)">
        
        <!-- Modal Container -->
        <div class="bg-surface-container-lowest w-full max-w-3xl max-h-[90vh] rounded-[20px] shadow-[0px_12px_32px_rgba(25,28,30,0.08)] flex flex-col overflow-hidden relative">
          
          <!-- Header Section -->
          <header class="px-8 py-6 border-b border-outline-variant/15 flex flex-col gap-4 shrink-0">
            <div class="flex items-start justify-between gap-4">
              <!-- Title Area -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1 w-max"
                    :class="getColumnClass(draft.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getColumnDot(draft.status)"></span>
                    {{ draft.status.replace('_', ' ') }}
                  </span>
                  <span class="text-sm text-on-surface-variant ml-2 font-medium flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">folder</span>
                    {{ board?.name || 'Board' }}
                  </span>
                </div>
                
                <!-- Editable Title -->
                <div class="relative inline-flex w-full items-center">
                  <textarea 
                    v-model="draft.title"
                    class="w-full text-[32px] leading-tight font-bold text-on-surface bg-transparent border-transparent hover:bg-surface-container-low focus:bg-surface-container focus:ring-2 focus:ring-primary-container/50 rounded-lg resize-none overflow-hidden transition-colors -ml-3 px-3 py-1 focus:outline-none" 
                    rows="1" 
                    placeholder="Task Title"
                    :disabled="isReadOnly"
                    @input="autoResize"
                    ref="titleTextarea"
                  ></textarea>
                </div>
              </div>
              
              <!-- Close Button -->
              <button @click="close(false)" class="text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-full p-2 transition-colors shrink-0 outline-none">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <!-- Contextual Save Actions -->
            <div class="flex gap-2 justify-end mt-2" v-if="!isReadOnly && hasChanges">
                <button @click="submitTask" :disabled="loading" class="px-4 py-1.5 text-xs font-semibold bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
                    <AppSpinner v-if="loading" size="1rem" />
                    {{ task ? 'Save Changes' : 'Create Task' }}
                </button>
            </div>
          </header>
          
          <!-- Main Content Area -->
          <div class="flex flex-col flex-1 overflow-y-auto px-8 py-8 space-y-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Priority -->
                <section>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Priority</h3>
                <div class="flex flex-wrap gap-2">
                    <button 
                        @click="draft.priority = 'LOW'"
                        :disabled="isReadOnly"
                        class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                        :class="draft.priority === 'LOW' ? 'bg-primary-fixed text-on-primary-fixed border border-primary-fixed' : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'"
                    >Low</button>
                    <button 
                        @click="draft.priority = 'MEDIUM'"
                        :disabled="isReadOnly"
                        class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                        :class="draft.priority === 'MEDIUM' ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed' : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'"
                    >Medium</button>
                    <button 
                        @click="draft.priority = 'HIGH'"
                        :disabled="isReadOnly"
                        class="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                        :class="draft.priority === 'HIGH' ? 'bg-error-container text-on-error-container border border-error-container' : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'"
                    >High</button>
                </div>
                </section>
                
                <!-- Assignees -->
                <section>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Assignees</h3>
                <div class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-3 space-y-2 max-h-40 overflow-y-auto">
                    <label v-for="member in members" :key="member.value" class="flex items-center gap-2 text-sm text-on-surface">
                        <input
                          v-model="draft.assigneeIds"
                          :value="member.value"
                          :disabled="isReadOnly || !isOwner"
                          type="checkbox"
                          class="rounded border-outline-variant/40 text-primary focus:ring-primary/20"
                        />
                        <span>{{ member.label }}</span>
                    </label>
                    <p v-if="!members.length" class="text-xs text-on-surface-variant">No board members available.</p>
                </div>
                </section>
                
                <!-- Start Date -->
                <section>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Start Date</h3>
                <div class="relative w-full">
                    <input 
                        v-model="draft.startDate"
                        type="date"
                        :disabled="isReadOnly"
                        class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container transition-all outline-none" 
                    />
                </div>
                </section>

                <!-- Due Date -->
                <section>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Due Date</h3>
                <div class="relative w-full">
                    <input 
                        v-model="draft.dueDate"
                        type="date"
                        :disabled="isReadOnly"
                        class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container transition-all outline-none" 
                    />
                </div>
                </section>
            </div>

            <section class="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
              <div>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Emoji</h3>
                <input
                  v-model="draft.emoji"
                  :disabled="isReadOnly"
                  maxlength="8"
                  class="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-2xl text-center outline-none focus:ring-2 focus:ring-primary-container/50"
                  placeholder="✨"
                />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Keywords</h3>
                <input
                  v-model="draft.keywordsText"
                  :disabled="isReadOnly"
                  class="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container/50"
                  placeholder="design, api, urgent"
                />
                <p class="mt-2 text-xs text-on-surface-variant">Comma-separated keywords for search.</p>
              </div>
            </section>

            <!-- Description -->
            <section>
              <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  Description
              </h3>
              <div class="mb-3 flex flex-wrap gap-2" v-if="!isReadOnly">
                <button @click="insertIntoDescription('bold')" type="button" class="rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">Bold</button>
                <button @click="insertIntoDescription('bullet')" type="button" class="rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">Bullets</button>
                <button @click="insertIntoDescription('color')" type="button" class="rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">Color</button>
              </div>
              <div class="bg-surface-container-low rounded-[16px] p-4 border border-outline-variant/15 hover:border-outline-variant/30 transition-colors group focus-within:ring-2 focus-within:ring-primary-container/50 focus-within:border-primary-container min-h-[120px]">
                <textarea 
                    v-model="draft.description"
                    class="w-full bg-transparent border-none text-on-surface-variant text-sm leading-relaxed p-0 focus:ring-0 resize-y min-h-[100px] outline-none" 
                    placeholder="Add a description..."
                    :disabled="isReadOnly"
                ></textarea>
              </div>
              <div class="mt-3 rounded-[16px] border border-outline-variant/10 bg-surface-container-lowest p-4">
                <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Preview</p>
                <div class="rich-preview text-sm text-on-surface-variant" v-html="renderRichText(draft.description)"></div>
              </div>
            </section>

            <section>
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Task Checklist</h3>
                <button v-if="!isReadOnly" @click="addChecklistItem" type="button" class="rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
                  Add Item
                </button>
              </div>
              <div class="space-y-2">
                <AppEmptyState v-if="!draft.checklist.length" title="No subtasks yet" description="Break the task into smaller checklist items." class="!py-4" />
                <div v-for="(item, index) in draft.checklist" :key="item._id || index" class="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low p-3">
                  <button type="button" class="text-secondary" @click="toggleChecklistItem(index)" :disabled="isReadOnly">
                    <span class="material-symbols-outlined">{{ item.completed ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  </button>
                  <input
                    v-model="item.text"
                    :readonly="isReadOnly"
                    class="flex-1 bg-transparent text-sm text-on-surface outline-none"
                    placeholder="Checklist item"
                  />
                  <button v-if="!isReadOnly" type="button" class="text-on-surface-variant hover:text-error" @click="removeChecklistItem(index)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </section>

            <!-- Attachments -->
            <section v-if="task">
                <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  Attachments ({{ attachments.length }})
                </h3>
                
                <div class="flex items-center gap-3 mb-4" v-if="!isReadOnly">
                    <input ref="attachmentInput" type="file" class="hidden" @change="handleAttachmentChange" />
                    <button @click="attachmentInput?.click()" class="px-4 py-2 text-sm font-medium border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-xl flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">attach_file</span> Add File
                    </button>
                    <button v-if="attachmentFile" @click="submitAttachment" :disabled="attachmentLoading" class="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:opacity-90 flex items-center gap-2">
                        <AppSpinner v-if="attachmentLoading" size="1rem" />
                        Upload
                    </button>
                    <span v-if="attachmentFile" class="text-xs text-on-surface-variant">{{ attachmentFile.name }}</span>
                </div>

                <div class="flex flex-col gap-2">
                    <AppEmptyState v-if="!attachments.length" title="No attachments yet" description="Attach files for quick collaboration." class="!py-4" />
                    <article v-for="attachment in attachments" :key="attachment._id" class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-surface-container-low rounded-xl ring-1 ring-outline-variant/15">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary bg-primary-container p-2 rounded-lg">description</span>
                            <div class="flex flex-col">
                                <span class="text-sm font-semibold text-on-surface">{{ attachment.fileName }}</span>
                                <div class="flex items-center gap-2 text-[10px] mt-1 text-on-surface-variant">
                                    <span class="font-bold">{{ attachment.uploadedBy?.name || 'Unknown' }}</span>
                                    <span>•</span>
                                    <span>{{ timeAgo(attachment.createdAt) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 sm:mt-0 flex items-center gap-2">
                          <a :href="attachment.fileUrl" target="_blank" class="px-3 py-1 text-xs font-semibold bg-surface-container-lowest border border-outline-variant/30 rounded-lg hover:bg-surface-variant/50 transition-colors text-on-surface">Download</a>
                          <button
                            v-if="canDeleteAttachment(attachment)"
                            @click="$emit('attachment-delete', attachment)"
                            type="button"
                            class="px-3 py-1 text-xs font-semibold bg-error-container text-on-error-container rounded-lg hover:bg-error hover:text-on-error transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                    </article>
                </div>
            </section>

            <!-- Activity / Comments -->
            <section v-if="task">
              <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  Activity
              </h3>
              
              <!-- Comment Input -->
              <div class="flex gap-4 mb-8">
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shrink-0 mt-1 ring-2 ring-surface-container-lowest uppercase">
                    {{ authStore.user?.name?.charAt(0) || 'U' }}
                </div>
                <div class="flex-1">
                  <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] focus-within:ring-2 focus-within:ring-primary-container/50 focus-within:border-primary-container transition-all shadow-sm">
                    <textarea 
                        v-model="commentDraft"
                        class="w-full bg-transparent border-none text-sm text-on-surface placeholder-on-surface-variant/60 focus:ring-0 p-3 min-h-[80px] resize-y rounded-t-[16px] outline-none" 
                        placeholder="Add a comment..."
                    ></textarea>
                    <div class="flex items-center justify-between px-3 py-2 bg-surface-container-low/50 rounded-b-[16px] border-t border-outline-variant/15">
                      <div class="flex gap-1 text-on-surface-variant">
                        <button type="button" class="p-1.5 hover:bg-surface-container-high rounded-md transition-colors" @click="insertIntoComment('bold')"><span class="material-symbols-outlined text-[20px]">format_bold</span></button>
                        <button type="button" class="p-1.5 hover:bg-surface-container-high rounded-md transition-colors" @click="insertIntoComment('bullet')"><span class="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                        <button type="button" class="p-1.5 hover:bg-surface-container-high rounded-md transition-colors" @click="insertIntoComment('color')"><span class="material-symbols-outlined text-[20px]">palette</span></button>
                      </div>
                      <button @click="submitComment" :disabled="loading || !commentDraft.trim()" class="bg-[#2563EB] disabled:opacity-50 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">Comment</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activity Feed -->
              <div class="space-y-6">
                <!-- Comment mapping -->
                <AppEmptyState v-if="!comments.length" title="No comments" description="Be the first to leave a comment!" class="!py-4" />
                <div class="flex gap-4" v-for="comment in topLevelComments" :key="comment._id">
                  <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs shrink-0 mt-1 uppercase">
                      {{ comment.userId?.name.charAt(0) || 'U' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-baseline gap-2 mb-1">
                        <span class="font-semibold text-sm text-on-surface">{{ comment.userId?.name || 'Unknown' }}</span>
                        <span class="text-xs text-on-surface-variant">{{ timeAgo(comment.createdAt) }}</span>
                    </div>
                    <div class="bg-surface-container-low rounded-[16px] rounded-tl-none p-3 text-sm text-on-surface-variant rich-preview" v-html="renderRichText(comment.content)"></div>
                    <button type="button" class="mt-2 text-xs font-semibold text-primary" @click="toggleReply(comment._id)">
                      {{ activeReplyId === comment._id ? 'Cancel reply' : 'Reply' }}
                    </button>
                    <div v-if="activeReplyId === comment._id" class="mt-3 rounded-[16px] border border-outline-variant/10 bg-surface-container-lowest p-3">
                      <textarea v-model="replyDraft" class="min-h-[70px] w-full bg-transparent text-sm outline-none" placeholder="Write a reply..."></textarea>
                      <div class="mt-2 flex justify-end">
                        <button type="button" @click="submitReply(comment._id)" class="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary">Reply</button>
                      </div>
                    </div>
                    <div v-if="commentReplies(comment._id).length" class="mt-3 space-y-3 pl-4">
                      <div v-for="reply in commentReplies(comment._id)" :key="reply._id" class="flex gap-3">
                        <div class="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary-fixed text-[10px] font-bold uppercase text-secondary">
                          {{ reply.userId?.name?.charAt(0) || 'U' }}
                        </div>
                        <div class="flex-1">
                          <div class="flex items-baseline gap-2 mb-1">
                            <span class="font-semibold text-xs text-on-surface">{{ reply.userId?.name || 'Unknown' }}</span>
                            <span class="text-[10px] text-on-surface-variant">{{ timeAgo(reply.createdAt) }}</span>
                          </div>
                          <div class="rounded-[14px] bg-surface-container-low p-3 text-sm text-on-surface-variant rich-preview" v-html="renderRichText(reply.content)"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- Footer Actions -->
            <footer class="pt-6 border-t border-outline-variant/15 flex flex-wrap gap-4 justify-between items-center bg-surface-container-lowest" v-if="task && canManage">
              <div class="flex gap-3">
                  <button @click="$emit('archive', !draft.isArchived)" class="px-4 py-2 text-sm font-semibold border border-outline-variant/50 text-on-surface rounded-xl hover:bg-surface-container-low transition-colors shadow-sm">
                      {{ draft.isArchived ? 'Restore Task' : 'Archive Task' }}
                  </button>
                  <button v-if="isOwner" @click="$emit('delete')" class="px-4 py-2 text-sm font-semibold bg-error-container text-on-error-container rounded-xl hover:bg-error hover:text-on-error transition-colors shadow-sm">
                      Delete Task
                  </button>
              </div>
              
              <div class="px-4 py-2 bg-surface-container-highest text-on-surface-variant text-xs rounded-xl font-medium tracking-wide" v-if="draft.isArchived">
                  This task is archived.
              </div>
              <div class="flex gap-2" v-if="!isReadOnly">
                 <button v-for="statusOpt in statusOptions" :key="statusOpt.value" v-show="draft.status !== statusOpt.value" @click="$emit('status-change', statusOpt.value)" class="px-4 py-2 text-xs font-bold text-on-surface border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm uppercase tracking-wider">
                     Move to {{ statusOpt.label }}
                 </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick } from 'vue'
import { timeAgo } from '@/utils/formatters'
import { useAuthStore } from '@/stores/authStore'
import { insertRichTextToken, renderRichText } from '@/utils/richText'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'

const props = defineProps({
  modelValue: Boolean,
  task: { type: Object, default: null },
  board: { type: Object, default: null },
  members: { type: Array, default: () => [] },
  comments: { type: Array, default: () => [] },
  attachments: { type: Array, default: () => [] },
  loading: Boolean,
  attachmentLoading: Boolean
})

const emit = defineEmits([
  'update:modelValue',
  'save',
  'status-change',
  'archive',
  'delete',
  'comment',
  'attachment-upload',
  'attachment-delete'
])

const authStore = useAuthStore()

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
]

const draft = reactive({
  title: '',
  description: '',
  emoji: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeIds: [],
  keywordsText: '',
  checklist: [],
  startDate: '',
  dueDate: '',
  isArchived: false
})

const commentDraft = ref('')
const replyDraft = ref('')
const activeReplyId = ref(null)
const attachmentFile = ref(null)
const attachmentInput = ref(null)
const titleTextarea = ref(null)

const canManage = computed(() => {
  if (props.task) return Boolean(props.task.canManage)
  return Boolean(props.board?.isOwner)
})
const isOwner = computed(() => Boolean(props.board?.isOwner))
const isReadOnly = computed(() => Boolean(props.task && !canManage.value))
const topLevelComments = computed(() => props.comments.filter((comment) => !comment.parentCommentId))

const hasChanges = computed(() => {
    if (!props.task) return true;
    return (
        draft.title !== props.task.title ||
        draft.description !== props.task.description ||
        draft.emoji !== (props.task.emoji || '') ||
        draft.status !== props.task.status ||
        draft.priority !== props.task.priority ||
        JSON.stringify(draft.assigneeIds) !== JSON.stringify((props.task.assigneeIds || []).map((item) => item._id || item)) ||
        draft.keywordsText !== (props.task.keywords || []).join(', ') ||
        JSON.stringify(draft.checklist) !== JSON.stringify(props.task.checklist || []) ||
        draft.startDate !== (props.task.startDate ? String(props.task.startDate).slice(0, 10) : '') ||
        draft.dueDate !== (props.task.dueDate ? String(props.task.dueDate).slice(0, 10) : '')
    )
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
       document.body.style.overflow = ''
       return
    }

    document.body.style.overflow = 'hidden'
    draft.title = props.task?.title || ''
    draft.description = props.task?.description || ''
    draft.emoji = props.task?.emoji || ''
    draft.status = props.task?.status || 'TODO'
    draft.priority = props.task?.priority || 'MEDIUM'
    draft.assigneeIds = (props.task?.assigneeIds || props.task?.assigneeId ? (props.task?.assigneeIds || [props.task?.assigneeId]) : [])
      .filter(Boolean)
      .map((item) => item._id || item)
    draft.keywordsText = (props.task?.keywords || []).join(', ')
    draft.checklist = (props.task?.checklist || []).map((item) => ({ ...item }))
    draft.startDate = props.task?.startDate ? String(props.task.startDate).slice(0, 10) : ''
    draft.dueDate = props.task?.dueDate ? String(props.task.dueDate).slice(0, 10) : ''
    draft.isArchived = Boolean(props.task?.isArchived)
    commentDraft.value = ''
    replyDraft.value = ''
    activeReplyId.value = null
    attachmentFile.value = null
    
    await nextTick()
    autoResize()
  },
  { immediate: true }
)

const autoResize = () => {
    if(titleTextarea.value){
        titleTextarea.value.style.height = 'auto'
        titleTextarea.value.style.height = titleTextarea.value.scrollHeight + 'px'
    }
}

const close = (value = false) => {
  emit('update:modelValue', value)
}

const submitTask = () => {
  if (isReadOnly.value && props.task) {
    emit('status-change', draft.status)
    return
  }

  if (!draft.title.trim()) return

  const payload = {
    title: draft.title,
    description: draft.description,
    emoji: draft.emoji,
    status: draft.status,
    priority: draft.priority,
    assigneeIds: [...draft.assigneeIds],
    keywords: draft.keywordsText.split(',').map((item) => item.trim()).filter(Boolean),
    checklist: draft.checklist.map((item) => ({ text: item.text, completed: item.completed })),
    startDate: draft.startDate || null,
    dueDate: draft.dueDate || null
  }

  emit('save', payload)
}

const submitComment = () => {
  if (!commentDraft.value.trim()) return
  emit('comment', { content: commentDraft.value.trim() })
  commentDraft.value = ''
}

const submitReply = (parentCommentId) => {
  if (!replyDraft.value.trim()) return
  emit('comment', { content: replyDraft.value.trim(), parentCommentId })
  replyDraft.value = ''
  activeReplyId.value = null
}

const handleAttachmentChange = (event) => {
  attachmentFile.value = event.target.files?.[0] || null
}

const submitAttachment = () => {
  if (!attachmentFile.value) return
  emit('attachment-upload', attachmentFile.value)
  attachmentFile.value = null
  if (attachmentInput.value) attachmentInput.value.value = ''
}

const getColumnClass = (status) => {
    if(status === 'TODO') return 'bg-primary-fixed text-on-primary-fixed'
    if(status === 'IN_PROGRESS') return 'bg-tertiary-fixed text-on-tertiary-fixed'
    if(status === 'DONE') return 'bg-secondary-fixed text-on-secondary-fixed'
    return 'bg-surface-variant text-on-surface-variant'
}

const getColumnDot = (status) => {
    if(status === 'TODO') return 'bg-primary'
    if(status === 'IN_PROGRESS') return 'bg-tertiary-container'
    if(status === 'DONE') return 'bg-secondary'
    return 'bg-outline'
}

const canDeleteAttachment = (attachment) => {
  if (!attachment?.uploadedBy?._id || !authStore.user?._id) {
    return canManage.value
  }

  return canManage.value || attachment.uploadedBy._id === authStore.user._id
}

const addChecklistItem = () => {
  draft.checklist.push({ text: '', completed: false })
}

const removeChecklistItem = (index) => {
  draft.checklist.splice(index, 1)
}

const toggleChecklistItem = (index) => {
  draft.checklist[index].completed = !draft.checklist[index].completed
}

const insertIntoDescription = (token) => {
  draft.description = insertRichTextToken(draft.description, token)
}

const insertIntoComment = (token) => {
  commentDraft.value = insertRichTextToken(commentDraft.value, token)
}

const toggleReply = (commentId) => {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId
  replyDraft.value = ''
}

const commentReplies = (parentCommentId) =>
  props.comments.filter((comment) => (comment.parentCommentId?._id || comment.parentCommentId) === parentCommentId)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.rich-preview :deep(p) {
  margin: 0 0 0.5rem;
}

.rich-preview :deep(ul) {
  margin: 0.5rem 0;
  padding-left: 1rem;
  list-style: disc;
}

.rich-preview :deep(li) {
  margin: 0.25rem 0;
}
</style>
