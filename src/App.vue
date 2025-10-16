<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from "@/components/Navbar.vue"

const route = useRoute()

// Sembunyikan navbar di halaman login & register
const showNavbar = computed(() => {
  const hiddenPages = ['/login', '/register']
  return !hiddenPages.includes(route.path)
})
</script>

<template>
  <Navbar v-if="showNavbar" />
  <router-view />
</template>
