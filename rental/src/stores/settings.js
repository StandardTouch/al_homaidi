import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createResource } from 'frappe-ui'

export const useSettings = defineStore('settings', () => {
	const activeTab = ref(null)

	// Theme Logic
	const theme = ref(localStorage.getItem('theme') || 'light')

	if (['light', 'dark'].includes(theme.value)) {
		document.documentElement.setAttribute('data-theme', theme.value)
	}

	const toggleTheme = () => {
		const currentTheme = document.documentElement.getAttribute('data-theme')
		theme.value = currentTheme === 'dark' ? 'light' : 'dark'
		document.documentElement.setAttribute('data-theme', theme.value)
		localStorage.setItem('theme', theme.value)
	}

	const settings = createResource({
		url: 'al_homaidi.homaidi.api.get_rental_management_settings',
		auto: true,
		cache: 'Rental Settings'
	})

	return {
		activeTab,
		settings,
		theme,
		toggleTheme
	}
})
