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
    if (!token) {
      alert("Token tidak ditemukan dari server!");
      return;
    }

    // Simpan token
    localStorage.setItem("token", token);

    // Redirect ke pilih role
    router.push("/pilih_role");
  } catch (err) {
    console.error("Login error:", err.response?.data || err);
    alert(err.response?.data?.message || "Login gagal");
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="left-side">
        <img
          src="https://i.pinimg.com/474x/a6/33/40/a633405594365ef1d55122fff5e93264.jpg"
          alt="login logo"
        />
        <div class="welcome-text">
          <h2>Welcome</h2>
          <p>
            Don't have an account? Create your account, it takes less than a
            minute.
          </p>
        </div>
      </div>

      <div class="right-side">
        <h2>Login System</h2>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input type="text" placeholder="Email" v-model="email" required />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              v-model="password"
              required
            />
          </div>

          <button type="submit" class="login-btn">LOGIN</button>
        </form>

        <div class="register-link">
          <p>
            Don't have an account? <a href="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

/* sama persis style login yang sebelumnya */
.login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #007bff, #00c6ff, #00e6e6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-box {
  width: 100%;
  max-width: 1000px;
  display: flex;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.left-side {
  flex: 1;
  background: linear-gradient(to bottom right, #e6f4ff, #cce9ff);
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
.right-side {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  color: #888;
}
.input-group input {
  width: 80%;
  padding: 12px 40px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
}
.login-btn {
  background: linear-gradient(to right, #007bff, #00c6ff);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}
.register-link {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
}
</style>
