```vue
<template>
  <div class="job-wrapper">
    <!-- Header / Hero -->
    <div class="job-hero">
      <button class="btn-back" @click="$router.back()">⬅ Kembali</button>
      <div class="hero-content">
        <div class="company-logo">🛠️</div>
        <div>
          <h1 class="job-title">{{ loker?.judul }}</h1>
          
        </div>
      </div>
    </div>

    <!-- Konten utama -->
    <div class="job-container">
      <!-- Deskripsi -->
      <div class="job-left">
        <h2>Deskripsi Pekerjaan</h2>
        <p>{{ loker?.deskripsi }}</p>
      </div>

      <!-- Info ringkas -->
      <div class="job-right">
        <div class="info-card">
          <h3>Detail Pekerjaan</h3>
          <ul>
            <li><span>📍 Lokasi:</span> {{ loker?.lokasi }}</li>
            <li><span>💰 Gaji:</span> Rp {{ formatRupiah(loker?.gaji) }}</li>
            <li><span>⏳ Deadline:</span> {{ loker?.deadline }}</li>
          </ul>
          <button class="btn-apply" @click="lamarLoker">🚀 Lamar Sekarang</button>
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
    return {
      loker: null,
    };
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
        const res = await api.post(
          "/lamar",
          { loker_id: this.$route.params.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Lamaran berhasil dikirim!");
      } catch (err) {
        if (err.response) {
          alert(`Gagal melamar: ${err.response.data.message || "Terjadi kesalahan"}`);
        } else {
          alert("Gagal melamar, coba lagi.");
        }
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
.job-wrapper {
  font-family: "Segoe UI", sans-serif;
  color: #2c3e50;
}

/* Hero */
.job-hero {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  color: white;
  padding: 30px;
  border-radius: 0 0 30px 30px;
  margin-bottom: 30px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.btn-back {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.company-logo {
  background: white;
  color: #3498db;
  font-size: 30px;
  border-radius: 12px;
  padding: 12px;
}

.job-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.job-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 5px;
}

/* Container */
.job-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  max-width: 1100px;
  margin: auto;
  padding: 0 20px;
}

.job-left h2 {
  margin-bottom: 15px;
  font-size: 22px;
  color: #34495e;
}

.job-left p {
  line-height: 1.6;
  color: #555;
  text-align: justify;
}

/* Info ringkas */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}

.info-card h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #2c3e50;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.info-card li {
  margin: 10px 0;
  font-size: 15px;
  color: #444;
}

.info-card span {
  font-weight: 600;
  margin-right: 6px;
}

.btn-apply {
  width: 100%;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  color: white;
  font-size: 16px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-apply:hover {
  background: linear-gradient(135deg, #27ae60, #1e8449);
  transform: scale(1.03);
}
</style>
```
