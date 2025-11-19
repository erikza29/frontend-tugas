<template>
  <div class="register-wrapper">
    <div class="left-section">
      <img src="@/assets/gibran.png" alt="Poster kerja" class="hero-image" />
    </div>

    <div class="right-section">
      <div class="form-container">
        <h1>Selamat Datang</h1>
        <p>Nganggur? Cari kerja di Kerjayo aja!</p>

        <form @submit.prevent="handleRegister">
          <input type="text" v-model="name" placeholder="Nama Lengkap" required class="input-field" />
          <input type="email" v-model="email" placeholder="Email" required class="input-field" />
          <input type="password" v-model="password" placeholder="Password" required class="input-field" />
          <button type="submit" class="register-button">Daftar</button>
        </form>

        <p class="login-text">
          Belum punya akun?
          <router-link to="/login" class="link-login">Masuk</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/API/api";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");

async function handleRegister() {
  try {
    await api.post("/register", {
      name: name.value,
      email: email.value,
      password: password.value,
      role: "pekerja",
    });
    alert("Registrasi berhasil! Silakan login.");
    router.push("/login");
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Registrasi gagal. Coba lagi!");
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

.register-wrapper {
  display: flex;
  height: 100vh;
  font-family: "Poppins", sans-serif;
  background-color: #0c1b36;
}

.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-section {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 360px;
  text-align: center;
  padding: 20px;
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

.input-field {
  width: 90%;
  padding: 10px 15px;
  border: 1px solid #aaa;
  border-radius: 25px;
  margin-bottom: 15px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #00bfff;
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2);
}

.register-button {
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

.register-button:hover {
  opacity: 0.9;
}

.login-text {
  margin-top: 20px;
  font-size: 13px;
  color: #444;
}

.link-login {
  color: #00bfff;
  text-decoration: none;
  font-weight: 500;
}

.link-login:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-wrapper {
    position: relative;
    flex-direction: column;
    height: 100vh;
  }

  .left-section {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.45);
  }

  .right-section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 25px;
    border-radius: 16px;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.3);
  }

  .form-container h1 {
    color: white;
  }

  .form-container p {
    color: #f0f0f0;
  }

  .input-field {
    width: 90%;
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
