<script setup>

import BaseLayout from "@/Layouts/BaseLayout.vue";
import SEO from "@/Components/SEO.vue";
import TrafficMap from "@/Pages/TrafficMap/Components/TrafficMap.vue";

const props = defineProps({
    page: Object,
})
</script>

<template>
    <BaseLayout>
        <SEO :title="page?.title" :seo="page?.seo" />
        <TrafficMap/>
    </BaseLayout>
</template>

<style scoped>

</style>
