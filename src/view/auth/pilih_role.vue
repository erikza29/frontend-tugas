<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const role = ref("");

function selectRole(selected) {
  role.value = selected;
  localStorage.setItem("role", selected);

  // 🔥 trigger event supaya Navbar auto update tanpa refresh
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
        class="role-card pekerja"
        :class="{ selected: role === 'pekerja' }"
        @click="selectRole('pekerja')"
      >
        <i class="fas fa-user-tie"></i>
        <h3>Pekerja</h3>
        <p>Cari pekerjaan & peluang karir sesuai minat.</p>
      </div>

      <div
        class="role-card pemberi-kerja"
        :class="{ selected: role === 'pemberi_kerja' }"
        @click="selectRole('pemberi_kerja')"
      >
        <i class="fas fa-briefcase"></i>
        <h3>Pemberi Kerja</h3>
        <p>Rekrut talenta terbaik untuk perusahaan Anda.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}
.role-selection {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.role-card {
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  width: 200px;
  transition: 0.3s;
}
.role-card:hover {
  transform: translateY(-5px);
}
.role-card.selected {
  border-color: #007bff;
  background: #eef6ff;
}
</style>
