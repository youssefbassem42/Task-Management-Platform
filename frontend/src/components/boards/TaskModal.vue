<template>
  <AppModal :model-value="modelValue" :title="modalTitle" size="lg" @update:modelValue="close">
    <div class="task-modal">
      <div class="task-form-grid">
        <AppInput v-model="draft.title" label="Title" placeholder="Task title" :disabled="isReadOnly" />

        <AppSelect
          v-model="draft.priority"
          label="Priority"
          :options="priorityOptions"
          :disabled="isReadOnly"
        />

        <AppSelect
          v-if="canManage"
          v-model="draft.assigneeId"
          label="Assignee"
          :options="[{ value: '', label: 'Unassigned' }, ...members]"
        />

        <AppSelect
          v-model="draft.status"
          label="Status"
          :options="statusOptions"
          :disabled="!canChangeStatus"
        />

        <AppInput v-model="draft.dueDate" label="Due date" type="date" :disabled="isReadOnly" />
      </div>

      <label class="field-label">Description</label>
      <textarea
        v-model="draft.description"
        class="task-textarea"
        rows="5"
        placeholder="What needs to be done?"
        :disabled="isReadOnly"
      />

      <div v-if="task" class="comments-section">
        <div class="comments-header">
          <h3>Comments</h3>
          <span>{{ comments.length }}</span>
        </div>

        <div v-if="comments.length" class="comments-list">
          <article v-for="comment in comments" :key="comment._id" class="comment-card">
            <AppAvatar :src="comment.userId?.avatar" :name="comment.userId?.name" size="sm" />
            <div class="comment-body">
              <div class="comment-bubble">
                <strong>{{ comment.userId?.name || 'Unknown user' }}</strong>
                <p>{{ comment.content }}</p>
              </div>
              <span class="comment-time">{{ timeAgo(comment.createdAt) }}</span>
            </div>
          </article>
        </div>
        <AppEmptyState
          v-else
          title="No comments yet"
          description="Use comments to keep collaboration attached to the task."
        />

        <div class="comment-input-row">
          <input
            v-model="commentDraft"
            class="comment-input"
            type="text"
            placeholder="Add a comment"
            @keyup.enter="submitComment"
          />
          <AppButton :loading="loading" @click="submitComment">Comment</AppButton>
        </div>
      </div>

      <div v-if="task" class="attachments-section">
        <div class="comments-header">
          <h3>Attachments</h3>
          <span>{{ attachments.length }}</span>
        </div>

        <div class="attachment-upload-row">
          <input ref="attachmentInput" type="file" class="hidden-input" @change="handleAttachmentChange" />
          <AppButton variant="secondary" @click="attachmentInput?.click()">Choose File</AppButton>
          <AppButton
            :loading="attachmentLoading"
            :disabled="!attachmentFile"
            @click="submitAttachment"
          >
            Upload
          </AppButton>
        </div>

        <div v-if="attachments.length" class="attachments-list">
          <article v-for="attachment in attachments" :key="attachment._id" class="attachment-card">
            <div>
              <strong>{{ attachment.fileName }}</strong>
              <div class="attachment-meta">
                <AppAvatar :src="attachment.uploadedBy?.avatar" :name="attachment.uploadedBy?.name" size="sm" />
                <span>{{ attachment.uploadedBy?.name || 'Unknown user' }}</span>
                <span>{{ timeAgo(attachment.createdAt) }}</span>
              </div>
            </div>
            <a :href="attachment.fileUrl" target="_blank" rel="noreferrer">Download</a>
          </article>
        </div>
        <AppEmptyState
          v-else
          title="No attachments yet"
          description="Attach files directly to this task for quick collaboration."
        />
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <div class="footer-left">
          <AppButton
            v-if="task && canManage"
            variant="ghost"
            @click="$emit('archive', !draft.isArchived)"
          >
            {{ draft.isArchived ? 'Restore' : 'Archive' }}
          </AppButton>
          <AppButton
            v-if="task && canManage"
            variant="danger"
            @click="$emit('delete')"
          >
            Delete
          </AppButton>
        </div>

        <div class="footer-right">
          <AppButton variant="ghost" @click="close(false)">Close</AppButton>
          <AppButton :loading="loading" @click="submitTask">
            {{ task ? (isReadOnly ? 'Update status' : 'Save changes') : 'Create task' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { timeAgo } from '@/utils/formatters'

const props = defineProps({
  modelValue: Boolean,
  task: {
    type: Object,
    default: null
  },
  board: {
    type: Object,
    default: null
  },
  members: {
    type: Array,
    default: () => []
  },
  comments: {
    type: Array,
    default: () => []
  },
  attachments: {
    type: Array,
    default: () => []
  },
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
  'attachment-upload'
])

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
]

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }
]

