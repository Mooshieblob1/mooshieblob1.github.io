<template>
    <div id="DigitalClock">{{ time }}</div>
</template>

<script setup lang="ts">
import '~/assets/css/output.css';
import { ref, onMounted } from 'vue';

const time = ref('');

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    time.value =
        hours.toString().padStart(2, '0') +
        ':' +
        minutes.toString().padStart(2, '0') +
        ':' +
        seconds.toString().padStart(2, '0');
}

onMounted(() => {
    // Call updateClock immediately to set the initial time
    updateClock();

    // Set interval to update the clock every second
    setInterval(updateClock, 1000);
});
</script>

<style scoped>
/* Add any styles for the clock here */
</style>
