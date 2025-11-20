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
import type CalorieItem from 'src/types/healthy';
import type { FoodItem, listNameFood } from 'src/types/healthy';
import { watch, computed, onMounted, ref } from 'vue';

const getCurrentDate = new Date().toISOString().split('T')[0]?.replaceAll('-', '/');
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
const props = defineProps<{
  date: string | undefined;
}>();
watch(
  () => props.date,

  () => {
    input.value.date = props.date;
  },
  // รอ 300ms หลังพิมพ์เสร็จ ค่อยส่งค่าไปให้ filteredFoodsList
);

const loading = ref(false); //เริ่มหน้ามาปิดโชว์ loading ไว้ก่อน
const showDropdown = ref(false); //เริ่มหน้ามาปิดโชว์รายการอาหารไว้ก่อน
const debounceText = ref<string>('');
const listNameFood = ref<listNameFood[]>([]);
const dataFoodAPI = ref<FoodItem[]>([]);
const btnAddNewFood = ref(false);
const customFoods = ref<FoodItem[]>([]);
const caloriesData = ref<CalorieItem[]>([]); //calories ของทุกวันไว้ทำระบบแยกวันต่อ
const toDayCalsData = ref<CalorieItem[]>([]);
const inputValid = ref(false);

const serving_size = ref<string | undefined>(' เลือกอาหารก่อน ');
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
function onFoodInput() {
  //เมื่อมีการพิมอาหาร
  showDropdown.value = true;
  loading.value = true;
}
function clearFoodInput() {
  input.value.foodname = '';
  input.value.calories = null;
  input.value.serving_size = null;
  input.value.carbs = null;
  input.value.protein = null;
  input.value.fat = null;
  input.value.leucine = null;
  input.value.magnesium = null;
  input.value.zinc = null;

  baseCaloriesPerGram.value = 0;
  protein.value = 0;
  fat.value = 0;
  carbs.value = 0;
  leucine.value = 0;
  magnesium.value = 0;
  zinc.value = 0;
  // foodInputRef.value?.focus();
}
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
const filteredFoodsList = computed(() => {
  // computed ใน vue คือ
  // รันทุกครั้งที่ค่าถูกอ่านหรือเข้าถึงเช่นเข้าถึง allFoods.value เปลี่ยนมันรู้ว่าเข้าถึงอยู่และเปลี่ยนมันจะรัน
  //หรือ .filter, .length, .map พวกนี้มันก็ติดตามเช่นกันถ้าเข้าถึงข้างนอกเปลี่ยนมันจะรันทันที
  if (!debounceText.value) return dataFoodAPI.value; //ถ้ายังไม่พิมก็ส่งค่าไปทั้งหมด
  if (input.value.foodname.length > 2) {
    return dataFoodAPI.value.filter((dataFoodAPI) => dataFoodAPI.name.includes(debounceText.value));
  }
  return dataFoodAPI.value.filter((dataFoodAPI) => dataFoodAPI.name.includes('5555555'));
});
const shouldShowAddOption = computed(() => {
  if (!input.value.foodname) return false;
  //.some เช็คมีสักตัวที่ตรงเงื่อนไข
  return !listNameFood.value.some(
    //เช็คว่าค่าที่ป้อนเข้าไปไม่ตรงกับค่าไดไดเลยใน list
    (listNameFood) =>
      listNameFood.name.toLocaleLowerCase() === input.value.foodname.toLocaleLowerCase(),
  );
});
function selectFood(foodName: string, id: number) {
  // เคลียข้อมูล input หเก่าทิ้งให้หมด
  protein.value = 0;
  fat.value = 0;
  carbs.value = 0;
  leucine.value = 0;
  magnesium.value = 0;
  zinc.value = 0;
  const foodById = dataFoodAPI.value.find((food) => food.id === id);
  serving_size.value = foodById?.serving_size; //เก็บปริมาณอาหาร
  protein.value = foodById?.nutrition.protein ?? 0;
  fat.value = foodById?.nutrition.fat ?? 0;
  carbs.value = foodById?.nutrition.carbs ?? 0;
  leucine.value = foodById?.nutrition.leucine ?? 0;
  magnesium.value = foodById?.nutrition.magnesium ?? 0;
  zinc.value = foodById?.nutrition.zinc ?? 0;

  const grams = Number(foodById?.serving_size.match(/\d+/)?.[0]); //แปรงเอาแค่ตัวเลข
  // เก็บข้อมูลที่ได้เข้า input เพื่อนำเข้า array เก็บไว้นำเข้าฐานข้อมูลต่อ
  input.value.serving_size = grams;
  const totalCalories = foodById?.nutrition.calories ?? null; // ? มีค่าหรือไม่มีก็ได้
  input.value.protein = protein.value;
  input.value.fat = fat.value;
  input.value.carbs = carbs.value;
  input.value.leucine = leucine.value;
  input.value.magnesium = magnesium.value;
  input.value.zinc = zinc.value;

  if (totalCalories !== null) {
    //เก็บหน่วยต่อกรัมไว้ไว้คำนวน
    baseCaloriesPerGram.value = Math.round((totalCalories / grams) * 100) / 100;
    baseProteinPerGram.value = Math.round((protein.value / grams) * 100) / 100;
    baseFatPerGram.value = Math.round((fat.value / grams) * 100) / 100;
    baseCarbsPerGram.value = Math.round((carbs.value / grams) * 100) / 100;
    baseLeucinePerGram.value = Math.round((leucine.value / grams) * 100) / 100;
    baseMagnesiumPerGram.value = Math.round((magnesium.value / grams) * 100) / 100;
    baseZincPerGram.value = Math.round((zinc.value / grams) * 100) / 100;
  }
  input.value.foodname = foodName;
  showDropdown.value = false; // ปิด dropdown ด้วย
}
function addNewlistFood(input: CalorieItem) {
  btnAddNewFood.value = true;
  if (!input.foodname.trim()) return; //เช็คว่าหลังตัดช่องว่างแล้วเป็นค่าว่างไหม
  const maxId = listNameFood.value.reduce((max, item) => Math.max(max, item.id), 0);
  listNameFood.value.push({
    id: maxId + 1, //ตอนเข้าฐานข้อมูลจริงค่อยทำ function เพิ่ม ไอดีล่ะกัน
    name: input.foodname,
  });
  showDropdown.value = false;
}

