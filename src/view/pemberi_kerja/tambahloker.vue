<template>
    <div class="form-container">
      <h1>Tambah Lowongan Kerja</h1>
  
      <form @submit.prevent="simpanLoker">
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
  
        <button type="submit" :disabled="loading">
          {{ loading ? "Menyimpan..." : "Simpan" }}
        </button>
        <button type="button" @click="$router.push('/daftarloker')">Batal</button>
      </form>
  
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import api from "@/API/api";
  
  export default {
    name: "TambahLoker",
    data() {
      return {
        form: {
          judul: "",
          deskripsi: "",
          lokasi: "",
          gaji: "",
          deadline: "",
          user_id: null
        },
        loading: false,
        error: ""
      };
    },
    mounted() {
      // Ambil user_id dari token atau localStorage (tergantung backend)
      this.form.user_id = localStorage.getItem("user_id"); 
    },
    methods: {
      async simpanLoker() {
        this.loading = true;
        this.error = "";
  
        try {
          const res = await api.post("/lokers", this.form);
          if (res.data.success) {
            alert("Lowongan berhasil ditambahkan");
            this.$router.push("/daftarloker");
          } else {
            this.error = res.data.message || "Gagal menambahkan lowongan";
          }
        } catch (err) {
          this.error = err.response?.data?.message || "Terjadi kesalahan server";
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
.form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

input:focus, textarea:focus {
  border-color: #007bff;
}

button {
  margin-right: 10px;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

button[type="submit"] {
  background: #007bff;
  color: white;
}

button[type="submit"]:hover {
  background: #0056b3;
}

button[type="button"] {
  background: #ccc;
  color: #333;
}

button[type="button"]:hover {
  background: #999;
}

.error {
  color: red;
  margin-top: 15px;
  text-align: center;
}
</style>
