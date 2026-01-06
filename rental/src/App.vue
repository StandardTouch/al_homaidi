<template>
	<FrappeUIProvider>
		<Layout class="isolate text-base">
			<router-view />
		</Layout>
		<Dialogs />
	</FrappeUIProvider>
</template>
<script setup>
import { FrappeUIProvider } from 'frappe-ui'
import { Dialogs } from '@/utils/dialogs'
import { computed} from 'vue'
import DesktopLayout from './components/DesktopLayout.vue'

const Layout = computed(() => {
	return DesktopLayout
})

</script>