const loadData = async () => {
  try {
    loading.value = true;
    const response = await fetch('/data/clean_food_menu.json');
    if (response.ok) {
      dataFoodAPI.value = await response.json();
      // const newArr = removeDuplicatesByIdAndName(dataFoodAPI.value); //จัดการกับรายการซ้ำก่อน
      // dataFoodAPI.value = newArr;
    } else {
      alert('ไม่สามารถโหลดไฟล์ได้');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    loading.value = false;
  }
};
function toDayData(filterDate: string | undefined) {
  //แคลของวันนี้
  if (filterDate) {
    // alert(formattedDate);
    return (toDayCalsData.value = caloriesData.value.filter((item) => item.date === filterDate));
  }
  return (toDayCalsData.value = caloriesData.value.filter((item) => item.date === getCurrentDate));
  // console.log('toDayCalsData', toDayCalsData);
}
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
onMounted(async () => {
  try {
    await loadData();
    loadFromLocalStorage();
    toDayData('');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดใน onMounted:', error);
  }
});
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
// บันทุกข้อมูลลง localstorage
const saveToLacalStorage = debounce(() => {
  localStorage.setItem('customFoods', JSON.stringify(customFoods.value));
  localStorage.setItem('caloriesData', JSON.stringify(caloriesData.value));
  loadFromLocalStorage(); //โหลดข้อมูลที่พึ่งเพิ่มไป
}, 10);
//function ไว้เพิ่มข้อมูลลง loadFromLocalStorage
function addFoodTolocalStorage(input: CalorieItem) {
  if (!input.foodname) return;
  const maxId = Math.max(
    ...dataFoodAPI.value.map((f) => f.id),
    ...customFoods.value.map((f) => f.id),
    0,
  );
  const newFood: FoodItem = {
    id: maxId + 1, // ใช้ timestamp เป็น temp ID
    name: input.foodname,
    serving_size: String(input.serving_size),
    nutrition: {
      calories: input.calories || 0,
      protein: input.protein || 0,
      fat: input.fat || 0,
      carbs: input.carbs || 0,
      fiber: 0,
      cholesterol: 0,
      leucine: input.leucine || 0,
      sodium: 0,
      potassium: 0,
      magnesium: input.magnesium || 0,
      zinc: input.zinc || 0,
      vitaminD: 0,
      vitaminB12: 0,
      water: 0,
    },
  };
  customFoods.value.push(newFood);
  saveToLacalStorage(); // เรียกใช้ function บันทึกลง localStorage
  showDropdown.value = false;
}
function onSubmitNewFood(input: CalorieItem) {
  addFoodTolocalStorage(input);
  clearFoodInput();
  btnAddNewFood.value = false;
}
//จะใช้ emit ต้องประกาศด้วย defineEmits เสมอ
const emit = defineEmits<{
  'food-added': [item: CalorieItem];
}>();
function onSubmit() {
  if (!inputValid.value) {
    return;
  }
  if (caloriesData.value.push({ ...input.value })) {
    //ถ้าเพิ่มรายการอาหารเข้า array สำเร็จ
    localStorage.setItem('caloriesData', JSON.stringify(caloriesData.value)); //เพิ่มเข้าความจำ เบราเซอร์ด้วย
    loadFromLocalStorage(); //Update ข้อมูลจากความจำเบราเซอร์
    // ส่ง emit ไป parent พร้อมข้อมูลที่เพิ่ม
    emit('food-added', { ...input.value });
    //  ↑        ↑            ↑
    // function  ชื่อ event   ข้อมูลที่ส่ง
  }

  clearFoodInput();
}
watch(
  input,
  (value) => {
    inputValid.value = value.foodname !== '';
  },
  { deep: true },
);
</script>
<template>
  <q-card-section>
    <div class="q-gutter-md">
      <div class="relative">
        <q-input
          ref="foodInputRef"
          v-model="input.foodname"
          label="เลือกอาหาร"
          outlined
          dense
          @focus="showDropdown = true"
          @input="onFoodInput"
          @blur="showDropdown = false"
          class="q-mb-sm"
        >
          <template v-slot:append>
            <q-icon
              v-if="input.foodname"
              name="cancel"
              @click="clearFoodInput"
              class="cursor-pointer"
            />
          </template>
        </q-input>
        <!-- Custom Dropdown ถ้า showDropdown เป็นจริงโชว์-->
        <q-card
          v-if="loading"
          class="absolute z-10 full-width q-mt-xs shadow-2"
          style="max-height: 200px; overflow-y: auto"
        >
          <q-item>
            <q-item-section class="text-italic text-grey"> Loading... </q-item-section>
          </q-item>
        </q-card>
        <q-card
          v-if="
            loading == false &&
            showDropdown &&
            (filteredFoodsList.length > 0 || shouldShowAddOption)
          "
          class="absolute z-10 full-width q-mt-xs shadow-2"
          style="max-height: 200px; overflow-y: auto"
        >
          <!-- รายการอาหารที่กรองแล้ว -->
          <q-item
            v-for="food in filteredFoodsList"
            :key="food.id"
            clickable
            @mousedown="selectFood(food.name, food.id)"
            class="hover:bg-blue-1"
          >
            <q-item-section>{{ food.name }}</q-item-section>
          </q-item>
          <!-- ตัวเลือกเพิ่มอาหารใหม่ -->
          <q-item
            v-if="shouldShowAddOption"
            clickable
            class="text-green-6 hover:bg-green-1"
            @mousedown="addNewlistFood(input)"
          >
            <q-item-section avatar>
              <q-icon name="add" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label>เพิ่ม "{{ input.foodname }}" ใหม่</q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
      <div class="basic-info q-mb-lg">
        <div class="row items-center q-mb-md">
          <q-icon name="restaurant_menu" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-h6">ข้อมูลพื้นฐาน</div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input
              v-model.number="input.serving_size"
              :label="`ปริมาณอาหาร (${baseCaloriesPerGram} kcal/g)`"
              type="number"
              outlined
              dense
              suffix="g"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="input.calories"
              label="แคลอรี"
              type="number"
              outlined
              dense
              suffix="kcal"
            />
          </div>
        </div>
      </div>
      <!-- สารอาหารหลัก -->
      <div class="macros q-mb-lg">
        <div class="row items-center q-mb-md">
          <q-icon name="pie_chart" color="pink" size="sm" class="q-mr-sm" />
          <div class="text-h6">สารอาหารหลัก</div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input
              v-model.number="input.carbs"
              label="คาร์โบไฮเดรต"
              type="number"
              outlined
              dense
              suffix="g"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="input.protein"
              label="โปรตีน"
              type="number"
              outlined
              dense
              suffix="g"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input
              v-model.number="input.fat"
              label="ไขมัน"
              type="number"
              outlined
              dense
              suffix="g"
            />
          </div>
        </div>
      </div>
      <!-- วิตามินและเกลือแร่ -->
      <div class="micros q-mb-lg">
        <div class="row items-center q-mb-md">
          <q-icon name="science" color="teal" size="sm" class="q-mr-sm" />
          <div class="text-h6">วิตามินและเกลือแร่</div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              step="0.1"
              v-model.number="input.leucine"
              label="ลูซีน"
              type="number"
              outlined
              dense
              suffix="g"
            />
          </div>
          <div class="col-6">
            <q-input
              step="0.1"
              v-model.number="input.magnesium"
              label="แมกนีเซียม"
              type="number"
              outlined
              dense
              suffix="mg"
            />
          </div>
          <div class="col-6">
            <q-input
              step="0.1"
              v-model.number="input.zinc"
              label="ซิงค์"
              type="number"
              outlined
              dense
              suffix="mg"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- ปุ่มบันทึก -->
    <q-btn
      v-if="btnAddNewFood == false"
      :disable="!inputValid"
      @click="onSubmit"
      color="primary"
      label="บันทึก"
      class="full-width"
    />
    <q-btn
      v-if="btnAddNewFood == true"
      :disable="!inputValid"
      @click="onSubmitNewFood(input)"
      color="primary"
      label="เพิ่มเมนูอาหารใหม่"
      class="full-width"
    />
  </q-card-section>
</template>
