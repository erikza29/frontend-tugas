```vue
<template>
  <div class="job-wrapper">
    <div class="job-hero">
      <button class="btn-back" @click="$router.back()">⬅ Kembali</button>
      <div class="hero-content">
        <div class="company-logo">💼</div>
        <div>
          <h1 class="job-title">{{ loker?.judul }}</h1>
          <p class="job-subtitle">{{ loker?.lokasi }} • Rp {{ formatRupiah(loker?.gaji) }}</p>
        </div>
      </div>
    </div>

    <div class="job-container">
      <div class="job-left glass-card">
        <h2>Deskripsi Pekerjaan</h2>
        <p>{{ loker?.deskripsi }}</p>
      </div>

      <div class="job-right glass-card">
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
        alert(err.response?.data?.message || "Gagal melamar, coba lagi.");
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
  font-family: "Poppins", sans-serif;
  color: #f0f4f9;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  min-height: 100vh;
  padding-bottom: 50px;
}

.job-hero {
  background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
  backdrop-filter: blur(12px);
  color: white;
  padding: 40px;
  border-radius: 0 0 40px 40px;
  margin-bottom: 40px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-back {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.3s;
}
.btn-back:hover { background: rgba(255, 255, 255, 0.4); }

.hero-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.company-logo {
  background: rgba(255, 255, 255, 0.2);
  font-size: 34px;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.job-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0;
}

.job-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 6px;
}

.job-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: auto;
  padding: 0 25px;
}

.glass-card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.25);
  animation: fadeUp 0.6s ease;
}

.job-left h2 {
  margin-bottom: 15px;
  font-size: 22px;
  color: #fff;
}

.job-left p {
  line-height: 1.7;
  color: #f0f0f0;
  text-align: justify;
}

.job-right h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #fff;
}

.job-right ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.job-right li {
  margin: 10px 0;
  font-size: 15px;
  color: #eee;
}

.job-right span {
  font-weight: 600;
  margin-right: 6px;
  color: #ffd166;
}

.btn-apply {
  width: 100%;
  background: linear-gradient(135deg, #ff6a00, #ee0979);
  border: none;
  color: white;
  font-size: 16px;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
}
.btn-apply:hover {
  background: linear-gradient(135deg, #ee0979, #ff6a00);
  transform: translateY(-3px) scale(1.03);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
```
