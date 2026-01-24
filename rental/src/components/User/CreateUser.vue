<template>
	<Dialog
		:modelValue="props.modelValue"
		@update:modelValue="emit('update:modelValue', $event)"
		:options="{
			size: '3xl',
		}"
	>
		<template #body-header>
			<div class="flex items-center mb-5">
				<div class="text-2xl font-semibold leading-6 text-ink-gray-9">
					{{ isEditMode ? 'Edit User' : 'Create New User' }}
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="user.full_name"
							label="Full Name"
							type="text"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="user.email"
							label="Email"
							type="email"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="user.status"
							type="select"
							:options="statusOptions"
							label="Status"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1" v-if="!isEditMode">
						<FormControl
							v-model="user.password"
							label="Password"
							type="password"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1" v-if="!isEditMode">
						<FormControl
							v-model="user.confirm_password"
							label="Confirm Password"
							type="password"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1" v-if="isEditMode">
						<FormControl
							v-model="user.password"
							label="New Password"
							type="password"
							:required="false"
							placeholder="Leave blank to keep current password"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1" v-if="isEditMode && user.password">
						<FormControl
							v-model="user.confirm_password"
							label="Confirm New Password"
							type="password"
							:required="user.password ? true : false"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveUser(close)" :loading="loading">
					{{ isEditMode ? 'Update' : 'Save' }}
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import {
	Button,
	Dialog,
	FormControl,
	toast,
} from 'frappe-ui'
import { reactive, ref, watch, computed } from 'vue'
import { addUser, updateUser } from '@/utils/dataService'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	onSuccess: {
		type: Function,
		default: () => {},
	},
	userData: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['update:modelValue'])

const isEditMode = computed(() => !!props.userData)

const loadUserData = () => {
	if (props.userData) {
		user.full_name = props.userData.full_name || ''
		user.email = props.userData.email || ''
		user.status = props.userData.status || 'Active'
		user.password = ''
		user.confirm_password = ''
	}
}

watch(() => props.modelValue, (newVal) => {
	if (!newVal) {
		resetForm()
	} else if (props.userData) {
		loadUserData()
	}
})

watch(() => props.userData, () => {
	if (props.modelValue && props.userData) {
		loadUserData()
	}
}, { deep: true })

const user = reactive({
	full_name: '',
	email: '',
	status: 'Active',
	password: '',
	confirm_password: '',
})

const loading = ref(false)

const statusOptions = [
	{
		label: 'Active',
		value: 'Active',
	},
	{
		label: 'In Active',
		value: 'In Active',
	},
]

const resetForm = () => {
	user.full_name = ''
	user.email = ''
	user.status = 'Active'
	user.password = ''
	user.confirm_password = ''
}

const saveUser = async (close) => {
	// Validation
	if (!user.full_name?.trim()) {
		toast.error('Full name is required')
		return
	}
	if (!user.email?.trim()) {
		toast.error('Email is required')
		return
	}
	// Email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(user.email.trim())) {
		toast.error('Please enter a valid email address')
		return
	}
	if (!user.status) {
		toast.error('Status is required')
		return
	}
	
	// Password validation
	if (!isEditMode.value) {
		// Create mode - password is required
		if (!user.password) {
			toast.error('Password is required')
			return
		}
		if (user.password !== user.confirm_password) {
			toast.error('Passwords do not match')
			return
		}
		if (user.password.length < 6) {
			toast.error('Password must be at least 6 characters long')
			return
		}
	} else {
		// Edit mode - password is optional
		if (user.password) {
			if (user.password !== user.confirm_password) {
				toast.error('Passwords do not match')
				return
			}
			if (user.password.length < 6) {
				toast.error('Password must be at least 6 characters long')
				return
			}
		}
	}

	loading.value = true
	try {
		const userData = {
			full_name: user.full_name.trim(),
			email: user.email.trim(),
			status: user.status,
		}

		// Only include password if it's provided
		if (user.password) {
			userData.password = user.password
		}

		if (isEditMode.value) {
			await updateUser(props.userData.id, userData)
			toast.success('User updated successfully')
		} else {
			await addUser(userData)
			toast.success('User created successfully')
		}

		close()
		resetForm()
		// Call onSuccess callback to refetch user listings
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || `Failed to ${isEditMode.value ? 'update' : 'create'} user`)
	} finally {
		loading.value = false
	}
}
</script>
