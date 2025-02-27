import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Upload from '../views/Upload.vue';
import CreateSite from '../views/CreateSite.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/upload', component: Upload },
  { path: '/create-site', component: CreateSite },
  { path: '/bandwidth', component: () => import('../views/Bandwidth.vue') },
  {
    path: '/denied-access',
    component: () => import('../views/DeniedAccess.vue'),
  },
  { path: '/threat', component: () => import('../views/Threat.vue') },
  { path: '/antivirus', component: () => import('../views/Antivirus.vue') },
  { path: '/ips', component: () => import('../views/Ips.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
