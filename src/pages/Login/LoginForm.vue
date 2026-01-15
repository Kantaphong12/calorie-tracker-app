<script setup lang="ts">
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
// const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'https://calorie.surindev.com'; //deploy
const isRegisterMode = ref(false);
const fullName = ref('กันตพงศ์ แก้วเกษ');
const email = ref('kantaphong@gmail.com');
const password = ref('password123');
const confirmPassword = ref('password123');
const loading = ref(false);
const age = ref('27');
const weight = ref('63');
const height = ref('170');
const gender = ref('male');
// const activity_level = ref('');
// const target_cals = ref('');

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value;
}
async function submitForm() {
  loading.value = true;

  // Simulate async operation
  if (isRegisterMode.value) {
    const payload = {
      name: fullName.value,
      email: email.value,
      password: password.value,
      gender: gender.value,
      age: Number(age.value),
      weight: Number(weight.value),
      height: Number(height.value),
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/Register`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || 'Registration successful');
      }
      Notify.create({
        type: 'positive',
        position: 'top-right',
        message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ',
      });
      toggleMode();
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.error('error', error);
    }
  } else {
    const payload = {
      email: email.value,
      password: password.value,
    };
    const response = await fetch(`${API_BASE_URL}/api/Login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errData = await response.text();
      if (errData) {
        Notify.create({
          type: 'negative',
          position: 'top-right',
          message: `Login Failed! ${errData}`,
        });
        loading.value = false;
        return;
      }
      loading.value = false;
    } else {
      const responseData = await response.json();
      console.log(responseData);
      localStorage.setItem('authToken', responseData.token); // save token
      localStorage.setItem('UserID', responseData.user.id); // save token

      void router.replace('/calorie'); // redirect to protected route

      loading.value = false;
      Notify.create({
        type: 'positive',
        position: 'top-right',
        message: 'Login successful!',
      });
    }
  }
}
</script>
<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 400px; max-width: 90vw">
      <!-- ส่วนหัวข้อ -->
      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-center">
          {{ isRegisterMode ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบ' }}
        </div>
      </q-card-section>

      <!-- ส่วนฟอร์ม -->
      <q-card-section class="q-gutter-md">
        <!-- ชื่อ (โชว์เฉพาะตอนสมัคร) -->
        <q-input
          v-if="isRegisterMode"
          v-model="fullName"
          label="ชื่อ-นามสกุล"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกชื่อ']"
        />
        <q-input
          v-if="isRegisterMode"
          v-model="age"
          label="อายุ"
          type="number"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกอายุ']"
        />
        <q-input
          v-if="isRegisterMode"
          v-model="height"
          label="ส่วนสูง"
          type="number"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกส่วนสูง']"
        />
        <q-input
          v-if="isRegisterMode"
          v-model="weight"
          label="น้ำหนัก"
          type="number"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกน้ำหนัก']"
        />
        <div v-if="isRegisterMode" class="q-px-sm">
          <div class="text-grey-7 q-mb-sm" style="font-size: 14px">เพศ</div>
          <div class="q-gutter-sm row">
            <q-radio v-model="gender" val="male" label="ชาย" dense color="primary" />
            <q-radio v-model="gender" val="female" label="หญิง" dense color="pink" />
            <q-radio v-model="gender" val="lgbtq" label="LGBTQ+" dense color="purple" />
            <q-radio v-model="gender" val="not_specified" label="ไม่ระบุ" dense color="grey" />
          </div>
        </div>

        <q-input
          v-model="email"
          label="อีเมล"
          type="email"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกอีเมล']"
        />

        <q-input
          v-model="password"
          label="รหัสผ่าน"
          type="password"
          dense
          outlined
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'กรุณากรอกรหัสผ่าน']"
        />

        <!-- ยืนยันรหัสผ่าน (โชว์เฉพาะตอนสมัคร) -->
        <q-input
          v-if="isRegisterMode"
          v-model="confirmPassword"
          label="ยืนยันรหัสผ่าน"
          type="password"
          dense
          outlined
          :rules="[(val) => val === password || 'รหัสผ่านไม่ตรงกัน']"
        />
      </q-card-section>

      <!-- ปุ่ม Action -->
      <q-card-actions class="q-px-md q-pb-md column q-gutter-sm">
        <q-btn @click="submitForm" color="primary" class="full-width" :loading="loading">
          {{ isRegisterMode ? 'ยืนยันการสมัคร' : 'เข้าสู่ระบบ' }}
        </q-btn>

        <!-- ปุ่มสลับโหมด Login <-> Register -->
        <q-btn flat color="secondary" class="full-width" @click="toggleMode">
          {{ isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>
