<script setup lang="ts">
import type CalorieItem from 'src/types/healthy';
import type { Column, RowData } from 'src/types/healthy';
import { ref } from 'vue';
// import { ref } from 'vue';

const props = defineProps<{
  toDayCalsData: CalorieItem[];
}>();
// console.log('toDayCalsData', props.toDayCalsData);

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
const edittingId = ref<number | null>(null);
const emit = defineEmits<{
  (e: 'update:data', rowData: CalorieItem): void;
  (e: 'delete:item', index: number): void;
  (e: 'deleteid:id', index: number): void;
}>();
function confirmUpdate(rowData: CalorieItem) {
  emit('update:data', rowData);
  console.log('calorie by FoodDataTable', rowData.calories);
}
function startEdit(index: number) {
  edittingId.value = index;
}
function confirmEdit(rowData: CalorieItem) {
  edittingId.value = null;
  // console.log('rowData', rowData);
  emit('update:data', rowData);
}
function deleteItem(index: number, id: number) {
  emit('deleteid:id', id);
  emit('delete:item', index);
}
function onPopupSave(val: string | number, row: CalorieItem, field: string) {
  //เช็คของก่อนส่งไปอัพเดท
  let finalVal = val;
  if (field !== 'foodname' && typeof finalVal === 'string') {
    finalVal = Number(val) || 0;
  }
  const updatedRow = { ...row, [field]: finalVal };
  confirmUpdate(updatedRow);
}
</script>

<template>
  <q-table
    :title="`รายการอาหารที่กิน`"
    :rows="props.toDayCalsData"
    :columns="columns"
    row-key="ID"
    dense
  >
    <template v-slot:body="rowprops">
      <q-tr :props="rowprops">
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.foodname"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex">
            {{ rowprops.row.foodname }}
            <q-popup-edit
              v-model="rowprops.row.foodname"
              title="Update calories"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'foodname')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.calories"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.calories }}
            <q-popup-edit
              v-model="rowprops.row.calories"
              title="Update calories"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'calories')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.carbs"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.carbs }}
            <q-popup-edit
              v-model="rowprops.row.carbs"
              title="Update carbs"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'carbs')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.protein"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.protein }}
            <q-popup-edit
              v-model="rowprops.row.protein"
              title="Update protein"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'protein')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.fat"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.fat }}
            <q-popup-edit
              v-model="rowprops.row.fat"
              title="Update fat"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'fat')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.leucine"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.leucine }}
            <q-popup-edit
              v-model="rowprops.row.leucine"
              title="Update leucine"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'leucine')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.magnesium"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.magnesium }}
            <q-popup-edit
              v-model="rowprops.row.magnesium"
              title="Update magnesium"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'magnesium')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.zinc"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.zinc }}
            <q-popup-edit
              v-model="rowprops.row.zinc"
              title="Update zinc"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'zinc')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td key="name" :props="rowprops">
          <q-input
            v-if="edittingId === rowprops.rowIndex"
            v-model="rowprops.row.serving_size"
            standout="bg-teal text-white"
            dense
          ></q-input>
          <span v-if="edittingId !== rowprops.rowIndex"
            >{{ rowprops.row.serving_size }}
            <q-popup-edit
              v-model="rowprops.row.serving_size"
              title="Update serving_size"
              buttons
              v-slot="scope"
              @save="(val) => onPopupSave(val, rowprops.row, 'serving_size')"
            >
              <q-input type="text" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </span>
        </q-td>
        <q-td v-if="edittingId === rowprops.rowIndex"
          ><q-btn
            size="sm"
            color="teal"
            dense
            round
            icon="check"
            @click="confirmEdit(rowprops.row)"
          />
        </q-td>
        <q-td v-else
          ><q-btn
            size="sm"
            color="amber-8"
            dense
            round
            :title="`แก้ไขข้อมูลรายการ`"
            icon="edit_document"
            @click="startEdit(rowprops.rowIndex)"
          />
          <q-btn
            class="q-ml-sm"
            :props="props"
            size="sm"
            color="negative"
            icon="delete"
            :title="`ลบ${rowprops.row.foodname}จากรายการ`"
            @click="deleteItem(rowprops.rowIndex, rowprops.row.ID)"
            dense
            round
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
