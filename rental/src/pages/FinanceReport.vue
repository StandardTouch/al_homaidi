<template>
	<header class="sticky flex items-center justify-between top-0 z-10 border-b bg-surface-white px-3 py-2.5 sm:px-5">
		<Breadcrumbs :items="breadcrumbs" />
	</header>
	<div class="p-5 pb-10">
		<!-- Page Title -->
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-ink-gray-9">Finance Report</h1>
			<p class="text-sm text-ink-gray-6 mt-1">Track rental payments and pending balances</p>
		</div>

		<!-- Filters Section -->
		<div class="bg-surface-white border rounded-lg p-4 mb-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-ink-gray-7 mb-2">Shop</label>
					<Select
						v-model="selectedShop"
						:options="shopOptions"
						placeholder="All Shops"
						@update:modelValue="updateReport"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-ink-gray-7 mb-2">Year</label>
					<Select
						v-model="selectedYear"
						:options="yearOptions"
						placeholder="All Years"
						@update:modelValue="updateReport"
					/>
				</div>
			</div>
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Total Paid</h3>
					<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-green-600">{{ formatCurrency(summaryData.totalPaid) }}</p>
			</div>
			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Pending Balance</h3>
					<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-red-600">{{ formatCurrency(summaryData.totalPending) }}</p>
			</div>
			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Expected Revenue</h3>
					<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-ink-gray-9">{{ formatCurrency(summaryData.totalExpected) }}</p>
			</div>
			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Collection Rate</h3>
					<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-purple-600">{{ summaryData.collectionRate.toFixed(1) }}%</p>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			<!-- Paid vs Pending Chart -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Paid vs Pending</h3>
				<div class="space-y-4">
					<div>
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm text-ink-gray-7">Paid</span>
							<span class="text-sm font-medium text-green-600">{{ formatCurrency(summaryData.totalPaid) }}</span>
						</div>
						<div class="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
							<div 
								class="bg-green-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
								:style="{ width: paidPercentage + '%' }"
							>
								<span class="text-xs text-white font-medium" v-if="paidPercentage > 10">{{ paidPercentage.toFixed(1) }}%</span>
							</div>
						</div>
					</div>
					<div>
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm text-ink-gray-7">Pending</span>
							<span class="text-sm font-medium text-red-600">{{ formatCurrency(summaryData.totalPending) }}</span>
						</div>
						<div class="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
							<div 
								class="bg-red-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
								:style="{ width: pendingPercentage + '%' }"
							>
								<span class="text-xs text-white font-medium" v-if="pendingPercentage > 10">{{ pendingPercentage.toFixed(1) }}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Monthly Breakdown Chart -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Monthly Breakdown</h3>
				<div class="space-y-3" v-if="monthlyData.length > 0">
					<div v-for="month in monthlyData" :key="month.month" class="space-y-1">
						<div class="flex justify-between items-center">
							<span class="text-sm text-ink-gray-7">{{ month.month }}</span>
							<span class="text-sm font-medium">{{ formatCurrency(month.amount) }}</span>
						</div>
						<div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
							<div 
								class="bg-blue-500 h-3 rounded-full transition-all duration-500"
								:style="{ width: month.percentage + '%' }"
							></div>
						</div>
					</div>
				</div>
				<div v-else class="text-center text-ink-gray-5 py-8">
					<p>No data available for selected filters</p>
				</div>
			</div>
		</div>

		<!-- Detailed Statistics Table -->
		<div class="bg-surface-white border rounded-lg p-6">
			<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Shop-wise Breakdown</h3>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="text-left py-3 px-4 text-sm font-semibold text-ink-gray-7">Shop Name</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-ink-gray-7">Paid Amount</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-ink-gray-7">Pending Amount</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-ink-gray-7">Total Expected</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-ink-gray-7">Collection Rate</th>
						</tr>
					</thead>
					<tbody>
						<tr 
							v-for="shop in shopBreakdown" 
							:key="shop.id"
							class="border-b hover:bg-gray-50 transition-colors"
						>
							<td class="py-3 px-4 text-sm text-ink-gray-9">{{ shop.name }}</td>
							<td class="py-3 px-4 text-sm text-right text-green-600 font-medium">{{ formatCurrency(shop.paid) }}</td>
							<td class="py-3 px-4 text-sm text-right text-red-600 font-medium">{{ formatCurrency(shop.pending) }}</td>
							<td class="py-3 px-4 text-sm text-right text-ink-gray-9">{{ formatCurrency(shop.total) }}</td>
							<td class="py-3 px-4 text-sm text-right">
								<span 
									class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
									:class="{
										'bg-green-100 text-green-800': shop.rate >= 80,
										'bg-yellow-100 text-yellow-800': shop.rate >= 50 && shop.rate < 80,
										'bg-red-100 text-red-800': shop.rate < 50
									}"
								>
									{{ shop.rate.toFixed(1) }}%
								</span>
							</td>
						</tr>
						<tr v-if="shopBreakdown.length === 0" class="border-b">
							<td colspan="5" class="py-8 text-center text-ink-gray-5">
								No data available for selected filters
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup>
import {
	Breadcrumbs,
	Select,
} from 'frappe-ui'
import { ref, onMounted, computed } from 'vue'
import { getShops, getShopRents } from '@/utils/dataService'
import { formatNumber } from '@/utils'

