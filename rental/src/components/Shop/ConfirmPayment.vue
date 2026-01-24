<template>
	<Dialog
		:modelValue="props.modelValue"
		@update:modelValue="emit('update:modelValue', $event)"
		:options="{
			size: 'lg',
		}"
	>
		<template #body-header>
			<div class="flex items-center mb-5">
				<div class="text-2xl font-semibold leading-6 text-ink-gray-9">
					Confirm Payment
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div v-if="rentData" class="mb-4 p-4 bg-ink-gray-1 rounded-lg">
					<div class="text-sm text-ink-gray-7 mb-2">Shop Information:</div>
					<div class="font-medium">{{ rentData.shop_name }} ({{ rentData.shop_location || '' }} + {{ rentData.shop_area || 0 }} sqm)</div>
					<div class="text-sm text-ink-gray-7 mt-2">
						Amount: <span class="font-medium">{{ formatNumber(rentData.total_amount || 0) }}</span>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-6">
					<div>
						<DatePicker
							v-model="payment.paid_date"
							variant="subtle"
							placeholder="Select payment date"
							:disabled="false"
							label="Payment Date"
							:required="true"
						/>
					</div>
					<div>
						<FormControl
							v-model="payment.reason"
							type="textarea"
							label="Reason"
							:rows="4"
							placeholder="Enter payment reason (optional)"
						/>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right flex gap-2">
				<Button variant="outline" @click="close">
					Cancel
				</Button>
				<Button variant="solid" @click="confirmPayment(close)" :loading="loading">
					Confirm Payment
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
import { formatNumber } from '@/utils'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	rentData: {
		type: Object,
		default: null,
	},
	onSuccess: {
		type: Function,
		default: () => {},
	},
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)

const payment = reactive({
	paid_date: null,
	reason: '',
})

watch(() => props.modelValue, (newVal) => {
	if (newVal) {
		// Set current date as default when dialog opens
		const today = new Date()
		payment.paid_date = today.toISOString().split('T')[0]
		payment.reason = props.rentData?.reason || ''
	} else {
		// Reset form when dialog closes
		payment.paid_date = null
		payment.reason = ''
	}
})

const confirmPayment = async (close) => {
	if (!payment.paid_date) {
		toast.error('Payment date is required')
		return
	}

	loading.value = true
	try {
		// Emit the payment confirmation with data
		emit('confirm', {
			paid_date: payment.paid_date,
			reason: payment.reason || null,
		})
		close()
	} catch (error) {
		toast.error(error.message || 'Failed to confirm payment')
	} finally {
		loading.value = false
	}
}
</script>
