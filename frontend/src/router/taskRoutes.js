export default [
  {
    path: '/tasks',
    name: 'TaskList',
    component: () => import('@/pages/tasks/TaskListPage.vue'),
    meta: { requiresAuth: true, title: 'Tasks' }
  },
  {
    path: '/tasks/create',
    name: 'TaskCreate',
    component: () => import('@/pages/tasks/TaskCreatePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Create Task' }
  },
  {
    path: '/tasks/:id/edit',
    name: 'TaskEdit',
    component: () => import('@/pages/tasks/TaskEditPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Edit Task' }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('@/pages/tasks/TaskDetailPage.vue'),
    meta: { requiresAuth: true, title: 'Task Details' }
  }
];
