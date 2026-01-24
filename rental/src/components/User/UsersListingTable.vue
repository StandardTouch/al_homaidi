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
              title: 'No users found',
              description: 'Create a new user to get started',
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
              <div v-if="column.key === 'status'" class="flex items-center">
                <Badge
                  variant="solid"
                  :theme="row[column.key] === 'Active' ? 'green' : 'gray'"
                  size="sm"
                >
                  {{ row[column.key] }}
                </Badge>
              </div>
              <div v-else-if="column.key === 'actions'" class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('edit', row)"
                  title="Edit User"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('delete', row)"
                  title="Delete User"
                >
                  <Trash2 class="h-4 w-4 text-red-600" />
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
import { ListView, ListRows, ListRow, ListRowItem, ListHeader, ListHeaderItem, Button, Badge } from 'frappe-ui';
import { computed, reactive } from 'vue';
import { Edit, Trash2 } from 'lucide-vue-next';

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

const emit = defineEmits(['edit', 'delete'])

const columns = reactive([
    { label: 'Sl. No', key: 'sl_no', width: 80, minWidth: 80, align: 'center', resizable: true },
    { label: 'Full Name', key: 'full_name', width: 200, minWidth: 150, resizable: true },
    { label: 'Email', key: 'email', width: 250, minWidth: 200, resizable: true },
    { label: 'Status', key: 'status', width: 120, minWidth: 100, align: 'center', resizable: true },
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
        return {
            ...item,
            sl_no: index + 1,
            full_name: item.full_name || '-',
            email: item.email || '-',
            status: item.status || 'In Active',
        }
    })
})
</script>
