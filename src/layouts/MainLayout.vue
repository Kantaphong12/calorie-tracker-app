<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen">
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

// เมนูทั้งหมด (ของเดิม)
const allLinks: EssentialLinkProps[] = [
  {
    title: 'healthy',
    caption: 'Calorie Tacking',
    icon: 'favorite',
    link: '#/calorie', // เพิ่ม # นำหน้า
  },
  {
    title: 'ระบบจัดการงาน',
    caption: 'Work Management',
    icon: 'work',
    link: '#/worksmanagement', // เพิ่ม # นำหน้า
  },
  {
    title: 'โปรแกรมแผนจัดการงาน',
    caption: 'Work Management',
    icon: 'work',
    link: '#/projectplanning', // เพิ่ม # นำหน้า
  },
  {
    title: 'Dashboard',
    caption: 'Work Management',
    icon: 'work',
    link: '#/dashboard', // เพิ่ม # นำหน้า
  },
];

// เมนูเฉพาะ Planning (สำหรับคนที่ไม่ใช่ UserID 1)
const planningOnlyLinks: EssentialLinkProps[] = [
  {
    title: 'โปรแกรมแผนจัดการงาน',
    caption: 'Work Management',
    icon: 'work',
    link: '#/projectplanning',
  },
  {
    title: 'Dashboard',
    caption: 'Work Management',
    icon: 'work',
    link: '#/dashboard',
  },
];

// เช็คว่า login อยู่เป็นใคร ถ้าเป็น UserID 1 (เจ้าของระบบ) เห็นเมนูครบทุกอัน
// คนอื่น (เช่นเพื่อนที่ demo ให้ดู) เห็นแค่เมนู Planning เท่านั้น
// หมายเหตุ: กันแค่ระดับ UI เท่านั้น ไม่ใช่การป้องกันความปลอดภัยจริงจัง
// (ใครแก้ localStorage เองก็ยังเห็นเมนูอื่นได้ แต่ backend /taskapi, /api ยังต้องใช้ token
// ของ UserID 1 จริง ๆ ถึงจะดึงข้อมูลได้ ข้อมูลจริงไม่หลุดอยู่ดี)
const currentUserId = localStorage.getItem('UserID');
const linksList = computed<EssentialLinkProps[]>(() => {
  return currentUserId === '1' ? allLinks : planningOnlyLinks;
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
