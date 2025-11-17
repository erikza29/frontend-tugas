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

      <!-- 🔥 DEADLINE TYPE -->
      <div class="form-group">
        <label>Jenis Deadline</label>
        <select v-model="form.deadline_unit" required>
          <option disabled value="">-- pilih jenis deadline --</option>
          <option value="jam">Jam</option>
          <option value="hari">Hari</option>
          <option value="bulan">Bulan</option>
        </select>
      </div>

      <!-- 🔥 DEADLINE VALUE -->
      <div class="form-group">
        <label>Nilai Deadline (angka)</label>
        <input
          v-model="form.deadline_value"
          type="number"
          min="1"
          required
          placeholder="contoh: 24"
        />
      </div>

      <!-- 🔥 INPUT GAMBAR BARU -->
      <div class="form-group">
        <label>Gambar (Opsional)</label>
        <input type="file" accept="image/*" @change="previewGambar" />

        <!-- PREVIEW -->
        <img
          v-if="preview"
          :src="preview"
          class="img-preview"
          alt="Preview Gambar"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Menyimpan..." : "Simpan" }}
      </button>

      <button type="button" @click="$router.push('/daftarloker')">
        Batal
      </button>
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
        deadline_unit: "",   // NEW
        deadline_value: "",  // NEW
      },
      gambarFile: null,
      preview: null,
      loading: false,
      error: "",
    };
  },
  methods: {
    previewGambar(e) {
      const file = e.target.files[0];
      this.gambarFile = file;
      this.preview = URL.createObjectURL(file);
    },

    async simpanLoker() {
      this.loading = true;
      this.error = "";

      try {
        const fd = new FormData();
        fd.append("judul", this.form.judul);
        fd.append("deskripsi", this.form.deskripsi);
        fd.append("lokasi", this.form.lokasi);
        fd.append("gaji", this.form.gaji);

        // 🔥 NEW: deadline fields
        fd.append("deadline_unit", this.form.deadline_unit);
        fd.append("deadline_value", this.form.deadline_value);

        if (this.gambarFile) {
          fd.append("gambar", this.gambarFile);
        }

        const res = await api.post("/loker", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          alert("Lowongan berhasil ditambahkan");
          this.$router.push("/daftarloker");
        } else {
          this.error = res.data.message || "Gagal menambahkan lowongan";
        }
      } catch (err) {
        console.error("Error simpanLoker:", err);
        this.error =
          err.response?.data?.message || "Terjadi kesalahan server";
      } finally {
        this.loading = false;
      }
    },
  },
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

.img-preview {
  margin-top: 10px;
  width: 180px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
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

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus,
select:focus {
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
