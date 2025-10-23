<template>
  <nav class="navbar" v-if="showNavbar">
    <div class="left">
      <div class="logo">JF</div>
      <div class="app-name">JobFinder</div>
    </div>

    <div class="right">
      <ul class="nav-links">
        <!-- Kalau role pemberi kerja -->
        <template v-if="role === 'pemberi_kerja'">
          <li><router-link to="/daftarloker">Beranda</router-link></li>
        </template>

        <!-- Kalau role pekerja -->
        <template v-else-if="role === 'pekerja'">
          <li><router-link to="/lokerlist">Beranda</router-link></li>
          <li><router-link to="/riwayat">Riwayat</router-link></li>
        </template>
      </ul>

      <!-- Switch Role -->
      <router-link to="/pilih_role" class="switch-role">
        Ganti Role
      </router-link>

      <!-- Avatar/Profile -->
      <router-link to="/profil" class="profile">
        <img :src="avatarUrl" alt="Avatar" />
      </router-link>

      <!-- Logout -->
      <button class="logout-btn" @click="logout">Logout</button>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Data reactive
const role = ref((localStorage.getItem("role") || "").toLowerCase().trim());
const avatarUrl = ref(localStorage.getItem("avatar_url") || "https://i.pravatar.cc/150?img=3");

// Navbar hanya tampil di halaman tertentu
const showNavbar = computed(() => {
  const hiddenPages = ["/login", "/register", "/pilih_role"];
  return !hiddenPages.includes(route.path);
});

// Logout function
const logout = () => {
  localStorage.clear();
  role.value = null;
  avatarUrl.value = "https://i.pravatar.cc/150?img=3";
  router.push("/login");
};

// Update data dari localStorage
const updateRole = () => {
  role.value = (localStorage.getItem("role") || "").toLowerCase().trim();
};
const updateAvatar = () => {
  avatarUrl.value = localStorage.getItem("avatar_url") || "https://i.pravatar.cc/150?img=3";
};

// Event listener untuk sinkronisasi real-time
onMounted(() => {
  updateRole();
  updateAvatar();
  window.addEventListener("role-changed", updateRole);
  window.addEventListener("avatar-changed", updateAvatar);
  window.addEventListener("storage", () => {
    updateRole();
    updateAvatar();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("role-changed", updateRole);
  window.removeEventListener("avatar-changed", updateAvatar);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 16px 48px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: 'Poppins', sans-serif;
}

/* Kiri */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
  background: #4F46E5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  border-radius: 8px;
  font-size: 1.1rem;
}

.app-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1F2937;
}

/* Kanan */
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.2s ease;
}
.nav-links a:hover {
  color: #4F46E5;
}

/* Switch Role Button */
.switch-role {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4F46E5;
  background-color: #EEF2FF;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
}
.switch-role:hover {
  background-color: #E0E7FF;
}

/* Avatar/Profile */
.profile {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #D1D5DB;
  transition: border-color 0.2s ease;
  display: block;
}
.profile:hover {
  border-color: #4F46E5;
}
.profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Logout Button */
.logout-btn {
  background: #ea0909;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}
.logout-btn:hover {
  background: #059669;
}
</style>
