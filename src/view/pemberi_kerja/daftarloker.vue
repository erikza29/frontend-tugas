<template>
  <div class="loker-container">
    <h1>Daftar Lowongan Kerja</h1>

    <!-- Tombol tambah -->
    <div class="add-button-container">
      <button @click="tambahLoker()" class="btn-add">Tambah Lowongan</button>
    </div>

    <div v-if="loading" class="loading">Memuat data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && lokerList.length > 0" class="loker-list">
      <div v-for="l in lokerList" :key="l.id" class="loker-card">
        <h2>{{ l.judul }}</h2>
        <p class="desc">{{ l.deskripsi }}</p>
        <p><strong>Lokasi:</strong> {{ l.lokasi }}</p>
        <p><strong>Gaji:</strong> Rp {{ formatRupiah(l.gaji) }}</p>
        <p><strong>Deadline:</strong> {{ l.deadline }}</p>

        <div class="action-buttons">
          <button @click="editLoker(l.id)" class="btn-edit">Edit</button>
          <button @click="hapusLoker(l.id)" class="btn-delete">Hapus</button>
          <button @click="lihatPelamar(l.id)" class="btn-pelamar">Lihat Pelamar</button>
        </div>
      </div>
    </div>

    <p v-if="!loading && lokerList.length === 0">Belum ada lowongan kerja.</p>

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
              <button
                @click="lihatProfil(p.user.id)"
                class="btn profil"
              >
                Lihat Profil
              </button>

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
      showModal: false,
      modalLoker: {},
      pelamars: [],
    };
  },
  async mounted() {
    await this.getLoker();
  },
  methods: {
    async getLoker() {
      this.loading = true;
      try {
        const res = await api.get("/lokers");
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
        await api.delete(`/lokers/${id}`);
        this.lokerList = this.lokerList.filter((l) => l.id !== id);
        alert("Lowongan berhasil dihapus");
      } catch (err) {
        alert("Gagal menghapus lowongan");
      }
    },

    async lihatPelamar(lokerId) {
      try {
        const res = await api.get(`/pelamar/${lokerId}`);
        if (res.data.success) {
          this.modalLoker = this.lokerList.find((l) => l.id === lokerId);
          this.pelamars = res.data.data.map(p => ({ ...p, loading: false, target: null }));
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
      this.$router.push(`/profil/${userId}`);
    },
  },
};
</script>

<style scoped>
.loker-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  text-align: center;
  font-family: "Poppins", sans-serif;
}
.loker-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.loker-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.action-buttons button {
  margin-right: 5px;
  padding: 8px 12px;
  border-radius:5px;
  border:none;
  cursor:pointer;
  color:#fff;
}
.btn-edit { background: #ffc107; color:#000; }
.btn-delete { background: #dc3545; }
.btn-pelamar { background: #007bff; }
.btn-add {
  background: #28a745;
  padding:10px 20px;
  border:none;
  border-radius:5px;
  cursor:pointer;
  color:#fff;
  font-weight:600;
  margin-bottom: 1rem;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
}
.modal-content {
  background:#fff;
  padding:25px;
  border-radius:12px;
  width:90%;
  max-width:550px;
  position:relative;
  box-shadow:0 8px 30px rgba(0,0,0,0.3);
}
.close-btn {
  position:absolute;
  top:10px;
  right:10px;
  background:red;
  color:#fff;
  border:none;
  padding:6px 10px;
  border-radius:50%;
  cursor:pointer;
  font-weight:bold;
}
.pelamar-card {
  border: 2px solid #eee;
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
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
  box-shadow: 0 0 8px rgba(0,0,0,0.15);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
