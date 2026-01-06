<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <Tooltip :text="'Total Shops'">
            <NumberChart class="border rounded-md" :config="{ title: 'Total Shops', value: 0 }" />
        </Tooltip>
        <Tooltip :text="'Pending Rents (Year End)'">
            <NumberChart class="border rounded-md" :config="{ title: 'Pending Rents', value: 0 }" />
        </Tooltip>
        <Tooltip :text="'Total Paid To Date'">
            <NumberChart class="border rounded-md" :config="{
                title: 'Total Rents',
                value: 0,
            }" />
        </Tooltip>
        <Tooltip :text="'Total Payments'">
            <NumberChart class="border rounded-md" :config="{
                title: 'Total Payments',
                value: 0,
            }" />
        </Tooltip>
    </div>
</template>
<script setup>
import {
    Breadcrumbs,
    createResource,
    NumberChart,
    Tooltip,
} from 'frappe-ui'
import { computed } from 'vue'
</script>
