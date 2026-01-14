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
              description: 'No rent records available',
          },
      }"
      row-key="name"
      >
      <ListRows>
        <ListRow :row="row" v-for="row in rows">
          <template #default="{ column, item }">
            <ListRowItem :item="row[column.key]" :align="column.align">
              <Badge
                v-if="column.key === 'payment_status'"
                variant="solid"
                :theme="row[column.key] === 'Paid' ? 'green' : 'gray'"
                size="sm"
              >
                {{ row[column.key] }}
              </Badge>
              <div v-else class="leading-5 text-sm">
                {{ row[column.key] }}
              </div>
            </ListRowItem>
          </template>
        </ListRow>
      </ListRows>
     </ListView>
   </div>
 </div>
</template>

<script setup>
import { ListView, ListRows, ListRow, ListRowItem, Badge } from 'frappe-ui';
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
    { label: 'Name', key: 'name', width: '150px', minWidth: '150px' },
    { label: 'Period Number', key: 'period_number', width: '120px', minWidth: '100px' },
    { label: 'Payment Status', key: 'payment_status', width: '140px', minWidth: '120px' },
    { label: 'Base Rent', key: 'base_rent', width: '120px', minWidth: '100px' },
    { label: 'Total Amount Incl VAT', key: 'total_amount_including_vat', width: '180px', minWidth: '150px' },
    { label: 'Payment Term', key: 'payment_term', width: '140px', minWidth: '120px' },
    { label: 'Paid Amount', key: 'paid_amount', width: '150px', minWidth: '130px' },
]

const rows = computed(() => {
    
    const formatRow = (item) => ({
        ...item,
        base_rent: formatNumber(item.base_rent || 0),
        total_amount_including_vat: formatNumber(item.total_amount_including_vat || 0),
        paid_amount: formatNumber(item.paid_amount || 0),
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
