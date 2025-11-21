<style scoped>
.relative {
  position: relative;
}
.z-10 {
  z-index: 10;
}
.q-mb-sm {
  margin: 0;
  padding: 0;
}
</style>
<script setup lang="ts">
import { debounce } from 'quasar';
import type CalorieItem from '../../types/healthy.ts';
import { ref, watch, onMounted } from 'vue';
import type { Column, FoodItem, listNameFood, RowData } from '../../types/healthy.ts';
import HealthyMetrics from 'src/components/healthy/HealthyMetrics.vue';
import NutritionSummary from 'src/components/healthy/nutrition/NutritionSummary.vue';
import useFoodDatabase from 'src/components/healthy/compossables/useFoodDatabase.vue';
import FoodDataTable from 'src/components/healthy/table/FoodDataTable.vue';
const inputValid = ref(false);

const getCurrentDate = new Date().toISOString().split('T')[0]?.replaceAll('-', '/');

const caloriesData = ref<CalorieItem[]>([]); //calories ของทุกวันไว้ทำระบบแยกวันต่อ
function toDayData(filterDate: string | undefined) {
  //แคลของวันนี้
  if (filterDate) {
    // alert(formattedDate);
    console.log(
      (toDayCalsData.value = caloriesData.value.filter((item) => item.date === filterDate)),
    );
    return (toDayCalsData.value = caloriesData.value.filter((item) => item.date === filterDate));
  }
  console.log(
    (toDayCalsData.value = caloriesData.value.filter((item) => item.date === filterDate)),
  );
  return (toDayCalsData.value = caloriesData.value.filter((item) => item.date === getCurrentDate));
  // console.log('toDayCalsData', toDayCalsData);
}
const toDayCalsData = ref<CalorieItem[]>([]);

const input = ref<CalorieItem>({
  date: getCurrentDate,
  foodname: '',
  calories: null,
  serving_size: null,
  carbs: null,
  protein: null,
  fat: null,
  leucine: null,
  magnesium: null,
  zinc: null,
});

watch(
  input,
  (value) => {
    inputValid.value = value.foodname !== '';
  },
  { deep: true },
);

