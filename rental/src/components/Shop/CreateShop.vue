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
					{{ isEditMode ? 'Edit Shop' : 'Create New Shop' }}
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
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.location"
							label="Location"
							type="text"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.area_sqm"
							label="Area (sqm)"
							type="number"
							:step="0.01"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.ejar_contract_no"
							label="Ejar Contract No"
							type="text"
							:required="true"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.base_rent"
							label="Base Rent"
							type="number"
							:step="0.01"
							:required="true"
							:placeholder="isEditMode ? 'Enter base rent' : 'Enter base rent'"
							@update:modelValue="calculateTotalAmount"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.vat_percentage"
							label="VAT %"
							type="number"
							:step="0.01"
							:required="true"
							@update:modelValue="calculateTotalAmount"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.term_type"
							type="select"
							:options="termTypeOptions"
							label="Term Type"
							:required="true"
							@update:modelValue="calculateTotalAmount"
						/>
					</div>
					<div class="col-span-2 lg:col-span-1">
						<FormControl
							v-model="shop.total_amount"
							label="Total Amount"
							type="number"
							:step="0.01"
							:disabled="true"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right">
				<Button variant="solid" @click="saveShop(close)" :loading="loading">
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
import { addShop, updateShop } from '@/utils/dataService'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	onSuccess: {
		type: Function,
		default: () => {},
	},
	shopData: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['update:modelValue'])

const isEditMode = computed(() => !!props.shopData)

const loadShopData = () => {
	if (props.shopData) {
		// Load shop data for editing
		// Use raw values if available (from table row), otherwise use the formatted values
		shop.shop_name = props.shopData.shop_name || ''
		shop.location = props.shopData.location || ''
		
		// Handle area_sqm - use raw value if available, otherwise parse formatted value
		if (props.shopData.area_sqm_raw != null) {
			shop.area_sqm = parseFloat(props.shopData.area_sqm_raw)
		} else if (props.shopData.area_sqm != null) {
			const areaValue = typeof props.shopData.area_sqm === 'string' 
				? parseFloat(props.shopData.area_sqm.replace(/,/g, '')) 
				: parseFloat(props.shopData.area_sqm)
			shop.area_sqm = isNaN(areaValue) ? null : areaValue
		} else {
			shop.area_sqm = null
		}
		
		shop.ejar_contract_no = props.shopData.ejar_contract_no || ''
		
		// Handle base_rent - use raw value if available, otherwise parse formatted value
		if (props.shopData.base_rent_raw != null) {
			shop.base_rent = parseFloat(props.shopData.base_rent_raw)
		} else if (props.shopData.base_rent != null) {
			const baseRentValue = typeof props.shopData.base_rent === 'string' 
				? parseFloat(props.shopData.base_rent.replace(/,/g, '')) 
				: parseFloat(props.shopData.base_rent)
			shop.base_rent = isNaN(baseRentValue) ? null : baseRentValue
		} else {
			shop.base_rent = null
		}
		
		shop.vat_percentage = props.shopData.vat_percentage != null ? parseFloat(props.shopData.vat_percentage) : 15
		shop.term_type = props.shopData.term_type || ''
		
		// Handle total_amount - use raw value if available, otherwise parse formatted value
		if (props.shopData.total_amount_raw != null) {
			shop.total_amount = parseFloat(props.shopData.total_amount_raw)
		} else if (props.shopData.total_amount != null) {
			const totalValue = typeof props.shopData.total_amount === 'string' 
				? parseFloat(props.shopData.total_amount.replace(/,/g, '')) 
				: parseFloat(props.shopData.total_amount)
			shop.total_amount = isNaN(totalValue) ? null : totalValue
		} else {
			shop.total_amount = null
		}
		
		calculateTotalAmount()
	}
}

watch(() => props.modelValue, (newVal) => {
	if (!newVal) {
		resetForm()
	} else if (props.shopData) {
		loadShopData()
	}
})

watch(() => props.shopData, () => {
	if (props.modelValue && props.shopData) {
		loadShopData()
	}
}, { deep: true })

const shop = reactive({
	shop_name: '',
	location: '',
	area_sqm: null,
	ejar_contract_no: '',
	base_rent: null,
	vat_percentage: 15,
	term_type: '',
	total_amount: null,
})

const loading = ref(false)

const termTypeOptions = [
	{
		label: 'Once a Year',
		value: 'Once a Year',
	},
	{
		label: 'Twice a Year',
		value: 'Twice a Year',
	},
]

const calculateTotalAmount = () => {
	if (!shop.base_rent || !shop.vat_percentage) {
		shop.total_amount = null
		return
	}

	const baseRent = parseFloat(shop.base_rent) || 0
	const vatPercent = parseFloat(shop.vat_percentage) || 0
	const vatAmount = baseRent * (vatPercent / 100)
	const singlePeriodAmount = baseRent + vatAmount

	if (shop.term_type === 'Once a Year') {
		shop.total_amount = singlePeriodAmount
	} else if (shop.term_type === 'Twice a Year') {
		shop.total_amount = singlePeriodAmount * 2
	} else {
		shop.total_amount = singlePeriodAmount
	}
}

const resetForm = () => {
	shop.shop_name = ''
	shop.location = ''
	shop.area_sqm = null
	shop.ejar_contract_no = ''
	shop.base_rent = null
	shop.vat_percentage = 15
	shop.term_type = ''
	shop.total_amount = null
}

const saveShop = async (close) => {
	// Validation
	if (!shop.shop_name?.trim()) {
		toast.error('Shop name is required')
		return
	}
	if (!shop.location?.trim()) {
		toast.error('Location is required')
		return
	}
	if (!shop.area_sqm) {
		toast.error('Area is required')
		return
	}
	if (!shop.ejar_contract_no?.trim()) {
		toast.error('Ejar Contract No is required')
		return
	}
	if (!shop.base_rent) {
		toast.error('Base Rent is required')
		return
	}
	if (!shop.term_type) {
		toast.error('Term Type is required')
		return
	}

	// Calculate total amount before saving
	calculateTotalAmount()

	loading.value = true
	try {
		const shopData = {
			shop_name: shop.shop_name.trim(),
			location: shop.location.trim(),
			area_sqm: parseFloat(shop.area_sqm),
			ejar_contract_no: shop.ejar_contract_no.trim(),
			base_rent: parseFloat(shop.base_rent),
			vat_percentage: parseFloat(shop.vat_percentage) || 15,
			term_type: shop.term_type,
			total_amount: parseFloat(shop.total_amount) || 0,
		}

		if (isEditMode.value) {
			await updateShop(props.shopData.id, shopData)
			toast.success('Shop updated successfully')
		} else {
			await addShop(shopData)
			toast.success('Shop created successfully')
		}

		close()
		resetForm()
		// Call onSuccess callback to refetch shop listings
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || `Failed to ${isEditMode.value ? 'update' : 'create'} shop`)
	} finally {
		loading.value = false
	}
}
</script>

