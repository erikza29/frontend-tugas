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
          <h2>{{ l.judul }}</h2>
          <p class="desc">{{ l.deskripsi }}</p>
        </div>

        <div class="card-info">
          <p><strong>📍 Lokasi:</strong> {{ l.lokasi }}</p>
          <p><strong>💰 Gaji:</strong> Rp {{ formatRupiah(l.gaji) }}</p>
          <p><strong>🗓 Deadline:</strong> {{ l.deadline }}</p>
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
  top: 20px;
  right: 20px;
  background: linear-gradient(90deg, #fffb00, #ec1414);
  color: white;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  animation: slideDown 0.4s ease;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* === Layout Utama === */
.loker-container {
  max-width: 1100px;
  margin: auto;
  padding: 30px 20px;
  font-family: "Poppins", sans-serif;
  text-align: center;
}

/* === Judul === */
.loker-container h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #1d4ed8, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

/* === Search dan Tambah === */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 10px;
}
.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  transition: 0.3s;
}
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
.btn-add {
  background: linear-gradient(90deg, #16a34a, #22c55e);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #fff;
  font-weight: 600;
  transition: 0.3s;
}
.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
}

/* === Loading & Error === */
.loading {
  color: #2563eb;
  font-weight: 600;
}
.error {
  color: red;
  font-weight: 600;
}

/* === Grid Loker === */
.loker-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* === Kartu Loker === */
.loker-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: 0.25s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
}
.loker-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
}
.loker-card h2 {
  font-size: 1.1rem;
  color: #1e3a8a;
  margin-bottom: 6px;
}
.desc {
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loker-card p {
  font-size: 0.85rem;
  color: #374151;
  margin: 3px 0;
}
.card-info {
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
}

/* === Tombol Aksi === */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.action-buttons button {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: 0.25s;
}
.btn-edit {
  background: #facc15;
  color: #000;
}
.btn-delete {
  background: #dc2626;
  color: #fff;
}
.btn-pelamar {
  background: #2563eb;
  color: #fff;
}
.action-buttons button:hover {
  opacity: 0.9;
  transform: scale(1.04);
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
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  position: relative;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
}

/* === Pelamar === */
.pelamar-card {
  border: 2px solid #eee;
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: 0.3s ease;
}
.pelamar-card.accepted {
  border-color: #16a34a;
  background: #f0fff4;
}
.pelamar-card.rejected {
  border-color: #dc2626;
  background: #fff5f5;
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
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin-right: 10px;
  font-size: 18px;
}
.status-label {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}
.status-label.diterima {
  background: #16a34a;
  color: white;
}
.status-label.ditolak {
  background: #dc2626;
  color: white;
}

/* === Tombol dalam Modal === */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.25s;
}
.btn.terima {
  background: #16a34a;
}
.btn.tolak {
  background: #dc2626;
}
.btn.profil {
  background: #0ea5e9;
}
.btn.profil:hover {
  background: #0284c7;
}
.btn.active {
  opacity: 0.9;
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
