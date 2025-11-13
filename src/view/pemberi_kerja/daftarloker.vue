<template>
  <div class="loker-container">
    <!-- === Popup Sambutan === -->
    <transition name="fade">
      <div v-if="showPopup" class="popup-welcome">
        👋 Apa kabar boss 😎
      </div>
    </transition>

    <h1>Daftar Lowongan Kerja</h1>

    <!-- Tombol tambah dan search -->
    <div class="top-bar">
      <input
        v-model="search"
        type="text"
        placeholder="🔍 Cari lowongan berdasarkan judul atau lokasi..."
        class="search-input"
      />
      <button @click="tambahLoker()" class="btn-add">+ Tambah Lowongan</button>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && filteredLoker.length > 0" class="loker-list">
      <div v-for="l in filteredLoker" :key="l.id" class="loker-card">
        <div class="card-header">
          <h2 class="job-title">{{ l.judul }}</h2>
          <p class="desc">{{ l.deskripsi }}</p>
        </div>

        <div class="card-info">
          <p><strong>Lokasi:</strong> {{ l.lokasi }}</p>
          <p><strong> Gaji:</strong> Rp {{ formatRupiah(l.gaji) }}</p>
          <p><strong> Deadline:</strong> {{ l.deadline }}</p>
        </div>

        <div class="action-buttons">
          <button @click="editLoker(l.id)" class="btn-edit">Edit</button>
          <button @click="hapusLoker(l.id)" class="btn-delete">Hapus</button>
          <button @click="lihatPelamar(l.id)" class="btn-pelamar">Lihat Pelamar</button>
        </div>
      </div>
    </div>

    <p v-if="!loading && filteredLoker.length === 0">Belum ada lowongan kerja.</p>

    <!-- Modal daftar pelamar -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Pelamar Lowongan: {{ modalLoker.judul }}</h3>
        <button class="close-btn" @click="closeModal">✖</button>

        <div v-if="pelamars.length === 0">
          <p>Belum ada pelamar.</p>
        </div>

        <div v-else>
          <div
            v-for="p in pelamars"
            :key="p.id"
            class="pelamar-card"
            :class="{
              accepted: p.status === 'diterima',
              rejected: p.status === 'ditolak'
            }"
          >
            <div class="pelamar-header">
              <div class="avatar">{{ p.user.name.charAt(0).toUpperCase() }}</div>
              <div class="info">
                <p class="nama">{{ p.user.name }}</p>
                <p class="email">{{ p.user.email }}</p>
              </div>

              <span
                v-if="p.status"
                class="status-label"
                :class="{
                  diterima: p.status === 'diterima',
                  ditolak: p.status === 'ditolak'
                }"
              >
                {{ p.status === 'diterima' ? '✔ Diterima' : '✖ Ditolak' }}
              </span>
            </div>

            <div class="actions">
              <button @click="lihatProfil(p.user.id)" class="btn profil">Lihat Profil</button>
              <button
                @click="updateStatus(p.id, 'diterima')"
                :disabled="p.loading"
                class="btn terima"
                :class="{ active: p.status === 'diterima' }"
              >
                {{ p.loading && p.target === 'diterima' ? 'Memproses...' : 'Terima' }}
              </button>
              <button
                @click="updateStatus(p.id, 'ditolak')"
                :disabled="p.loading"
                class="btn tolak"
                :class="{ active: p.status === 'ditolak' }"
              >
                {{ p.loading && p.target === 'ditolak' ? 'Memproses...' : 'Tolak' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "LokerList",
  data() {
    return {
      lokerList: [],
      loading: false,
      error: "",
      search: "",
      showModal: false,
      modalLoker: {},
      pelamars: [],
      showPopup: false, // Popup sambutan
    };
  },
  async mounted() {
    await this.getLoker();
    this.showWelcomePopup();
  },
  computed: {
    filteredLoker() {
      const q = this.search.toLowerCase();
      return this.lokerList.filter(
        (l) =>
          l.judul.toLowerCase().includes(q) ||
          l.lokasi.toLowerCase().includes(q)
      );
    },
  },
  methods: {
    async getLoker() {
      this.loading = true;
      try {
        const res = await api.get("/loker");
        if (res.data.success) {
          this.lokerList = res.data.data;
        } else {
          this.error = res.data.message || "Gagal memuat data loker";
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Terjadi kesalahan server";
      } finally {
        this.loading = false;
      }
    },
    formatRupiah(angka) {
      return new Intl.NumberFormat("id-ID").format(angka);
    },
    tambahLoker() {
      this.$router.push("/tambahloker");
    },
    editLoker(id) {
      this.$router.push(`/pemberi-kerja/edit-loker/${id}`);
    },
    async hapusLoker(id) {
      if (!confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) return;
      try {
        await api.delete(`/loker/${id}`);
        this.lokerList = this.lokerList.filter((l) => l.id !== id);
        alert("Lowongan berhasil dihapus");
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus lowongan");
      }
    },
    async lihatPelamar(lokerId) {
      try {
        const res = await api.get(`/pelamar/${lokerId}`);
        if (res.data.success) {
          this.modalLoker = this.lokerList.find((l) => l.id === lokerId);
          this.pelamars = res.data.data.map((p) => ({
            ...p,
            loading: false,
            target: null,
          }));
          this.showModal = true;
        } else {
          alert(res.data.message || "Gagal memuat pelamar");
        }
      } catch {
        alert("Terjadi kesalahan server");
      }
    },
    closeModal() {
      this.showModal = false;
      this.modalLoker = {};
      this.pelamars = [];
    },
    async updateStatus(lamaranId, status) {
      const p = this.pelamars.find((x) => x.id === lamaranId);
      if (!p) return;
      p.loading = true;
      p.target = status;
      try {
        const token = localStorage.getItem("token");
        await api.put(`/lamar/${lamaranId}/status/${status}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        p.status = status;

        // Jika diterima, tutup lowongan
        if (status === "diterima") {
          await api.put(`/loker/${this.modalLoker.id}/status`, { status: "tutup" }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Pelamar diterima, lowongan ditutup!");
          this.modalLoker.status = "tutup";
        } 
        // Jika ditolak, buka kembali lowongan
        else if (status === "ditolak") {
          await api.put(`/loker/${this.modalLoker.id}/status`, { status: "aktif" }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Pekerjaan dibatalkan, lowongan dibuka kembali.");
          this.modalLoker.status = "aktif";
        }

      } catch {
        alert("Gagal mengubah status pelamar");
      } finally {
        p.loading = false;
        p.target = null;
      }
    },

    lihatProfil(userId) {
      this.$router.push(`/profil/${userId}?loker_id=${this.modalLoker.id}`);
    },

    // === POPUP SAMBUTAN ===
    showWelcomePopup() {
      // tampilkan popup tiap kali user login / ganti role
      this.showPopup = true;
      setTimeout(() => {
        this.showPopup = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
/* === Popup Sambutan === */
.popup-welcome {
  position: fixed;
  top: 60px; /* turun sedikit dari atas */
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ff6a00, #ff1e56);
  color: #fff;
  padding: 16px 28px;
  border-radius: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 25px rgba(255, 70, 40, 0.6);
  z-index: 9999;
  animation: popSlide 0.4s ease;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-welcome::before {
  content: "⚡";
  font-size: 1.3rem;
}

@keyframes popSlide {
  from {
    opacity: 0;
    transform: translate(-50%, -20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}


/* === Layout Utama === */
.loker-container {
  max-width: 1150px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  font-family: "Poppins", sans-serif;
  color: #1e3a8a;
}

.loker-container h1 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

/* === Search dan Tambah === */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  min-width: 320px;
  padding: 0.9rem 1.2rem;
  border-radius: 1rem;
  border: none;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
  font-size: 1rem;
  transition: 0.3s ease;
}
.search-input:focus {
  background: #fff;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3);
  outline: none;
}

.btn-add {
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.4);
}

/* === Grid Loker === */
.loker-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1.5rem;
}

/* === Kartu Lowongan === */
.loker-card {
  background: linear-gradient(to bottom, #a7e1ed, #f3fdfe);
  border: 3px solid #a7e1ed;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: 0.25s ease;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 300px; /* tinggi sama semua */
}
.loker-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

.card-header {
  display: flex;
  flex-direction: column; /* Atur vertikal */
  justify-content: space-between; /* Rata atas & bawah */
  height: 300px; /* contoh tinggi container */

}
.card-header h2 {
  font-size: 1.2rem;
  color: #1e3a8a;
  font-weight: 700;
  margin-bottom: 0.5rem;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* maksimal 2 baris */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desc {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 1rem;

  display: -webkit-box;
  -webkit-line-clamp: 1; /* maksimal 3 baris */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* === Info Lowongan === */
.card-info {
  background: #e0f7fa;
  border-radius: 0.8rem;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;

  flex-shrink: 0; /* supaya tetap tidak mengecil */
}
.card-info p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #1e3a8a;

  white-space: nowrap; /* 1 baris saja */
  overflow: hidden;
  text-overflow: ellipsis;
}


/* === Tombol Aksi === */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  flex-shrink: 0; /* supaya tetap di bawah */
}
.action-buttons button {
  flex: 1;
  padding: 0.5rem 0.7rem;
  border-radius: 0.8rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.25s ease;
}
.btn-edit {
  background: linear-gradient(to right, #facc15, #fde047);
  color: #1e3a8a;
}
.btn-delete {
  background: linear-gradient(to right, #ef4444, #dc2626);
  color: #fff;
}
.btn-pelamar {
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  color: #fff;
}
.action-buttons button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* === Modal === */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
}

/* === Pelamar Card === */
.pelamar-card {
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
  border-radius: 0.8rem;
  border: 2px solid #a7e1ed;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: 0.3s ease;
}
.pelamar-card.accepted {
  border-color: #22c55e;
  background: #ecfdf5;
}
.pelamar-card.rejected {
  border-color: #ef4444;
  background: #fef2f2;
}

.pelamar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}
.status-label {
  padding: 6px 12px;
  border-radius: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-label.diterima {
  background: #22c55e;
  color: white;
}
.status-label.ditolak {
  background: #ef4444;
  color: white;
}

/* === Tombol Modal === */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.btn {
  flex: 1;
  border: none;
  padding: 0.7rem;
  border-radius: 0.8rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: 0.25s ease;
}
.btn.profil {
  background: linear-gradient(to right, #06b6d4, #3b82f6);
}
.btn.terima {
  background: linear-gradient(to right, #16a34a, #22c55e);
}
.btn.tolak {
  background: linear-gradient(to right, #dc2626, #ef4444);
}
.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.3);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.job-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;

  display: -webkit-box;
  -webkit-line-clamp: 1; /* maksimal 2 baris */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>

