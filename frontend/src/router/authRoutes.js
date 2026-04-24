export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guestOnly: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { guestOnly: true, title: 'Register' }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/pages/auth/VerifyEmailPage.vue'),
    meta: { guestOnly: true, title: 'Verify Email' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Forgot Password' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/auth/ResetPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Reset Password' }
  },
  {
    path: '/auth/callback',
    name: 'OAuthCallback',
    component: () => import('@/pages/auth/OAuthCallback.vue'),
    meta: { guestOnly: true, title: 'Authenticating...' }
  }
];
