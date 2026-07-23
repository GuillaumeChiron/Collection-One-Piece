import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'guest',
      component: () => import('@/views/GuestView.vue'),
    },
    {
      path: '/admin',
      name: 'collector',
      component: () => import('@/views/CollectorView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },
  ],
})

export default router
