<template>
  <div class="login-wrapper">
    <!-- BAGIAN KIRI -->
    <div class="left-section">
      <img
        src="C:\PAK ANDI\frontend\vue_project\src\assets\gibran.png"
        alt="login logo"
        class="hero-image"
      />
    </div>

    <!-- BAGIAN KANAN -->
    <div class="right-section">
      <div class="form-container">
        <h1>Login ke Kerjayo</h1>
        <p>Masuk untuk menemukan pekerjaan impianmu!</p>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              type="email"
              placeholder="Email"
              v-model="email"
              required
              class="input-field"
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              v-model="password"
              required
              class="input-field"
            />
          </div>

          <button type="submit" class="login-button">MASUK</button>
        </form>

        <div class="register-link">
          <p>
            Belum punya akun?
            <router-link to="/register" class="link-register">
              Daftar Sekarang
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/API/api";

const router = useRouter();
const email = ref("");
const password = ref("");

async function handleLogin() {
  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    console.log("Login response:", res.data);

    const token = res.data.data.token;
    const role = res.data.data.role;
    const userId = res.data.data.user.id;

    if (!token) {
      alert("Token tidak ditemukan dari server!");
      return;
    }

    // ✅ Simpan token, role, dan user_id ke localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user_id", userId);

    // ✅ Ambil profil user agar avatar langsung muncul di navbar
    try {
      const profilRes = await api.get("/profil", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const avatar =
        profilRes.data?.data?.gambar_url ||
        "https://i.pravatar.cc/150?img=3";

      localStorage.setItem("avatar_url", avatar);

      // ✅ Trigger event ke navbar (biar langsung update avatar & role)
      window.dispatchEvent(new Event("avatar-changed"));
      window.dispatchEvent(new Event("role-changed"));
    } catch (err) {
      console.warn("Gagal ambil profil:", err);
    }

    // ✅ Arahkan user sesuai role
    if (role === "pekerja") {
      router.push("/lokerlist");
    } else if (role === "pemberi_kerja") {
      router.push("/daftarloker");
    } else {
      router.push("/pilih_role");
    }
  } catch (err) {
    console.error("Login error:", err.response?.data || err);
    alert(err.response?.data?.message || "Login gagal");
  }
}
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

.login-wrapper {
  display: flex;
  height: 100vh;
  font-family: "Poppins", sans-serif;
}

/* BAGIAN KIRI */
.left-section {
  flex: 1;
  background-color: #0c1b36;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* BAGIAN KANAN */
.right-section {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 350px;
  text-align: center;
}

.form-container h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #000;
}

.form-container p {
  font-size: 13px;
  color: #333;
  margin-bottom: 25px;
}

/* INPUT */
.input-group {
  position: relative;
  margin-bottom: 15px;
}

.input-group i {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #888;
}

.input-field {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #aaa;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #00bfff;
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2);
}

/* BUTTON */
.login-button {
  width: 100%;
  background: linear-gradient(to bottom, #67e1ff, #00bfff);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.login-button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* LINK REGISTER */
.register-link {
  margin-top: 20px;
  font-size: 13px;
  color: #444;
}

.link-register {
  color: #00bfff;
  text-decoration: none;
  font-weight: 500;
}

.link-register:hover {
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }

  .left-section {
    height: 250px;
  }

  .hero-image {
    height: 100%;
    object-fit: cover;
  }
}
</style>
