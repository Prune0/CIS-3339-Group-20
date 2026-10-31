import { createRouter, createWebHistory } from 'vue-router'
import { useLoggedInUserStore } from '../store/loggedInUser'

// make all paths and names lowercase for consistency
const routes = [
  {
    path: '/',
    component: () => import('../views/home.vue')
  },
  {
    path: "/login",
    name: "login",
    component: () => import('../views/login.vue')
  },
  {
    path: '/clientform',
    name: 'clientform',
    // only authenticated users can create clients
    meta: { requiresAuth: true },
    component: () => import('../views/clientform.vue')
  },
  {
    path: '/findclient',
    name: 'findclient',
    meta: { requiresAuth: true },
    component: () => import('../views/findclient.vue')
  },
  {
    path: '/clientdetails/:id',
    name: 'clientdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/clientdetails.vue')
  },
  {
    path: '/eventform',
    name: 'eventform',
    meta: { requiresAuth: true },
    component: () => import('../views/eventform.vue')
  },
  {
    path: '/findevents',
    name: 'findevents',
    meta: { requiresAuth: true },
    component: () => import('../views/findevents.vue')
  },
  {
    path: '/eventdetails/:id',
    name: 'eventdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/eventDetails.vue')
  },
  {
    path: '/serviceform',
    name: 'serviceform',
    meta: { requiresAuth: true },
    component: () => import('../views/serviceform.vue')
  },
  {
    path: '/findservice',
    name: 'findservice',
    meta: { requiresAuth: true },
    component: () => import('../views/findservice.vue')
  },
  {
    path: '/servicedetails/:id',
    name: 'servicedetails',
    meta: { requiresAuth: true },
    component: () => import('../views/servicedetails.vue')
  }
]
const router = createRouter({
  // D2: use Vite's base path so the router works if the app is deployed under a subfolder
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// F4: Protect authenticated routes and check JWT expiration.
// Refresh the session before entering a protected page so an
// expired or missing token cannot grant access.
router.beforeEach((to) => {
  const store = useLoggedInUserStore()

  if (to.meta.requiresAuth) {
    store.restoreSession()

    if (!store.isLoggedIn) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  }
})

export default router