const breadcrumbs = ref([
	{
		label: 'Home',
		to: '/',
	},
	{
		label: 'Finance Report',
		to: '/finance-report',
	},
])

const shops = ref([])
const shopRents = ref([])
const selectedShop = ref('')
const selectedYear = ref('')
const loading = ref(false)

// Generate year options (current year and 5 years back)
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
	const years = [
		{ label: 'All Years', value: '' },
		...Array.from({ length: 6 }, (_, i) => ({
			label: String(currentYear - i),
			value: String(currentYear - i),
		}))
	]
	return years
})

// Shop options
const shopOptions = computed(() => {
	const options = [
		{ label: 'All Shops', value: '' },
		...shops.value.map(shop => ({
			label: `${shop.shop_name} (${shop.location})`,
			value: shop.id,
		}))
	]
	return options
})

// Filter shop rents based on selected filters
const filteredShopRents = computed(() => {
	let rents = [...shopRents.value]
	
	// Filter by shop
	if (selectedShop.value) {
		rents = rents.filter(rent => rent.shop_id === selectedShop.value)
	}
	
	// Filter by year
	if (selectedYear.value) {
		rents = rents.filter(rent => {
			if (!rent.start_date) return false
			const rentYear = new Date(rent.start_date).getFullYear()
			return String(rentYear) === selectedYear.value
		})
	}
	
	return rents
})

// Summary data calculations
const summaryData = computed(() => {
	const rents = filteredShopRents.value
	
	const totalPaid = rents
		.filter(rent => rent.payment_status === 'Paid')
		.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	
	const totalPending = rents
		.filter(rent => rent.payment_status === 'Un Paid' || rent.payment_status === 'Unpaid' || !rent.payment_status)
		.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	
	const totalExpected = rents.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	
	const collectionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0
	
	return {
		totalPaid,
		totalPending,
		totalExpected,
		collectionRate,
	}
})

// Percentage calculations for charts
const paidPercentage = computed(() => {
	const total = summaryData.value.totalPaid + summaryData.value.totalPending
	return total > 0 ? (summaryData.value.totalPaid / total) * 100 : 0
})

const pendingPercentage = computed(() => {
	const total = summaryData.value.totalPaid + summaryData.value.totalPending
	return total > 0 ? (summaryData.value.totalPending / total) * 100 : 0
})

// Monthly breakdown
const monthlyData = computed(() => {
	const rents = filteredShopRents.value.filter(rent => rent.payment_status === 'Paid')
	const monthlyMap = {}
	
	rents.forEach(rent => {
		if (!rent.paid_date) return
		const date = new Date(rent.paid_date)
		const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
		
		if (!monthlyMap[monthKey]) {
			monthlyMap[monthKey] = 0
		}
		monthlyMap[monthKey] += parseFloat(rent.total_amount) || 0
	})
	
	const monthlyArray = Object.entries(monthlyMap)
		.map(([month, amount]) => ({ month, amount }))
		.sort((a, b) => {
			const dateA = new Date(a.month)
			const dateB = new Date(b.month)
			return dateA - dateB
		})
	
	const maxAmount = Math.max(...monthlyArray.map(m => m.amount), 1)
	
	return monthlyArray.map(item => ({
		...item,
		percentage: (item.amount / maxAmount) * 100,
	}))
})

// Shop-wise breakdown
const shopBreakdown = computed(() => {
	const rents = filteredShopRents.value
	const shopMap = {}
	
	// Initialize shop map
	const shopsToProcess = selectedShop.value 
		? shops.value.filter(s => s.id === selectedShop.value)
		: shops.value
	
	shopsToProcess.forEach(shop => {
		shopMap[shop.id] = {
			id: shop.id,
			name: shop.shop_name,
			paid: 0,
			pending: 0,
			total: 0,
		}
	})
	
	// Calculate amounts per shop
	rents.forEach(rent => {
		if (!shopMap[rent.shop_id]) {
			const shop = shops.value.find(s => s.id === rent.shop_id)
			if (shop) {
				shopMap[rent.shop_id] = {
					id: rent.shop_id,
					name: shop.shop_name,
					paid: 0,
					pending: 0,
					total: 0,
				}
			}
		}
		
		if (shopMap[rent.shop_id]) {
			const amount = parseFloat(rent.total_amount) || 0
			shopMap[rent.shop_id].total += amount
			
			if (rent.payment_status === 'Paid') {
				shopMap[rent.shop_id].paid += amount
			} else {
				shopMap[rent.shop_id].pending += amount
			}
		}
	})
	
	return Object.values(shopMap)
		.filter(shop => shop.total > 0)
		.map(shop => ({
			...shop,
			rate: shop.total > 0 ? (shop.paid / shop.total) * 100 : 0,
		}))
		.sort((a, b) => b.total - a.total)
})

// Format currency
const formatCurrency = (amount) => {
	return formatNumber(amount || 0)
}

// Update report when filters change
const updateReport = () => {
	// Computed properties will automatically update
}

// Fetch data
const fetchData = async () => {
	loading.value = true
	try {
		const [shopsData, rentsData] = await Promise.all([
			getShops(),
			getShopRents(),
		])
		shops.value = shopsData || []
		shopRents.value = rentsData || []
	} catch (error) {
		console.error('Error fetching finance data:', error)
		shops.value = []
		shopRents.value = []
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchData()
})
</script>
