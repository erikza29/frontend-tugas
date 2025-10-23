<template>
    <div class="p-4 bg-white rounded-xl shadow-md w-full max-w-sm">
      <h2 class="text-lg font-semibold mb-3 text-center">Beri Rating</h2>
      <div class="flex justify-center gap-2 mb-4">
        <button
          v-for="n in 5"
          :key="n"
          @click="setRating(n)"
          class="text-3xl"
        >
          <span :class="n <= rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </button>
      </div>
      <button
        @click="submitRating"
        :disabled="loading || rating === 0"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Menyimpan...' : 'Kirim Rating' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import axios from "axios";
  
  const props = defineProps({
    targetId: { type: Number, required: true },
    lokerId: { type: Number, required: true },
  });
  
  const rating = ref(0);
  const loading = ref(false);
  
  function setRating(n) {
    rating.value = n;
  }
  
  async function submitRating() {
    if (!rating.value) return;
    loading.value = true;
    try {
      await axios.post("/api/rating", {
        target_id: props.targetId,
        loker_id: props.lokerId,
        rating: rating.value,
      });
      alert("Rating berhasil dikirim");
    } catch (e) {
      alert("Gagal mengirim rating");
    } finally {
      loading.value = false;
    }
  }
  </script>
  
  <style scoped>
  button {
    transition: 0.2s;
  }
  </style>
  