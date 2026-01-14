<template>
    <div
        class="flex h-full flex-col justify-between transition-all duration-300 ease-in-out border-r bg-surface-menu-bar"
        :class="sidebarStore.isSidebarCollapsed ? 'w-14' : 'w-56'"
    >
        <div class="flex flex-col overflow-hidden" :class="sidebarStore.isSidebarCollapsed ? 'items-center' : ''">
            <UserDropdown :isCollapsed="sidebarStore.isSidebarCollapsed" />
            <div v-if="links" class="flex flex-col">
                <div class="mx-2 my-2.5">
                    <nav class="space-y-1">
                        <div v-for="item in links.items">
                            <SidebarLink :link="item" :isCollapsed="sidebarStore.isSidebarCollapsed" />
                        </div>
                    </nav>
                </div>
            </div>
        </div>
        <div class="m-2 flex flex-col gap-1">
            <div
                class="flex justify-end items-center mt-4"
                :class="sidebarStore.isSidebarCollapsed ? 'flex-col space-y-3' : 'flex-row'"
            >
                <Tooltip :text="sidebarStore.isSidebarCollapsed ? 'Expand' : 'Collapse'">
                    <CollapseSidebar
                        class="size-4 text-ink-gray-7 duration-300 stroke-1.5 ease-in-out cursor-pointer"
                        :class="{
                            '[transform:rotateY(180deg)]': sidebarStore.isSidebarCollapsed
                        }"
                        @click="toggleSidebar()"
                    />
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSidebar } from '@/stores/sidebar'
import { Tooltip } from 'frappe-ui'
import { ref, onMounted } from 'vue'

import UserDropdown from '@/components/Sidebar/UserDropdown.vue'
import CollapseSidebar from '@/components/Icons/CollapseSidebar.vue'
import SidebarLink from '@/components/Sidebar/SidebarLink.vue'

let sidebarStore = useSidebar()
const links = ref(null)

onMounted(() => {
    links.value = {
        items: [
            {
                label: 'Dashboard',
                icon: 'Home',
                to: '/',
                activeFor: ['Home']
            },
            {
                label: 'Shops',
                icon: 'Store',
                to: '/shops',
                activeFor: ['ShopsList']
            },
            {
                label: 'Shop Rents',
                icon: 'Banknote',
                to: '/shop-rents',
                activeFor: ['ShopRentsList']
            },
            {
                label: 'Finance Report',
                icon: 'BarChart',
                to: '/finance-report',
                activeFor: ['Finance Report']
            },
            {
                label: 'Settings',
                icon: 'Settings',
                to: '/settings',
                activeFor: ['Settings']
            }
        ]
    }
})

const toggleSidebar = () => {
    sidebarStore.isSidebarCollapsed = !sidebarStore.isSidebarCollapsed
    localStorage.setItem('isSidebarCollapsed', JSON.stringify(sidebarStore.isSidebarCollapsed))
}
</script>
