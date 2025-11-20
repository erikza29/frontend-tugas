<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-center">Super Admin Dashboard</h1>

    <!-- Filter Bar -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-magnifying-glass text-gray-500"></i>
        <input v-model="searchQuery" type="text" placeholder="Cari user atau lowongan"
               class="border p-2 rounded w-full md:w-64"/>
      </div>
      <div>
        <select v-model="sortOption" class="border p-2 rounded">
          <option value="">Urutkan</option>
          <option value="abjad">A-Z</option>
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
        </select>
      </div>
    </div>

    <!-- Users Grid -->
    <section class="mb-10">
      <h2 class="text-2xl font-semibold mb-4">Users</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="user in filteredUsers" :key="user.id" class="bg-white shadow rounded-lg p-4 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <img v-if="user.profil?.gambar_url" :src="user.profil.gambar_url" class="w-12 h-12 rounded-full object-cover"/>
            <div>
              <p class="font-semibold">{{ user.name }}</p>
              <p class="text-gray-500 text-sm">{{ user.email }}</p>
            </div>
          </div>
          <p class="text-gray-500 text-sm">Profil: {{ user.profil?.nama ?? '-' }}</p>
          <div class="mt-auto">
            <button @click="deleteUser(user.id)"
                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition w-full">
              Hapus User
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Lokers Grid -->
    <section>
      <h2 class="text-2xl font-semibold mb-4">Lowongan</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="loker in filteredLokers" :key="loker.id" class="bg-white shadow rounded-lg p-4 flex flex-col gap-2">
          <img v-if="loker.gambar_url" :src="loker.gambar_url" class="w-full h-40 object-cover rounded"/>
          <h3 class="font-bold text-lg">{{ loker.judul }}</h3>
          <p class="text-gray-500 text-sm truncate">{{ loker.deskripsi }}</p>
          <p class="text-gray-500 text-sm">Pembuat: {{ loker.user.name }}</p>
          <div class="flex justify-between mt-auto gap-2">
            <button @click="viewLoker(loker)"
                    class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition flex-1">
              Detail
            </button>
            <button @click="deleteLoker(loker.id)"
                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex-1">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Loker Detail -->
    <div v-if="selectedLoker" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2 relative shadow-lg">
        <button @click="selectedLoker = null"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold">&times;</button>
        <div class="flex flex-col md:flex-row gap-4">
          <img v-if="selectedLoker.gambar_url" :src="selectedLoker.gambar_url" class="w-full md:w-1/2 h-48 object-cover rounded"/>
          <div class="flex-1">
            <h3 class="text-2xl font-bold mb-2">{{ selectedLoker.judul }}</h3>
            <p class="mb-2">{{ selectedLoker.deskripsi }}</p>
            <p class="mb-1">Lokasi: {{ selectedLoker.lokasi }}</p>
            <p class="mb-1">Gaji: {{ selectedLoker.gaji }}</p>
            <p class="mb-1">Deadline: {{ selectedLoker.deadline_end ?? 'Belum ditentukan' }}</p>
            <div class="mt-3 border-t pt-3">
              <h4 class="font-semibold mb-1">Pembuat:</h4>
              <div class="flex items-center gap-3">
                <img v-if="selectedLoker.user.profil?.gambar_url"
                     :src="selectedLoker.user.profil.gambar_url"
                     class="w-12 h-12 rounded-full object-cover"/>
                <div>
                  <p class="font-medium">{{ selectedLoker.user.name }} ({{ selectedLoker.user.email }})</p>
                  <p class="text-gray-500 text-sm">Profil: {{ selectedLoker.user.profil?.nama ?? '-' }}</p>
                  <p class="text-gray-500 text-sm">Deskripsi: {{ selectedLoker.user.profil?.deskripsi ?? '-' }}</p>
                </div>
              </div>
              <button @click="deleteUser(selectedLoker.user.id)"
                      class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition mt-2">
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

// Fetch Data
const fetchUsers = async () => {
  const res = await api.get("/superadmin/users");
  users.value = res.data.data;
};
const fetchLokers = async () => {
  const res = await api.get("/superadmin/lokers");
  lokers.value = res.data.data;
};

// Delete Actions
const deleteUser = async (id) => {
  if (!confirm("Yakin hapus user ini?")) return;
  await api.delete(`/superadmin/users/${id}`);
  fetchUsers();
  fetchLokers();
};
const deleteLoker = async (id) => {
  if (!confirm("Yakin hapus loker ini?")) return;
  await api.delete(`/superadmin/lokers/${id}`);
  fetchLokers();
};

// View Loker Detail
const viewLoker = (loker) => { selectedLoker.value = loker; };

// Computed Filters
const filteredUsers = computed(() => {
  return users.value.filter(u => u.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
const filteredLokers = computed(() => {
  let data = [...lokers.value];
  if (searchQuery.value) {
    data = data.filter(l => l.judul.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  if (sortOption.value === "abjad") data.sort((a,b)=>a.judul.localeCompare(b.judul));
  else if (sortOption.value === "terbaru") data.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  else if (sortOption.value === "terlama") data.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  return data;
});

onMounted(() => { fetchUsers(); fetchLokers(); });
</script>
