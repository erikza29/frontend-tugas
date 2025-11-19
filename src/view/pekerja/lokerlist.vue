<template>
  <div class="loker-page">
    <section class="banner">
      <div class="banner-track"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }">

        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="banner-slide"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
      </div>

      <button class="nav-btn prev" @click="prevSlide">❮</button>
      <button class="nav-btn next" @click="nextSlide">❯</button>

      <div class="indicator">
        <span
          v-for="(slide, i) in slides"
          :key="i"
          :class="{ active: currentSlide === i }"
          @click="setSlide(i)"
        ></span>
      </div>
    </section>

    <div id="lokerList" class="loker-container">
      <div class="daftar-lowongan">
        <h2 class="title">Daftar Lowongan Kerja</h2>
      </div>

      <div class="filter-bar">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari lowongan"
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

      <div v-if="loading" class="loading">Memuat data...</div>

      <div v-else class="job-grid">
        <div
          v-for="loker in sortedAndFilteredLokers"
          :key="loker.id"
          class="job-card"
        >
          <div class="image-new">
            <img :src="loker.gambar_url ? loker.gambar_url : gibran" alt="Gambar Lowongan" />
          </div>

          <div class="job-desc">
            <h3 class="job-title">{{ loker.judul }}</h3>
            <div class="job-location">{{ loker.lokasi }}</div>

            <div class="job-location">
              Deadline: {{ formatDeadline(loker) }}
            </div>

            <div class="job-footer">
              <span class="job-salary">Rp {{ formatRupiah(loker.gaji) }}</span>
              <button
                class="btn-detail"
                @click="$router.push(`/lokerdetail/${loker.id}`)"
              >
                Detail ➜
              </button>
            </div>
          </div>
        </div>

        <div v-if="sortedAndFilteredLokers.length === 0" class="no-result">
          Lowongan tidak ditemukan.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "@/API/api";

import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/gibran.png";
import t3 from "@/assets/bunga.jpeg";

import gibran from "@/assets/gibran.png";

const slides = ref([
  { image: t1 },
  { image: t2 },
  { image: t3 },
]);

const currentSlide = ref(0);
let autoSlideInterval = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};
const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};
const setSlide = (i) => (currentSlide.value = i);

const lokers = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const sortOption = ref("");

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

const formatDeadline = (loker) => {
  if (!loker.deadline_value) return "Tidak ada";

  const unit = loker.deadline_unit || loker.deadline_type || "";

  const unitMap = {
    hours: "Jam",
    days: "Hari",
    months: "Bulan",
  };

  const label = unitMap[unit] || "Hari";

  return `${loker.deadline_value} ${label}`;
};

const sortedAndFilteredLokers = computed(() => {
  let data = [...lokers.value];

  data = data.filter((l) => l.status !== "tutup");

  if (searchQuery.value) {
    data = data.filter((l) =>
      l.judul.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (sortOption.value === "abjad") {
    data.sort((a, b) => a.judul.localeCompare(b.judul));
  } else if (sortOption.value === "terbaru") {
    data.sort(
      (a, b) =>
        new Date(b.created_at || b.deadline) -
        new Date(a.created_at || a.deadline)
    );
  } else if (sortOption.value === "terlama") {
    data.sort(
      (a, b) =>
        new Date(a.created_at || a.deadline) -
        new Date(b.created_at || b.deadline)
    );
  }

  return data;
});

const formatRupiah = (angka) =>
  angka ? new Intl.NumberFormat("id-ID").format(angka) : "-";

onMounted(() => {
  autoSlideInterval = setInterval(nextSlide, 5000);
  getLokers();
});
onBeforeUnmount(() => clearInterval(autoSlideInterval));
</script>

<style scoped>
.banner {
  position: relative;
  height: 300px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
}

.banner-track {
  display: flex;
  height: 100%;
  transition: transform 1s ease-in-out;
}

.banner {
  overflow: hidden;
}




.banner-slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}



.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.35);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  transition: 0.3s;
}
.nav-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}
.prev {
  left: 15px;
}
.next {
  right: 15px;
}

.indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
.indicator span {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}
.indicator span.active {
  background: #06b6d4;
  transform: scale(1.2);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.search-wrapper {
  position: relative;
  flex: 1 1 220px;
  min-width: 0;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #06b6d4;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem;
  font-size: 1rem;
  border-radius: 1rem;
  border: none;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
  transition: all 0.3s ease;
}
.search-input:focus {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3);
  outline: none;
}

.select-wrapper {
  margin-left: 70px;
  flex: 0 0 auto;
}

.filter-select {
  padding: 0.85rem 1.2rem;
  border-radius: 0.9rem;
  background: linear-gradient(to right, #1e3a8a, #3b82f6);
  color: white;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem;
  align-items: start;
}

.job-card {
  background: linear-gradient(to bottom, #a7e1ed, #f3fdfe);
  border: 3px solid #a7e1ed;
  border-radius: 1rem;
  transition: 0.25s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-height: 320px;
  overflow: hidden;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.job-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-location {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-detail {
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}
.btn-detail:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.4);
}

.daftar-lowongan {
  justify-content: center;
  display: flex;
}

.filter-select option {
  color: #333;
}

.image {
  width: 310px;
  height: 200px;
  overflow: hidden;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
}

.image-new {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  margin-bottom: 0px;
}

.image-new img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  margin-bottom: 0px;
}

.job-desc {
  margin: 0px 15px 15px 15px;
}

.job-deadline {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #ea580c;
  font-weight: 600;
}

@media (max-width: 900px) {
  .banner {
    height: 220px;
  }

  .nav-btn {
    font-size: 1.6rem;
    padding: 0.4rem 0.8rem;
  }

  .select-wrapper {
    margin-left: 30px;
  }
}

@media (max-width: 640px) {
  .banner {
    height: 160px;
  }

  .nav-btn {
    display: none;
  }

  .indicator {
    bottom: 10px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-wrapper {
    flex: 1 1 auto;
    max-width: 100%;
  }

  .select-wrapper {
    margin-left: 0;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .job-grid {
    grid-template-columns: repeat(1, 1fr);
    margin: 1rem;
    gap: 1rem;
  }

  .image-new {
    height: 140px;
  }

  .job-title {
    font-size: 15px;
  }

  .job-location {
    white-space: normal;
  }
}

@media (min-width: 1200px) {
  .job-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    margin: 2.5rem;
  }
}

.loker-page {
  overflow-x: hidden;
  width: 100%;
}

:global(body) {
  overflow-x: hidden;
}



.job-grid {
  margin: 1rem;
}

</style>

