<script setup>
import {onMounted} from "vue";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';

const props = defineProps({
    data: Object
});

onMounted(() => {
    document.querySelectorAll('pre').forEach((block) => {
        if (block.dataset.highlighted) {
            delete block.dataset.highlighted;
        }
        hljs.highlightElement(block);
    });
});
</script>
<template>
    <div class="wysiwyg-wrap" v-mathjax v-html="props.data.content"></div>
</template>
<style>
.wysiwyg-wrap pre {
    overflow-x: auto;
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #6b7280 transparent; /* thumb and track colors */
}
.wysiwyg-wrap pre::-webkit-scrollbar {
    height: 6px;
}

.wysiwyg-wrap pre::-webkit-scrollbar-track {
    background: transparent;
}

.wysiwyg-wrap pre::-webkit-scrollbar-thumb {
    background-color: #6b7280; /* Tailwind gray-500 */
    border-radius: 4px;
}

.wysiwyg-wrap pre {
    overflow-x: scroll;
}
.wysiwyg-wrap figcaption {
    display: none;
}
.wysiwyg-wrap ul {
    margin-bottom: 25px;
}
.wysiwyg-wrap ul li p {
    margin: 0;
}
.wysiwyg-wrap ul li {
    list-style: disc;
    margin-left: 20px;
}
.wysiwyg-wrap h1, .wysiwyg-wrap h2, .wysiwyg-wrap h3, .wysiwyg-wrap h4, .wysiwyg-wrap h5, .wysiwyg-wrap h6 {
    line-height: 1.5;
}
.wysiwyg-wrap h1 {
    font-size: 36px;
    margin: 30px 0 15px 0;
    font-weight: bold;
}
.wysiwyg-wrap h2 {
    font-size: 36px;
    margin: 30px 0 15px 0;
    font-weight: bold;
}
.wysiwyg-wrap h3 {
    font-size: 28px;
    margin: 30px 0 15px 0;
    font-weight: bold;
}
.wysiwyg-wrap p {
    margin-bottom: 8px;
}

.wysiwyg-wrap a {
    text-decoration: underline;
}
</style>
