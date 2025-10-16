<template>
  <div class="profil-wrapper">
    <div class="profil-container">
      <h1 class="title">Edit Profil</h1>

      <!-- Upload Foto -->
      <div class="foto-profil text-center">
        <img
          v-if="preview || form.gambar_url"
          :src="preview || form.gambar_url"
          alt="Foto Profil"
          class="profil-img"
        />
        <div v-else class="profil-default">Belum ada foto</div>
        <input type="file" @change="onFileChange" class="file-input" />
      </div>

      <!-- Form -->
      <div class="info-profil">
        <label>Nama</label>
        <input v-model="form.nama" type="text" class="input" />

        <label>Deskripsi</label>
        <textarea v-model="form.deskripsi" class="input"></textarea>
      </div>

      <!-- Button Save -->
      <button
        @click="saveProfil"
        class="edit-btn"
        :disabled="loading"
      >
        {{ loading ? "Menyimpan..." : "Simpan" }}
      </button>
    </div>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "EditProfil",
  data() {
    return {
      form: {
        nama: "",
        deskripsi: "",
        gambar_url: null,
        foto: null, // file asli
      },
      preview: null,
      loading: false,
    };
  },
  async mounted() {
    await this.getProfil();
  },
  methods: {
    async getProfil() {
      try {
        const res = await api.get("/profil", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data?.data) {
          this.form = { ...res.data.data, foto: null };
        }
      } catch (err) {
        console.error("Error getProfil:", err);
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.preview = URL.createObjectURL(file);
        this.form.foto = file;
      }
    },
    async saveProfil() {
  this.loading = true;
  try {
    const formData = new FormData();
    formData.append("nama", this.form.nama);
    formData.append("deskripsi", this.form.deskripsi);
    if (this.form.foto) {
      formData.append("foto", this.form.foto);
    }

    const res = await api.post("/profil", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ Simpan avatar ke localStorage & trigger event
    if (res.data?.data?.gambar_url) {
      localStorage.setItem("avatar_url", res.data.data.gambar_url);
      window.dispatchEvent(new Event("avatar-changed"));
    }

    this.$router.push("/profil");
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      let messages = "";
      for (const key in errors) {
        messages += `${key}: ${errors[key].join(", ")}\n`;
      }
      alert("Gagal menyimpan profil:\n" + messages);
    } else {
      console.error("Error saveProfil:", error);
      alert("Terjadi kesalahan saat menyimpan profil");
    }
  } finally {
    this.loading = false;
  }
},

  },
};
</script>

<style scoped>
.profil-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-family: "Poppins", sans-serif;
}
.profil-container {
  width: 100%;
  max-width: 450px;
  background: #fff;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.title {
  text-align: center;
  font-size: 1.7rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
}
.profil-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4F46E5;
  margin: auto;
}
.profil-default {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  font-size: 0.9rem;
}
.file-input {
  margin-top: 1rem;
  display: block;
}
.info-profil {
  margin-top: 1.5rem;
}
.input {
  width: 100%;
  padding: 12px;
  margin: 8px 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.edit-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 12px;
  background: #4F46E5;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s;
}
.edit-btn:hover:not(:disabled) {
  background: #4338CA;
  transform: scale(1.02);
}
.edit-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
</style>
