export default [
  {
    path: '/boards',
    name: 'Boards',
    component: () => import('@/pages/boards/BoardsPage.vue'),
    meta: { requiresAuth: true, title: 'Boards' }
  },
  {
    path: '/boards/join/:inviteCode',
    name: 'BoardJoin',
    component: () => import('@/pages/boards/BoardJoinPage.vue'),
    meta: { requiresAuth: true, title: 'Join Board' }
  },
  {
    path: '/boards/:id',
    name: 'BoardDetails',
    component: () => import('@/pages/boards/BoardPage.vue'),
    meta: { requiresAuth: true, title: 'Board' }
  }
]
