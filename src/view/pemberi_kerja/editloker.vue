<template>
  <div class="edit-container">
    <div class="edit-card">
      <h1>Edit Lowongan Kerja</h1>

      <form @submit.prevent="updateLoker" v-if="loaded" class="edit-form">
        <div class="form-group">
          <label>Judul</label>
          <input v-model="form.judul" type="text" required />
        </div>

        <div class="form-group">
          <label>Deskripsi</label>
          <textarea v-model="form.deskripsi" rows="4" required></textarea>
        </div>

        <div class="form-group">
          <label>Lokasi</label>
          <input v-model="form.lokasi" type="text" required />
        </div>

        <div class="form-group">
          <label>Gaji</label>
          <input v-model="form.gaji" type="number" required />
        </div>

        <div class="form-group">
          <label>Deadline</label>
          <input v-model="form.deadline" type="date" required />
        </div>

        <div class="btn-group">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
          <button type="button" class="btn-cancel" @click="$router.push('/daftarloker')">
            Batal
          </button>
        </div>
      </form>

      <p v-else class="loading">Memuat data...</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from "@/API/api";

export default {
  name: "EditLoker",
  data() {
    return {
      form: {
        judul: "",
        deskripsi: "",
        lokasi: "",
        gaji: "",
        deadline: "",
        user_id: null,
      },
      loading: false,
      loaded: false,
      error: "",
    };
  },
  async mounted() {
  try {
    const id = this.$route.params.id;
    const res = await api.get(`/loker/${id}`); // ✅ ubah jadi singular
    if (res.data.success) {
      this.form = res.data.data;
      this.loaded = true;
    } else {
      this.error = res.data.message || "Gagal memuat data";
    }
  } catch (err) {
    this.error = err.response?.data?.message || "Terjadi kesalahan server";
  }
},

methods: {
  async updateLoker() {
    this.loading = true;
    this.error = "";

    try {
      const id = this.$route.params.id;
      const res = await api.put(`/loker/${id}`, this.form); // ✅ ubah juga di sini
      if (res.data.success) {
        alert("Lowongan berhasil diperbarui");
        this.$router.push("/daftarloker");
      } else {
        this.error = res.data.message || "Gagal memperbarui lowongan";
      }
    } catch (err) {
      this.error = err.response?.data?.message || "Terjadi kesalahan server";
    } finally {
      this.loading = false;
    }
  },
},

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
}

.edit-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9fbff;
  padding: 40px 24px;
}

.edit-card {
  width: 100%;
  max-width: 650px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 40px 36px;
  transition: 0.3s ease;
}

h1 {
  text-align: center;
  margin-bottom: 28px;
  color: #2b3a67;
  font-size: 26px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2b3a67;
  font-size: 14.5px;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #c9d3e1;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #f9fbff;
}

input:focus,
textarea:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  background-color: #fff;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

button {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  padding: 10px 18px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background-color: #3b7fd4;
  transform: scale(1.03);
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e2e2e2;
}

.error {
  color: #e74c3c;
  text-align: center;
  margin-top: 12px;
  font-weight: 500;
}

.loading {
  text-align: center;
  color: #555;
}
</style>
