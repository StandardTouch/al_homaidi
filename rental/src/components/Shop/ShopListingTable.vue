<template>
 <div class="w-full overflow-x-auto md:overflow-x-visible">
   <div class="min-w-full md:w-full">
     <ListView 
      class="h-full w-full"
      :columns="columns"
      :rows="rows"
      :options="{
          selectable: true,
          showTooltip: true,
          resizeColumn: false,
          emptyState: {
              title: 'No records found',
              description: 'Create a new shop to get started',
              button: {
                  label: 'New Shop',
                  variant: 'solid',
                  onClick: () => {
                      console.log('New Shop')
                  },
              },
          },
      }"
      row-key="shop_name"
      />
   </div>
 </div>
</template>

<script setup>
import { ListView } from 'frappe-ui';
import { computed } from 'vue';
import { formatNumber } from '@/utils';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    }
})

const columns = [
    { label: 'Shop Name', key: 'shop_name', width: '150px', minWidth: '150px' },
    { label: 'Area (sqm)', key: 'area', width: '120px', minWidth: '100px' },
    { label: 'Base Rent', key: 'base_rent', width: '120px', minWidth: '100px' },
    { label: 'Payment Term', key: 'payment_term', width: '140px', minWidth: '120px' },
    { label: 'Total Amount Incl VAT', key: 'total_amount_including_vat', width: '180px', minWidth: '150px' },
    { label: 'Balance Amount', key: 'balance_amount', width: '150px', minWidth: '130px' },
]

const rows = computed(() => {
    
    const formatRow = (item) => ({
        ...item,
        area: item.area ? formatNumber(item.area) : '0',
        base_rent: formatNumber(item.base_rent || 0),
        total_amount_including_vat: formatNumber(item.total_amount_including_vat || 0),
        balance_amount: formatNumber(item.balance_amount || 0),
    })
    
    // Ensure we always return an array
    if (!props.items) {
        return []
    }
    if (Array.isArray(props.items)) {
        return props.items.map(formatRow)
    }
    // If items is an object with a data property, extract it
    if (props.items && props.items.data && Array.isArray(props.items.data)) {
        return props.items.data.map(formatRow)
    }
    return []
})
</script>
