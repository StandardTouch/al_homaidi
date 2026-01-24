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
					{{ isEditMode ? 'Edit Shop Rent' : 'Create Shop Rent' }}
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="grid grid-cols-2 gap-10">
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="rentPayment.shop_id"
							type="select"
							:options="shopOptions"
							label="Shop Name (Location + Area sqm)"
							:loading="loadingShops"
							:placeholder="loadingShops ? 'Loading shops...' : 'Select a shop'"
							:required="true"
							:disabled="isEditMode"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<div class="p-2">
							<DatePicker
								v-model="rentPayment.start_date"
								variant="subtle"
								placeholder="Select start date"
								:disabled="false"
								label="Start Date"
								:required="true"
							/>
						</div>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="rentPayment.payment_status"
							type="select"
							:options="paymentStatusOptions"
							label="Payment Status"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<div class="p-2">
							<DatePicker
								v-model="rentPayment.paid_date"
								variant="subtle"
								placeholder="Select paid date"
								:disabled="false"
								label="Paid Date"
							/>
						</div>
					</div>
					<div class="col-span-2">
						<FormControl
							v-model="rentPayment.reason"
							type="textarea"
							label="Reason"
							:rows="3"
							placeholder="Enter reason (optional)"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveRentPayment(close)" :loading="loading">
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
	DatePicker,
	toast,
} from 'frappe-ui'
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { getShops, getShopById, addShopRent, addShopRents, updateShopRent } from '@/utils/dataService'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	onSuccess: {
		type: Function,
		default: () => {},
	},
	rentData: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['update:modelValue'])

const isEditMode = computed(() => !!props.rentData)

watch(() => props.modelValue, (newVal) => {
	if (!newVal) {
		resetForm()
	} else if (props.rentData) {
		// Load rent data for editing
		rentPayment.shop_id = props.rentData.shop_id || ''
		rentPayment.start_date = props.rentData.start_date || null
		rentPayment.payment_status = props.rentData.payment_status || 'Un Paid'
		rentPayment.paid_date = props.rentData.paid_date || null
		rentPayment.reason = props.rentData.reason || ''
	}
})

const rentPayment = reactive({
	shop_id: '',
	start_date: null,
	payment_status: 'Un Paid',
	paid_date: null,
	reason: '',
})

const loading = ref(false)
const loadingShops = ref(false)
const shopOptions = ref([])

const paymentStatusOptions = [
	{
		label: 'Paid',
		value: 'Paid',
	},
	{
		label: 'Un Paid',
		value: 'Un Paid',
	},
]

const fetchShops = async () => {
	loadingShops.value = true
	try {
		const shops = await getShops()
		shopOptions.value = shops.map(shop => ({
			label: `${shop.shop_name} (${shop.location} + ${shop.area_sqm} sqm)`,
			value: shop.id,
		}))
	} catch (error) {
		console.error('Error fetching shops:', error)
		toast.error('Failed to load shops')
	} finally {
		loadingShops.value = false
	}
}

const resetForm = () => {
	rentPayment.shop_id = ''
	rentPayment.start_date = null
	rentPayment.payment_status = 'Un Paid'
	rentPayment.paid_date = null
	rentPayment.reason = ''
}

const calculateEndDate = (startDate, months) => {
	const date = new Date(startDate)
	date.setMonth(date.getMonth() + months)
	return date.toISOString().split('T')[0]
}

const saveRentPayment = async (close) => {
	// Validation
	if (!rentPayment.shop_id) {
		toast.error('Shop is required')
		return
	}
	if (!rentPayment.start_date) {
		toast.error('Start Date is required')
		return
	}

	loading.value = true
	try {
		if (isEditMode.value) {
			// Update existing rent record - just update the fields, don't recalculate dates
			const shop = await getShopById(props.rentData.shop_id)
			if (!shop) {
				throw new Error('Shop not found')
			}
			
			// Calculate end date based on start date and shop term type
			const startDate = new Date(rentPayment.start_date)
			let endDate = props.rentData.end_date
			
			// Recalculate end date if start date changed
			if (shop.term_type === 'Once a Year') {
				endDate = calculateEndDate(startDate, 12)
			} else if (shop.term_type === 'Twice a Year') {
				// For twice a year, calculate 6 months from start date
				endDate = calculateEndDate(startDate, 6)
			}
			
			// Calculate total amount based on term type
			let totalAmount = shop.total_amount || 0
			if (shop.term_type === 'Twice a Year') {
				totalAmount = totalAmount / 2 // Divide by 2 for each 6-month period
			}
			
			await updateShopRent(props.rentData.id, {
				start_date: rentPayment.start_date,
				end_date: endDate,
				total_amount: totalAmount,
				payment_status: rentPayment.payment_status,
				paid_date: rentPayment.paid_date || null,
				reason: rentPayment.reason || null,
			})
			toast.success('Shop rent updated successfully')
		} else {
			// Create new rent records
			const shop = await getShopById(rentPayment.shop_id)
			if (!shop) {
				throw new Error('Shop not found')
			}

			const startDate = new Date(rentPayment.start_date)
			let rentRecords = []
			
			// Calculate total amount based on term type
			let totalAmount = shop.total_amount || 0
			if (shop.term_type === 'Twice a Year') {
				totalAmount = totalAmount / 2 // Divide by 2 for each 6-month period
			}

			if (shop.term_type === 'Once a Year') {
				// Create one record for the full year
				const endDate = calculateEndDate(startDate, 12)
				rentRecords.push({
					shop_id: shop.id,
					shop_name: shop.shop_name,
					shop_location: shop.location,
					shop_area: shop.area_sqm,
					start_date: rentPayment.start_date,
					end_date: endDate,
					total_amount: totalAmount,
					payment_status: rentPayment.payment_status,
					paid_date: rentPayment.paid_date || null,
					reason: rentPayment.reason || null,
				})
			} else if (shop.term_type === 'Twice a Year') {
				// Create two records: first 6 months and second 6 months
				const firstEndDate = calculateEndDate(startDate, 6)
				const secondStartDate = calculateEndDate(startDate, 6)
				const secondEndDate = calculateEndDate(secondStartDate, 6)
				
				rentRecords.push({
					shop_id: shop.id,
					shop_name: shop.shop_name,
					shop_location: shop.location,
					shop_area: shop.area_sqm,
					start_date: rentPayment.start_date,
					end_date: firstEndDate,
					total_amount: totalAmount,
					payment_status: rentPayment.payment_status,
					paid_date: rentPayment.paid_date || null,
					reason: rentPayment.reason || null,
				})
				
				rentRecords.push({
					shop_id: shop.id,
					shop_name: shop.shop_name,
					shop_location: shop.location,
					shop_area: shop.area_sqm,
					start_date: secondStartDate,
					end_date: secondEndDate,
					total_amount: totalAmount,
					payment_status: rentPayment.payment_status,
					paid_date: rentPayment.paid_date || null,
					reason: rentPayment.reason || null,
				})
			}

			// Create new rent records
			if (rentRecords.length === 1) {
				await addShopRent(rentRecords[0])
			} else {
				await addShopRents(rentRecords)
			}
			toast.success(`Shop rent${rentRecords.length > 1 ? 's' : ''} created successfully`)
		}

		close()
		resetForm()
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || `Failed to ${isEditMode.value ? 'update' : 'create'} shop rent`)
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchShops()
})
</script>
