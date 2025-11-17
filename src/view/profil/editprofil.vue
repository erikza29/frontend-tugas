<template>
  <div class="profil-wrapper">
    <div class="profil-container">
      <h1 class="title">Edit Profil</h1>

      <!-- Foto Profil -->
      <div class="foto-profil text-center">
        <img
          v-if="preview || form.gambar_url"
          :src="preview || form.gambar_url"
          alt="Foto Profil"
          class="profil-img"
        />
        <div v-else class="profil-default">Belum ada foto</div>
        <label class="upload-label">
          <input type="file" accept="image/*" @change="onFileChange" hidden />
          <span class="upload-btn">Pilih Foto</span>
        </label>
      </div>

      <!-- Form Profil -->
      <div class="info-profil">
        <label>Nama</label>
        <input v-model="form.nama" type="text" class="input" placeholder="Nama lengkap" />

        <label>Deskripsi</label>
        <textarea
          v-model="form.deskripsi"
          class="input"
          placeholder="Ceritakan sedikit tentang dirimu..."
        ></textarea>
        <label>Nomor WhatsApp</label>
        <input
          v-model="form.whatsapp"
          type="text"
          class="input"
          placeholder="08xxxxxxxxxx"
        />

      </div>

      <!-- Tombol Simpan -->
      <button @click="saveProfil" class="edit-btn" :disabled="loading">
        <span v-if="loading">Menyimpan...</span>
        <span v-else>Simpan Profil</span>
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
        foto: null,
        whatsapp: "", // ⬅️ TAMBAHAN
      },
      preview: null,
      loading: false,
    };
  },

  async mounted() {
    this.getProfil();
  },

  methods: {
    async getProfil() {
      try {
        const { data } = await api.get("/profil", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (data?.data) {
          this.form = {
            ...data.data,
            foto: null, // jangan hilangkan ini
            whatsapp: data.data.whatsapp || "", // ⬅️ TAMBAHAN
          };
        }
      } catch (err) {
        console.error("Error getProfil:", err);
      }
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.preview = URL.createObjectURL(file);
      this.form.foto = file;
    },

    async saveProfil() {
      this.loading = true;
      try {
        const fd = new FormData();
        fd.append("nama", this.form.nama);
        fd.append("deskripsi", this.form.deskripsi);
        fd.append("whatsapp", this.form.whatsapp); // ⬅️ TAMBAHAN

        if (this.form.foto) {
          fd.append("foto", this.form.foto);
        }

        const { data } = await api.post("/profil", fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (data?.data?.gambar_url) {
          localStorage.setItem("avatar_url", data.data.gambar_url);
          window.dispatchEvent(new Event("avatar-changed"));
        }

        setTimeout(() => this.$router.push("/profil"), 200);
      } catch (error) {
        console.error("Error saveProfil:", error);

        if (error.response?.status === 422) {
          const msg = Object.entries(error.response.data.errors)
            .map(([k, v]) => `${k}: ${v.join(", ")}`)
            .join("\n");
          alert("Gagal menyimpan profil:\n" + msg);
        } else {
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
  padding: 2.5rem 1rem;
  background: #f9fafb;
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
}

.profil-container {
  width: 100%;
  max-width: 480px;
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2rem;
}

.foto-profil {
  text-align: center;
}

.profil-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6366f1;
  margin-bottom: 0.75rem;
}

.profil-default {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 0.95rem;
}

.upload-label {
  cursor: pointer;
}

.upload-btn {
  display: inline-block;
  background: #4f46e5;
  color: #fff;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #4338ca;
}

.info-profil {
  margin-top: 2rem;
}

label {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.3rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.edit-btn {
  width: 100%;
  padding: 0.9rem;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.edit-btn:hover:not(:disabled) {
  background: #4338ca;
  transform: scale(1.02);
}

.edit-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
</style>
