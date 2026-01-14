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
					Create Rent Payment
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="rentPayment.shop"
							type="select"
							:options="shopOptions"
							label="Shop"
							:loading="loadingShops"
							:placeholder="loadingShops ? 'Loading shops...' : 'Select a shop'"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="rentPayment.amount"
							label="Amount"
							type="number"
							:step="0.01"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
                        <DatePicker
                            v-model="rentPayment.payment_date"
                            variant="subtle"
                            placeholder="Select payment date"
                            :disabled="false"
                            label="Payment Date"
                        />
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="rentPayment.payment_method"
							type="select"
							:options="paymentMethodOptions"
							label="Payment Method"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveRentPayment(close)" :loading="loading">
					Save
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
	DatePicker,
	toast,
} from 'frappe-ui'
import { reactive, ref, watch, onMounted } from 'vue'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	onSuccess: {
		type: Function,
		default: () => {},
	},
})

const emit = defineEmits(['update:modelValue'])

watch(() => props.modelValue, (newVal) => {
	if (!newVal) {
		// Reset form when modal closes
		rentPayment.shop = ''
		rentPayment.amount = null
		rentPayment.payment_date = null
		rentPayment.payment_method = ''
	}
})

const rentPayment = reactive({
	shop: '',
	amount: null,
	payment_date: null,
	payment_method: '',
})

const loading = ref(false)
const loadingShops = ref(false)
const shopOptions = ref([])

const paymentMethodOptions = [
	{
		label: 'Cash',
		value: 'Cash',
	},
	{
		label: 'Bank Transfer',
		value: 'Bank Transfer',
	},
	{
		label: 'Cheque',
		value: 'Cheque',
	},
	{
		label: 'Credit Card',
		value: 'Credit Card',
	},
]

const fetchShops = async () => {
	loadingShops.value = true
	try {
		const fields = ['name']
		const params = new URLSearchParams()
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
		
		if (data && data.data && Array.isArray(data.data)) {
			shopOptions.value = data.data.map(shop => ({
				label: shop.name,
				value: shop.name,
			}))
		}
	} catch (error) {
		console.error('Error fetching shops:', error)
		toast.error('Failed to load shops')
	} finally {
		loadingShops.value = false
	}
}

onMounted(() => {
	fetchShops()
})

const saveRentPayment = async (close) => {
	if (!rentPayment.shop) {
		toast.error('Shop is required')
		return
	}
	if (!rentPayment.amount) {
		toast.error('Amount is required')
		return
	}
	if (!rentPayment.payment_date) {
		toast.error('Payment date is required')
		return
	}
	if (!rentPayment.payment_method) {
		toast.error('Payment method is required')
		return
	}

	loading.value = true
	try {
		const response = await fetch('https://testhomaidi.k.frappe.cloud/api/method/frappe.client.insert', {
			method: 'POST',
			headers: {
				'Authorization': 'token 7bb9da8a62f5b38:b41b1d78a86f197',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				doc: {
					doctype: 'Rent Payment',
					shop: rentPayment.shop,
					amount: rentPayment.amount ? parseFloat(rentPayment.amount) : null,
					payment_date: rentPayment.payment_date || null,
					payment_method: rentPayment.payment_method,
				},
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		toast.success('Rent payment created successfully')
		close()
		// Reset form
		rentPayment.shop = ''
		rentPayment.amount = null
		rentPayment.payment_date = null
		rentPayment.payment_method = ''
		// Call onSuccess callback to refetch rent listings
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || 'Failed to create rent payment')
	} finally {
		loading.value = false
	}
}
</script>
