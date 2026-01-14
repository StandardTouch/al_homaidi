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
					Create New Shop
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.shop_name"
							label="Shop Name"
							type="text"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.base_rent"
							label="Base Rent"
							type="number"
							:step="0.01"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.standard_vat"
							label="Standard VAT"
							type="number"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<div class="p-2">
							<DatePicker
								v-model="shop.contract_start_date"
								variant="subtle"
								placeholder="Select start date"
								:disabled="false"
								label="Contract Start Date"
							/>
						</div>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<div class="p-2">
							<DatePicker
								v-model="shop.contract_end_date"
								variant="subtle"
								placeholder="Select end date"
								:disabled="false"
								label="Contract End Date"
							/>
						</div>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.annual_base_rent"
							label="Annual Base Rent"
							type="number"
							:step="0.01"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.area_sqm"
							label="Area (sqm)"
							type="number"
							:step="0.01"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.payment_term"
							type="select"
							:options="paymentTermOptions"
							label="Payment Term"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveShop(close)" :loading="loading">
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
import { reactive, ref, watch } from 'vue'

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
		shop.shop_name = ''
		shop.base_rent = null
		shop.standard_vat = 15
		shop.contract_start_date = null
		shop.contract_end_date = null
		shop.annual_base_rent = null
		shop.area_sqm = null
		shop.payment_term = ''
	}
})

const shop = reactive({
	shop_name: '',
	base_rent: null,
	standard_vat: 15,
	contract_start_date: null,
	contract_end_date: null,
	annual_base_rent: null,
	area_sqm: null,
	payment_term: '',
})

const loading = ref(false)

const paymentTermOptions = [
	{
		label: 'Once a Year',
		value: 'Once a Year',
	},
	{
		label: 'Twice a Year',
		value: 'Twice a Year',
	},
]

const saveShop = async (close) => {
	if (!shop.shop_name) {
		toast.error('Shop name is required')
		return
	}
	if (!shop.base_rent) {
		toast.error('Base rent is required')
		return
	}
	if (!shop.area_sqm) {
		toast.error('Area is required')
		return
	}
	if (!shop.payment_term) {
		toast.error('Payment term is required')
		return
	}

	loading.value = true
	try {
		const response = await fetch('https://testhomaidi.k.frappe.cloud/api/resource/Shop', {
			method: 'POST',
			headers: {
				'Authorization': 'token 7bb9da8a62f5b38:b41b1d78a86f197',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				shop_name: shop.shop_name,
				base_rent: shop.base_rent ? parseFloat(shop.base_rent) : null,
				standard_vat: shop.standard_vat ? parseInt(shop.standard_vat) : 15,
				contract_start_date: shop.contract_start_date || null,
				contract_end_date: shop.contract_end_date || null,
				annual_base_rent: shop.annual_base_rent ? parseFloat(shop.annual_base_rent) : null,
				area_sqm: shop.area_sqm ? parseFloat(shop.area_sqm) : null,
				payment_term: shop.payment_term,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		toast.success('Shop created successfully')
		close()
		// Reset form
		shop.shop_name = ''
		shop.base_rent = null
		shop.standard_vat = 15
		shop.contract_start_date = null
		shop.contract_end_date = null
		shop.annual_base_rent = null
		shop.area_sqm = null
		shop.payment_term = ''
		// Call onSuccess callback to refetch shop listings
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || 'Failed to create shop')
	} finally {
		loading.value = false
	}
}
</script>

