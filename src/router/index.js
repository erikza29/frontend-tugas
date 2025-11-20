import { createRouter, createWebHistory } from 'vue-router'

// === Auth ===
import Login from '../view/auth/login.vue'
import Register from '../view/auth/register.vue'
import PilihRole from '../view/auth/pilih_role.vue'

// === Pekerja ===
import LokerList from '../view/pekerja/lokerlist.vue'
import LokerDetail from '../view/pekerja/lokerdetail.vue'

// === Profil (semua role) ===
import Profil from '../view/profil/profil.vue'
import EditProfil from '../view/profil/editprofil.vue'
import ProfilPelamar from '../view/profil/profilpelamar.vue' // ✅ tambahan

// === Pemberi Kerja ===
import DaftarLoker from '../view/pemberi_kerja/daftarloker.vue'
import PelamarList from '../view/pemberi_kerja/pelamarlist.vue'
import TambahLoker from '../view/pemberi_kerja/tambahloker.vue'
import EditLoker from '../view/pemberi_kerja/editloker.vue'
import Superadmin from '../view/superadmin.vue'

const routes = [
  // === Auth ===
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/pilih_role', name: 'PilihRole', component: PilihRole },

  // === Semua role bisa akses ===
  { path: '/lokerlist', name: 'LokerList', component: LokerList },
  {
    path: '/lokerdetail/:id',
    name: 'LokerDetail',
    component: LokerDetail,
    props: true,
  },
  {
    path: '/lokerdetail/:id/pelamar',
    name: 'PelamarList',
    component: PelamarList,
  },
  {
    path: '/riwayat',
    name: 'Riwayat',
    component: () => import('@/view/pekerja/Riwayat.vue'),
    meta: { role: 'pekerja' },
  },

  // === Profil (umum) ===
  { path: '/profil', name: 'Profil', component: Profil },
  { path: '/profil/edit', name: 'EditProfil', component: EditProfil },
  {
    path: '/profil/:id', // ✅ route baru
    name: 'ProfilPelamar',
    component: ProfilPelamar,
    props: true,
  },

  // === Pemberi kerja ===
  {
    path: '/daftarloker',
    name: 'DaftarLoker',
    component: DaftarLoker,
    meta: { role: 'pemberi_kerja' },
  },
  {
    path: '/tambahloker',
    name: 'TambahLoker',
    component: TambahLoker,
    meta: { role: 'pemberi_kerja' },
  },
  {
    path: '/pemberi-kerja/tambah-loker',
    name: 'TambahLokerAlias',
    component: TambahLoker,
    meta: { role: 'pemberi_kerja' },
  },
  {
    path: '/pemberi-kerja/edit-loker/:id',
    name: 'EditLoker',
    component: EditLoker,
    meta: { role: 'pemberi_kerja' },
  },
  {
    path: '/superadmin',
    name: 'superadmin',
    component: Superadmin,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// === Middleware Proteksi Login + Role ===
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  // Jika route butuh role, cek login & role
  if (to.meta.role) {
    if (!isLoggedIn) {
      return next('/login')
    }
    if (to.meta.role !== userRole) {
      return next('/lokerlist') // fallback kalau role beda
    }
  }

  // Jika belum login & bukan ke halaman publik
  if (
    !isLoggedIn &&
    !['/login', '/register', '/pilih_role'].includes(to.path)
  ) {
    return next('/login')
  }

  // Jika sudah login tapi belum pilih role
  if (isLoggedIn && !userRole && to.path !== '/pilih_role') {
    return next('/pilih_role')
  }

  next()
})

export default router
