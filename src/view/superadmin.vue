<template>
  <div class="dashboard-container">

    <h1 class="title">Super Admin Dashboard</h1>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Cari user atau lowongan" />
      </div>

      <select v-model="sortOption">
        <option value="">Urutkan</option>
        <option value="abjad">A-Z</option>
        <option value="terbaru">Terbaru</option>
        <option value="terlama">Terlama</option>
      </select>
    </div>

    <!-- USERS SECTION -->
    <section class="section">
      <h2 class="section-title">Users</h2>

      <div class="grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="card"
        >
          <div class="user-header">
            <img
              v-if="user.profil?.gambar_url"
              :src="user.profil.gambar_url"
              class="avatar"
            />

            <div>
              <p class="name">{{ user.name }}</p>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>

          <p class="desc">Profil: {{ user.profil?.nama ?? "-" }}</p>

          <button class="btn-danger" @click="deleteUser(user.id)">
            Hapus User
          </button>
        </div>
      </div>
    </section>

    <!-- LOKERS SECTION -->
    <section class="section">
      <h2 class="section-title">Lowongan</h2>

      <div class="grid">
        <div
          v-for="loker in filteredLokers"
          :key="loker.id"
          class="card"
        >
          <img v-if="loker.gambar_url" :src="loker.gambar_url" class="loker-thumb" />

          <h3 class="loker-title">{{ loker.judul }}</h3>

          <p class="desc truncate">{{ loker.deskripsi }}</p>

          <p class="desc">Pembuat: {{ loker.user.name }}</p>

          <div class="btn-group">
            <button class="btn-primary" @click="viewLoker(loker)">Detail</button>
            <button class="btn-danger" @click="deleteLoker(loker.id)">Hapus</button>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL DETAIL -->
    <div v-if="selectedLoker" class="modal-overlay">
      <div class="modal">
        <button class="modal-close" @click="selectedLoker = null">&times;</button>

        <div class="modal-content">
          <img
            v-if="selectedLoker.gambar_url"
            :src="selectedLoker.gambar_url"
            class="modal-img"
          />

          <div class="modal-info">
            <h3 class="modal-title">{{ selectedLoker.judul }}</h3>

            <p>{{ selectedLoker.deskripsi }}</p>
            <p><strong>Lokasi:</strong> {{ selectedLoker.lokasi }}</p>
            <p><strong>Gaji:</strong> {{ selectedLoker.gaji }}</p>
            <p><strong>Deadline:</strong> {{ selectedLoker.deadline_end ?? "Belum ditentukan" }}</p>

            <div class="creator-box">
              <h4>Pembuat:</h4>

              <div class="creator">
                <img
                  v-if="selectedLoker.user.profil?.gambar_url"
                  :src="selectedLoker.user.profil.gambar_url"
                  class="avatar"
                />

                <div>
                  <p class="name">{{ selectedLoker.user.name }} ({{ selectedLoker.user.email }})</p>
                  <p class="desc">Profil: {{ selectedLoker.user.profil?.nama ?? "-" }}</p>
                </div>
              </div>

              <button
                class="btn-danger mt-2"
                @click="deleteUser(selectedLoker.user.id)"
              >
                Hapus User
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>



<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/API/api";

const users = ref([]);
const lokers = ref([]);
const selectedLoker = ref(null);

const searchQuery = ref("");
const sortOption = ref("");

/* FETCH USERS */
const fetchUsers = async () => {
  try {
    const res = await api.get("/superadmin/users");
    users.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
};

/* FETCH LOKERS */
const fetchLokers = async () => {
  try {
    const res = await api.get("/superadmin/lokers");
    lokers.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
};

/* DELETE USER */
const deleteUser = async (id) => {
  if (!confirm("Yakin hapus user ini?")) return;

  await api.delete(`/superadmin/users/${id}`);
  fetchUsers();
  fetchLokers();
};

/* DELETE LOKER */
const deleteLoker = async (id) => {
  if (!confirm("Yakin hapus loker ini?")) return;

  await api.delete(`/superadmin/lokers/${id}`);
  fetchLokers();
};

/* VIEW DETAIL */
const viewLoker = (loker) => {
  selectedLoker.value = loker;
};

/* COMPUTED FILTER */
const filteredUsers = computed(() =>
  users.value.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const filteredLokers = computed(() => {
  let data = [...lokers.value];

  if (searchQuery.value) {
    data = data.filter((l) =>
      l.judul.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (sortOption.value === "abjad")
    data.sort((a, b) => a.judul.localeCompare(b.judul));
  else if (sortOption.value === "terbaru")
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else if (sortOption.value === "terlama")
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return data;
});

/* FIRST LOAD */
onMounted(() => {
  fetchUsers();
  fetchLokers();
});
</script>


<style>
/* ---------- GLOBAL ---------- */
.dashboard-container {
  padding: 30px;
  background: #f7f8fa;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
}

.title {
  text-align: center;
  font-size: 34px;
  margin-bottom: 30px;
  font-weight: bold;
}

/* ---------- FILTER BAR ---------- */
.filter-bar {
  display: flex;
  gap: 15px;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.search-box input {
  padding: 10px 15px;
  width: 250px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* ---------- SECTIONS ---------- */
.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* ---------- GRID ---------- */
.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

/* ---------- CARD ---------- */
.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-header {
  display: flex;
  gap: 15px;
  align-items: center;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  font-weight: bold;
}

.email, .desc {
  color: #666;
  font-size: 14px;
}

.loker-thumb {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
}

.loker-title {
  font-size: 18px;
  font-weight: bold;
}

/* ---------- BUTTONS ---------- */
.btn-primary,
.btn-danger {
  padding: 10px;
  border-radius: 8px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.btn-primary {
  background: #007bff;
}
.btn-primary:hover {
  background: #0066d6;
}

.btn-danger {
  background: #e63946;
}
.btn-danger:hover {
  background: #c62828;
}

.btn-group {
  display: flex;
  gap: 10px;
}

/* ---------- MODAL ---------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  background: white;
  width: 90%;
  max-width: 750px;
  padding: 25px;
  border-radius: 12px;
  position: relative;
  animation: fadeIn 0.25s ease;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 18px;
  font-size: 28px;
  cursor: pointer;
  background: none;
  border: none;
  color: #555;
}

.modal-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.modal-img {
  width: 100%;
  max-width: 300px;
  height: 180px;
  border-radius: 10px;
  object-fit: cover;
}

.creator-box {
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.creator {
  display: flex;
  gap: 15px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
