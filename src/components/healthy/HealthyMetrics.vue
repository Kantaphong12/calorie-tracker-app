<script setup lang="ts">
import { ref } from 'vue';
const activityOptions = [
  {
    value: 0,
    label: 'เลือกกิจกรรม',
    short: '',
    description: '',
  },
  {
    value: 1.2,
    label: 'Sedentary',
    short: 'นั่งทำงาน',
    description: 'นั่งทำงานตลอดวัน ไม่ออกกำลังกาย',
  },
  {
    value: 1.375,
    label: 'Lightly Active',
    short: 'ออกกำลังกายเบา',
    description: 'ออกกำลังกายเบา 1–3 วัน/สัปดาห์',
  },
  {
    value: 1.55,
    label: 'Moderately Active',
    short: 'ออกกำลังกายปานกลาง',
    description: 'ออกกำลังกายปานกลาง 3–5 วัน/สัปดาห์',
  },
  {
    value: 1.725,
    label: 'Very Active',
    short: 'ออกกำลังกายหนัก',
    description: 'ออกกำลังกายหนัก 6–7 วัน/สัปดาห์',
  },
  {
    value: 1.9,
    label: 'Extra Active',
    short: 'ออกกำลังกายหนัก+',
    description: 'ออกกำลังกายหนัก + งานหนัก/ฝึกซ้อมซ้ำหลายครั้ง',
  },
];
const props = defineProps<{
  weight: string | number | null;
  height: string | number | null;
  body_fat: string | number | null;
  activityLevel: string | number | null;
}>();
const emit = defineEmits<{
  (e: 'update:weight', value: string | number | null): void;
  (e: 'update:height', value: string | number | null): void;
  (e: 'update:body_fat', value: string | number | null): void;
  (e: 'update:activityLevel', value: string | number | null): void;
}>();
const updateWeight = (newWeight: string | number | null) => {
  emit('update:weight', newWeight);
};
const updateHeight = (NewHeight: string | number | null) => {
  emit('update:height', NewHeight);
};
const updatebody_fat = (newBody_fat: string | number | null) => {
  emit('update:body_fat', newBody_fat);
};
const updateactivityLevel = (newactivityLevel: string | number | null) => {
  emit('update:activityLevel', newactivityLevel);
};
const weightStatus = ref(false);
const heightStatus = ref(false);
const body_fatStatus = ref(false);
function editWeight() {
  weightStatus.value = true;
}
function editbody_fat() {
  body_fatStatus.value = true;
}
function editHeight() {
  // alert('test');
  heightStatus.value = true;
}
//  :model-value="props.weight"         <!-- รับค่า -->
// @update:model-value="updateWeight"  <!-- ส่งค่าใหม่ -->
</script>
<template>
  <div class="col-md-3" style="padding: 10px">
    <q-item class="metric-card">
      <q-item-section class="metric-header" v-if="weightStatus == false" avatar>
        <q-icon color="primary " name="monitor_weight" /><span class="metric-title">น้ำหนัก</span>
      </q-item-section>
      <q-item-section class="metric-content">
        <div class="metric-value">
          {{ props.weight || 0 }} <span class="metric-unit"> kg.</span>
        </div>
        <q-icon
          v-if="weightStatus == false"
          @click="editWeight"
          name="edit_note"
          color="primary"
          size="sm"
          class="edit-btn"
        />
        <q-item-label v-if="weightStatus == true" class="edit-mode">
          <q-input
            class="inputmetric"
            bottom-slots
            :model-value="props.weight"
            @update:model-value="updateWeight"
            label=""
            maxlength="12"
            dense
          >
            <template v-slot:before> </template>

            <template v-slot:after>
              <q-btn @click="weightStatus = false" round dense flat icon="send" />
            </template>
          </q-input>
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
  <div class="col-md-3" style="padding: 10px">
    <q-item class="metric-card">
      <q-item-section class="metric-header" v-if="heightStatus == false" avatar>
        <q-icon color="primary" name="straighten" /><span class="metric-title">ส่วนสูง</span>
      </q-item-section>
      <q-item-section class="metric-content">
        <div class="metric-value">
          {{ props.height || 0 }} <span class="metric-unit"> cm.</span>
        </div>
        <q-icon
          v-if="heightStatus == false"
          @click="editHeight"
          name="edit_note"
          color="primary"
          size="sm"
          class="edit-btn"
        />
        <q-item-label v-if="heightStatus" class="edit-mode">
          <q-input
            class="inputmetric"
            bottom-slots
            :model-value="props.height"
            @update:model-value="updateHeight"
            label=""
            maxlength="12"
            dense
          >
            <template v-slot:before> </template>

            <template v-slot:after>
              <q-btn @click="heightStatus = false" round dense flat icon="send" />
            </template>
          </q-input>
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
  <div class="col-md-3" style="padding: 10px">
    <q-item class="metric-card">
      <q-item-section class="metric-header" v-if="body_fatStatus == false">
        <q-icon name="percent" color="primary" size="24px" /><span class="metric-title">ไขมัน</span>
      </q-item-section>
      <q-item-section class="metric-content">
        <div class="metric-value">
          {{ props.body_fat || 0 }} <span class="metric-unit"> %</span>
        </div>

        <q-icon
          v-if="body_fatStatus == false"
          @click="editbody_fat"
          name="edit_note"
          color="primary"
          size="sm"
          class="edit-btn"
        />
        <q-item-label v-if="body_fatStatus" class="edit-mode">
          <q-input
            class="inputmetric"
            bottom-slots
            :model-value="props.body_fat"
            @update:model-value="updatebody_fat"
            label=""
            maxlength="100"
            dense
          >
            <template v-slot:before> </template>

            <template v-slot:after>
              <q-btn @click="body_fatStatus = false" round dense flat icon="send" />
            </template>
          </q-input>
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
  <div class="col-md-3" style="padding: 10px">
    <q-item-label class="metric-card">
      <q-item-section class="metric-header">
        <q-select
          :model-value="props.activityLevel"
          @update:model-value="updateactivityLevel"
          :options="activityOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          dense
          outlined
          :label="
            props.activityLevel
              ? activityOptions.find((opt) => opt.value === props.activityLevel)?.short
              : 'เลือกระดับกิจกรรม'
          "
        >
          <template v-slot:option="scope">
            <q-item class="inputmetric" v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                <q-item-label caption class="text-positive"
                  >ตัวคูณ: {{ scope.opt.value }}</q-item-label
                >
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item-section>
    </q-item-label>
  </div>
</template>
