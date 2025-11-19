<template>
  <div class="loker-container">

    <transition name="toast-pop">
      <div v-if="actionToast.show" :class="['action-toast', actionToast.type]">
        <span>{{ actionToast.message }}</span>
      </div>
    </transition>



    <transition name="popup-zoom">
      <div v-if="showPopup" class="popup-welcome">
        <span>👋 Apa kabar boss 😎</span>
      </div>
    </transition>


    <h1>Daftar Lowongan Kerja</h1>

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

        <div class="card-image">
          <img :src="l.gambar_url ? l.gambar_url : gibran" class="job-image" />
        </div>

        <div class="card-content">
          <h2 class="job-title">{{ l.judul }}</h2>
          <p class="desc">{{ l.deskripsi }}</p>
          <div class="info-detail">
            <p><strong>Lokasi:</strong> {{ l.lokasi }}</p>
            <p><strong>Gaji:</strong> Rp {{ formatRupiah(l.gaji) }}</p>
            <p><strong>Deadline:</strong> {{ formatDeadline(l) }}</p>

          </div>
        </div>

        <div class="action-buttons">
          <button @click="editLoker(l.id)" class="btn-edit">Edit</button>
          <button @click="hapusLoker(l.id)" class="btn-delete">Hapus</button>
          <button @click="lihatPelamar(l.id)" class="btn-pelamar">Pelamar</button>
        </div>
      </div>
    </div>

    <p v-if="!loading && filteredLoker.length === 0">
      Belum ada lowongan kerja.
    </p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Pelamar Lowongan: {{ modalLoker.judul }}</h3>
        <button class="close-btn" @click="closeModal">✖</button>

        <div v-if="pelamars.length === 0">
          <p>Belum ada pelamar.</p>
        </div>

        <div v-else>
          <div v-for="p in pelamars" :key="p.id"
            class="pelamar-card"
            :class="{
              accepted: p.status === 'diterima',
              rejected: p.status === 'ditolak'
            }"
          >
            <div class="pelamar-header">
              <div class="worker">
                <div class="avatar">{{ p.user.name.charAt(0).toUpperCase() }}</div>
                <div class="info">
                  <p class="nama">{{ p.user.name }}</p>
                  <p class="email">{{ p.user.email }}</p>
                </div>
              </div>

              <span
                v-if="p.status === 'diterima' || p.status === 'ditolak'"
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
import gibran from "@/assets/gibran.png";

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
      showPopup: false,
      popupMessage: "",
      gibran,
      baseURL: import.meta.env.VITE_API_URL,

      actionToast: {
        show: false,
        type: "",     
        message: "",
      },
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
    formatDeadline(l) {
      if (!l.deadline_unit || !l.deadline_value) {
        return "Tidak ada deadline";
      }

      const typeLabel = {
        jam: "jam",
        hari: "hari",
        bulan: "bulan"
      };

      return `${l.deadline_value} ${typeLabel[l.deadline_unit]}`;
    },

    triggerPopup(msg) {
      this.popupMessage = msg;
      this.showPopup = true;
      setTimeout(() => {
        this.showPopup = false;
      }, 2500);
    },

    triggerToast(type, msg) {
      this.actionToast.type = type;   
      this.actionToast.message = msg;
      this.actionToast.show = true;

      setTimeout(() => {
        this.actionToast.show = false;
      }, 3000);
    },


    async getLoker() {
      this.loading = true;
      try {
        const res = await api.get("/loker");

        if (res.data.success) {
          this.lokerList = res.data.data;
        } else {
          this.error = res.data.message || "Gagal memuat data loker";
          this.triggerToast("danger", this.error);
        }

      } catch (err) {
        this.error = err.response?.data?.message || "Terjadi kesalahan server";
        this.triggerToast("danger", this.error);

      } finally {
        this.loading = false;
      }
    },

    formatRupiah(angka) {
      return new Intl.NumberFormat("id-ID").format(angka);
    },

    tambahLoker() {
      this.$router.push("/tambahloker");
      this.triggerToast("success", "Mode tambah lowongan");
    },

    editLoker(id) {
      this.$router.push(`/pemberi-kerja/edit-loker/${id}`);
      this.triggerToast("warning", "Mode edit lowongan");
    },

    async hapusLoker(id) {
      if (!confirm("Yakin ingin menghapus lowongan ini?")) return;

      try {
        await api.delete(`/loker/${id}`);
        this.lokerList = this.lokerList.filter((l) => l.id !== id);

        this.triggerToast("danger", "Lowongan berhasil dihapus!");

      } catch (err) {
        this.triggerToast("danger", "Gagal menghapus lowongan");
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
          this.triggerToast("danger", "Gagal memuat pelamar");
        }
      } catch {
        this.triggerToast("danger", "Terjadi kesalahan server");
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

        // 🔹 Update status pelamar
        await api.put(`/lamar/${lamaranId}/status/${status}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        p.status = status;

        // 🔹 Auto update status lowongan
        if (status === "diterima") {
          // Jika diterima → tutup lowongan
          await api.put(`/loker/${this.modalLoker.id}/status`, { status: "tutup" }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const idx = this.lokerList.findIndex(l => l.id === this.modalLoker.id);
          if (idx !== -1) this.lokerList[idx].status = "tutup";

          this.triggerToast("warning", "Lowongan telah ditutup karena pelamar diterima!");
        } 
        else if (status === "ditolak") {
          // Jika ditolak → pastikan lowongan tetap aktif
          await api.put(`/loker/${this.modalLoker.id}/status`, { status: "aktif" }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const idx = this.lokerList.findIndex(l => l.id === this.modalLoker.id);
          if (idx !== -1) this.lokerList[idx].status = "aktif";

          this.triggerToast("success", "Lowongan tetap aktif karena pelamar ditolak");
        }

        this.triggerToast("purple", "Status pelamar berhasil diperbarui!");

      } catch (err) {
        console.error(err);
        this.triggerToast("danger", "Gagal mengubah status pelamar");
      } finally {
        p.loading = false;
        p.target = null;
      }
    },



    lihatProfil(userId) {
      this.$router.push(`/profil/${userId}?loker_id=${this.modalLoker.id}`);
    },

    showWelcomePopup() {
      this.popupMessage = "Selamat datang!";
      this.showPopup = true;
      setTimeout(() => (this.showPopup = false), 3000);
    },
  },
};
</script>



<style scoped>
.popup-welcome {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  padding: 20px 35px;
  background: linear-gradient(135deg, #ff4e00, #ec9f05);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 0 18px rgba(255, 100, 0, 0.6);
  animation: popupFade 0.4s ease-out, popupFloat 2s infinite ease-in-out;
  z-index: 9999;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes popupFade {
  from { opacity: 0; transform: translateX(-50%) scale(0.8); }
  to   { opacity: 1; transform: translateX(-50%) scale(1); }
}

@keyframes popupFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(4px); }
}



.action-toast {
  position: fixed;
  bottom: 22px;
  right: 22px;
  padding: 14px 20px;
  color: white;
  font-weight: 600;
  min-width: 190px;
  border-radius: 14px;
  box-shadow: 0 0 20px rgba(0,0,0,0.35);
  animation: toastSlide 0.35s ease-out;
  z-index: 9999;
}

@keyframes toastSlide {
  from { transform: translateX(50px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}


.action-toast.success {
  background: linear-gradient(135deg, #00c853, #64dd17);
  box-shadow: 0 0 16px rgba(0, 255, 90, 0.55);
}

.action-toast.warning {
  background: linear-gradient(135deg, #ffca28, #ffb300);
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.55);
}

.action-toast.danger {
  background: linear-gradient(135deg, #ff1744, #d50000);
  box-shadow: 0 0 16px rgba(255, 40, 40, 0.55);
}

.action-toast.purple {
  background: linear-gradient(135deg, #8e24aa, #d500f9);
  box-shadow: 0 0 16px rgba(200, 0, 255, 0.55);
}

.loker-container {
  max-width: 85%;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.loker-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  width: 100%;
}

.loker-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;

}



.loker-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.25);
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.card-content {
  padding: 1rem 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.job-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-detail p {
  font-size: 0.88rem;
  color: #1e3a8a;
  margin-bottom: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.8rem 1rem 1rem;
}

.action-buttons button {
  flex: 1;
  padding: 0.6rem;
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

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
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
  justify-content: space-between;
  align-items: center;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color:white;
  font-weight: bold;
  font-size: 1.1rem;
  margin-right: 15px;
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
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.worker {
  display: flex;
  align-items: center;
}

@media (max-width: 480px) {
  .loker-container { max-width: 95%; }
  .loker-list { grid-template-columns: 1fr; }
  .top-bar { flex-direction: column; align-items: stretch; }
  .btn-add { width: 100%; }
}
</style>
