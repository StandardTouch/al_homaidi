import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import {
  setConfig,
  frappeRequest,
  resourcesPlugin,
} from 'frappe-ui'

let app = createApp(App)

setConfig('resourceFetcher', frappeRequest)

// pinia store
import { createPinia } from 'pinia';
const pinia = createPinia();
app.use(pinia);

app.use(router)
app.use(resourcesPlugin)

// main app css
import '@/assets/css/app.css';

// perfect scrollbar
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
app.use(PerfectScrollbarPlugin);

// popper
import Popper from 'vue3-popper';
app.component('Popper', Popper);

app.mount('#app')
