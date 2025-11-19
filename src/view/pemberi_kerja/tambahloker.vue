<template>
  <div class="add-container">
    <div class="add-card">
      <h1>Tambah Lowongan Kerja</h1>

      <form @submit.prevent="simpanLoker" class="add-form">
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

        <label>Deadline</label>
        <div class="input-deadline">
          <div class="form-group-left">
            <input
              v-model="form.deadline_value"
              type="number"
              min="1"
              required
              placeholder="contoh: 24"
            />

          </div>

          <div class="form-group-right">
            <select v-model="form.deadline_unit" required>
              <option disabled value="">Jenis</option>
              <option value="jam">Jam</option>
              <option value="hari">Hari</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Gambar (Opsional)</label>
          <input type="file" accept="image/*" @change="previewGambar" />

          <div v-if="preview" class="preview-container">
            <p>Preview gambar:</p>
            <img :src="preview" class="preview-image" />
          </div>
        </div>

        <div class="btn-group">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? "Menyimpan..." : "Simpan" }}
          </button>

          <button
            type="button"
            class="btn-cancel"
            @click="$router.push('/daftarloker')"
          >
            Batal
          </button>
        </div>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
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
        deadline_unit: "",
        deadline_value: "",
      },
      gambarFile: null,
      preview: null,
      loading: false,
      error: "",
    };
  },
  beforeUnmount() {
    if (this.preview) URL.revokeObjectURL(this.preview);
  },
  methods: {
    previewGambar(e) {
      const file = e.target.files[0];
      this.gambarFile = file;

      if (this.preview) URL.revokeObjectURL(this.preview);
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
}

.add-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9fbff;
  padding: 40px 24px;
}

.add-card {
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
textarea,
select {
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
textarea:focus,
select:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  background-color: #fff;
}

.preview-container {
  margin-top: 10px;
}

.preview-image {
  width: 180px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: block;
  margin-top: 6px;
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

.add-form {
  width: 95%;
}
.input-deadline {
  display: flex;
  width: 100%;
  width: 100%;
  margin-bottom: 18px;
}

.form-group-left {
  width: fit-content;
  margin-right: 30px;
  width: 60%;
}

.form-group-right {
  width: 30%;
}

.form-group-left input,
.form-group-right select {
  width: 100%;
}


</style>

