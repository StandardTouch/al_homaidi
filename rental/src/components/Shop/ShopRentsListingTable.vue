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
          resizeColumn: true,
          emptyState: {
              title: 'No records found',
              description: 'No rent records available',
          },
      }"
      row-key="id"
      >
      <ListHeader>
        <ListHeaderItem
          v-for="column in columns"
          :key="column.key"
          :item="column"
        />
      </ListHeader>
      <ListRows>
        <ListRow :row="row" v-for="row in rows" :key="row.id">
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
              <div v-else-if="column.key === 'actions'" class="flex items-center gap-1">
                <Button
                  v-if="row.payment_status !== 'Paid'"
                  variant="ghost"
                  size="sm"
                  @click="$emit('payNow', row)"
                  title="Pay Now"
                  class="bg-gray-300 text-gray-400 rounded-full"
                >
                  <DollarSign class="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('edit', row)"
                  title="Edit Rent"
                  class="bg-gray-300 text-gray-400 rounded-full"
                >
                  <Edit class="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('delete', row)"
                  title="Delete Rent"
                  class="bg-gray-300 text-gray-400 rounded-full"
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
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
import { ListView, ListRows, ListRow, ListRowItem, ListHeader, ListHeaderItem, Badge, Button } from 'frappe-ui';
import { computed, reactive } from 'vue';
import { formatNumber } from '@/utils';
import { DollarSign, Edit, Trash2 } from 'lucide-vue-next';

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

const emit = defineEmits(['payNow', 'edit', 'delete'])

const columns = reactive([
    { label: 'Sl. No', key: 'sl_no', width: 80, minWidth: 80, align: 'center', resizable: true },
    { label: 'Shop Name + Location + Area(Sqm)', key: 'shop_info', width: 250, minWidth: 200, resizable: true },
    { label: 'Total Amount', key: 'total_amount', width: 140, minWidth: 120, align: 'right', resizable: true },
    { label: 'Start Date', key: 'start_date', width: 120, minWidth: 100, resizable: true },
    { label: 'End Date', key: 'end_date', width: 120, minWidth: 100, resizable: true },
    { label: 'Payment Status', key: 'payment_status', width: 140, minWidth: 120, align: 'center', resizable: true },
    { label: 'Paid Date', key: 'paid_date', width: 120, minWidth: 100, resizable: true },
    { label: 'Reason', key: 'reason', width: 200, minWidth: 150, resizable: true },
    { label: 'Action', key: 'actions', width: 150, minWidth: 120, align: 'center', resizable: false },
])

const rows = computed(() => {
    // Ensure we always return an array
    if (!props.items) {
        return []
    }
    
    const itemsArray = Array.isArray(props.items) 
        ? props.items 
        : (props.items.data && Array.isArray(props.items.data) ? props.items.data : [])
    
    return itemsArray.map((item, index) => {
        const shopInfo = item.shop_name 
            ? `${item.shop_name} (${item.shop_location || ''} + ${item.shop_area || 0} sqm)`
            : '-'
        
        return {
            ...item,
            sl_no: index + 1,
            shop_info: shopInfo,
            total_amount: formatNumber(item.total_amount || 0),
            start_date: item.start_date || '-',
            end_date: item.end_date || '-',
            payment_status: item.payment_status || 'Un Paid',
            paid_date: item.paid_date || '-',
            reason: item.reason || '-',
        }
    })
})
</script>
