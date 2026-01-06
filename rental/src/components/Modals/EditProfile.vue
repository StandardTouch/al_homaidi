<template>
	<Dialog :options="{
		size: '3xl'
	}">
		<template #body-header>
			<div class="flex items-center mb-5">
				<div class="text-2xl font-semibold leading-6 text-ink-gray-9">Edit Profile</div>
				<Badge v-if="isDirty" class="ml-4" theme="orange"> Not Saved </Badge>
				<Badge v-if="currentTab === 'password' && password.new_password !== password.confirm_password" class="ml-4" theme="red"> Password Mismatch </Badge>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="flex mb-9">
					<TabButtons :buttons="[
						{
							label: 'Update Profile',
							value: 'profile',
						},
						{
							label: 'Update Password',
							value: 'password',
						},
					]" v-model="currentTab" />
				</div>
				<div v-if="currentTab === 'profile'" class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<div class="text-xs text-ink-gray-5 mb-1">Profile Image</div>
						<FileUploader v-if="!profile.image" :fileTypes="['image/*']" :validateFile="validateFile"
							@success="(file) => saveImage(file)">
							<template v-slot="{ file, progress, uploading, openFileSelector }">
								<div class="mb-4">
									<Button @click="openFileSelector" :loading="uploading">
										{{ uploading ? `Uploading ${progress}%` : 'Upload a profile image' }}
									</Button>
								</div>
							</template>
						</FileUploader>
						<div v-else class="mb-4">
							<div class="flex items-center">
								<img :src="profile.image?.file_url"
									class="object-cover h-[50px] w-[50px] rounded-full border-4 border-white object-cover" />

								<div class="text-base flex flex-col ml-2">
									<span>
										{{ profile.image?.file_name }}
									</span>
									<span class="text-sm text-ink-gray-4 mt-1">
										{{ getFileSize(profile.image?.file_size) }}
									</span>
								</div>
								<X @click="removeImage()"
									class="bg-surface-gray-3 rounded-md cursor-pointer stroke-1.5 w-5 h-5 p-1 ml-4" />
							</div>
						</div>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl v-model="profile.first_name" :label="'First Name'" />
					</div>
				</div>
				<div v-if="currentTab === 'password'" class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<FormControl v-model="password.new_password" :label="'Password'" />
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl v-model="password.confirm_password" :label="'Confirm Password'" />
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveProfile(close)"> Save </Button>
			</div>
		</template>
	</Dialog>
</template>
<script setup>
import {
	Badge,
	Button,
	createResource,
	Dialog,
	FormControl,
	FileUploader,
	TabButtons,
	toast,
} from 'frappe-ui'
import { ref, reactive, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { getFileSize } from '@/utils'

const reloadProfile = defineModel('reloadProfile')
const isDirty = ref(false)
const currentTab = ref('profile');

const props = defineProps({
	profile: {
		type: Object,
		required: true,
	},
})

const profile = reactive({
	first_name: '',
	last_name: '',
})

const password = reactive({
	new_password: '',
	confirm_password: '',
})

const imageResource = createResource({
	url: 'al_homaidi.homaidi.api.get_file_info',
	makeParams(values) {
		return {
			file_url: values.image,
		}
	},
	auto: false,
	onSuccess(data) {
		profile.image = data
	},
})

const updateProfile = createResource({
	url: 'frappe.client.set_value',
	makeParams(values) {
		return {
			doctype: 'User',
			name: props.profile.data.name,
			fieldname: {
				user_image: profile.image?.file_url || null,
				...profile,
			},
		}
	},
	onSuccess(data) {
		props.profile.data = data
	},
})

const updatePassword = createResource({
	url: 'al_homaidi.homaidi.api.change_password',
	makeParams(values) {
		return {
			new_password: password.new_password,
		}
	},
})

const saveProfile = (close) => {
	if(currentTab.value === 'profile') {
		updateProfile.submit(
			{},
			{
				onSuccess() {
					toast.success('Profile updated successfully')
					close()
					// Reload the profile resource if it's a resource object
					if (props.profile && typeof props.profile.reload === 'function') {
						props.profile.reload()
					}
					// Also reload reloadProfile if provided
					if (reloadProfile?.value && typeof reloadProfile.value.reload === 'function') {
						reloadProfile.value.reload()
					}
					window.location.reload()
				},
				onError(err) {
					toast.error(err.messages?.[0] || err)
				},
			}
		)
	}
	if(currentTab.value === 'password') {
		if(password.new_password === password.confirm_password) {
			toast.error('TODO: Password Integration Is Pending');
			// updatePassword.submit(
			// 	{},
			// 	{
			// 		onSuccess() {
			// 			close()
			// 		},
			// 	}
			// )
		}
	}
}

const validateFile = (file) => {
	let extension = file.name.split('.').pop().toLowerCase()
	if (!['jpg', 'jpeg', 'png'].includes(extension)) {
		return 'Only image file is allowed.'
	}
}

const saveImage = (file) => {
	profile.image = file
}

const removeImage = () => {
	profile.image = null
}

watch(
	() => profile,
	(newVal) => {
		if (!props.profile.data) return
		let keys = Object.keys(newVal)
		keys.splice(keys.indexOf('image'), 1)
		for (let key of keys) {
			if (newVal[key] !== props.profile.data[key]) {
				isDirty.value = true
				return
			}
		}
		if (profile.image?.file_url !== props.profile.data.user_image) {
			isDirty.value = true
			return
		}
		isDirty.value = false
	},
	{ deep: true }
)

watch(
	() => props.profile.data,
	(newVal) => {
		if (newVal) {
			profile.first_name = newVal.first_name
			profile.last_name = newVal.last_name
			if (newVal.user_image) imageResource.submit({ image: newVal.user_image })
			isDirty.value = false
		}
	}
)
</script>
