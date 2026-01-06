import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createDialog } from '@/utils/dialogs'
import { usersStore } from './stores/user'
import { FrappeUI, setConfig, frappeRequest, pageMetaPlugin } from 'frappe-ui'

let pinia = createPinia()
let app = createApp(App)
setConfig('resourceFetcher', frappeRequest)

app.use(FrappeUI)
app.use(pinia)
app.use(router)
app.use(pageMetaPlugin)
app.mount('#app')

const { userResource } = usersStore()
app.provide('$user', userResource)

app.config.globalProperties.$user = userResource
app.config.globalProperties.$dialog = createDialog
