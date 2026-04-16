export default [
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
