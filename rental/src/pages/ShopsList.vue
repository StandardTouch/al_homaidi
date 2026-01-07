<template>
	<header class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5">
		<Breadcrumbs :items="breadcrumbs" />
		<Dropdown :options="[
			{
				label: 'New Shop',
				icon: 'users',
				onClick() {
					onClickCreateShop()
				},
			},
			{
				label: 'Import Shops',
				icon: 'upload',
				onClick() {
					router.push({
						name: 'BulkShopsImport',
					})
				},
			},
		]">
			<template v-slot="{ open }">
				<Button variant="solid">
					<template #prefix>
						<Plus class="h-4 w-4 stroke-1.5" />
					</template>
					{{ 'Create' }}
					<template #suffix>
						<ChevronDown :class="[
							'w-4 h-4 stroke-1.5 ml-1 transform transition-transform',
							open ? 'rotate-180' : '',
						]" />
					</template>
				</Button>
			</template>
		</Dropdown>
	</header>
	<div class="p-5 pb-10">
		<div class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between mb-5">
			<div class="text-lg text-ink-gray-9 font-semibold">
				All Stores
			</div>
			<div class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
				<div class="grid grid-cols-2 gap-2">
					<FormControl
						v-model="title"
						:placeholder="'Search by Name'"
						type="text"
						class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40"
						
					/>
					<div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
						<Select
							v-if="statusOptions.length"
							v-model="status"
							:options="statusOptions"
							:placeholder="'Status'"
							@update:modelValue="updateFilters()"
						/>
					</div>
				</div>
			</div>
		</div>
		<ShopListingTable :items="shopListingsData" :loading="loading" />
	</div>
	<CreateShop
		v-model="showCreateShopModal"
		:onSuccess="fetchShopListings"
	/>
</template>
<script setup>
import {
	Breadcrumbs,
	Button,
	Dropdown,
	Select,
	FormControl
} from 'frappe-ui'
import { ChevronDown, Plus } from 'lucide-vue-next'
import ShopListingTable from '@/components/Shop/ShopListingTable.vue';
import CreateShop from '@/components/Shop/CreateShop.vue';
import { ref, onMounted } from 'vue'
import router from '@/router'

const filters = ref({})
const title = ref('')
const status = ref('')

const statusOptions = ref([
	{
		label: 'Active',
		value: 'Active',
	},
	{
		label: 'Inactive',
		value: 'Inactive',
	},
]);

const breadcrumbs = ref([
	{
		label: 'Home',
		to: '/',
	},
	{
		label: 'Shops',
		to: '/shops',
	},
])

const shopListingsData = ref([])
const loading = ref(false)
const showCreateShopModal = ref(false)

const onClickCreateShop = () => {
	showCreateShopModal.value = true
}

const fetchShopListings = async () => {
	loading.value = true
	try {
		const response = await fetch('https://testhomaidi.k.frappe.cloud/api/resource/Rent?fields=["*"]', {
			method: 'GET',
			headers: {
				'Authorization': `token 7bb9da8a62f5b38:b41b1d78a86f197`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		
		// Frappe API returns { data: [...] }, so extract the array
		if (data && data.data && Array.isArray(data.data)) {
			shopListingsData.value = data.data
		} 
	} catch (error) {
		shopListingsData.value = []
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchShopListings()
})


const updateFilters = () => {
	reCheckFilterValues()
}

const reCheckFilterValues = () => {
	updateTitleFilter()
	updateStatusFilter()
	setQueryParams()
}

const updateTitleFilter = () => {
	if (title.value) {
		filters.value['title'] = ['like', `%${title.value}%`]
	} else {
		delete filters.value.title
	}
}

const updateStatusFilter = () => {
	if (status.value) {
		filters.value['status'] = ['=', status.value]
	} else {
		delete filters.value.status
	}
}

const setQueryParams = () => {
	const queries = new URLSearchParams(location.search)
	let filterKeys = {
		title: title.value,
		status: status.value,
	}
	Object.keys(filterKeys).forEach(key => {
		if (filterKeys[key]) {
			queries.set(key, filterKeys[key])
		} else {
			queries.delete(key)
		}
	})
	history.replaceState(
		{},
		'',
		`${location.pathname}${queries.size() > 0 ? `?${queries.toString()}` : ''}`
	)
}
</script>
