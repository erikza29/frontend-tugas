<template>
  <div class="login-wrapper">

    <div class="left-section">
      <img src="@/assets/gibran.png" alt="Poster kerja" class="hero-image" />
    </div>

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

    const data = res.data.data;

    const token = data.token;
    const user = data.user;
    const isSuperadmin = data.is_superadmin ?? false; // ← penting

    if (!token) {
      alert("Token tidak ditemukan dari server!");
      return;
    }

    // Simpan token & user
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("is_superadmin", isSuperadmin);

    // Ambil profil jika bukan superadmin
    if (!isSuperadmin) {
      try {
        const profilRes = await api.get("/profil", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const avatar =
          profilRes.data?.data?.gambar_url ||
          "https://i.pravatar.cc/150?img=3";

        localStorage.setItem("avatar_url", avatar);

        window.dispatchEvent(new Event("avatar-changed"));
        window.dispatchEvent(new Event("role-changed"));
      } catch (err) {
        console.warn("Gagal ambil profil:", err);
      }
    }

    // 🔥 Redirect berdasarkan status superadmin
    if (isSuperadmin) {
      router.push("/superadmin");
      return;
    }

    // 🔥 Redirect normal untuk user biasa
    const role = data.role;

    if (role === "pekerja") {
      router.push("/lokerlist");
    } else if (role === "pemberi_kerja") {
      router.push("/daftarloker");
    } else {
      router.push("/pilih_role");
    }

  } catch (err) {
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
  background-color: #0c1b36;
}

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
}

.right-section {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
  width: 85%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #aaa;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #00bfff;
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2);
}

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

@media (max-width: 900px) {
  .login-wrapper {
    flex-direction: column;
    height: auto;
  }

  .left-section {
    height: 230px;
  }

  .hero-image {
    height: 100%;
  }

  .right-section {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .form-container h1 {
    font-size: 22px;
  }

  .form-container p {
    font-size: 12px;
  }

  .input-field {
    font-size: 13px;
    padding: 10px 15px 10px 40px;
  }

  .login-button {
    padding: 10px;
    font-size: 14px;
  }

  @media (max-width: 768px) {
  .login-wrapper {
    position: relative;
    height: 100vh;
    flex-direction: column;
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
    box-shadow: 0 4px 25px rgba(0,0,0,0.3);
  }

  .form-container h1 {
    color: white;
  }

  .form-container p {
    color: #f0f0f0;
  }

  .input-field {
    width: 85%;
    background: rgba(255,255,255,0.85);
  }


}

}
</style>
