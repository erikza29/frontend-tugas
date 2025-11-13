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
        <h1>{{ profil.nama }}</h1>
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

export default {
  name: "ProfilView",
  data() {
    return {
      profil: null,
      rating: { average: 0, count: 0 },
      showFotoModal: false,
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
.profil-page { max-width: 900px; margin: 2rem auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 2.5rem; font-family: "Poppins", sans-serif; }
.profil-header { display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1.5rem; }
.profil-photo img { width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 3px solid #4f46e5; cursor: pointer; transition: transform 0.3s; }
.profil-photo img:hover { transform: scale(1.05); }
.profil-default { width: 130px; height: 130px; border-radius: 50%; background: #f3f4f6; color: #6b7280; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.profil-info { flex: 1; }
.profil-info h1 { font-size: 1.6rem; font-weight: 600; color: #111827; }
.rating-wrapper { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
.stars { display: flex; gap: 4px; font-size: 1.2rem; color: #d1d5db; }
.stars .fa-star.active { color: #facc15; }
.rating-text { font-size: 0.9rem; color: #4b5563; }
.edit-btn { margin-top: 1rem; background: #10b981; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.edit-btn:hover { background: #059669; transform: scale(1.03); }
.profil-body { margin-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.profil-card { background: #f9fafb; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; }
.profil-card h2 { font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 0.8rem; }
.profil-card ul { padding-left: 1.2rem; }
.profil-card li { color: #374151; margin-bottom: 0.4rem; }
.loading { text-align: center; padding: 2rem; font-size: 1.1rem; color: #6b7280; }

/* Modal Foto Profil */
.foto-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.foto-modal-content {
  position: relative;
  width: 45vw;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  animation: zoomIn 0.3s ease;
  border-radius: 12px;
  background: #000;
}

.foto-modal-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.foto-modal-content .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

@keyframes zoomIn {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
