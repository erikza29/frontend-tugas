<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/API/api"; // axios instance

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("");

async function handleRegister() {
  try {
    await api.post("/register", {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });

    alert("Registrasi berhasil! Silakan login.");
    router.push("/login");
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Registrasi gagal. Coba lagi!");
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <!-- Kiri -->
      <div class="left-side">
        <img
          src="https://i.pinimg.com/474x/a6/33/40/a633405594365ef1d55122fff5e93264.jpg"
          alt="register logo"
        />
        <div class="welcome-text">
          <h2>Welcome</h2>
          <p>Create your account, it takes less than a minute.</p>
        </div>
      </div>

      <!-- Kanan -->
      <div class="right-side">
        <h2>Welcome to Register</h2>
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" placeholder="Nama Lengkap" v-model="name" required />
          </div>

          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" placeholder="Email" v-model="email" required />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input type="password" placeholder="Password" v-model="password" required />
          </div>


          <button type="submit" class="login-btn">REGISTER</button>
        </form>

        <div class="register-link">
          <p>Udah punya akun? <router-link to="/login">Login</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to right, #7b2ff7, #f107a3);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.login-box {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.left-side {
  flex: 1;
  background: linear-gradient(to bottom right, #d6b2ff, #f5d0ff);
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.left-side img {
  max-width: 180px;
  margin-bottom: 20px;
  border-radius: 12px;
}

.welcome-text h2 {
  margin: 0;
  font-size: 24px;
  color: #4b0082;
}

.welcome-text p {
  color: #5a5a5a;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

.right-side {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-side h2 {
  margin-bottom: 20px;
  color: #4b0082;
  font-weight: bold;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group i {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #aaa;
}

.input-group input {
  width: 100%;
  padding: 12px 40px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
  transition: 0.3s;
}

.input-group input:focus {
  border-color: #9b4dff;
  box-shadow: 0 0 6px rgba(155, 77, 255, 0.5);
}

.login-btn {
  background: linear-gradient(to right, #9b4dff, #6a00f4);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background 0.3s;
}

.login-btn:hover {
  background: linear-gradient(to right, #7a26d1, #5200aa);
}

.register-link {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
}

.register-link p {
  margin-top: 25px;
  font-size: 14px;
  color: rgb(28, 27, 27);
}

.register-link a {
  color: #9b4dff;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
