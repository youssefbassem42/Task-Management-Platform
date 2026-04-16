export default [
  {
    path: '/boards/:id',
    name: 'BoardDetails',
    component: () => import('@/pages/boards/BoardPage.vue'),
    meta: { requiresAuth: true, title: 'Board' }
  }
]
