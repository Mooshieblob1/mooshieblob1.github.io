<!--
    This component represents the navigation bar of the application.
    It includes links to various sections of the site, providing
    users with an easy way to navigate through the app.
-->

<template>
    <nav class="bg-transparent p-4 fixed top-0 right-0 w-full">
        <div class="container mx-auto flex justify-end items-center space-x-4">
            <div class="relative group">
                <nuxt-link to="/blog" class="text-white hover:text-gray-400 hover:text-xl hover:font-bold transition duration-300">
                    Blog
                </nuxt-link>
            </div>
            <div class="relative group">
                <a href="https://comfy.mooshieblob.com" class="text-white hover:text-gray-400 hover:text-xl hover:font-bold transition duration-300">
                    ComfyUI
                </a>
            </div>
            <div class="relative group">
                <nuxt-link to="/images" class="text-white hover:text-gray-400 hover:text-xl hover:font-bold transition duration-300">
                    Images
                </nuxt-link>
            </div>
        </div>
    </nav>
</template>

<script>
import '~/assets/css/output.css';

export default {
    name: 'Navbar'
}
</script>

<style>
/* Add any additional styles here if needed */
</style>