<template>
  <div class="container">
  
    <h1>Superadmin Panel</h1>

    <!-- 🔎 SEARCH BAR -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari data..."
          class="search-input"
        />
      </div>
    </div>

    <!-- SWITCH BUTTON -->
    <div class="switch-btns">
      <button :class="{active: activeView==='users'}" @click="activeView='users'">Users</button>
      <button :class="{active: activeView==='lokers'}" @click="activeView='lokers'">Lokers</button>
    </div>

    <!-- USERS -->
    <div v-if="activeView==='users'" class="card-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="card">
        <img :src="fullUrl(user.profil?.gambar_url)" alt="Profil" class="avatar"/>
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <div class="actions">
          <button class="delete" @click="deleteUser(user.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- LOKERS -->
    <div v-if="activeView==='lokers'" class="card-grid">
      <div 
        v-for="loker in filteredLokers" 
        :key="loker.id" 
        class="card"
        @click="openLokerDetail(loker.id)"
        style="cursor:pointer"
      >
        <img :src="fullUrl(loker.gambar_url)" alt="Loker" class="loker-img"/>
        <h3>{{ loker.judul }}</h3>

        <div class="user-info">
          <img :src="fullUrl(loker.user.profil?.gambar_url)" alt="Profil User" class="avatar"/>
          <span>{{ loker.user.name }}</span>
        </div>

        <div class="actions">
          <button class="delete" @click.stop="deleteLoker(loker.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- DETAIL LOKER POPUP -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>

        <img :src="fullUrl(selectedLoker?.gambar_url)" class="modal-img">

        <h2 class="modal-title">{{ selectedLoker?.judul }}</h2>

        <div class="info-section">
          <p><strong>Lokasi:</strong> {{ selectedLoker?.lokasi }}</p>
          <p><strong>Gaji:</strong> Rp {{ selectedLoker?.gaji }}</p>
          <p><strong>Deadline:</strong> {{ selectedLoker?.deadline_value }} {{ selectedLoker?.deadline_unit }}</p>
        </div>

        <h3 class="section-heading">Deskripsi</h3>
        <p class="desc">{{ selectedLoker?.deskripsi }}</p>

        <div class="owner">
          <img :src="fullUrl(selectedLoker?.user?.profil?.gambar_url)" class="owner-avatar"/>
          <div>
            <p class="owner-name">{{ selectedLoker?.user?.name }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>


<script>
import axios from "axios";

export default {
  data() {
    return {
      activeView: 'users',
      users: [],
      lokers: [],

      showModal: false,
      selectedLoker: null,

      searchQuery: "",   // Search bar input

      defaultProfil: "https://via.placeholder.com/80?text=No+Profil",
      defaultLoker: "https://via.placeholder.com/250x140?text=No+Image"
    };
  },

  computed: {
    /** 🔍 FILTER USERS */
    filteredUsers() {
      return this.users.filter(u =>
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    /** 🔍 FILTER LOKERS */
    filteredLokers() {
      return this.lokers.filter(l =>
        l.judul.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        l.user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  methods: {

    fullUrl(path) {
      if (!path) return this.defaultProfil;
      if (path.startsWith("http")) return path;
      return `http://127.0.0.1:8000${path}`;
    },

    async fetchUsers() {
      const res = await axios.get("http://localhost:8000/api/admin/users");
      this.users = res.data.data;
    },

    async fetchLokers() {
      const res = await axios.get("http://localhost:8000/api/admin/lokers");
      this.lokers = res.data.data;
    },

    async openLokerDetail(id) {
      try {
        const res = await axios.get(`http://localhost:8000/api/lokers/${id}`);
        this.selectedLoker = res.data.data;
        this.showModal = true;
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil detail loker.");
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedLoker = null;
    },

    async deleteUser(id) {
      if (!confirm("Hapus user ini?")) return;
      await axios.delete(`http://localhost:8000/api/admin/users/${id}`);
      this.fetchUsers();
    },

    async deleteLoker(id) {
      if (!confirm("Hapus loker ini?")) return;
      await axios.delete(`http://localhost:8000/api/admin/lokers/${id}`);
      this.fetchLokers();
    }
  },

  mounted() {
    this.fetchUsers();
    this.fetchLokers();
  }
};
</script>



<style scoped>


/* ============================= */
/* CONTAINER + TITLE */
/* ============================= */
.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 25px;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

.container h1 {
  font-size: 1.9rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ============================= */
/* SWITCH BUTTON */
/* ============================= */
.switch-btns {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.switch-btns button {
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  background: #e2e8f0;
  color: #1e293b;
  transition: 0.25s;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.switch-btns button.active {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  box-shadow: 0 4px 12px rgba(6,182,212,0.5);
  transform: scale(1.05);
}

.switch-btns button:hover {
  transform: scale(1.07);
}

/* ============================= */
/* GRID CARD */
/* ============================= */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px,1fr));
  gap: 25px;
}

/* ============================= */
/* CARD ITEM */
/* ============================= */
.card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(6,182,212,0.12);
  padding: 20px;
  text-align: center;
  transition: 0.25s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(6,182,212,0.25);
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.loker-img {
  width: 100%;
  height: 160px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0,0,0,0.12);
  margin-bottom: 12px;
}

/* ============================= */
/* USER INFO SMALL */
/* ============================= */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
}

.user-info .avatar {
  width: 40px;
  height: 40px;
}

/* ============================= */
/* DELETE BUTTON */
/* ============================= */
.actions {
  margin-top: 10px;
  width: 100%;
}

.actions .delete {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 3px 12px rgba(239,68,68,0.4);
}

.actions .delete:hover {
  transform: scale(1.05);
}

/* ============================= */
/* MODAL OVERLAY */
/* ============================= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn .25s ease;
}

/* ============================= */
/* MODAL BOX */
/* ============================= */
.modal-content {
  background: white;
  width: 620px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 22px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.18);
  animation: popupZoom .25s ease;
  position: relative;
}

.modal-img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  height: 260px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1e3a8a;
}

.info-section p {
  color: #374151;
  margin-bottom: 5px;
}

.section-heading {
  margin-top: 15px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e3a8a;
}

.desc {
  color: #475569;
  margin-top: 6px;
  line-height: 1.55;
}

/* ============================= */
/* OWNER SECTION */
/* ============================= */
.owner {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.owner-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.owner-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

/* ============================= */
/* CLOSE BUTTON */
/* ============================= */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: white;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 24px;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.close-btn:hover {
  background: #f1f5f9;
}

/* ============================= */
/* ANIMATIONS */
/* ============================= */
@keyframes popupZoom {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ============================= */
/* RESPONSIVE */
/* ============================= */
@media (max-width: 768px) {
  .modal-content {
    width: 92%;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}

/* CONTAINER */
.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 25px;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

.container h1 {
  font-size: 1.9rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* SEARCH BAR */
.filter-bar {
  width: 100%;
  margin-bottom: 20px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  width: 280px;
  box-shadow: 0 4px 12px rgba(6,182,212,0.12);
  transition: 0.25s;
}

.search-wrapper:focus-within {
  box-shadow: 0 6px 20px rgba(6,182,212,0.25);
  transform: scale(1.03);
}

.search-icon {
  font-size: 16px;
  color: #64748b;
  margin-right: 10px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  width: 100%;
  color: #1e293b;
}

/* SWITCH BUTTON */
.switch-btns {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.switch-btns button {
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  background: #e2e8f0;
  color: #1e293b;
  transition: 0.25s;
}

.switch-btns button.active {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
}

/* GRID */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px,1fr));
  gap: 25px;
}

/* CARD */
.card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  text-align: center;
  transition: 0.25s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
}

/* AVATAR */
.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

/* LOKER IMAGE */
.loker-img {
  width: 100%;
  height: 160px;
  border-radius: 14px;
  object-fit: cover;
  margin-bottom: 12px;
}

/* USER INFO SMALL */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
}

.user-info .avatar {
  width: 40px;
  height: 40px;
}

/* DELETE BUTTON */
.actions {
  margin-top: 10px;
  width: 100%;
}

.actions .delete {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  width: 620px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 22px;
  position: relative;
}

.modal-img {
  width: 100%;
  border-radius: 16px;
  height: 260px;
  object-fit: cover;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  background: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>

