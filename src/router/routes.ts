import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),

    children: [{ path: '', component: () => import('src/pages/Calorie/CalorieForm.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/login', // login route
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/Login/LoginForm.vue') }],
  },

  {
    path: '/calorie',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/Calorie/CalorieForm.vue') }],
    meta: { requiresAuth: true }, // protect this route
  },
  {
    path: '/worksmanagement',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/worksmanagement/work-management.vue') },
    ],
    meta: { requiresAuth: true }, // protect this route
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
