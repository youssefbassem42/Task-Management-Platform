<template>
  <header class="the-topbar glass-panel">
    <div class="left-section">
      <button class="mobile-toggle" @click="uiStore.toggleMobileDrawer">
        ☰
      </button>
      <div v-if="!uiStore.mobileDrawerOpen && $route.meta.title" class="page-title hidden-mobile">
        <h2>{{ $route.meta.title }}</h2>
      </div>
    </div>

    <div class="right-section">
      <button class="theme-toggle" @click="toggleTheme" title="Toggle Theme">
        {{ isDark ? '☀' : '◐' }}
      </button>
      <div ref="menuRef" class="user-menu-wrapper" v-if="authStore.user">
        <button class="user-menu-btn" @click="userMenuOpen = !userMenuOpen">
          <AppAvatar :name="authStore.user.name" size="md" />
          <div class="user-info hidden-mobile">
            <span class="user-name">{{ authStore.user.name }}</span>
            <span class="user-email">{{ authStore.user.email }}</span>
          </div>
        </button>

        <transition name="fade">
          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="dropdown-header">
              <p class="font-semibold">{{ authStore.user.name }}</p>
              <p class="text-xs text-muted">{{ authStore.user.email }}</p>
            </div>
            <router-link to="/profile" class="dropdown-item" @click="userMenuOpen = false">My Profile</router-link>
            <div class="dropdown-divider"></div>
            <button @click="logout" class="dropdown-item text-danger">Logout</button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const uiStore = useUIStore()
const authStore = useAuthStore()
const router = useRouter()

const userMenuOpen = ref(false)
const isDark = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => {
  userMenuOpen.value = false
})

onMounted(() => {
  const theme = localStorage.getItem('theme') || 'light'
  isDark.value = theme === 'dark'
  document.documentElement.setAttribute('data-theme', theme)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const logout = () => {
  userMenuOpen.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.the-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  border-bottom: 1px solid var(--c-border-light);
  background: var(--c-bg-surface);
  position: relative;
  z-index: 10;
}

.left-section, .right-section { display: flex; align-items: center; gap: var(--space-4); }

.mobile-toggle { display: none; font-size: 1.5rem; color: var(--c-text-primary); }
.page-title h2 { margin: 0; font-size: var(--font-size-xl); }

.theme-toggle { font-size: 1.25rem; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background var(--transition-fast); }
.theme-toggle:hover { background-color: var(--c-bg); }

.user-menu-wrapper { position: relative; }
.user-menu-btn { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-1); border-radius: var(--radius-full); transition: background var(--transition-fast); }
.user-menu-btn:hover { background-color: var(--c-bg); }

.user-info { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
.user-name { font-weight: 600; font-size: var(--font-size-sm); color: var(--c-text-primary); }
.user-email { font-size: var(--font-size-xs); color: var(--c-text-muted); }

.user-dropdown {
  position: absolute; top: calc(100% + var(--space-2)); right: 0;
  width: 220px; background: var(--c-bg-surface);
  border-radius: var(--radius-md); box-shadow: var(--shadow-lg); border: 1px solid var(--c-border);
  overflow: hidden;
}
.dropdown-header { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--c-border-light); background: var(--c-bg); }
.dropdown-header p { margin: 0; }
.dropdown-item {
  display: block; width: 100%; text-align: left;
  padding: var(--space-3) var(--space-4);
  color: var(--c-text-primary); cursor: pointer; transition: background var(--transition-fast); font-size: var(--font-size-sm); font-family: inherit; font-weight: 500;
}
.dropdown-item:hover { background-color: var(--c-bg); }
.dropdown-item.text-danger { color: var(--c-danger); }
.dropdown-divider { height: 1px; background-color: var(--c-border-light); margin: var(--space-1) 0; }

@media (max-width: 768px) {
  .the-topbar { padding: 0 var(--space-4); }
  .mobile-toggle { display: block; }
  .hidden-mobile { display: none; }
}
</style>
