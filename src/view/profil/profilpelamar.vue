<template>
    <div class="profil-wrapper" v-if="profil">
      <div class="profil-container">
        <h1 class="title">Profil Pelamar</h1>
  
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
  
        <!-- Rating Section -->
        <div class="rating-section">
          <p class="rating-title">⭐ Rating Pelamar</p>
  
          <!-- Menampilkan rata-rata rating -->
          <div v-if="ratingData.average" class="rating-average">
            <span class="average-number">{{ ratingData.average.toFixed(1) }}</span>
            <span class="average-text">dari {{ ratingData.count }} penilai</span>
          </div>
  
          <!-- Input rating baru -->
          <div class="star-input">
            <i
              v-for="n in 5"
              :key="n"
              class="fas fa-star"
              :class="{ active: n <= userRating }"
              @click="setRating(n)"
            ></i>
          </div>
  
          <button
            v-if="userRating > 0"
            @click="submitRating"
            class="rating-btn"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Menyimpan..." : "Kirim Rating" }}
          </button>
        </div>
  
        <!-- Data Profil -->
        <div class="info-profil">
          <p><strong>Nama:</strong> {{ profil.nama }}</p>
          <p><strong>Deskripsi:</strong> {{ profil.deskripsi || "-" }}</p>
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
        ratingData: {
          average: 0,
          count: 0,
        },
        userRating: 0,
        isSubmitting: false,
      };
    },
    async mounted() {
      await this.getProfil();
      await this.getRating();
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
          // Ambil rata-rata rating user berdasarkan target_id
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
      setRating(n) {
        this.userRating = n;
      },
      async submitRating() {
        if (!this.userRating) return;
  
        const lokerId = this.$route.query.loker_id; // Ambil dari URL query
        if (!lokerId) {
          alert("ID Loker tidak ditemukan! Pastikan URL memiliki ?loker_id=...");
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
          await this.getRating();
        } catch (err) {
          console.error("❌ Gagal kirim rating:", err);
          alert(err.response?.data?.message || "Terjadi kesalahan saat mengirim rating.");
        } finally {
          this.isSubmitting = false;
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
    border: 3px solid #4f46e5;
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
  .loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #6b7280;
  }
  
  /* Rating Section */
  .rating-section {
    text-align: center;
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 10px;
    background: #f9fafb;
  }
  .rating-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .star-input {
    display: flex;
    justify-content: center;
    gap: 5px;
    font-size: 1.6rem;
    color: #d1d5db;
    margin: 0.5rem 0;
  }
  .star-input .fa-star {
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .star-input .fa-star.active {
    color: #facc15;
  }
  .rating-average {
    margin-bottom: 0.3rem;
    font-size: 0.95rem;
    color: #4b5563;
  }
  .average-number {
    font-weight: 700;
    color: #f59e0b;
    font-size: 1.2rem;
  }
  .rating-btn {
    margin-top: 0.5rem;
    background: #3b82f6;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .rating-btn:hover {
    background: #2563eb;
  }
  .rating-btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
  </style>
  