import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // Add this
import router from './router';

const vuetify = createVuetify({
  theme: { defaultTheme: 'light' },
  icons: { defaultSet: 'mdi' }, // Enable Material Design Icons
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');
