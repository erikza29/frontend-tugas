<template>
  <div class="riwayat-container">
    <!-- Title & controls -->
    <div class="controls">
      <h2 class="title">Riwayat Pekerjaan</h2>

      <div class="controls-right">
        <select v-model="filterStatus" @change="onFilterChange" aria-label="Filter status">
          <option value="">Semua</option>
          <option value="pending">Pending</option>
          <option value="diterima">Diterima</option>
          <option value="ditolak">Ditolak</option>
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>

        <div class="summary">
          <span>{{ total }} item</span>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="skeleton-list" aria-busy="true">
      <div class="skeleton" v-for="n in 3" :key="n">
        <div class="skeleton-left"></div>
        <div class="skeleton-right"></div>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <div v-if="riwayat.length === 0" class="no-data">
        Belum ada riwayat.
      </div>

      <div v-else class="list">
        <div
          v-for="item in paginated"
          :key="item._uid || item.id"
          class="riwayat-card"
          role="article"
          :aria-label="`Riwayat ${getTitle(item) || '–'}`"
        >
          <div class="info">
            <p class="judul">{{ getTitle(item) }}</p>
            <p class="tanggal">{{ formatTanggal(item.tanggal) }}</p>
            <small class="tipe" v-if="item.type">Tipe: {{ item.type }}</small>
          </div>

          <div class="right-area">
            <div :class="['status', statusClass(item.status)]">
              {{ humanStatus(item.status) }}
            </div>

            <div class="actions">
              <!-- Tampilkan tombol hanya untuk entri pekerjaan (type === 'pekerjaan') dan status 'aktif' -->
              <button
                v-if="item.type === 'pekerjaan' && item.status === 'aktif'"
                class="btn-complete"
                @click="confirmComplete(item)"
              >
                Tandai Selesai
              </button>

              <!-- Jika sudah selesai, tampilkan tanggal selesai -->
              <p v-if="item.status === 'selesai' && item.tanggal_selesai" class="finished-at">
                Selesai: {{ formatTanggal(item.tanggal_selesai) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination sederhana -->
      <div class="pagination" v-if="pageCount > 1">
        <button :disabled="page === 1" @click="page--">Prev</button>
        <span>Halaman {{ page }} / {{ pageCount }}</span>
        <button :disabled="page === pageCount" @click="page++">Next</button>
      </div>
    </div>

    <!-- Konfirmasi modal -->
    <div v-if="confirmModal.show" class="modal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <h3>Konfirmasi</h3>
        <p>Anda yakin ingin menandai pekerjaan "<strong>{{ getTitle(confirmModal.item) }}</strong>" sebagai selesai?</p>
        <div class="modal-actions">
          <button @click="confirmModal.show = false">Batal</button>
          <button class="danger" @click="completeWork(confirmModal.item)">Ya, selesai</button>
        </div>
      </div>
    </div>

    <!-- Toast sederhana -->
    <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.message }}</div>
  </div>
</template>

<script>
import api from "@/API/api"; // sesuaikan path api kamu