const columns: Column[] = [
  {
    name: 'name',
    required: true,
    label: 'List Food',
    align: 'left',
    field: (row: RowData) => row.foodname,
    format: (val: string | number) => `${val}`,
    sortable: true,
  },
  { name: 'calories', align: 'center', label: 'calories', field: 'calories', sortable: true },
  { name: 'carbs', align: 'center', label: 'carbs (g)', field: 'carbs', sortable: true },
  { name: 'protein', align: 'center', label: 'protein (g)', field: 'protein', sortable: true },
  { name: 'fat', align: 'center', label: 'fat (g)', field: 'fat', sortable: true },
  { name: 'leucine', align: 'center', label: 'leucine (mg)', field: 'leucine', sortable: true },
  {
    name: 'magnesium',
    align: 'center',
    label: 'magnesium (mg)',
    field: 'magnesium',
    sortable: true,
  },
  { name: 'zinc', align: 'center', label: 'zinc (g)', field: 'zinc', sortable: true },
  {
    name: 'serving_size',
    align: 'center',
    label: 'serving (g)',
    field: 'serving_size',
    sortable: true,
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center', sortable: false },
];

const listNameFood = ref<listNameFood[]>([]);

const debounceText = ref<string>('');
const updateSearch = debounce((newVal) => {
  debounceText.value = newVal.toLocaleLowerCase();
  loading.value = false;
}, 100);
watch(
  () => input.value.foodname,

  (newVal) => {
    loading.value = true;
    updateSearch(newVal);
  },
  // รอ 300ms หลังพิมพ์เสร็จ ค่อยส่งค่าไปให้ filteredFoodsList
);

const baseCaloriesPerGram = ref<number | null>(null);
const baseProteinPerGram = ref<number | null>(null);
const baseFatPerGram = ref<number | null>(null);
const baseCarbsPerGram = ref<number | null>(null);
const baseLeucinePerGram = ref<number | null>(null);
const baseMagnesiumPerGram = ref<number | null>(null);
const baseZincPerGram = ref<number | null>(null);
const protein = ref<number>(0);
const fat = ref<number>(0);
const carbs = ref<number>(0);
const leucine = ref<number>(0);
const magnesium = ref<number>(0);
const zinc = ref<number>(0);

watch(
  () => input.value.serving_size,
  (newServing) => {
    if (baseCaloriesPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.calories = Math.round(baseCaloriesPerGram.value * newServing * 100) / 100;
    }
    if (baseProteinPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.protein = protein.value =
        Math.round(baseProteinPerGram.value * newServing * 100) / 100;
    }
    if (baseFatPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.fat = fat.value = Math.round(baseFatPerGram.value * newServing * 100) / 100;
    }
    if (baseCarbsPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.carbs = carbs.value = Math.round(baseCarbsPerGram.value * newServing * 100) / 100;
    }
    if (baseLeucinePerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.leucine = leucine.value =
        Math.round(baseLeucinePerGram.value * newServing * 100) / 100;
    }
    if (baseMagnesiumPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.magnesium = magnesium.value =
        Math.round(baseMagnesiumPerGram.value * newServing * 100) / 100;
    }
    if (baseZincPerGram.value !== null && typeof newServing === 'number' && newServing > 0) {
      input.value.zinc = zinc.value = Math.round(baseZincPerGram.value * newServing * 100) / 100;
      // alert(newServing);
      // alert(baseZincPerGram.value);
      // alert(baseZincPerGram.value * newServing * 100);
    }
    if (newServing == 0) {
      input.value.calories = null;
    }
  },
);

function removeDuplicatesByIdAndName<T extends { id: number | string; name: string }>(
  arr: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of arr) {
    const key = `${item.id}`;
    const name = `${item.name}`;
    if (!seen.has(key) && !seen.has(name)) {
      //loop เช็คถ้าชื่อกับไอดีมีซ้ำไม่ต้องเข้า function นี้
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

const dataFoodAPI = ref<FoodItem[]>([]);

const loading = ref(false);
const loadData = async () => {
  try {
    loading.value = true;
    const response = await fetch('/data/clean_food_menu.json');
    if (response.ok) {
      dataFoodAPI.value = await response.json();
      const newArr = removeDuplicatesByIdAndName(dataFoodAPI.value); //จัดการกับรายการซ้ำก่อน
      dataFoodAPI.value = newArr;
    } else {
      alert('ไม่สามารถโหลดไฟล์ได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    loading.value = false;
  }
};
onMounted(async () => {
  try {
    await loadData();
    loadFromLocalStorage();
    toDayData('');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดใน onMounted:', error);
  }
});

// เพิ่ม function ลบ
function deleteItem(index: number) {
  // alert(index);
  // return;
  //   foods.splice(1, 1);  // ลบตำแหน่งที่ 1, ลบ 1 ตัว
  // foods.splice(1, 2);  // ลบตำแหน่งที่ 1, ลบ 2 ตัว ไอ้ตัวถัดไปด้วย
  // foods.splice(1, 0, 'กะเพรา');  // ตำแหน่งที่ 1, ลบ 0 ตัว, เพิ่ม 'กะเพรา'
  caloriesData.value.splice(index, 1);
  localStorage.setItem('caloriesData', JSON.stringify(caloriesData.value)); //เซ็ทความจำ browser ตาม array
  loadFromLocalStorage();
}

const weight = ref<number>(65);

const height = ref<number>(170);

const body_fat = ref<number>(15);

// หา TDEE
const activityLevel = ref<number>(1.725); // ค่าเริ่มต้น

// บันทุกข้อมูลลง localstorage
const saveToLacalStorage = debounce(() => {
  localStorage.setItem('customFoods', JSON.stringify(customFoods.value));
  localStorage.setItem('caloriesData', JSON.stringify(caloriesData.value));
  loadFromLocalStorage(); //โหลดข้อมูลที่พึ่งเพิ่มไป
}, 10);
// เพิ่มตัวแปรสำหรับเก็บอาหารที่ user เพิ่มเอง
const customFoods = ref<FoodItem[]>([]);

//function ไว้เพิ่มข้อมูลลง loadFromLocalStorage

const loadFromLocalStorage = () => {
  const saveCustomFoods = localStorage.getItem('customFoods');
  const savedCaloriesData = localStorage.getItem('caloriesData');
  if (saveCustomFoods) {
    customFoods.value = JSON.parse(saveCustomFoods);
    dataFoodAPI.value = [...dataFoodAPI.value, ...customFoods.value]; //ยัดข้อมูลใหม่ไปใน api ที่โหลดมาโดยเอาข้อมูลใน LocalStorage ต่อเข้าไปด้วย
    // console.log(dataFoodAPI.value);
  }
  if (savedCaloriesData) {
    caloriesData.value = JSON.parse(savedCaloriesData); //caloriesData ที่เก็บใน localStorage แทน array
    toDayData(input.value.date);
    // console.log('caloriesData', caloriesData);
  }
};
watch(
  () => input.value.date,
  () => {
    toDayData(input.value.date);
  },
);
const handleFoodAdded = (newFoodItem: CalorieItem) => {
  console.log('รับข้อมูลจาก child:', newFoodItem);
  loadFromLocalStorage();
};
function handleDataUpdate() {
  saveToLacalStorage();
}
</script>
<template>
  <q-page>
    <div class="row">
      <div class="col-sm-4" style="padding: 15px">
        <q-card class="q-pa-md shadow-2 rounded-borders" style="max-width:">
          <q-card-section class="text-center">
            <div class="text-h5 text-primary">Calorie Tracker</div>
            <div class="row justify-center items-center q-mt-sm">
              <div class="text-subtitle2 text-grey q-mr-sm">บันทึกแคลอรีประจำวัน</div>
              <q-input
                style="max-width: 160px"
                class="q-ml-sm"
                filled
                v-model="input.date"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="input.date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-card-actions> </q-card-actions>
          </q-card-section>
          <useFoodDatabase
            :date="input.date"
            :caloriesData="caloriesData"
            @food-added="handleFoodAdded"
          ></useFoodDatabase>
        </q-card>
      </div>
      <div class="col-sm-8" style="padding: 15px">
        <q-card class="q-pa-md shadow-2 rounded-borders" style="width: 100%">
          <!-- <q-card-section> -->
          <!-- แสดงข้อมูลปัจจุบัน -->
          <div class="q-pa-sm bg-blue-1 rounded-borders">
            <q-item>
              <q-item-section top avatar>
                <q-avatar>
                  <q-avatar color="orange-10" text-color="white" icon="whatshot" />
                </q-avatar>
              </q-item-section>
              <NutritionSummary
                :body_fat="body_fat"
                :activity-level="activityLevel"
                :toDayCalsData="toDayCalsData"
              >
              </NutritionSummary>

              <q-item-section side top>
                <q-badge color="primary">
                  <q-icon name="restaurant_menu " class="q-mr-xs" />
                  ( {{ toDayCalsData.length || 0 }} )
                </q-badge>
              </q-item-section>
            </q-item>
            <q-banner class="q-mt-md bg-grey-2 text-grey-9 rounded-borders">
              <template v-slot:avatar>
                <q-icon name="inventory_2" color="primary" />
              </template>
              จำนวนอาหารในระบบ: <strong>{{ dataFoodAPI.length }}</strong> รายการ
            </q-banner>
          </div>
        </q-card>

        <!-- ตารางแสดงข้อมูล -->

        <q-card-section v-if="toDayCalsData.length > 0" style="width: 100%; margin: 0; padding: 0">
          <FoodDataTable
            :toDayCalsData="toDayCalsData"
            :colum="columns"
            @update:data="handleDataUpdate()"
            @delete:item="deleteItem"
          >
          </FoodDataTable>
        </q-card-section>
        <!-- </q-card> -->

        <q-card class="my-card health-metrics-card" style="margin-top: 2rem" flat bordered>
          <div class="text-center text-h6 text-weight-medium q-mb-md text-grey-8">
            ข้อมูลสุขภาพของคุณ
          </div>

          <q-list class="row col-md-12">
            <HealthyMetrics
              v-model:weight="weight"
              v-model:height="height"
              v-model:body_fat="body_fat"
              v-model:activityLevel="activityLevel"
            ></HealthyMetrics>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
  <hr />
</template>

<style>
.health-metrics-card {
  background: linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.metric-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  position: relative;
  overflow: hidden;
  padding: 10px;
  height: 60px;
}
.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}
.metric-card:hover::before {
  opacity: 1;
}
.inputmetric {
  width: 120px;
}
.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.metric-title {
  font-weight: 500;
  color: #37474f;
  font-size: 14px;
}
.metric-content {
  display: flex;
  align-items: baseline;
  gap: 4px;
  position: relative;
}
.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  line-height: 1;
}
.metric-unit {
  font-size: 12px;
  color: #78909c;
  font-weight: 500;
}
.edit-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-content:hover .edit-btn {
  cursor: pointer;
  opacity: 1;
}
.edit-mode {
  margin-top: 8px;
}
.activity-select {
  margin-top: 8px;
}

.activity-select .q-field {
  font-size: 13px;
}
</style>
