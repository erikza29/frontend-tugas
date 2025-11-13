<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import pekerjaImg from "@/assets/pekerja.png";
import pemberiImg from "@/assets/pemberikerja.jpeg";

const router = useRouter();
const role = ref("");

function selectRole(selected) {
  role.value = selected;
  localStorage.setItem("role", selected);
  window.dispatchEvent(new Event("role-changed"));

  if (selected === "pekerja") {
    router.push("/lokerlist");
  } else if (selected === "pemberi_kerja") {
    router.push("/daftarloker");
  }
}
</script>

<template>
  <div class="role-page">
    <h2>Pilih Role</h2>

    <div class="role-selection">
      <div
        class="role-card"
        :class="{ selected: role === 'pekerja' }"
        @click="selectRole('pekerja')"
      >
        <img :src="pekerjaImg" alt="Pekerja" class="role-image" />
        <h3>Pekerja</h3>
        <p>Cari pekerjaan & peluang karir sesuai minat.</p>
      </div>

      <div
        class="role-card"
        :class="{ selected: role === 'pemberi_kerja' }"
        @click="selectRole('pemberi_kerja')"
      >
        <img :src="pemberiImg" alt="Pemberi Kerja" class="role-image" />
        <h3>Pemberi Kerja</h3>
        <p>Rekrut talenta terbaik untuk menyelesaikan pekerjaan Anda.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-page {
  text-align: center;
  padding: 40px 20px;
}

.role-selection {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 30px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.role-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  width: 280px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
}

.role-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.role-card.selected {
  border: 2px solid #007bff;
  background: #f0f7ff;
}

.role-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 15px;
  transition: transform 0.6s ease;
}

.role-card:hover .role-image {
  transform: scale(1.1);
}

h2 {
  font-size: 26px;
  font-weight: 600;
  color: #222;
}

h3 {
  margin: 10px 0 5px;
  color: #007bff;
}

p {
  font-size: 14px;
  color: #555;
}
</style>
