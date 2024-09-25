<template>
    <div id="clock" />
</template>

<script setup lang="ts">
import '~/assets/css/output.css';
import { onMounted } from "vue";

onMounted(() => {
    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const timeString =
            hours.toString().padStart(2, "0") +
            ":" +
            minutes.toString().padStart(2, "0") +
            ":" +
            seconds.toString().padStart(2, "0");
        const clockElement = document.getElementById("clock");
        if (clockElement !== null) {
            clockElement.textContent = timeString;
        }
    }

    // Call updateClock immediately to set the initial time
    updateClock();

    // Set interval to update the clock every second
    setInterval(updateClock, 1000);
});
</script>

<style scoped>
/* Add any styles for the clock here */
</style>