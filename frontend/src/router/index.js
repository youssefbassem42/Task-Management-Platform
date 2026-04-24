import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

import authRoutes from './authRoutes'
import dashboardRoutes from './dashboardRoutes'
import boardRoutes from './boardRoutes'
import profileRoutes from './profileRoutes'

const routes = [
  { path: '/', redirect: '/dashboard' },
  ...authRoutes,
  ...dashboardRoutes,
  ...boardRoutes,
  ...profileRoutes,
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/pages/members/MembersPage.vue'),
    meta: { requiresAuth: true, title: 'Members' }
  },
  {
    path: '/members/:id',
    name: 'MemberProfile',
    component: () => import('@/pages/members/MemberProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Member Profile' }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/notifications/NotificationsPage.vue'),
    meta: { requiresAuth: true, title: 'Notifications' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/pages/chat/ChatPage.vue'),
    meta: { requiresAuth: true, title: 'Messages' }
  },
  {
    path: '/chat/:userId',
    name: 'ChatConversation',
    component: () => import('@/pages/chat/ChatPage.vue'),
    meta: { requiresAuth: true, title: 'Messages' }
  },
  // Legacy user routes redirect to members
  {
    path: '/users',
    redirect: '/members'
  },
  {
    path: '/users/:id',
    redirect: to => `/members/${to.params.id}`
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '404 Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  if (!authStore.initialized) {
    return authStore.initializeAuth().then(() => applyNavigationRules(to, authStore, uiStore))
  }

  return applyNavigationRules(to, authStore, uiStore)
})

function applyNavigationRules(to, authStore, uiStore) {
  if (to.meta.title) {
    document.title = `${to.meta.title} | Taskify`
  }

  if (uiStore.mobileDrawerOpen) {
    uiStore.mobileDrawerOpen = false
  }

  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/dashboard'
  }
}

export default router
