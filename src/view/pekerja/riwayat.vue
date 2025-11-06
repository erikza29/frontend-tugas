<template>
  <div class="riwayat-container">
    <!-- ===== Header & Controls ===== -->
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
        <div class="summary"><span>{{ total }} item</span></div>
      </div>
    </div>

    <!-- ===== Loading Skeleton ===== -->
    <div v-if="loading" class="skeleton-list" aria-busy="true">
      <div class="skeleton" v-for="n in 3" :key="n">
        <div class="skeleton-left"></div>
        <div class="skeleton-right"></div>
      </div>
    </div>

    <!-- ===== Content ===== -->
    <div v-else>
      <div v-if="riwayat.length === 0" class="no-data">Belum ada riwayat.</div>

      <div v-else class="list">
        <div
          v-for="item in paginated"
          :key="item._uid || item.id"
          class="riwayat-card"
          role="article"
        >
          <div class="info">
            <p class="judul">{{ getTitle(item) }}</p>
            <p class="tanggal">{{ formatTanggal(item.tanggal) }}</p>
            <small class="tipe" v-if="item.type">Tipe: {{ item.type }}</small>
          </div>

          <div class="right-area">
            <div :class="['status', statusClass(item.status)]">{{ humanStatus(item.status) }}</div>

            <div class="actions">
              <button
                v-if="item.type === 'pekerjaan' && item.status === 'aktif'"
                class="btn-complete"
                @click="confirmComplete(item)"
              >
                Tandai Selesai
              </button>

              <p v-if="item.status === 'selesai' && item.tanggal_selesai" class="finished-at">
                Selesai: {{ formatTanggal(item.tanggal_selesai) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Pagination ===== -->
      <div class="pagination" v-if="pageCount > 1">
        <button :disabled="page === 1" @click="page--">Prev</button>
        <span>Halaman {{ page }} / {{ pageCount }}</span>
        <button :disabled="page === pageCount" @click="page++">Next</button>
      </div>
    </div>

    <!-- ===== Modal Konfirmasi ===== -->
    <div v-if="confirmModal.show" class="modal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <h3>Konfirmasi</h3>
        <p>
          Anda yakin ingin menandai pekerjaan
          "<strong>{{ getTitle(confirmModal.item) }}</strong>" sebagai selesai?
        </p>
        <div class="modal-actions">
          <button @click="confirmModal.show = false">Batal</button>
          <button class="danger" @click="completeWork(confirmModal.item)">Ya, selesai</button>
        </div>
      </div>
    </div>

    <!-- ===== Toast ===== -->
    <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.message }}</div>
  </div>
</template>

