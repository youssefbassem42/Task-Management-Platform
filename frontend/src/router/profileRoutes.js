export default [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/profile/ProfilePage.vue'),
    meta: { requiresAuth: true, title: 'My Profile' }
  }
];
