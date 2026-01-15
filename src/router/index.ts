import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // --------------------------------------------------------------
  // 🔥 START: Logic ยามเฝ้าประตู (Navigation Guard)
  // --------------------------------------------------------------
  Router.beforeEach((to, from, next) => {
    // 1. ดึง Token จาก Storage
    const token = localStorage.getItem('authToken');

    // 2. เช็คว่าปลายทาง (to) มีป้าย 'requiresAuth' แปะไว้ไหม
    // ใช้ .some() เพราะบางทีเราแปะที่ Parent Route แล้วลูกๆ จะติดไปด้วย
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    // --- 🔍 DEBUG LOG: ขั้นตอนการตัดสินใจ 1-2-3-4 ---
    console.log(`%c 👮 Router Guard: ${to.path} `, 'background: #222; color: #bada55');
    console.log(`   1. ต้องการ Login ไหม? : ${requiresAuth}`);
    console.log(`   2. มี Token ไหม?      : ${!!token}`);

    // 3. เริ่มตัดสินใจ
    if (requiresAuth && !token) {
      // Case A: จะเข้าห้องล็อค แต่ไม่มีกุญแจ -> ถีบไปหน้า Login
      console.log('   🛑 Case A: Access Denied -> ไป Login ซะ');
      next('/login');
    } else if (to.path === '/login' && token) {
      // Case B: มีกุญแจแล้ว จะไปหน้า Login อีกทำไม -> ส่งไปหน้าแรก (UX ที่ดี)
      console.log('   ⚠️ Case B: Login อยู่แล้ว -> ไปหน้าแรก');
      next('/');
    } else {
      // Case C: ผ่านตลอด (ห้องไม่ได้ล็อค หรือ มีกุญแจแล้ว)
      console.log('   ✅ Case C: Access Granted -> เชิญครับ');
      next(); // อนุญาตให้ไปต่อ
    }
  });
  // --------------------------------------------------------------
  // 🔥 END: Logic
  // --------------------------------------------------------------

  return Router;
});
