<template>
	<header class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5">
		<Breadcrumbs :items="breadcrumbs" />
	</header>
	<div class="p-5 pb-10">
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-ink-gray-9">Settings</h1>
			<p class="text-sm text-ink-gray-6 mt-1">Manage application settings and users</p>
		</div>

		<div class="">
			<TabButtons
				:buttons="[
					{
						label: 'Users Management',
						value: 'users',
					},
				]"
				v-model="activeTab"
				class="border-b w-auto"
			/>

			<!-- Users Management Tab -->
			<div v-if="activeTab === 'users'" class="p-5">
				<div class="flex items-center justify-between mb-5">
					<h2 class="text-lg font-semibold text-ink-gray-9">Users Management</h2>
					<Button variant="solid" @click="handleCreateUser">
						<template #prefix>
							<Plus class="h-4 w-4 stroke-1.5" />
						</template>
						Add New User
					</Button>
				</div>

				<UsersListingTable 
					:items="users" 
					:loading="loading"
					@edit="handleEditUser"
					@delete="handleDeleteUser"
				/>
			</div>
		</div>
	</div>

	<CreateUser
		v-model="showCreateUserModal"
		:userData="selectedUser"
		:onSuccess="fetchUsers"
	/>
</template>

<script setup>
import {
	Breadcrumbs,
	Button,
	TabButtons,
	toast,
} from 'frappe-ui'
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import UsersListingTable from '@/components/User/UsersListingTable.vue'
import CreateUser from '@/components/User/CreateUser.vue'
import { getUsers, deleteUser } from '@/utils/dataService'

const breadcrumbs = ref([
	{
		label: 'Home',
		to: '/',
	},
	{
		label: 'Settings',
		to: '/settings',
	},
])

const activeTab = ref('users')
const users = ref([])
const loading = ref(false)
const showCreateUserModal = ref(false)
const selectedUser = ref(null)

const handleCreateUser = () => {
	selectedUser.value = null
	showCreateUserModal.value = true
}

const handleEditUser = (user) => {
	selectedUser.value = user
	showCreateUserModal.value = true
}

const handleDeleteUser = async (user) => {
	if (!confirm(`Are you sure you want to delete user "${user.full_name}"?`)) {
		return
	}
	
	try {
		await deleteUser(user.id)
		toast.success('User deleted successfully')
		fetchUsers()
	} catch (error) {
		toast.error(error.message || 'Failed to delete user')
	}
}

const fetchUsers = async () => {
	loading.value = true
	try {
		const usersData = await getUsers()
		users.value = usersData || []
	} catch (error) {
		users.value = []
		console.error('Error fetching users:', error)
		toast.error('Failed to load users')
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchUsers()
})
</script>
