import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
    mobileDrawerOpen: false,
    toasts: [],
    globalLoading: false,
    toastIdCounter: 0
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
    },
    toggleMobileDrawer() {
      this.mobileDrawerOpen = !this.mobileDrawerOpen;
    },
    setGlobalLoading(val) {
      this.globalLoading = !!val;
    },
    addToast(type, message, duration = 3000) {
      const id = ++this.toastIdCounter;
      this.toasts.push({ id, type, message, duration });
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },
    removeToast(id) {
      const idx = this.toasts.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.toasts.splice(idx, 1);
      }
    }
  }
});
