<template>
  <div class="profil-page" v-if="profil">
    <div class="profil-card">
      <div class="header">
        <div class="avatar">
          <img
            v-if="profil.gambar_url"
            :src="profil.gambar_url"
            alt="Foto Profil"
          />
          <div v-else class="avatar-placeholder">No Image</div>
        </div>
        <div class="user-info">
          <h2 class="name">{{ profil.nama }}</h2>
          <p class="desc">{{ profil.deskripsi || "Belum ada deskripsi." }}</p>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="rating-box">
        <h3>⭐ Rating Pelamar</h3>

        <div v-if="ratingData.count > 0" class="rating-average">
          <span class="average-number">{{ ratingData.average.toFixed(1) }}</span>
          <span class="average-text">dari {{ ratingData.count }} penilai</span>
        </div>
        <div v-else class="rating-empty">Belum ada rating</div>

        <div class="stars">
          <i
            v-for="n in 5"
            :key="n"
            class="fas fa-star star"
            :class="{ active: n <= userRating, disabled: alreadyRated }"
            @click="!alreadyRated && setRating(n)"
          ></i>
        </div>

        <button
          v-if="!alreadyRated && userRating > 0"
          @click="submitRating"
          class="btn-rate"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Menyimpan..." : "Kirim Rating" }}
        </button>

        <p v-if="alreadyRated" class="rated-text">
          ✅ Anda sudah memberi rating untuk pelamar ini.
        </p>
      </div>

      <!-- Riwayat -->
      <div v-if="profil.riwayat?.length" class="riwayat">
        <h3>📜 Riwayat Pekerjaan</h3>
        <ul>
          <li v-for="(item, i) in profil.riwayat" :key="i">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>Memuat data pelamar...</p>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "ProfilPelamar",
  props: ["id"],
  data() {
    return {
      profil: null,
      ratingData: { average: 0, count: 0 },
      userRating: 0,
      isSubmitting: false,
      alreadyRated: false,
    };
  },
  async mounted() {
    await this.getProfil();
    await this.getRating();
    await this.checkAlreadyRated();
  },
  methods: {
    async getProfil() {
      try {
        const res = await api.get(`/profil/${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.profil = res.data?.data || {};
      } catch (err) {
        console.error("Error getProfil:", err);
      }
    },
    async getRating() {
      try {
        const res = await api.get(`/rating/user/${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.ratingData = {
          average: res.data?.average_rating || 0,
          count: res.data?.total || 0,
        };
      } catch (err) {
        console.warn("Belum ada rating atau error getRating:", err);
      }
    },
    async checkAlreadyRated() {
      try {
        const res = await api.get(`/rating/check/${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.alreadyRated = res.data?.alreadyRated || false;
      } catch (err) {
        console.warn("Error check rating:", err);
      }
    },
    setRating(n) {
      this.userRating = n;
    },
    async submitRating() {
      if (!this.userRating) return;
      const lokerId = this.$route.query.loker_id;
      if (!lokerId) {
        alert("ID Loker tidak ditemukan! Tambahkan ?loker_id=... di URL");
        return;
      }

      this.isSubmitting = true;
      try {
        await api.post(
          "/rating",
          {
            target_id: this.$route.params.id,
            loker_id: lokerId,
            rating: this.userRating,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        alert("✅ Rating berhasil dikirim!");
        this.userRating = 0;
        this.alreadyRated = true;
        await this.getRating();
      } catch (err) {
        alert(err.response?.data?.message || "Terjadi kesalahan saat mengirim rating.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.profil-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2ff, #f9fafb);
  font-family: "Poppins", sans-serif;
}

.profil-card {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  animation: fadeIn 0.4s ease-in-out;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
  transition: transform 0.3s;
}
.avatar img:hover {
  transform: scale(1.05);
}
.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6b7280;
}

.user-info .name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}
.user-info .desc {
  color: #4b5563;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Rating */
.rating-box {
  text-align: center;
  margin-top: 1.8rem;
  background: #f9fafb;
  padding: 1.2rem;
  border-radius: 12px;
}
.rating-box h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}
.rating-average {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.average-number {
  color: #f59e0b;
  font-weight: 700;
  font-size: 1.3rem;
  margin-right: 5px;
}
.rating-empty {
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 0.5rem 0 0.8rem;
}
.star {
  font-size: 1.8rem;
  color: #d1d5db;
  cursor: pointer;
  transition: transform 0.2s, color 0.3s;
}
.star:hover {
  transform: scale(1.2);
  color: #facc15;
}
.star.active {
  color: #fbbf24;
  animation: pop 0.3s ease;
}
.star.disabled {
  pointer-events: none;
  opacity: 0.4;
}

.btn-rate {
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.1s;
}
.btn-rate:hover {
  background: linear-gradient(90deg, #4f46e5, #4338ca);
  transform: scale(1.03);
}
.btn-rate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rated-text {
  margin-top: 0.6rem;
  color: #10b981;
  font-weight: 500;
}

/* Riwayat */
.riwayat {
  margin-top: 1.8rem;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1.2rem;
}
.riwayat h3 {
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-weight: 600;
}
.riwayat ul {
  padding-left: 1.2rem;
  color: #374151;
  font-size: 0.95rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.loading {
  text-align: center;
  font-size: 1.1rem;
  color: #6b7280;
  padding: 3rem;
}
</style>
