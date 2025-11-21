import { createRouter, createWebHistory } from 'vue-router'

// === Auth ===
import Login from '../view/auth/login.vue'
import Register from '../view/auth/register.vue'
import PilihRole from '../view/auth/pilih_role.vue'

// === Pekerja ===
import LokerList from '../view/pekerja/lokerlist.vue'
import LokerDetail from '../view/pekerja/lokerdetail.vue'

// === Profil ===
import Profil from '../view/profil/profil.vue'
import EditProfil from '../view/profil/editprofil.vue'
import ProfilPelamar from '../view/profil/profilpelamar.vue'

// === Pemberi Kerja ===
import DaftarLoker from '../view/pemberi_kerja/daftarloker.vue'
import PelamarList from '../view/pemberi_kerja/pelamarlist.vue'
import TambahLoker from '../view/pemberi_kerja/tambahloker.vue'
import EditLoker from '../view/pemberi_kerja/editloker.vue'

// === Superadmin (versi branch aza) ===
import SuperAdminView from '../view/SuperAdminView.vue'

const routes = [
  // === Auth ===
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/pilih_role', name: 'PilihRole', component: PilihRole },

  // === Pekerja & umum ===
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

  // === Profil ===
  { path: '/profil', name: 'Profil', component: Profil },
  { path: '/profil/edit', name: 'EditProfil', component: EditProfil },
  {
    path: '/profil/:id',
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

  // === Superadmin (simple saja) ===
  {
    path: '/superadmin',
    name: 'superadmin',
    component: SuperAdminView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// === Middleware ===
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = (localStorage.getItem('role') || '').toLowerCase()
  const email = localStorage.getItem('email')
  const isSuperadmin = email === 's@s.s'

  // === Superadmin override seluruh akses ===
  if (isSuperadmin && to.path !== '/superadmin') {
    return next('/superadmin')
  }

  // === Cek login ===
  if (!token && !['/login', '/register', '/pilih_role'].includes(to.path)) {
    return next('/login')
  }

  // === User sudah login tapi belum pilih role ===
  if (token && !role && to.path !== '/pilih_role') {
    return next('/pilih_role')
  }

  // === Cek role di route ===
  if (to.meta.role && to.meta.role !== role) {
    return next('/lokerlist')
  }

  next()
})

export default router
