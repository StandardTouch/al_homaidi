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
					Bulk Import Shops
				</div>
			</div>
		</template>
		<template #body-content>
			<div class="text-base">
				<div class="mb-6">
					<div class="text-sm text-ink-gray-7 mb-4">
						Upload a CSV file with shop data. Download the test CSV file to see the required format.
					</div>
					<div class="flex items-center gap-4 mb-4">
						<Button
							variant="outline"
							@click="downloadTestCSV"
							:loading="downloadingCSV"
						>
							<template #prefix>
								<Download class="h-4 w-4" />
							</template>
							Download Test CSV
						</Button>
					</div>
				</div>
				<div class="mb-4">
					<div class="text-xs text-ink-gray-5 mb-1">
						CSV File
					</div>
					<input
						ref="fileInput"
						type="file"
						accept=".csv"
						@change="handleFileSelect"
						class="hidden"
					/>
					<div v-if="!selectedFile" class="border-2 border-dashed border-ink-gray-3 rounded-lg p-6 text-center">
						<Button
							variant="outline"
							@click="$refs.fileInput.click()"
						>
							<template #prefix>
								<Upload class="h-4 w-4" />
							</template>
							Choose CSV File
						</Button>
					</div>
					<div v-else class="border border-ink-gray-3 rounded-lg p-4 flex items-center justify-between">
						<div class="flex items-center">
							<FileText class="h-5 w-5 text-ink-gray-7 mr-2" />
							<span class="text-sm">{{ selectedFile.name }}</span>
							<span class="text-xs text-ink-gray-5 ml-2">
								({{ formatFileSize(selectedFile.size) }})
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							@click="clearFile"
						>
							<X class="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div v-if="importErrors.length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div class="text-sm font-semibold text-red-900 mb-2">Import Errors:</div>
					<ul class="list-disc list-inside text-sm text-red-800">
						<li v-for="(error, index) in importErrors" :key="index">
							{{ error }}
						</li>
					</ul>
				</div>
				<div v-if="importPreview.length > 0" class="mb-4">
					<div class="text-sm font-semibold text-ink-gray-9 mb-2">
						Preview ({{ importPreview.length }} shops will be imported):
					</div>
					<div class="max-h-60 overflow-y-auto border border-ink-gray-3 rounded-lg">
						<table class="w-full text-sm">
							<thead class="bg-ink-gray-1">
								<tr>
									<th class="px-3 py-2 text-left">Shop Name</th>
									<th class="px-3 py-2 text-left">Location</th>
									<th class="px-3 py-2 text-right">Area</th>
									<th class="px-3 py-2 text-left">Ejar Contract No</th>
									<th class="px-3 py-2 text-right">Base Rent</th>
									<th class="px-3 py-2 text-right">VAT %</th>
									<th class="px-3 py-2 text-left">Term Type</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(shop, index) in importPreview" :key="index" class="border-t border-ink-gray-3">
									<td class="px-3 py-2">{{ shop.shop_name }}</td>
									<td class="px-3 py-2">{{ shop.location }}</td>
									<td class="px-3 py-2 text-right">{{ shop.area_sqm }}</td>
									<td class="px-3 py-2">{{ shop.ejar_contract_no }}</td>
									<td class="px-3 py-2 text-right">{{ formatNumber(shop.base_rent) }}</td>
									<td class="px-3 py-2 text-right">{{ shop.vat_percentage }}%</td>
									<td class="px-3 py-2">{{ shop.term_type }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</template>
		<template #actions="{ close }">
			<div class="pb-5 float-right flex gap-2">
				<Button variant="outline" @click="close">
					Cancel
				</Button>
				<Button 
					variant="solid" 
					@click="importShops(close)" 
					:loading="importing"
					:disabled="!selectedFile || importPreview.length === 0"
				>
					Import Shops
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import {
	Button,
	Dialog,
	toast,
} from 'frappe-ui'
import { ref, watch } from 'vue'
import { Upload, Download, FileText, X } from 'lucide-vue-next'
import { addShop } from '@/utils/dataService'
import { formatNumber } from '@/utils'

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

const fileInput = ref(null)
const selectedFile = ref(null)
const importing = ref(false)
const downloadingCSV = ref(false)
const importPreview = ref([])
const importErrors = ref([])

watch(() => props.modelValue, (newVal) => {
	if (!newVal) {
		clearFile()
	}
})

const handleFileSelect = (event) => {
	const file = event.target.files[0]
	if (!file) return
	
	if (!file.name.endsWith('.csv')) {
		toast.error('Please select a CSV file')
		return
	}
	
	selectedFile.value = file
	parseCSV(file)
}

const parseCSV = (file) => {
	const reader = new FileReader()
	reader.onload = (e) => {
		const text = e.target.result
		const lines = text.split('\n').filter(line => line.trim())
		
		if (lines.length < 2) {
			toast.error('CSV file must have at least a header row and one data row')
			importPreview.value = []
			importErrors.value = ['CSV file is empty or invalid']
			return
		}
		
		// Parse CSV line handling quoted values
		const parseCSVLine = (line) => {
			const result = []
			let current = ''
			let inQuotes = false
			
			for (let i = 0; i < line.length; i++) {
				const char = line[i]
				const nextChar = line[i + 1]
				
				if (char === '"') {
					if (inQuotes && nextChar === '"') {
						current += '"'
						i++ // Skip next quote
					} else {
						inQuotes = !inQuotes
					}
				} else if (char === ',' && !inQuotes) {
					result.push(current.trim())
					current = ''
				} else {
					current += char
				}
			}
			result.push(current.trim())
			return result
		}
		
		// Parse header
		const headers = parseCSVLine(lines[0])
		
		// Expected headers
		const expectedHeaders = [
			'Shop Name',
			'Location',
			'Area (sqm)',
			'Ejar Contract No',
			'Base Rent',
			'VAT %',
			'Term Type'
		]
		
		// Validate headers
		const headerMap = {}
		expectedHeaders.forEach(expectedHeader => {
			const index = headers.findIndex(h => h.toLowerCase() === expectedHeader.toLowerCase())
			if (index === -1) {
				importErrors.value.push(`Missing required column: ${expectedHeader}`)
			} else {
				headerMap[expectedHeader] = index
			}
		})
		
		if (importErrors.value.length > 0) {
			importPreview.value = []
			return
		}
		
		// Parse data rows
		const shops = []
		const errors = []
		
		for (let i = 1; i < lines.length; i++) {
			const values = parseCSVLine(lines[i])
			
			if (values.length < expectedHeaders.length) {
				errors.push(`Row ${i + 1}: Insufficient columns`)
				continue
			}
			
			const shopName = values[headerMap['Shop Name']]
			const location = values[headerMap['Location']]
			const areaSqm = values[headerMap['Area (sqm)']]
			const ejarContractNo = values[headerMap['Ejar Contract No']]
			const baseRent = values[headerMap['Base Rent']]
			const vatPercent = values[headerMap['VAT %']] || '15'
			const termType = values[headerMap['Term Type']]
			
			// Validation
			if (!shopName) {
				errors.push(`Row ${i + 1}: Shop Name is required`)
				continue
			}
			if (!location) {
				errors.push(`Row ${i + 1}: Location is required`)
				continue
			}
			if (!areaSqm || isNaN(parseFloat(areaSqm))) {
				errors.push(`Row ${i + 1}: Area (sqm) must be a valid number`)
				continue
			}
			if (!ejarContractNo) {
				errors.push(`Row ${i + 1}: Ejar Contract No is required`)
				continue
			}
			if (!baseRent || isNaN(parseFloat(baseRent))) {
				errors.push(`Row ${i + 1}: Base Rent must be a valid number`)
				continue
			}
			if (!termType || !['Once a Year', 'Twice a Year'].includes(termType)) {
				errors.push(`Row ${i + 1}: Term Type must be "Once a Year" or "Twice a Year"`)
				continue
			}
			
			// Calculate total amount
			const baseRentNum = parseFloat(baseRent)
			const vatPercentNum = parseFloat(vatPercent) || 15
			const vatAmount = baseRentNum * (vatPercentNum / 100)
			const singlePeriodAmount = baseRentNum + vatAmount
			const totalAmount = termType === 'Twice a Year' 
				? singlePeriodAmount * 2 
				: singlePeriodAmount
			
			shops.push({
				shop_name: shopName,
				location: location,
				area_sqm: parseFloat(areaSqm),
				ejar_contract_no: ejarContractNo,
				base_rent: baseRentNum,
				vat_percentage: vatPercentNum,
				term_type: termType,
				total_amount: totalAmount,
			})
		}
		
		importPreview.value = shops
		importErrors.value = errors
		
		if (shops.length === 0 && errors.length > 0) {
			toast.error('No valid shops found in CSV file')
		}
	}
	
	reader.readAsText(file)
}

const importShops = async (close) => {
	if (importPreview.value.length === 0) {
		toast.error('No shops to import')
		return
	}
	
	importing.value = true
	try {
		let successCount = 0
		let errorCount = 0
		
		for (const shop of importPreview.value) {
			try {
				await addShop(shop)
				successCount++
			} catch (error) {
				console.error('Error importing shop:', error)
				errorCount++
			}
		}
		
		if (successCount > 0) {
			toast.success(`Successfully imported ${successCount} shop(s)`)
		}
		if (errorCount > 0) {
			toast.error(`Failed to import ${errorCount} shop(s)`)
		}
		
		close()
		clearFile()
		props.onSuccess()
	} catch (error) {
		toast.error(error.message || 'Failed to import shops')
	} finally {
		importing.value = false
	}
}

const downloadTestCSV = () => {
	downloadingCSV.value = true
	try {
		const link = document.createElement('a')
		link.href = '/rental/test-shops-import.csv'
		link.download = 'test-shops-import.csv'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		toast.success('Test CSV file downloaded')
	} catch (error) {
		toast.error('Failed to download test CSV file')
	} finally {
		downloadingCSV.value = false
	}
}

const clearFile = () => {
	selectedFile.value = null
	importPreview.value = []
	importErrors.value = []
	if (fileInput.value) {
		fileInput.value.value = ''
	}
}

const formatFileSize = (bytes) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>
