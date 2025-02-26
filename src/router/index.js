import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Upload from '../views/Upload.vue';
import CreateSite from '../views/CreateSite.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/upload', component: Upload },
  { path: '/create-site', component: CreateSite },
  { path: '/firewall', component: () => import('../views/Firewall.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
