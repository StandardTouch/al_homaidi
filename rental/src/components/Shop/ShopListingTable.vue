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
              <div v-if="column.key === 'actions'" class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('edit', row)"
                  title="Edit Shop"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('delete', row)"
                  title="Delete Shop"
                >
                  <Trash2 class="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <div 
                v-else 
                class="leading-5 text-sm"
                :class="{
                  'bg-red-50 px-2 py-1 rounded': column.key === 'pending_balance' && row.pending_balance_raw > 0,
                  'bg-green-50 px-2 py-1 rounded': column.key === 'pending_balance' && row.pending_balance_raw === 0
                }"
              >
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
import { ListView, ListRows, ListRow, ListRowItem, ListHeader, ListHeaderItem, Button } from 'frappe-ui';
import { computed, reactive } from 'vue';
import { formatNumber } from '@/utils';
import { Edit, Trash2 } from 'lucide-vue-next';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    shopRents: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    }
})

const emit = defineEmits(['edit', 'delete'])

const columns = reactive([
    { label: 'Sl. No', key: 'sl_no', width: 80, minWidth: 80, align: 'center', resizable: true },
    { label: 'Shop Name + Location + Area(sqm)', key: 'shop_name', width: 250, minWidth: 200, resizable: true },
    { label: 'Ejar Contract No', key: 'ejar_contract_no', width: 150, minWidth: 130, resizable: true },
    { label: 'Base Rent', key: 'base_rent', width: 120, minWidth: 100, align: 'right', resizable: true },
    { label: 'VAT', key: 'vat', width: 100, minWidth: 80, align: 'right', resizable: true },
    { label: 'Total Amount', key: 'total_amount', width: 140, minWidth: 120, align: 'right', resizable: true },
    { label: 'Term Type', key: 'term_type', width: 140, minWidth: 120, resizable: true },
    { label: 'Pending Balance', key: 'pending_balance', width: 100, minWidth: 100, align: 'right', resizable: true },
    { label: 'Actions', key: 'actions', width: 120, minWidth: 100, align: 'center', resizable: false },
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
        const vatAmount = item.base_rent && item.vat_percentage 
            ? (item.base_rent * (item.vat_percentage / 100))
            : 0
        
        // Combine shop name, location, and area
        const shopInfo = item.shop_name 
            ? `${item.shop_name} (${item.location || ''} + ${item.area_sqm ? formatNumber(item.area_sqm) : '0'} sqm)`
            : '-'
        
        // Calculate pending balance from unpaid shop rents
        const unpaidRents = (props.shopRents || []).filter(rent => 
            rent.shop_id === item.id && 
            (rent.payment_status === 'Un Paid' || rent.payment_status === 'Unpaid' || !rent.payment_status)
        )
        const pendingBalance = unpaidRents.reduce((sum, rent) => {
            return sum + (parseFloat(rent.total_amount) || 0)
        }, 0)
        
        return {
            ...item,
            sl_no: index + 1,
            shop_name: shopInfo,
            location: item.location || '-', // Keep for editing
            location_raw: item.location, // Keep original value for editing
            area_sqm: item.area_sqm ? formatNumber(item.area_sqm) : '0',
            area_sqm_raw: item.area_sqm, // Keep original value for editing
            ejar_contract_no: item.ejar_contract_no || '-',
            base_rent: formatNumber(item.base_rent || 0),
            base_rent_raw: item.base_rent, // Keep original value for editing
            vat: item.vat_percentage ? `${formatNumber(item.vat_percentage)}%` : '0%',
            total_amount: formatNumber(item.total_amount || 0),
            total_amount_raw: item.total_amount, // Keep original value for editing
            term_type: item.term_type || '-',
            pending_balance: formatNumber(pendingBalance),
            pending_balance_raw: pendingBalance, // Keep raw value for conditional styling
        }
    })
})
</script>
