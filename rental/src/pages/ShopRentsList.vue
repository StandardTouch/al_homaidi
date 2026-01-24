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
					{{ 'Create Shop Rent' }}
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
		<ShopRentsListingTable 
			:items="filteredRents" 
			:loading="loading"
			@payNow="handlePayNow"
			@edit="handleEditRent"
			@delete="handleDeleteRent"
		/>
	</div>
	<CreateRent
		v-model="showCreateRentModal"
		:rentData="selectedRent"
		:onSuccess="fetchRentListings"
	/>
	<ConfirmPayment
		v-model="showConfirmPaymentModal"
		:rentData="selectedRentForPayment"
		@confirm="handleConfirmPayment"
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
import ShopRentsListingTable from '@/components/Shop/ShopRentsListingTable.vue';
import CreateRent from '@/components/Shop/CreateRent.vue';
import ConfirmPayment from '@/components/Shop/ConfirmPayment.vue';
import { ref, onMounted, computed } from 'vue'
import { getShopRents, updateShopRent, deleteShopRent } from '@/utils/dataService'

const filters = ref([])
const name = ref('')
const paymentTerm = ref('')
const paymentStatus = ref('')

const paymentStatusOptions = ref([
	{
		label: 'All',
		value: '',
	},
	{
		label: 'Paid',
		value: 'Paid',
	},
	{
		label: 'Un Paid',
		value: 'Un Paid',
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
		label: 'Shop Rents',
		to: '/shop-rents',
	},
])

const rentListingsData = ref([])
const loading = ref(false)
const showCreateRentModal = ref(false)
const showConfirmPaymentModal = ref(false)
const selectedRent = ref(null)
const selectedRentForPayment = ref(null)

const filteredRents = computed(() => {
	let rents = [...rentListingsData.value]
	
	// Filter by shop name
	if (name.value) {
		rents = rents.filter(rent => 
			rent.shop_name?.toLowerCase().includes(name.value.toLowerCase()) ||
			rent.shop_location?.toLowerCase().includes(name.value.toLowerCase())
		)
	}
	
	// Filter by payment status
	if (paymentStatus.value) {
		rents = rents.filter(rent => rent.payment_status === paymentStatus.value)
	}
	
	return rents
})

const onClickCreateRent = () => {
	selectedRent.value = null
	showCreateRentModal.value = true
}

const handlePayNow = (rent) => {
	selectedRentForPayment.value = rent
	showConfirmPaymentModal.value = true
}

const handleConfirmPayment = async (paymentData) => {
	if (!selectedRentForPayment.value) {
		return
	}
	
	try {
		await updateShopRent(selectedRentForPayment.value.id, {
			payment_status: 'Paid',
			paid_date: paymentData.paid_date,
			reason: paymentData.reason || null,
		})
		toast.success('Payment confirmed successfully')
		showConfirmPaymentModal.value = false
		selectedRentForPayment.value = null
		fetchRentListings()
	} catch (error) {
		toast.error(error.message || 'Failed to confirm payment')
	}
}

const handleEditRent = (rent) => {
	selectedRent.value = rent
	showCreateRentModal.value = true
}

const handleDeleteRent = async (rent) => {
	if (!confirm(`Are you sure you want to delete this rent record?`)) {
		return
	}
	
	try {
		await deleteShopRent(rent.id)
		toast.success('Rent record deleted successfully')
		fetchRentListings()
	} catch (error) {
		toast.error(error.message || 'Failed to delete rent record')
	}
}

const fetchRentListings = async () => {
	loading.value = true
	try {
		const rents = await getShopRents()
		rentListingsData.value = rents || []
	} catch (error) {
		rentListingsData.value = []
		console.error('Error fetching rent listings:', error)
		toast.error('Failed to load shop rents')
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
