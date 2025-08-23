<template>
    <div
        class="fixed top-31 mt-4 left ml-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 space-y-4"
    >
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">Live Traffic Stats</h2>
            <button
                @click="toggleCollapse"
                class="text-gray-600 text-sm font-semibold px-2 py-1 rounded hover:bg-gray-200 transition"
            >
                {{ collapsed ? "Show" : "Hide" }}
            </button>
        </div>

        <div v-if="!collapsed" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-xl p-3 shadow text-center">
                <p class="text-xs text-gray-500">Total Requests</p>
                <p class="text-lg font-bold text-gray-800">{{ TrafficStatsStore.requests }}</p>
            </div>
            <div class="bg-white rounded-xl p-3 shadow text-center">
                <p class="text-xs text-gray-500">Connections</p>
                <p class="text-lg font-bold text-green-600">{{ TrafficStatsStore.connections }}</p>
            </div>
            <div class="bg-white rounded-xl p-3 shadow text-center">
                <p class="text-xs text-gray-500">Servers</p>
                <p class="text-lg font-bold text-blue-600">{{ TrafficStatsStore.servers }}</p>
            </div>
<!--            <div class="bg-white rounded-xl p-3 shadow text-center col-span-2 sm:col-span-1">-->
<!--                <p class="text-xs text-gray-500">Top Country</p>-->
<!--                <p class="text-lg font-bold">{{ stats.topCountry }}</p>-->
<!--            </div>-->
<!--            <div class="bg-white rounded-xl p-3 shadow text-center col-span-2 sm:col-span-2">-->
<!--                <p class="text-xs text-gray-500">Last Updated</p>-->
<!--                <p class="text-sm text-gray-700">{{ stats.updatedAt }}</p>-->
<!--            </div>-->
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import TrafficStatsStore from "./TrafficStatsStore.js";

const collapsed = ref(false)

const toggleCollapse = () => {
    collapsed.value = !collapsed.value
}

// Replace this with live reactive data
const stats = ref({
    total: 123456,
    perMinute: 87,
    countries: 42,
    topCountry: 'United States',
    updatedAt: new Date().toLocaleTimeString()
})
</script>
