<template>
	<header class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5">
		<Breadcrumbs :items="breadcrumbs" />
		<Dropdown :options="dropdownOptions">
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
		<ShopListingTable 
			:items="filteredShops" 
			:shopRents="shopRentsData"
			:loading="loading"
			@edit="handleEditShop"
			@delete="handleDeleteShop"
		/>
	</div>
	<CreateShop
		v-model="showCreateShopModal"
		:shopData="selectedShop"
		:onSuccess="fetchShopListings"
	/>
	<BulkImportShops
		v-model="showBulkImportModal"
		:onSuccess="fetchShopListings"
	/>
</template>
<script setup>
import {
	Breadcrumbs,
	Button,
	Dropdown,
	Select,
	FormControl,
	Dialog,
	toast,
} from 'frappe-ui'
import { ChevronDown, Plus } from 'lucide-vue-next'
import ShopListingTable from '@/components/Shop/ShopListingTable.vue';
import CreateShop from '@/components/Shop/CreateShop.vue';
import BulkImportShops from '@/components/Shop/BulkImportShops.vue';
import { ref, onMounted, computed } from 'vue'
import router from '@/router'
import { getShops, deleteShop, getShopRents } from '@/utils/dataService'

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
const shopRentsData = ref([])
const loading = ref(false)
const showCreateShopModal = ref(false)
const showBulkImportModal = ref(false)
const selectedShop = ref(null)

const dropdownOptions = computed(() => [
	{
		label: 'New Shop',
		icon: 'users',
		onClick() {
			onClickCreateShop()
		},
	},
	{
		label: 'Bulk Import Shops',
		icon: 'upload',
		onClick() {
			showBulkImportModal.value = true
		},
	},
])

const filteredShops = computed(() => {
	let shops = [...shopListingsData.value]
	
	// Filter by shop name
	if (title.value) {
		shops = shops.filter(shop => 
			shop.shop_name?.toLowerCase().includes(title.value.toLowerCase())
		)
	}
	
	// Filter by term type
	if (paymentTerm.value) {
		shops = shops.filter(shop => shop.term_type === paymentTerm.value)
	}
	
	return shops
})

const onClickCreateShop = () => {
	selectedShop.value = null
	showCreateShopModal.value = true
}

const handleEditShop = (shop) => {
	selectedShop.value = shop
	showCreateShopModal.value = true
}

const handleDeleteShop = async (shop) => {
	if (!confirm(`Are you sure you want to delete "${shop.shop_name}"?`)) {
		return
	}
	
	try {
		await deleteShop(shop.id)
		toast.success('Shop deleted successfully')
		fetchShopListings()
	} catch (error) {
		toast.error(error.message || 'Failed to delete shop')
	}
}

const fetchShopListings = async () => {
	loading.value = true
	try {
		const [shops, shopRents] = await Promise.all([
			getShops(),
			getShopRents()
		])
		shopListingsData.value = shops || []
		shopRentsData.value = shopRents || []
	} catch (error) {
		shopListingsData.value = []
		shopRentsData.value = []
		console.error('Error fetching shop listings:', error)
		toast.error('Failed to load shops')
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
