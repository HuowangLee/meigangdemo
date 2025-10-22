import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '生产总览' }
      },
      {
        path: 'furnace-realtime',
        name: 'FurnaceRealtime',
        component: () => import('@/views/FurnaceRealtime.vue'),
        meta: { title: '炉次实时' }
      },
      {
        path: 'ai-suggestions',
        name: 'AISuggestions',
        component: () => import('@/views/AISuggestions.vue'),
        meta: { title: 'AI建议队列' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/Analysis.vue'),
        meta: { title: '炉次复盘' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { title: '报表中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
