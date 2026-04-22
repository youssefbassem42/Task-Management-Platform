import './assets/styles/tailwind.css'
import './assets/styles/reset.css'
import './assets/styles/variables.css'
import './assets/styles/typography.css'
import './assets/styles/utilities.css'
import './assets/styles/transitions.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import AppButton from '@/components/shared/AppButton.vue'
import AppInput from '@/components/shared/AppInput.vue'
import AppSelect from '@/components/shared/AppSelect.vue'
import AppCard from '@/components/shared/AppCard.vue'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppBadge from '@/components/shared/AppBadge.vue'
import AppAvatar from '@/components/shared/AppAvatar.vue'
import AppModal from '@/components/shared/AppModal.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'
import AppToast from '@/components/shared/AppToast.vue'
import AppFileUpload from '@/components/shared/AppFileUpload.vue'
import AppProgressBar from '@/components/shared/AppProgressBar.vue'
import AppBreadcrumb from '@/components/shared/AppBreadcrumb.vue'
import AppTable from '@/components/shared/AppTable.vue'
import AppPagination from '@/components/shared/AppPagination.vue'
import AppConfirmDialog from '@/components/shared/AppConfirmDialog.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('AppButton', AppButton)
app.component('AppInput', AppInput)
app.component('AppSelect', AppSelect)
app.component('AppCard', AppCard)
app.component('AppSpinner', AppSpinner)
app.component('AppBadge', AppBadge)
app.component('AppAvatar', AppAvatar)
app.component('AppModal', AppModal)
app.component('AppEmptyState', AppEmptyState)
app.component('AppToast', AppToast)
app.component('AppFileUpload', AppFileUpload)
app.component('AppProgressBar', AppProgressBar)
app.component('AppBreadcrumb', AppBreadcrumb)
app.component('AppTable', AppTable)
app.component('AppPagination', AppPagination)
app.component('AppConfirmDialog', AppConfirmDialog)

app.mount('#app')
