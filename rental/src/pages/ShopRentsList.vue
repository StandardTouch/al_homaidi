<template>
	<header class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5">
		<Breadcrumbs :items="breadcrumbs" />
		<Dropdown :options="[
			{
				label: 'New Rent Payment',
				icon: 'dollar-sign',
				onClick() {
					onClickCreateRent()
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
				All Rents
			</div>
			<div class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
				<div class="grid grid-cols-3 gap-2">
					<FormControl
						v-model="name"
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
							v-if="paymentStatusOptions.length"
							v-model="paymentStatus"
							:options="paymentStatusOptions"
							:placeholder="'Payment Status'"
							@update:modelValue="updateFilters()"
						/>
					</div>
				</div>
			</div>
		</div>
		<ShopRentsListingTable :items="rentListingsData" :loading="loading" />
	</div>
	<CreateRent
		v-model="showCreateRentModal"
		:onSuccess="fetchRentListings"
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
import ShopRentsListingTable from '@/components/Shop/ShopRentsListingTable.vue';
import CreateRent from '@/components/Shop/CreateRent.vue';
import { ref, onMounted } from 'vue'

const filters = ref([])
const name = ref('')
const paymentTerm = ref('')
const paymentStatus = ref('')

const paymentStatusOptions = ref([
	{
		label: 'Paid',
		value: 'Paid',
	},
	{
		label: 'Unpaid',
		value: 'Unpaid',
	},
]);

const paymentTermOptions = ref([
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
		label: 'Shop Rents',
		to: '/shop-rents',
	},
])

const rentListingsData = ref([])
const loading = ref(false)
const showCreateRentModal = ref(false)

const onClickCreateRent = () => {
	showCreateRentModal.value = true
}

const fetchRentListings = async () => {
	loading.value = true
	try {
		// Build filters array
		const filterArray = []
		if (paymentTerm.value) {
			filterArray.push(['payment_term', '=', paymentTerm.value])
		}
		if (name.value) {
			filterArray.push(['name', 'like', `%${name.value}%`])
		}
		if (paymentStatus.value) {
			filterArray.push(['payment_status', '=', paymentStatus.value])
		}

		// Build query parameters
		const params = new URLSearchParams()
		
		// Add filters if any
		if (filterArray.length > 0) {
			params.append('filters', JSON.stringify(filterArray))
		}
		
		// Add fields parameter
		const fields = ['name', 'period_number', 'payment_status', 'base_rent', 'total_amount_including_vat', 'payment_term', 'paid_amount']
		params.append('fields', JSON.stringify(fields))

		const url = `https://testhomaidi.k.frappe.cloud/api/resource/Rent${params.toString() ? `?${params.toString()}` : ''}`
		
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
			rentListingsData.value = data.data
		} 
	} catch (error) {
		rentListingsData.value = []
		console.error('Error fetching rent listings:', error)
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchRentListings()
})

const updateFilters = () => {
	reCheckFilterValues()
}

const reCheckFilterValues = () => {
	fetchRentListings()
	setQueryParams()
}

const setQueryParams = () => {
	const queries = new URLSearchParams(location.search)
	let filterKeys = {
		name: name.value,
		payment_term: paymentTerm.value,
		payment_status: paymentStatus.value,
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
