export default [
  {
    path: '/users',
    name: 'UserList',
    component: () => import('@/pages/users/UserListPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Team Members' }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('@/pages/users/UserDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'User Profile' }
  }
];
