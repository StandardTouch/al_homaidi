<template>
	<div class="space-y-6">
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Total Shops</h3>
					<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-ink-gray-9">{{ stats.totalShops }}</p>
			</div>

			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Pending Rents</h3>
					<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-red-600">{{ formatCurrency(stats.totalPending) }}</p>
				<p class="text-xs text-ink-gray-6 mt-1">{{ stats.pendingCount }} unpaid records</p>
			</div>

			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Total Paid</h3>
					<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-green-600">{{ formatCurrency(stats.totalPaid) }}</p>
				<p class="text-xs text-ink-gray-6 mt-1">{{ stats.paidCount }} paid records</p>
			</div>

			<div class="bg-surface-white border rounded-lg p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-ink-gray-7">Collection Rate</h3>
					<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
						</svg>
					</div>
				</div>
				<p class="text-2xl font-semibold text-purple-600">{{ stats.collectionRate.toFixed(1) }}%</p>
				<p class="text-xs text-ink-gray-6 mt-1">Payment efficiency</p>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Payment Status Chart -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Payment Status Overview</h3>
				<div class="space-y-4">
					<div>
						<div class="flex justify-between items-center mb-2">
							<span class="text-sm text-ink-gray-7">Paid</span>
							<span class="text-sm font-medium text-green-600">{{ formatCurrency(stats.totalPaid) }}</span>
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
							<span class="text-sm font-medium text-red-600">{{ formatCurrency(stats.totalPending) }}</span>
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

			<!-- Monthly Revenue Chart -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Monthly Revenue (Last 6 Months)</h3>
				<div class="space-y-3" v-if="monthlyData.length > 0">
					<div v-for="month in monthlyData.slice(-6)" :key="month.month" class="space-y-1">
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
					<p>No payment data available</p>
				</div>
			</div>
		</div>

		<!-- Recent Activity & Top Shops -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Payments -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Recent Payments</h3>
				<div class="space-y-3" v-if="recentPayments.length > 0">
					<div 
						v-for="payment in recentPayments.slice(0, 5)" 
						:key="payment.id"
						class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<div class="flex-1">
							<p class="text-sm font-medium text-ink-gray-9">{{ payment.shop_name }}</p>
							<p class="text-xs text-ink-gray-6">{{ formatDate(payment.paid_date) }}</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-green-600">{{ formatCurrency(payment.total_amount) }}</p>
							<Badge variant="solid" theme="green" size="sm" class="mt-1">Paid</Badge>
						</div>
					</div>
				</div>
				<div v-else class="text-center text-ink-gray-5 py-8">
					<p>No recent payments</p>
				</div>
			</div>

			<!-- Top Performing Shops -->
			<div class="bg-surface-white border rounded-lg p-6">
				<h3 class="text-lg font-semibold text-ink-gray-9 mb-4">Top Performing Shops</h3>
				<div class="space-y-3" v-if="topShops.length > 0">
					<div 
						v-for="(shop, index) in topShops.slice(0, 5)" 
						:key="shop.id"
						class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<div class="flex items-center gap-3 flex-1">
							<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
								<span class="text-xs font-semibold text-blue-600">#{{ index + 1 }}</span>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium text-ink-gray-9">{{ shop.name }}</p>
								<p class="text-xs text-ink-gray-6">{{ formatCurrency(shop.paid) }} collected</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-ink-gray-9">{{ shop.rate.toFixed(1) }}%</p>
							<Badge 
								variant="solid" 
								:theme="shop.rate >= 80 ? 'green' : shop.rate >= 50 ? 'yellow' : 'red'" 
								size="sm" 
								class="mt-1"
							>
								{{ shop.rate >= 80 ? 'Excellent' : shop.rate >= 50 ? 'Good' : 'Needs Attention' }}
							</Badge>
						</div>
					</div>
				</div>
				<div v-else class="text-center text-ink-gray-5 py-8">
					<p>No shop data available</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Badge } from 'frappe-ui'
import { getShops, getShopRents } from '@/utils/dataService'
import { formatNumber } from '@/utils'

const shops = ref([])
const shopRents = ref([])
const loading = ref(false)

// Calculate statistics
const stats = computed(() => {
	const totalShops = shops.value.length
	
	const paidRents = shopRents.value.filter(rent => rent.payment_status === 'Paid')
	const pendingRents = shopRents.value.filter(rent => 
		rent.payment_status === 'Un Paid' || rent.payment_status === 'Unpaid' || !rent.payment_status
	)
	
	const totalPaid = paidRents.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	const totalPending = pendingRents.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	const totalExpected = shopRents.value.reduce((sum, rent) => sum + (parseFloat(rent.total_amount) || 0), 0)
	
	const collectionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0
	
	return {
		totalShops,
		totalPaid,
		totalPending,
		totalExpected,
		collectionRate,
		paidCount: paidRents.length,
		pendingCount: pendingRents.length,
	}
})

// Percentage calculations for charts
const paidPercentage = computed(() => {
	const total = stats.value.totalPaid + stats.value.totalPending
	return total > 0 ? (stats.value.totalPaid / total) * 100 : 0
})

const pendingPercentage = computed(() => {
	const total = stats.value.totalPaid + stats.value.totalPending
	return total > 0 ? (stats.value.totalPending / total) * 100 : 0
})

// Monthly breakdown
const monthlyData = computed(() => {
	const rents = shopRents.value.filter(rent => rent.payment_status === 'Paid')
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

// Recent payments
const recentPayments = computed(() => {
	return shopRents.value
		.filter(rent => rent.payment_status === 'Paid' && rent.paid_date)
		.map(rent => {
			const shop = shops.value.find(s => s.id === rent.shop_id)
			return {
				...rent,
				shop_name: shop?.shop_name || 'Unknown Shop',
			}
		})
		.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date))
})

// Top performing shops
const topShops = computed(() => {
	const shopMap = {}
	
	shops.value.forEach(shop => {
		shopMap[shop.id] = {
			id: shop.id,
			name: shop.shop_name,
			paid: 0,
			pending: 0,
			total: 0,
		}
	})
	
	shopRents.value.forEach(rent => {
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
		.sort((a, b) => b.paid - a.paid)
})

// Format currency
const formatCurrency = (amount) => {
	return formatNumber(amount || 0)
}

// Format date
const formatDate = (dateString) => {
	if (!dateString) return '-'
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'short', 
		day: 'numeric' 
	})
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
		console.error('Error fetching dashboard data:', error)
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