export default {
  name: "Riwayat",
  data() {
    return {
      riwayat: [],
      loading: false,
      filterStatus: "",
      page: 1,
      perPage: 6,
      confirmModal: { show: false, item: null },
      toast: { show: false, message: "", type: "" },
    };
  },
  computed: {
    filtered() {
      // filter berdasarkan status jika ada filter dipilih
      if (!this.filterStatus) return this.riwayat;
      return this.riwayat.filter(r => r.status === this.filterStatus);
    },
    total() {
      return this.filtered.length;
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.total / this.perPage));
    },
    paginated() {
      const start = (this.page - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    }
  },
  methods: {
    // Ambil data riwayat gabungan (lamaran + pekerjaan) dan normalisasi status
    async getRiwayat() {
      this.loading = true;
      try {
        const res = await api.get("/pekerjaan/riwayat-gabungan", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        let raw = [];
        if (res.data?.success && Array.isArray(res.data.data)) {
          raw = res.data.data;
        } else if (Array.isArray(res.data)) {
          raw = res.data;
        } else if (Array.isArray(res.data?.data)) {
          raw = res.data.data;
        }

        let gabungan = raw.map((it, idx) => {
          // Normalisasi objek loker (bisa string atau object dari backend)
          let lokerObj = null;
          if (it.loker) {
            if (typeof it.loker === "string") {
              lokerObj = { judul: it.loker };
            } else if (typeof it.loker === "object") {
              lokerObj = {
                judul:
                  it.loker.judul ??
                  it.loker.name ??
                  it.loker.title ??
                  (it.loker?.judul ? it.loker.judul : null)
              };
            }
          } else if (it.loker_judul) {
            lokerObj = { judul: it.loker_judul };
          } else if (it.judul) {
            lokerObj = { judul: it.judul };
          }

          // Normalisasi status: tangani variasi (rejected, reject, tolak, dll.)
          const rawStatus = (it.status ?? "").toString().toLowerCase().trim();
          const normalizedStatus = (() => {
            if (rawStatus === "diterima" || rawStatus === "accepted") return "diterima";
            if (["rejected", "reject", "tolak", "ditolak"].includes(rawStatus)) return "ditolak";
            if (["aktif", "active"].includes(rawStatus)) return "aktif";
            if (rawStatus === "pending") return "pending";
            if (rawStatus === "selesai" || rawStatus === "finished") return "selesai";
            if (["dibatalkan", "cancelled", "canceled"].includes(rawStatus)) return "dibatalkan";
            // fallback ke raw status (aman)
            return rawStatus || null;
          })();

          // pastikan type: backend biasanya sudah mengisi 'type' (lamaran/pekerjaan)
          const type = it.type ?? it.tipe ?? null;

          return {
            id: it.id ?? null,
            _uid: `riwayat-${Date.now()}-${idx}`,
            type: type,
            status: normalizedStatus,
            tanggal: it.tanggal ?? it.tanggal_mulai ?? it.created_at ?? null,
            tanggal_selesai: it.tanggal_selesai ?? null,
            loker: lokerObj,
            raw: it
          };
        });

        // hilangkan duplikat berdasarkan id (tetap jaga urutan)
        const uniqueMap = new Map();
        gabungan.forEach(item => {
          // bila id null/undefined, buat key unik dari _uid
          const key = item.id ?? item._uid;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        // Simpan semua tipe (lamaran + pekerjaan) — penting supaya 'ditolak' dari lamaran tampil
        this.riwayat = Array.from(uniqueMap.values());

      } catch (err) {
        console.error("Gagal memuat riwayat:", err);
        this.showToast("Gagal memuat riwayat. Cek jaringan.", "error");
        this.riwayat = [];
      } finally {
        this.loading = false;
      }
    },

    getTitle(item) {
      if (!item) return "Judul tidak tersedia";
      if (item.loker?.judul) return item.loker.judul;
      if (item.raw?.loker?.judul) return item.raw.loker.judul;
      if (typeof item.raw?.loker === "string") return item.raw.loker;
      if (item.raw?.judul) return item.raw.judul;
      return "Judul tidak tersedia";
    },

    formatTanggal(date) {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    },

    humanStatus(status) {
      const map = {
        pending: "Pending",
        diterima: "Diterima",
        ditolak: "Ditolak",
        aktif: "Aktif",
        selesai: "Selesai",
        dibatalkan: "Dibatalkan"
      };
      return map[status] ?? (status ? status.toString() : "-");
    },

    statusClass(status) {
      if (status === "pending") return "pending";
      if (status === "diterima" || status === "aktif") return "aktif";
      if (status === "ditolak") return "ditolak";
      if (status === "selesai") return "selesai";
      if (status === "dibatalkan") return "dibatalkan";
      return "other";
    },

    onFilterChange() {
      this.page = 1;
    },

    confirmComplete(item) {
      this.confirmModal.item = item;
      this.confirmModal.show = true;
    },

    async completeWork(item) {
      if (!item || !item.id) return;
      this.confirmModal.show = false;

      const id = item.id;
      try {
        const previousStatus = item.status;
        item.status = "selesai";
        item.tanggal_selesai = new Date().toISOString();

        const res = await api.put(`/pekerjaan/${id}/status/selesai`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (res.data?.success) {
          this.showToast("Pekerjaan berhasil ditandai selesai.", "success");
          this.getRiwayat();
        } else {
          item.status = previousStatus;
          delete item.tanggal_selesai;
          this.showToast("Gagal menandai selesai.", "error");
        }
      } catch (err) {
        console.error("Error complete:", err);
        item.status = previousStatus || item.status;
        delete item.tanggal_selesai;
        this.showToast("Gagal terhubung ke server.", "error");
      }
    },

    showToast(message, type = "info", ms = 3500) {
      this.toast = { show: true, message, type };
      setTimeout(() => (this.toast.show = false), ms);
    }
  },
  mounted() {
    this.getRiwayat();
  },
};
</script>

<style scoped>
.riwayat-container { max-width: 920px; margin: 0 auto; padding: 16px; font-family: Inter, system-ui, sans-serif; }

.controls { display:flex; justify-content:space-between; align-items:center; margin: 12px 0; }
.title { margin:0; font-size:20px; color:#222; }
.controls-right { display:flex; align-items:center; gap:12px; }
select { padding:6px 8px; border-radius:6px; border:1px solid #ccc; }

/* Skeleton */
.skeleton-list { display:flex; flex-direction:column; gap:12px; }
.skeleton { display:flex; justify-content:space-between; background:#f6f6f6; border-radius:10px; height:80px; padding:12px; }
.skeleton-left { width:70%; background:linear-gradient(90deg,#eee,#f5f5f5); border-radius:6px; }
.skeleton-right { width:25%; background:linear-gradient(90deg,#eee,#f5f5f5); border-radius:6px; }

/* Cards */
.list { display:flex; flex-direction:column; gap:12px; margin-top:8px; }
.riwayat-card { display:flex; justify-content:space-between; align-items:center; padding:14px; border-radius:10px; background:#fafafa; border:1px solid #eee; }
.info { max-width:70%; }
.judul { font-weight:700; margin:0 0 6px; }
.tanggal { margin:0; color:#777; font-size:13px; }
.tipe { font-size:12px; color:#888; }

/* Right area */
.right-area { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }

/* Status */
.status { padding:8px 14px; border-radius:8px; color:#fff; font-weight:600; text-transform:capitalize; }
.status.aktif { background:#3498db; }
.status.selesai { background:#2ecc71; }
.status.ditolak { background:#e74c3c; }
.status.pending { background:#f39c12; }
.status.dibatalkan { background:#95a5a6; }
.status.other { background:#95a5a6; }

/* Actions */
.actions { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
.btn-complete { background:#2ecc71; color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; }
.btn-complete:hover { filter:brightness(.95); }
.finished-at { font-size:12px; color:#555; margin:0; }

/* Pagination */
.pagination { display:flex; justify-content:center; gap:12px; margin-top:16px; align-items:center; }
.pagination button { padding:6px 10px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; }

/* Modal */
.modal { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; justify-content:center; align-items:center; }
.modal-content { background:#fff; padding:18px; border-radius:12px; max-width:420px; width:90%; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.modal-actions .danger { background:#e74c3c; color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; }

/* Toast */
.toast { position:fixed; right:20px; bottom:20px; padding:10px 14px; border-radius:8px; color:#fff; }
.toast.info { background:#3498db; }
.toast.success { background:#2ecc71; }
.toast.error { background:#e74c3c; }
</style>