<script>
import api from "@/API/api";

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
      if (!this.filterStatus) return this.riwayat;
      return this.riwayat.filter((r) => r.status === this.filterStatus);
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
    },
  },
  methods: {
    async getRiwayat() {
      this.loading = true;
      try {
        const res = await api.get("/pekerjaan/riwayat-gabungan", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        let raw = [];
        if (res.data?.success && Array.isArray(res.data.data)) raw = res.data.data;
        else if (Array.isArray(res.data)) raw = res.data;
        else if (Array.isArray(res.data?.data)) raw = res.data.data;

        const gabungan = raw.map((it, idx) => {
          const lokerObj =
            typeof it.loker === "object"
              ? { judul: it.loker.judul || it.loker.name || it.loker.title }
              : { judul: it.loker || it.judul || it.loker_judul };

          const normalizedStatus = (() => {
            const s = (it.status || "").toLowerCase();
            if (["diterima", "accepted"].includes(s)) return "diterima";
            if (["rejected", "reject", "tolak", "ditolak"].includes(s)) return "ditolak";
            if (["aktif", "active"].includes(s)) return "aktif";
            if (s === "pending") return "pending";
            if (["selesai", "finished"].includes(s)) return "selesai";
            if (["dibatalkan", "cancelled", "canceled"].includes(s)) return "dibatalkan";
            return s;
          })();

          return {
            id: it.id,
            _uid: `riwayat-${Date.now()}-${idx}`,
            type: it.type ?? it.tipe ?? null,
            status: normalizedStatus,
            tanggal: it.tanggal ?? it.tanggal_mulai ?? it.created_at,
            tanggal_selesai: it.tanggal_selesai ?? null,
            loker: lokerObj,
            raw: it,
          };
        });

        const unique = Array.from(new Map(gabungan.map((i) => [i.id ?? i._uid, i])).values());
        this.riwayat = unique;
      } catch (err) {
        console.error(err);
        this.showToast("Gagal memuat riwayat.", "error");
      } finally {
        this.loading = false;
      }
    },
    getTitle(item) {
      return (
        item?.loker?.judul ||
        item?.raw?.loker?.judul ||
        item?.raw?.judul ||
        item?.raw?.loker ||
        "Judul tidak tersedia"
      );
    },
    formatTanggal(date) {
      if (!date) return "-";
      const d = new Date(date);
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
    humanStatus(s) {
      const m = {
        pending: "Pending",
        diterima: "Diterima",
        ditolak: "Ditolak",
        aktif: "Aktif",
        selesai: "Selesai",
        dibatalkan: "Dibatalkan",
      };
      return m[s] || s;
    },
    statusClass(s) {
      return s;
    },
    onFilterChange() {
      this.page = 1;
    },
    confirmComplete(i) {
      this.confirmModal = { show: true, item: i };
    },
    async completeWork(i) {
      if (!i?.id) return;
      this.confirmModal.show = false;
      const prev = i.status;
      i.status = "selesai";
      try {
        const res = await api.put(`/pekerjaan/${i.id}/status/selesai`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data?.success) {
          this.showToast("Pekerjaan berhasil diselesaikan.", "success");
          this.getRiwayat();
        } else {
          i.status = prev;
          this.showToast("Gagal menandai selesai.", "error");
        }
      } catch {
        i.status = prev;
        this.showToast("Gagal terhubung ke server.", "error");
      }
    },
    showToast(m, t = "info", ms = 3000) {
      this.toast = { show: true, message: m, type: t };
      setTimeout(() => (this.toast.show = false), ms);
    },
  },
  mounted() {
    this.getRiwayat();
  },
};
</script>

<style scoped>
.riwayat-container {
  max-width: 980px;
  margin: 40px auto;
  padding: 28px;
  background: #f9fafb;
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  font-family: "Poppins", sans-serif;
}

/* Header */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 14px;
}
select:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}
.summary {
  font-size: 14px;
  color: #6b7280;
}

/* Cards */
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.riwayat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.25s ease;
}
.riwayat-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.info .judul {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.info .tanggal {
  font-size: 13px;
  color: #6b7280;
}
.info .tipe {
  font-size: 12px;
  color: #9ca3af;
}

/* Status Badge */
.status {
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 600;
  color: white;
  font-size: 13px;
  text-align: center;
}
.status.pending { background: #fbbf24; }
.status.diterima { background: #10b981; }
.status.aktif { background: #3b82f6; }
.status.ditolak { background: #ef4444; }
.status.selesai { background: #14b8a6; }
.status.dibatalkan { background: #9ca3af; }

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.btn-complete {
  background: linear-gradient(to right, #10b981, #059669);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: 0.25s;
}
.btn-complete:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

/* Pagination */
.pagination {
  margin-top: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.pagination button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
}
.pagination button:hover {
  background: #0ea5e9;
  color: white;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 14px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}
.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-actions button {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.modal-actions .danger {
  background: #ef4444;
  color: #fff;
}

/* Toast */
.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  color: #fff;
}
.toast.info { background: #3b82f6; }
.toast.success { background: #10b981; }
.toast.error { background: #ef4444; }

@media (max-width: 700px) {
  .riwayat-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .right-area {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
