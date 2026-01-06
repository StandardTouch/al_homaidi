<template>
    <div class="w-full px-5 pt-5 pb-10">
        <div class="space-y-2">
            <div class="flex flex-col">
                <div class="text-xl font-bold text-ink-gray-9">
                    Hey, {{ user.data?.full_name }} 👋
                </div>

                <div class="text-lg text-ink-gray-6 leading-6">
                    Welcome to your dashboard
                </div>
            </div>
        </div>
        <div class="space-y-2">
            <DashboardStats />
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import DashboardStats from '@/components/DashboardStats.vue'

const user = inject<any>('$user')

</script>
