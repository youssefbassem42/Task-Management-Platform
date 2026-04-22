import { defineStore } from 'pinia'
import boardService from '@/api/boardService'

export const useBoardStore = defineStore('boards', {
  state: () => ({
    boards: [],
    currentBoard: null,
    members: [],
    tasks: [],
    activity: [],
    boardAttachments: [],
    commentsByTask: {},
    attachmentsByTask: {},
    boardsLoading: false,
    boardLoading: false,
    taskMutationLoading: false,
    commentsLoading: false,
    activityLoading: false,
    attachmentsLoading: false,
    error: null
  }),
  getters: {
    boardById: (state) => (id) => state.boards.find((board) => board._id === id),
    boardProgress: () => (board) => {
      if (!board?.totalTasks) return 0
      return Math.round((board.completedTasks / board.totalTasks) * 100)
    }
  },
  actions: {
    async fetchBoards() {
      this.boardsLoading = true
      this.error = null

      try {
        this.boards = await boardService.getBoards()
        return this.boards
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.boardsLoading = false
      }
    },
    async createBoard(payload) {
      this.taskMutationLoading = true
      this.error = null

      try {
        const board = await boardService.createBoard(payload)
        this.boards = [board, ...this.boards]
        return board
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async fetchBoard(boardId) {
      this.boardLoading = true
      this.error = null

      try {
        const data = await boardService.getBoardById(boardId)
        this.currentBoard = data.board
        this.members = data.members || []
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.boardLoading = false
      }
    },
    async updateBoard(boardId, payload) {
      this.taskMutationLoading = true
      this.error = null

      try {
        const data = await boardService.updateBoard(boardId, payload)
        this.currentBoard = data.board
        this.boards = this.boards.map((board) => (board._id === boardId ? { ...board, ...data.board } : board))
        return data.board
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async fetchTasks(boardId, filters = {}) {
      this.boardLoading = true
      this.error = null

      try {
        this.tasks = await boardService.getTasks(boardId, filters)
        return this.tasks
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.boardLoading = false
      }
    },
    async fetchBoardWorkspace(boardId, filters = {}) {
      await Promise.all([this.fetchBoard(boardId), this.fetchTasks(boardId, filters)])
    },
    async fetchBoardInvite(inviteCode) {
      return boardService.getBoardInvite(inviteCode)
    },
    async joinBoardByInvite(inviteCode) {
      const data = await boardService.joinBoardByInvite(inviteCode)
      const existingBoard = this.boards.find((board) => board._id === data.board._id)
      if (!existingBoard) {
        this.boards = [data.board, ...this.boards]
      }
      return data
    },
    async saveBoardMembers(boardId, memberIds) {
      this.taskMutationLoading = true
      this.error = null

      try {
        const data = await boardService.updateBoardMembers(boardId, memberIds)
        this.currentBoard = data.board
        this.members = data.members || []
        this.boards = this.boards.map((board) =>
          board._id === boardId ? { ...board, memberIds: data.board.memberIds } : board
        )
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async deleteBoard(boardId) {
      this.taskMutationLoading = true
      this.error = null

      try {
        await boardService.deleteBoard(boardId)
        this.boards = this.boards.filter((board) => board._id !== boardId)
        if (this.currentBoard?._id === boardId) {
          this.currentBoard = null
          this.members = []
          this.tasks = []
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async createTask(boardId, payload) {
      this.taskMutationLoading = true
      this.error = null

      try {
        const task = await boardService.createTask(boardId, payload)
        this.tasks = [task, ...this.tasks]
        return task
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async updateTask(boardId, taskId, payload) {
      this.taskMutationLoading = true
      this.error = null

      try {
        const task = await boardService.updateTask(boardId, taskId, payload)
        this.tasks = this.tasks.map((item) => (item._id === taskId ? task : item))
        return task
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async updateTaskStatus(boardId, taskId, status) {
      const task = await boardService.updateTaskStatus(boardId, taskId, status)
      this.tasks = this.tasks.map((item) => (item._id === taskId ? task : item))
      return task
    },
    async archiveTask(boardId, taskId, isArchived = true) {
      const task = await boardService.archiveTask(boardId, taskId, isArchived)
      this.tasks = this.tasks.map((item) => (item._id === taskId ? task : item))
      return task
    },
    async deleteTask(boardId, taskId) {
      this.taskMutationLoading = true
      this.error = null

      try {
        await boardService.deleteTask(boardId, taskId)
        this.tasks = this.tasks.filter((task) => task._id !== taskId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.taskMutationLoading = false
      }
    },
    async fetchComments(boardId, taskId) {
      this.commentsLoading = true
      this.error = null

      try {
        const comments = await boardService.getComments(boardId, taskId)
        this.commentsByTask = {
          ...this.commentsByTask,
          [taskId]: comments
        }
        return comments
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.commentsLoading = false
      }
    },
    async addComment(boardId, taskId, payload) {
      this.commentsLoading = true
      this.error = null

      try {
        const comment = await boardService.addComment(boardId, taskId, payload)
        const currentComments = this.commentsByTask[taskId] || []
        this.commentsByTask = {
          ...this.commentsByTask,
          [taskId]: [...currentComments, comment]
        }
        return comment
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.commentsLoading = false
      }
    },
    async fetchBoardActivity(boardId) {
      this.activityLoading = true
      this.error = null

      try {
        this.activity = await boardService.getBoardActivity(boardId)
        return this.activity
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.activityLoading = false
      }
    },
    async fetchBoardAttachments(boardId) {
      this.attachmentsLoading = true
      this.error = null

      try {
        this.boardAttachments = await boardService.getBoardAttachments(boardId)
        return this.boardAttachments
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async uploadBoardAttachment(boardId, file) {
      this.attachmentsLoading = true
      this.error = null

      try {
        const attachment = await boardService.uploadBoardAttachment(boardId, file)
        this.boardAttachments = [attachment, ...this.boardAttachments]
        return attachment
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async deleteBoardAttachment(boardId, attachmentId) {
      this.attachmentsLoading = true
      this.error = null

      try {
        await boardService.deleteBoardAttachment(boardId, attachmentId)
        this.boardAttachments = this.boardAttachments.filter((attachment) => attachment._id !== attachmentId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async fetchTaskAttachments(boardId, taskId) {
      this.attachmentsLoading = true
      this.error = null

      try {
        const attachments = await boardService.getTaskAttachments(boardId, taskId)
        this.attachmentsByTask = {
          ...this.attachmentsByTask,
          [taskId]: attachments
        }
        return attachments
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async uploadTaskAttachment(boardId, taskId, file) {
      this.attachmentsLoading = true
      this.error = null

      try {
        const attachment = await boardService.uploadTaskAttachment(boardId, taskId, file)
        const currentAttachments = this.attachmentsByTask[taskId] || []
        this.attachmentsByTask = {
          ...this.attachmentsByTask,
          [taskId]: [attachment, ...currentAttachments]
        }
        return attachment
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async deleteTaskAttachment(boardId, taskId, attachmentId) {
      this.attachmentsLoading = true
      this.error = null

      try {
        await boardService.deleteTaskAttachment(boardId, taskId, attachmentId)
        const currentAttachments = this.attachmentsByTask[taskId] || []
        this.attachmentsByTask = {
          ...this.attachmentsByTask,
          [taskId]: currentAttachments.filter((attachment) => attachment._id !== attachmentId)
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.attachmentsLoading = false
      }
    },
    async exportBoard(boardId) {
      return boardService.exportBoard(boardId)
    }
  }
})
