<template>
  <div class="profil-page" v-if="profil">
    <div class="profil-header">
      <div class="profil-photo" @click="openFotoModal">
        <img
          v-if="profil.gambar_url"
          :src="profil.gambar_url"
          alt="Foto Profil"
        />
        <div v-else class="profil-default">No Photo</div>
      </div>
      <div class="profil-info">
        <div class="identity">
          <div class="identity-left">
            <h1>{{ profil.nama }}</h1>
          </div>  
          <div class="identity-right">
            <img :src=icwa alt="" >
            <h1>{{ profil.whatsapp }}</h1>
          </div>
        </div>
        

        <div class="rating-wrapper">
          <div class="stars">
            <i
              v-for="n in 5"
              :key="n"
              class="fas fa-star"
              :class="{ active: n <= Math.round(rating.average) }"
            ></i>
          </div>
          <span class="rating-text">
            {{ rating.average.toFixed(1) }} dari {{ rating.count }} penilai
          </span>
        </div>
        <button class="edit-btn" @click="goToEdit">
          <i class="fas fa-edit"></i> Edit Profil
        </button>
      </div>
    </div>

    <div class="profil-body">
      <div class="profil-card">
        <h2>Tentang Saya</h2>
        <p>{{ profil.deskripsi || "Belum ada deskripsi yang ditulis." }}</p>
      </div>

      <div class="profil-card" v-if="profil.riwayat && profil.riwayat.length">
        <h2>📚 Riwayat Pekerjaan</h2>
        <ul>
          <li v-for="(item, index) in profil.riwayat" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal Foto Profil -->
    <div v-if="showFotoModal" class="foto-modal" @click.self="closeFotoModal">
      <div class="foto-modal-content">
        <button class="close-btn" @click="closeFotoModal">✖</button>
        <img :src="profil.gambar_url" alt="Foto Profil" />
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>Memuat data profil...</p>
  </div>
</template>

<script>
import api from "@/API/api";
import icwa from "@/assets/ic_wa.png";
export default {
  name: "ProfilView",
  data() {
    return {
      profil: null,
      rating: { average: 0, count: 0 },
      showFotoModal: false,
      icwa,
    };
  },
  async mounted() {
    await this.getProfil();
    await this.getRating();
  },
  methods: {
    async getProfil() {
      const res = await api.get("/profil", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.profil = res.data?.data || {};
    },
    async getRating() {
      const res = await api.get(`/rating/user/${localStorage.getItem("user_id")}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      this.rating = {
        average: res.data?.average_rating || 0,
        count: res.data?.total || 0,
      };
    },
    goToEdit() {
      this.$router.push("/profil/edit");
    },
    openFotoModal() {
      if (!this.profil.gambar_url) return;
      this.showFotoModal = true;
    },
    closeFotoModal() {
      this.showFotoModal = false;
    },
  },
};
</script>

<style scoped>

/* ===========================
   PROFILE PAGE WRAPPER
=========================== */
.profil-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  font-family: "Poppins", sans-serif;
}

/* ===========================
   HEADER & PHOTO
=========================== */
.profil-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Foto Profil */
.profil-photo img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
  cursor: pointer;
  transition: transform 0.3s;
}

.profil-photo img:hover {
  transform: scale(1.05);
}

/* Default Foto */
.profil-default {
  width: 130px;
  height: 130px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

/* ===========================
   PROFILE INFO
=========================== */
.profil-info {
  flex: 1;
}

.profil-info h1 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #111827;
}

/* Rating */
.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stars {
  display: flex;
  gap: 4px;
  font-size: 1.2rem;
  color: #d1d5db;
}

.stars .fa-star.active {
  color: #facc15;
}

.rating-text {
  font-size: 0.9rem;
  color: #4b5563;
}

/* Edit Button */
.edit-btn {
  margin-top: 1rem;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.edit-btn:hover {
  background: #059669;
  transform: scale(1.03);
}

/* ===========================
   BODY & CARD
=========================== */
.profil-body {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profil-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.profil-card h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.8rem;
}

.profil-card ul {
  padding-left: 1.2rem;
}

.profil-card li {
  margin-bottom: 0.4rem;
  color: #374151;
}

/* Loading */
.loading {
  padding: 2rem;
  text-align: center;
  font-size: 1.1rem;
  color: #6b7280;
}

/* ===========================
   MODAL FOTO PROFIL
=========================== */
.foto-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.7);
}

.foto-modal-content {
  position: relative;
  width: 45vw;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #000;
  border-radius: 12px;
  animation: zoomIn 0.3s ease;
}

.foto-modal-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Tombol Close */
.foto-modal-content .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 10px;
  font-size: 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* Animasi */
@keyframes zoomIn {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.identity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;           /* 👉 teks panjang bisa turun */
  gap: 1rem;

}

.identity-left,
.identity-right {
  display: flex;

  border-radius: 6px;
  color: white;
  word-break: break-word;    /* 👉 pecah kata panjang */
  overflow-wrap: break-word; 
  align-items: center;
  /* 👉 pastikan tetap wrap */
}

/* kiri */
.identity-left {
  flex: 1;                   /* 👉 fleksibel agar rapi */
  min-width: 200px;
}

.identity-left h1 {
  font-size: 25px;
  font-weight: 600;
}
.identity-right h1 {
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  color: rgb(255, 255, 255);
}

/* kanan */
.identity-right {
  width: fit-content;
  background: linear-gradient(135deg, #128C7E, #25D366);
  display: flex;
  padding: 1px 10px;
  max-width: 200px;          /* 👉 biar tidak terlalu lebar */
  min-width: 120px;
  text-align: right;
  justify-content: center;
}

.identity-right img {
  width:20px;
  height: 20px;
  margin-right: 10px;
}

</style>

