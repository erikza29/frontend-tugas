<template>
  <div class="profil-wrapper" v-if="profil">
    <div class="profil-container">
      <h1 class="title">Profil Saya</h1>

      <!-- Foto Profil -->
      <div class="foto-profil text-center">
        <img
          v-if="profil.gambar_url"
          :src="profil.gambar_url"
          alt="Foto Profil"
          class="profil-img"
        />
        <div v-else class="profil-default">Belum ada foto</div>
      </div>

      <!-- Data Profil -->
      <div class="info-profil">
        <p><strong>Nama:</strong> {{ profil.nama }}</p>
        <p><strong>Deskripsi:</strong> {{ profil.deskripsi || '-' }}</p>
      </div>

      <!-- Riwayat -->
      <div v-if="profil.riwayat && profil.riwayat.length" class="riwayat-box">
        <p><strong>Riwayat:</strong></p>
        <ul>
          <li v-for="(item, index) in profil.riwayat" :key="index">
            • {{ item }}
          </li>
        </ul>
      </div>

      <!-- Button Edit -->
      <button @click="goToEdit" class="edit-btn">Edit Profil</button>
    </div>
  </div>

  <div v-else class="loading">
    <p>Memuat data profil...</p>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "ProfilView",
  data() {
    return {
      profil: null,
      message: "",
    };
  },
  async mounted() {
    await this.getProfil();
  },
  methods: {
    async getProfil() {
  try {
    const res = await api.get("/profil", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    this.profil = res.data?.data || {
      nama: "",
      deskripsi: "",
      gambar_url: null,
      riwayat: [],
    };

    // ✅ Simpan foto ke localStorage
    if (this.profil.gambar_url) {
      localStorage.setItem("avatar_url", this.profil.gambar_url);
      window.dispatchEvent(new Event("avatar-changed"));
    }

  } catch (err) {
    console.error("Error getProfil:", err);
    this.message = err.response?.data?.message || "Terjadi kesalahan server";
  }
},

  },
};
</script>

<style scoped>
.profil-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-family: "Poppins", sans-serif;
}
.profil-container {
  width: 100%;
  max-width: 450px;
  background: #fff;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.title {
  text-align: center;
  font-size: 1.7rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
}
.profil-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4F46E5;
  margin: auto;
}
.profil-default {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  font-size: 0.9rem;
}
.info-profil {
  margin-top: 1.5rem;
}
.riwayat-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.riwayat-box ul {
  margin-top: 0.5rem;
  padding-left: 1rem;
}
.edit-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 12px;
  background: #10b981;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s;
}
.edit-btn:hover {
  background: #059669;
  transform: scale(1.02);
}
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6b7280;
}
</style>
