import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Upload from '../views/Upload.vue';
import Reports from '../views/Reports.vue';
import CreateSite from '../views/CreateSite.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/upload', component: Upload },
  { path: '/reports', component: Reports },
  { path: '/create-site', component: CreateSite },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
