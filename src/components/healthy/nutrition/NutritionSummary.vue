<script setup lang="ts">
import type CalorieItem from 'src/types/healthy';
import { computed, ref } from 'vue';
const weight = ref<number>(65);

// หา TDEE
// คำนวณ Lean Body Mass (LBM)
const lbm = computed(() => {
  return weight.value * (1 - props.body_fat / 100);
});
// คำนวณ BMR ด้วย Katch-McArdle Formula
const bmr = computed(() => {
  return 370 + 21.6 * lbm.value;
});
// คำนวณ TDEE
const tdee = computed(() => {
  return (bmr.value * props.activityLevel).toFixed(2);
});
//
const props = withDefaults(
  defineProps<{
    // tdee: string | null;
    // weight: number | null;
    activityLevel: number;
    body_fat: number;
    toDayCalsData: CalorieItem[];
  }>(),
  {},
);
// คำนวนสารอาหารทั้งหมดใน array
const nutritionTotals = computed(() => {
  // เริ่มต้นด้วยค่า 0 ทั้งหมด
  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    leucine: 0,
    magnesium: 0,
    zinc: 0,
  };

  // วนลูปผ่านข้อมูลอาหารทั้งหมด
  props.toDayCalsData.forEach((item) => {
    // แปลงเป็นตัวเลข ถ้าเป็น null หรือ undefined จะได้ 0
    totals.calories += Number(item.calories) || 0;
    totals.protein += Number(item.protein) || 0;
    totals.fat += Number(item.fat) || 0;
    totals.carbs += Number(item.carbs) || 0;
    totals.leucine += Number(item.leucine) || 0;
    totals.magnesium += Number(item.magnesium) || 0;
    totals.zinc += Number(item.zinc) || 0;
  });

  return totals;
});
</script>

<template>
  <q-item-section>
    <q-item-label
      ><div class="text-h5 text-primary">
        พลังงานทั้งหมด
        <span class="text-h5 text-negative">{{ nutritionTotals.calories || '0' }} </span> cals จาก
        TDEE
        <span class="text-h5 text-negative"> {{ tdee }}</span>
      </div>
    </q-item-label>
    <div class="row q-col-gutter-sm q-mt-sm">
      <div class="col-4">
        <div class="col-4">
          <q-badge
            :label="`Protein: ${nutritionTotals.protein.toFixed(2)} g : ${(nutritionTotals.protein * 4).toFixed(2)} cals คิดเป็น ${((nutritionTotals.protein / (weight * 2)) * 100).toFixed(1)}% `"
            color="blue-3"
            text-color="black"
            class="q-mr-sm cursor-pointer"
          >
            <q-tooltip>
              โปรตีนแนะนำ 1.6–2.2 g/กก.น้ำหนักตัว สำหรับ {{ weight }} กก. → {{ weight * 1.6 }}–{{
                weight * 2
              }}
              g/วัน ( เราใช้ค่ากลาง 2 )
            </q-tooltip>
          </q-badge>
        </div>
        <div class="col-4">
          <q-badge
            :label="`Fat: ${nutritionTotals.fat} g : ${(nutritionTotals.fat * 9).toFixed(2)} cals คิดเป็น ${((nutritionTotals.fat / (weight * 0.8)) * 100).toFixed(1)}% `"
            color="amber-4"
            text-color="black"
            class="q-mr-sm cursor-pointer"
          >
            <q-tooltip>
              ไขมันประมาณ 0.6–1 g/กก.น้ำหนักตัว {{ weight }} กก. → {{ weight * 0.8 }}–{{
                weight * 1
              }}
              g/วัน ( เราใช้ค่ากลาง 0.8 )
            </q-tooltip>
          </q-badge>
        </div>
        <div class="col-4">
          <q-badge
            :label="`Carb: ${nutritionTotals.carbs} g : ${(nutritionTotals.carbs * 5).toFixed(2)} cals คิดเป็น ${((nutritionTotals.carbs / (weight * 5)) * 100).toFixed(1)}% `"
            color="green-3"
            text-color="black"
            class="q-mr-sm cursor-pointer"
          >
            <q-tooltip>
              คาร์บแนะนำ ~4–6 g/กก. สำหรับผู้สร้างกล้าม {{ weight }} กก. → {{ weight * 4 }}–{{
                weight * 6
              }}
              g/วัน ( เราใช้ค่ากลาง 5 )
            </q-tooltip>
          </q-badge>
        </div>
      </div>

      <div class="col-4"></div>
      <div class="col-4">
        <div class="col-4">
          <div class="col-4">
            <q-badge
              :label="`Leucine: ${nutritionTotals.leucine} g คิดเป็น ${((nutritionTotals.leucine / 9) * 100).toFixed(1)}% `"
              color="deep-purple-3"
              text-color="white"
              class="q-mr-sm cursor-pointer"
            >
              <q-tooltip>
                ลูซีน 2.5–3 g ต่อมื้อโปรตีน วันละ 6–9 g เพื่อกระตุ้นการสร้างกล้าม (MPS) ( เราใช้ค่า
                9 )
              </q-tooltip>
            </q-badge>
          </div>
          <div class="col-4">
            <q-badge
              :label="`Zinc: ${nutritionTotals.zinc} g คิดเป็น ${((nutritionTotals.zinc * 100) / 15).toFixed(1)}%`"
              color="grey-4"
              text-color="black"
              class="cursor-pointer"
            >
              <q-tooltip>
                ซิงค์แนะนำ 12–15 mg/วัน(ชาย) 9-12 mg/วัน(หญิง) สำคัญต่อระบบภูมิคุ้มกัน
                และฮอร์โมนเพศชาย ( เราใช้ค่า 15 )
              </q-tooltip>
            </q-badge>
          </div>
          <div class="col-4">
            <q-badge
              :label="`Magnesium: ${nutritionTotals.magnesium} g คิดเป็น ${((nutritionTotals.magnesium * 100) / 500).toFixed(1)}%`"
              color="teal-3"
              text-color="black"
              class="q-mr-sm cursor-pointer"
            >
              <q-tooltip>
                แมกนีเซียมแนะนำ ~450–500 mg/วัน(ชาย) 350–400 mg/วัน(หญิง) ช่วยการฟื้นฟู กล้ามเนื้อ
                และระบบประสาท ( เราใช้ค่า 500 )
              </q-tooltip>
            </q-badge>
          </div>
        </div>
      </div>

      <div class="col-4"></div>
    </div>
  </q-item-section>
</template>
