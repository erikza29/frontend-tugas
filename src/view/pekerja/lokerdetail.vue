<template>
  <div class="job-wrapper">
    <!-- Banner -->
    <div class="banner-section">
      <button class="btn-close" @click="$router.back()" > <p>⬅</p></button>

      <div class="banner">
        <h2>{{ loker?.judul }}</h2>
      </div>
    </div>

    <!-- Konten Utama -->
    <div class="main-content">
      <!-- Kolom Kiri -->
      <div class="left-column">
        <div class="image-left" v-if="loker">
            <img :src="loker?.gambar_url || gibran" alt=""  class="clickable-image"
             @click="openPreview(loker?.gambar_url || gibran)">
        </div>
      </div>

      <!-- Kolom Kanan -->
      <div class="right-column">
        <div class="detail-card">
          <h3>Detail Pekerjaan</h3>
          <div class="detail-info">
            <p><span>Lokasi :</span> {{ loker?.lokasi }}</p>
            <p><span>Gaji :</span> Rp {{ formatRupiah(loker?.gaji) }}</p>
            <p><span>Deadline :</span> {{ formatDeadline(loker) }}</p>

          </div>
          <button class="apply-button" @click="lamarLoker">Lamar Sekarang</button>
        </div>
      </div>
    </div>
    <div class="contact-info">
      <div class="contact">
        <a
          :href="`https://wa.me/${formatWhatsapp(loker?.user?.whatsapp)}`"
          class="contact-number-phone"
        >
          Whatsapp : {{ loker?.user?.whatsapp || '-' }}
        </a>

        <a
          :href="`https://wa.me/${formatWhatsapp(loker?.user?.whatsapp)}`"
          class="contact-name"
        >
          {{ loker?.user?.profil?.nama || 'Tanpa Nama' }}
        </a>

      </div>     
      
      <p>Klik untuk menghubungi!</p>
  
    </div>  
    <div class="main-content-bottom">
      <div class="description">
          <h3>Deskripsi Pekerjaan</h3>
          <div class="description-content">
            <p>{{ loker?.deskripsi }}</p>
          </div>
        </div>
    </div>
  </div>
  <!-- === Fullscreen Image Viewer === -->
<!-- === Fullscreen Image Modal === -->
<div v-if="previewImage" class="image-modal" @click="closePreview">
  <img 
    :src="previewImage" 
    class="image-preview"
    @click.stop
  >
  <button class="close-preview" @click="closePreview">×</button>
</div>


</template>

<script>
import api from "@/API/api";
import gibran from '@/assets/gibran.png';

export default {
  name: "LokerDetail",
  data() {
    return { 
      loker: null,
      gibran,
      previewImage: null,

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

    formatDeadline(loker) {
      if (!loker || !loker.deadline_value) return "Tidak ada";

      const unit = loker.deadline_unit || loker.deadline_type || "";

      const unitMap = {
        hours: "Jam",
        days: "Hari",
        months: "Bulan",
      };

      const label = unitMap[unit] || "Hari"; // fallback default

      return `${loker.deadline_value} ${label}`;
    },

    openPreview(src) {
      this.previewImage = src;
    },

    closePreview() {
      this.previewImage = null;
    },


    formatRupiah(angka) {
      if (!angka) return 0;
      return new Intl.NumberFormat("id-ID").format(angka);
    },

    // 🔥 Tambahan untuk format nomor WA (agar auto wa.me)
    formatWhatsapp(no) {
      if (!no) return "";
      no = no.replace(/\D/g, ""); // buang karakter aneh
      if (no.startsWith("0")) return "62" + no.substring(1);
      return no;
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
  align-items: center;
  justify-content: space-between;
  
}

.banner {
  background: linear-gradient(to bottom, #a0e6f6, #f9ffff);
  padding: 35px 60px;
  color: white;
  text-align: center;
  position: relative;
  width: 80%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  color: black;
  margin-right: 19vh;
  border-end-start-radius: 20px;
  border-end-end-radius: 20px;
  margin-top: 0px;
  height: fit-content;
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
.main-content-bottom {
  margin: 0px auto;
  margin-top: 2rem;
  width: 154vh;
  gap: 2rem;
  align-items: center;
  display: flex;
  justify-content: start;
}

/* === Deskripsi === */
.description {
  background: rgb(255, 255, 255);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
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
  margin-left: 0px;
  border-radius: 15px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  text-align: center;
  height: fit-content;
  display: flex;
  flex-direction: column;

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

.image-left {
  margin-right: 0px;
  padding-right: 0px;
}

.image-left img {
  width: 100vh;
  height: 45vh;
  object-fit: cover;     /* tetap crop */

  border-radius: 10px;
  overflow: hidden;
}


.contact {
  width: fit-content;

  color: white;
  font-size: 20px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  margin-right: 15px;
  justify-content: start;
  align-items: center;
  border:3px solid #60D2DC;

}

.contact-number-phone {
  font-size: 15px;
  background: linear-gradient(to right, #4789b2, #60d2dc);
  padding: 15px;
  border-radius: 10px;
  font-weight: 600;
  z-index: 3;
  text-decoration: none;
  color: white;
}
.contact-name {
  font-size: 15px;
  color: rgb(24, 23, 24);
  font-weight: 600;
  text-decoration: none;
  color: rgb(28, 27, 29);
  padding: 15px;
  border-radius: 10px;
}
.contact p {
  font-size: 15px;
  color: rgb(24, 23, 24);
  font-weight: 600;

  padding: 15px;
  border-radius: 10px;
}

.contact-info {
  width: 80%;
  display: flex;
  justify-content: start;
  align-items: center;
}

.contact-info p {
  color: gray;
  font-weight: 400;
}

.btn-close {
  display: flex;
  margin-left: 5vh;
  width: 10vh;
  height: 10vh;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 50px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(180deg, #70b7ff, #9cc7ff);
  box-shadow: 0 6px 18px rgba(30, 64, 175, 0.28);

  display: flex;
  align-items: center;
  justify-content: center;
  transition: .15s ease;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  font-weight: 600;
}
.btn-close:hover {
  transform: translateY(-3px) scale(1.05);
}
.btn-close:active {
  transform: scale(0.95);
}

/* === Fullscreen Image Modal === */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.image-preview {
  max-width: 95%;
  max-height: 95%;
  border-radius: 12px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.5);
  object-fit: contain; /* Jaga rasio asli */
  animation: zoomIn .18s ease;
}

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

.close-preview {
  position: fixed;
  top: 25px;
  right: 25px;
  background: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 30px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.clickable-image {
  cursor: zoom-in;
}


</style>