const draft = reactive({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
  isArchived: false
})

const commentDraft = ref('')
const attachmentFile = ref(null)
const attachmentInput = ref(null)

const modalTitle = computed(() => (props.task ? 'Task details' : 'Create task'))
const canManage = computed(() => Boolean(props.board?.isOwner))
const canChangeStatus = computed(() => Boolean(props.task?.canChangeStatus || props.board?.isOwner || !props.task))
const isReadOnly = computed(() => Boolean(props.task && !canManage.value))

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return

    draft.title = props.task?.title || ''
    draft.description = props.task?.description || ''
    draft.status = props.task?.status || 'TODO'
    draft.priority = props.task?.priority || 'MEDIUM'
    draft.assigneeId = props.task?.assigneeId?._id || ''
    draft.dueDate = props.task?.dueDate ? String(props.task.dueDate).slice(0, 10) : ''
    draft.isArchived = Boolean(props.task?.isArchived)
    commentDraft.value = ''
    attachmentFile.value = null
  },
  { immediate: true }
)

const close = (value = false) => {
  emit('update:modelValue', value)
}

const submitTask = () => {
  if (isReadOnly.value) {
    emit('status-change', draft.status)
    return
  }

  if (!draft.title.trim()) {
    return
  }

  const payload = {
    title: draft.title,
    description: draft.description,
    status: draft.status,
    priority: draft.priority,
    assigneeId: draft.assigneeId || null,
    dueDate: draft.dueDate || null
  }

  emit('save', payload)
}

const submitComment = () => {
  if (!commentDraft.value.trim()) {
    return
  }

  emit('comment', commentDraft.value.trim())
  commentDraft.value = ''
}

const handleAttachmentChange = (event) => {
  attachmentFile.value = event.target.files?.[0] || null
}

const submitAttachment = () => {
  if (!attachmentFile.value) {
    return
  }

  emit('attachment-upload', attachmentFile.value)
  attachmentFile.value = null
  if (attachmentInput.value) {
    attachmentInput.value.value = ''
  }
}
</script>

<style scoped>
.task-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.field-label {
  font-size: var(--font-size-sm);
  color: var(--c-text-secondary);
  font-weight: 500;
}

.task-textarea,
.comment-input {
  width: 100%;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background: var(--c-bg-surface);
  color: var(--c-text-primary);
  outline: none;
}

.task-textarea:focus,
.comment-input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-alpha);
}

.comments-section {
  border-top: 1px solid var(--c-border-light);
  padding-top: var(--space-4);
}

.attachments-section {
  border-top: 1px solid var(--c-border-light);
  padding-top: var(--space-4);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.comments-header h3 {
  margin: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  max-height: 220px;
  overflow-y: auto;
}

.comment-card {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.comment-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.comment-bubble {
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  background: var(--c-bg);
}

.comment-bubble p {
  margin: var(--space-2) 0 0;
}

.comment-time {
  color: var(--c-text-muted);
  font-size: var(--font-size-xs);
  padding-left: var(--space-2);
}

.comment-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  align-items: center;
}

.attachment-upload-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-4);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.attachment-card {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: center;
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background: var(--c-bg);
}

.attachment-meta {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  color: var(--c-text-muted);
  font-size: var(--font-size-xs);
  margin-top: var(--space-2);
}

.hidden-input {
  display: none;
}

.footer-actions,
.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.footer-actions {
  width: 100%;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .task-form-grid,
  .comment-input-row,
  .footer-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .attachment-upload-row,
  .attachment-card {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-left,
  .footer-right {
    width: 100%;
  }
}
</style>
