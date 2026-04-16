<template>
  <aside
    class="the-sidebar"
    :class="{
      'is-collapsed': uiStore.sidebarCollapsed,
      'is-mobile-open': uiStore.mobileDrawerOpen
    }"
  >
    <div class="sidebar-header">
      <h2 class="brand-name" v-if="!uiStore.sidebarCollapsed">Taskify</h2>
      <h2 class="brand-name" v-else>T</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item">
        <span class="icon">▦</span>
        <span class="label" v-if="!uiStore.sidebarCollapsed">Boards</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="icon">◎</span>
        <span class="label" v-if="!uiStore.sidebarCollapsed">Profile</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="toggle-btn hidden-mobile" @click="uiStore.toggleSidebar">
        {{ uiStore.sidebarCollapsed ? '»' : '« Collapse' }}
      </button>
    </div>
  </aside>

  <div
    v-if="uiStore.mobileDrawerOpen"
    class="mobile-overlay"
    @click="uiStore.toggleMobileDrawer"
  ></div>
</template>

<script setup>
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
</script>

<style scoped>
.the-sidebar {
  width: 260px;
  background-color: var(--c-bg-surface);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal), transform var(--transition-normal);
  z-index: 100;
}
.the-sidebar.is-collapsed { width: 80px; }

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--c-border-light);
}
.brand-name { color: var(--c-primary); font-size: 1.5rem; margin: 0; font-family: var(--font-family-heading); }

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  color: var(--c-text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}
.the-sidebar.is-collapsed .nav-item { padding: var(--space-3) 0; justify-content: center; }
.nav-item:hover { background-color: var(--c-bg); color: var(--c-primary); }
.router-link-active { background-color: var(--c-primary-alpha); color: var(--c-primary); border-left-color: var(--c-primary); }

.icon { font-size: 1.25rem; }

.sidebar-footer { padding: var(--space-4); border-top: 1px solid var(--c-border-light); display: flex; justify-content: center; }
.toggle-btn { color: var(--c-text-muted); font-size: var(--font-size-sm); }
.toggle-btn:hover { color: var(--c-text-primary); }

.mobile-overlay { display: none; }

@media (max-width: 768px) {
  .the-sidebar {
    position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); width: 260px !important;
  }
  .the-sidebar.is-mobile-open { transform: translateX(0); }
  .hidden-mobile { display: none; }
  .mobile-overlay {
    display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 99;
  }
}
</style>
