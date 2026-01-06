<template>
	<div class="p-2">
		<Dropdown :options="userDropdownOptions">
			<template v-slot="{ open, close }">
				<button class="flex h-12 py-2 items-center rounded-md duration-300 ease-in-out" :class="isCollapsed
						? 'px-0 w-auto'
						: open
							? 'bg-surface-white shadow-sm px-2 w-52'
							: 'hover:bg-surface-gray-3 px-2 w-52'
					">
					<img v-if="branding.data?.banner_image" :src="branding.data?.banner_image.file_url"
						class="w-8 h-8 rounded flex-shrink-0" />
					<RentalLogo v-else class="w-8 h-8 rounded flex-shrink-0" />
					<div class="flex flex-1 flex-col text-left duration-300 ease-in-out" :class="isCollapsed
							? 'opacity-0 ml-0 w-0 overflow-hidden'
							: 'opacity-100 ml-2 w-auto'
						">
						<div class="text-base font-medium text-ink-gray-9 leading-none">
							<span v-if="
								branding.data?.app_name && branding.data?.app_name != 'Rental'
							">
								{{ branding.data?.app_name }}
							</span>
							<span v-else> Alhomaidhi Rental </span>
						</div>
						<div v-if="userResource.data" class="mt-1 text-sm text-ink-gray-7 leading-none">
							{{ convertToTitleCase(userResource.data?.full_name) }}
						</div>
					</div>
					<div class="duration-300 ease-in-out" :class="isCollapsed
							? 'opacity-0 ml-0 w-0 overflow-hidden'
							: 'opacity-100 ml-2 w-auto'
						">
						<ChevronDown class="h-4 w-4 text-ink-gray-7" />
					</div>
				</button>
			</template>
		</Dropdown>
	</div>
	<EditProfile
		v-model="showProfileModal"
		v-model:profile="profile"
		:profile="profile"
	/>
</template>

<script setup>
import { sessionStore } from '@/stores/session'
import { Dropdown } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { convertToTitleCase } from '@/utils'
import { usersStore } from '@/stores/user'
import { useSettings } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import RentalLogo from '@/components/Icons/RentalLogo.vue'

import {
	ChevronDown,
	LogIn,
	LogOut,
	Moon,
	User,
	Sun,
} from 'lucide-vue-next'
import EditProfile from '@/components/Modals/EditProfile.vue'
import { createResource } from 'frappe-ui'

const router = useRouter()
const { logout, branding } = sessionStore()
const  { userResource } = usersStore()
const { isLoggedIn } = sessionStore()
const settingsStore = useSettings()
const { theme } = storeToRefs(settingsStore)
const { toggleTheme } = settingsStore
const showProfileModal = ref(false);

const props = defineProps({
	isCollapsed: {
		type: Boolean,
		default: false,
	},
})


const profile = createResource({
	url: 'al_homaidi.homaidi.api.get_user_info',
	onError(error) {
		if (error && error.exc_type === 'AuthenticationError') {
			window.location.href = '/login'
		} 
	},
	auto: true,
})


const userDropdownOptions = computed(() => {
	return [
		{
			group: '',
			items: [
				{
					icon: User,
					label: 'My Profile',
					onClick: () => {
						// router.push(`/user/${userResource.data?.username}`)
						showProfileModal.value = true
					},
					condition: () => {
						return isLoggedIn
					},
				},
				{
					icon: theme.value === 'light' ? Moon : Sun,
					label: 'Toggle Theme',
					onClick: () => {
						toggleTheme()
					},
				},
				{
					icon: LogOut,
					label: 'Log out',
					onClick: () => {
						logout.submit().then(() => {
							isLoggedIn = false
						})
					},
					condition: () => {
						return isLoggedIn
					},
				},
				{
					icon: LogIn,
					label: 'Log in',
					onClick: () => {
						window.location.href = '/login'
					},
					condition: () => {
						return !isLoggedIn
					},
				},
			],
		},
	]
})

</script>
