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
				<div class="grid grid-cols-3 gap-2">
					<FormControl
						v-model="title"
						:placeholder="'Search by Name'"
						type="text"
						class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40"
						@update:modelValue="updateFilters()"
					/>
					<div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
						<Select
							v-if="paymentTermOptions.length"
							v-model="paymentTerm"
							:options="paymentTermOptions"
							:placeholder="'Payment Term'"
							@update:modelValue="updateFilters()"
						/>
					</div>
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

const filters = ref([])
const title = ref('')
const status = ref('')
const paymentTerm = ref('')

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

const paymentTermOptions = ref([
	{
		label: 'All',
		value: '',
	},
	{
		label: 'Once a Year',
		value: 'Once a Year',
	},
	{
		label: 'Twice a Year',
		value: 'Twice a Year',
	}
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
		// Build filters array
		const filterArray = []
		if (paymentTerm.value) {
			filterArray.push(['payment_term', '=', paymentTerm.value])
		}
		if (title.value) {
			filterArray.push(['shop_name', 'like', `%${title.value}%`])
		}
		if (status.value) {
			filterArray.push(['status', '=', status.value])
		}

		// Build query parameters
		const params = new URLSearchParams()
		
		// Add filters if any
		if (filterArray.length > 0) {
			params.append('filters', JSON.stringify(filterArray))
		}
		
		// Add fields parameter
		const fields = ['shop_name', 'area', 'base_rent', 'total_amount_including_vat', 'balance_amount', 'payment_term']
		params.append('fields', JSON.stringify(fields))

		const url = `https://testhomaidi.k.frappe.cloud/api/resource/Shop${params.toString() ? `?${params.toString()}` : ''}`
		
		const response = await fetch(url, {
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
		console.error('Error fetching shop listings:', error)
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
	fetchShopListings()
	setQueryParams()
}

const setQueryParams = () => {
	const queries = new URLSearchParams(location.search)
	let filterKeys = {
		title: title.value,
		status: status.value,
		payment_term: paymentTerm.value,
	}
	Object.keys(filterKeys).forEach(key => {
		if (filterKeys[key]) {
			queries.set(key, filterKeys[key])
		} else {
			queries.delete(key)
		}
	})
	const queryString = queries.toString()
	history.replaceState(
		{},
		'',
		`${location.pathname}${queryString ? `?${queryString}` : ''}`
	)
}
</script>
