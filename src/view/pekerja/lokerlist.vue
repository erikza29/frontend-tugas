<template>
  <div class="loker-container">
    <h2 class="title">Daftar Lowongan Kerja</h2>

    <!-- Search + Filter -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Cari lowongan..."
          class="search-input"
        />
      </div>

      <div class="select-wrapper">
        <select v-model="sortOption" class="filter-select">
          <option value="">Urutkan</option>
          <option value="abjad">📖 A - Z</option>
          <option value="terbaru">🕒 Terbaru</option>
          <option value="terlama">📅 Terlama</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Memuat data...</div>

    <!-- Grid Lowongan -->
    <div v-else class="job-grid">
      <div
        v-for="loker in sortedAndFilteredLokers"
        :key="loker.id"
        class="job-card"
      >
        <h3 class="job-title">{{ loker.judul }}</h3>

        <div class="job-info">
          <p><strong>Lokasi:</strong> {{ loker.lokasi }}</p>
          <p><strong>Deadline:</strong> {{ loker.deadline }}</p>
        </div>

        <div class="job-meta">
          <span class="price">Rp {{ formatRupiah(loker.gaji) }}</span>
          <button
            class="detail-btn"
            @click="$router.push(`/lokerdetail/${loker.id}`)"
          >
            Detail
          </button>
        </div>
      </div>

      <!-- Pesan jika tidak ada hasil -->
      <div v-if="sortedAndFilteredLokers.length === 0" class="no-result">
        Lowongan tidak ditemukan.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/API/api";

const lokers = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const sortOption = ref("");

// Ambil data dari backend
const getLokers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/lokers");
    lokers.value = Array.isArray(res.data) ? res.data : res.data.data;
  } catch (err) {
    console.error("Gagal ambil data:", err);
  } finally {
    loading.value = false;
  }
};

// Filter + Sorting gabung
const sortedAndFilteredLokers = computed(() => {
  let data = [...lokers.value];

  // Filter pencarian
  if (searchQuery.value) {
    data = data.filter((l) =>
      l.judul.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Urutkan sesuai opsi
  if (sortOption.value === "abjad") {
    data.sort((a, b) => a.judul.localeCompare(b.judul));
  } else if (sortOption.value === "terbaru") {
    data.sort(
      (a, b) => new Date(b.created_at || b.deadline) - new Date(a.created_at || a.deadline)
    );
  } else if (sortOption.value === "terlama") {
    data.sort(
      (a, b) => new Date(a.created_at || a.deadline) - new Date(b.created_at || b.deadline)
    );
  }

  return data;
});

// Format gaji
const formatRupiah = (angka) => {
  if (!angka) return "-";
  return new Intl.NumberFormat("id-ID").format(angka);
};

// Jalankan saat komponen dimuat
onMounted(() => {
  getLokers();
});
</script>

<style scoped>
.loker-container {
  font-family: "Segoe UI", sans-serif;
  color: #1a1a2e;
  max-width: 1100px;
  margin: 80px auto 40px;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

/* TITLE */
.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

/* FILTER BAR */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #5b8bf5;
  box-shadow: 0 0 6px rgba(91, 139, 245, 0.4);
}

.select-wrapper {
  min-width: 180px;
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  font-size: 1rem;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #5b8bf5;
}

.filter-select:focus {
  outline: none;
  border-color: #5b8bf5;
  box-shadow: 0 0 6px rgba(91, 139, 245, 0.4);
}

/* LOADING */
.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
}

/* GRID LOKER */
.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* CARD LOKER */
.job-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* JUDUL */
.job-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #1a1a2e;

  /* biar wrap */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;

  /* ellipsis dua baris */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* INFO */
.job-info {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.8rem;
}

.job-info p {
  margin: 0.2rem 0;
}

/* BAGIAN BAWAH */
.job-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  color: #7a5195;
  font-weight: bold;
  font-size: 1rem;
}

.detail-btn {
  background-color: #5b8bf5;
  color: white;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.detail-btn:hover {
  background-color: #3a6cf0;
}

/* JIKA TIDAK ADA DATA */
.no-result {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 16px;
  color: #999;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .select-wrapper {
    width: 100%;
  }
}
</style>
