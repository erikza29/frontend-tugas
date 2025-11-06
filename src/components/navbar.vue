<template>
  <nav class="navbar" v-if="showNavbar">
    <div class="left">
      <div class="logo">JF</div>
      <div class="app-name">JobFinder</div>
    </div>

    <!-- Hamburger for Mobile -->
    <div class="menu-toggle" @click="isMenuOpen = !isMenuOpen">
      <span></span><span></span><span></span>
    </div>

    <div :class="['right', { open: isMenuOpen }]">
      <ul class="nav-links">
        <template v-if="role === 'pemberi_kerja'">
          <li><router-link to="/daftarloker" @click="isMenuOpen = false">Beranda</router-link></li>
        </template>

        <template v-else-if="role === 'pekerja'">
          <li><router-link to="/lokerlist" @click="isMenuOpen = false">Beranda</router-link></li>
          <li><router-link to="/riwayat" @click="isMenuOpen = false">Riwayat</router-link></li>
        </template>
      </ul>

      <router-link to="/pilih_role" class="switch-role" @click="isMenuOpen = false">
        Ganti Role
      </router-link>

      <router-link to="/profil" class="profile" @click="isMenuOpen = false">
        <img :src="avatarUrl" alt="Avatar" />
      </router-link>

      <button class="logout-btn" @click="logout">Logout</button>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/API/api";

const route = useRoute();
const router = useRouter();

const role = ref((localStorage.getItem("role") || "").toLowerCase().trim());
const avatarUrl = ref(localStorage.getItem("avatar_url") || "https://i.pravatar.cc/150?img=3");
const isMenuOpen = ref(false);

const showNavbar = computed(() => {
  const hiddenPages = ["/login", "/register", "/pilih_role"];
  return !hiddenPages.includes(route.path);
});

const fetchProfil = async () => {
  try {
    const res = await api.get("/profil");
    if (res.data.success) {
      const imgUrl = res.data.data.gambar_url || "https://i.pravatar.cc/150?img=3";
      avatarUrl.value = imgUrl;
      localStorage.setItem("avatar_url", imgUrl);
      window.dispatchEvent(new Event("avatar-changed"));
    }
  } catch (err) {
    console.error("Gagal mengambil profil:", err);
  }
};

const logout = () => {
  localStorage.clear();
  role.value = null;
  avatarUrl.value = "https://i.pravatar.cc/150?img=3";
  router.push("/login");
};

const updateRole = () => {
  role.value = (localStorage.getItem("role") || "").toLowerCase().trim();
};
const updateAvatar = () => {
  avatarUrl.value = localStorage.getItem("avatar_url") || "https://i.pravatar.cc/150?img=3";
};

onMounted(() => {
  updateRole();
  updateAvatar();
  fetchProfil();

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
  background: linear-gradient(90deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%);
  padding: 14px 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Logo */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
  border-radius: 12px;
  font-size: 1.1rem;
  backdrop-filter: blur(8px);
}

.app-name {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Right Side */
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
  color: #E0E7FF;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}
.nav-links a:hover {
  color: #fff;
}
.nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 2px;
  background: #fff;
  transition: width 0.3s ease;
}
.nav-links a:hover::after {
  width: 100%;
}

/* Switch Role */
.switch-role {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E3A8A;
  background-color: #FFFFFF;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}
.switch-role:hover {
  background-color: #E0E7FF;
  color: #111827;
}

/* Avatar/Profile */
.profile {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.6);
  transition: border-color 0.2s ease;
  display: block;
}
.profile:hover {
  border-color: #fff;
}
.profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Logout */
.logout-btn {
  background: #EF4444;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}
.logout-btn:hover {
  background: #DC2626;
}

/* Hamburger Button */
.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}
.menu-toggle span {
  width: 26px;
  height: 3px;
  background: white;
  border-radius: 4px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .right {
    position: absolute;
    top: 70px;
    right: 0;
    width: 240px;
    background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 80%);
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 16px;
    border-bottom-left-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-120%);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .right.open {
    transform: translateY(0);
    opacity: 1;
  }

  .nav-links {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .logout-btn {
    width: 100%;
  }

  .switch-role {
    width: 100%;
    text-align: center;
  }
}
</style>
