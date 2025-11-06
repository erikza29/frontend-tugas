<template>
  <div class="job-wrapper">
    <!-- Banner -->
    <div class="banner-section">
      <div class="banner">
        <button class="btn-back" @click="$router.back()">⬅ Kembali</button>
        <h2>{{ loker?.judul }}</h2>
      </div>
    </div>

    <!-- Konten Utama -->
    <div class="main-content">
      <!-- Kolom Kiri -->
      <div class="left-column">
        <div class="description">
          <h3>Deskripsi Pekerjaan</h3>
          <div class="description-content">
            <p>{{ loker?.deskripsi }}</p>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan -->
      <div class="right-column">
        <div class="detail-card">
          <h3>Detail Pekerjaan</h3>
          <div class="detail-info">
            <p><span>📍 Lokasi :</span> {{ loker?.lokasi }}</p>
            <p><span>💰 Gaji :</span> Rp {{ formatRupiah(loker?.gaji) }}</p>
            <p><span>⏳ Deadline :</span> {{ loker?.deadline }}</p>
          </div>
          <button class="apply-button" @click="lamarLoker">🚀 Lamar Sekarang</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "LokerDetail",
  data() {
    return { loker: null };
  },
  methods: {
    async getDetailLoker() {
      try {
        const res = await api.get(`/lokers/${this.$route.params.id}`);
        this.loker = res.data.data || res.data;
      } catch (err) {
        console.error("Gagal ambil detail loker:", err);
        alert("Gagal memuat detail loker");
      }
    },
    async lamarLoker() {
      try {
        await api.post(
          "/lamar",
          { loker_id: this.$route.params.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Lamaran berhasil dikirim!");
      } catch (err) {
        alert(`Gagal melamar: ${err.response?.data?.message || "Terjadi kesalahan"}`);
      }
    },
    formatRupiah(angka) {
      if (!angka) return 0;
      return new Intl.NumberFormat("id-ID").format(angka);
    },
  },
  mounted() {
    this.getDetailLoker();
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.job-wrapper {
  font-family: "Poppins", sans-serif;
  background: #f9fdfe;
  min-height: 100vh;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* === Banner === */
.banner-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.banner {
  background: linear-gradient(to bottom, #a0e6f6, #f9ffff);
  border-radius: 20px;
  padding: 35px 60px;
  color: white;
  text-align: center;
  position: relative;
  width: 80%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  color: black;
}

.btn-back {
  position: absolute;
  left: 25px;
  top: 25px;
  background: #4789B2;
  color: rgb(255, 255, 255);
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.4);
}

.banner h2 {
  font-size: 1.8rem;
  font-weight: 600;
  word-break: break-word;
}

/* === Layout Utama === */
.main-content {
  width: 80%;
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* === Deskripsi === */
.description {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  height: 400px;
  display: flex;
  flex-direction: column;
}

.description h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a4d5c;
  margin-bottom: 1rem;
}

.description-content {
  flex: 1;
  overflow-y: auto;
  color: #2d5a68;
  line-height: 1.7;
  text-align: justify;
  padding-right: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

/* scrollbar halus */
.description-content::-webkit-scrollbar {
  width: 6px;
}
.description-content::-webkit-scrollbar-thumb {
  background: #86c5cf;
  border-radius: 3px;
}

/* === Detail Card === */
.detail-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.detail-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a4d5c;
  margin-bottom: 1rem;
}

.detail-info {
  text-align: left;
  margin-bottom: 1.5rem;
}

.detail-info p {
  margin-bottom: 0.8rem;
  color: #2d5a68;
}

.detail-info span {
  font-weight: 600;
  color: #164c5b;
}

/* === Tombol Lamar === */
.apply-button {
  width: 100%;
  background: linear-gradient(to right, #4789b2, #60d2dc);
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}


.apply-button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* === Responsif === */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .description {
    height: auto;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .banner {
    width: 90%;
    padding: 25px;
  }
  .banner h2 {
    font-size: 1.3rem;
  }
  .main-content {
    width: 90%;
  }
}
</style>
