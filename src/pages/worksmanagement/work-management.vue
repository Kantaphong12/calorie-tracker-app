<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row justify-center">
      <div class="col-12">
        <!-- Header Section -->
        <q-card class="q-mb-md shadow-3 bg-gradient-primary">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="col-3">
                <div class="text-h4 text-weight-bold text-white">📋 ระบบจัดการงาน</div>
                <div class="text-subtitle1 text-white opacity-90">Dashboard ภาพรวมงานทั้งหมด</div>
              </div>
              <!-- <q-space /> -->
              <div class="row col-6 q-col-gutter-sm">
                <div class="col-3">
                  <q-card class="stat-card bg-blue text-white">
                    <q-card-section class="text-center">
                      <div class="text-caption opacity-20 q-sm-xs">งานทั้งหมด</div>
                      <div class="text-h5 text-weight-bold">{{ tasks.length }}</div>
                      <q-icon name="assignment" size="sm" class="q-mt-sm opacity-20" />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-3">
                  <q-card class="stat-card bg-red text-white">
                    <q-card-section class="text-center">
                      <div class="text-caption opacity-20 q-sm-xs">งานด่วน</div>
                      <div class="text-h5 text-weight-bold">{{ urgentTasksCount }}</div>
                      <q-icon name="local_fire_department" size="sm" class="q-mt-sm opacity-20" />
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-3">
                  <q-card class="stat-card bg-orange text-white">
                    <q-card-section class="text-center">
                      <div class="text-caption opacity-20 q-sm-xs">กำลังดำเนินการ</div>
                      <div class="text-h5 text-weight-bold">{{ inProgressCount }}</div>
                      <q-icon name="schedule" size="sm" class="q-mt-sm opacity-20" />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-3">
                  <q-card class="stat-card bg-green text-white">
                    <q-card-section class="text-center">
                      <div class="text-caption opacity-20 q-sm-xs">เสร็จสิ้น</div>
                      <div class="text-h5 text-weight-bold">{{ completedCount }}</div>
                      <q-icon name="check_circle" size="sm" class="q-mt-sm opacity-20" />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="col-3 flex justify-end items-center">
                <q-btn
                  unelevated
                  color="white"
                  text-color="primary"
                  icon="add"
                  label="เพิ่มงานใหม่"
                  @click="openModal()"
                  class="q-px-lg"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Stats Cards Row - All in One Line -->

        <!-- Notifications & Filters in One Row - 50/50 Split -->
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Notifications -->
          <div class="col-6">
            <q-card class="notification-card shadow-2 full-height">
              <q-card-section class="bg-amber-1 q-pa-sm">
                <div class="text-subtitle2 text-weight-bold text-amber-10">
                  <q-icon name="notifications_active" size="sm" /> การแจ้งเตือน
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-sm" style="max-height: 180px; overflow-y: auto">
                <q-list separator dense>
                  <q-item v-if="urgentTasksCount > 0" class="bg-red-1 rounded-borders q-mb-xs">
                    <q-item-section avatar>
                      <q-icon name="warning" color="red" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-red-8 text-caption">
                        งานด่วน {{ urgentTasksCount }} รายการ
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-for="task in recurringTasks.slice(0, 2)"
                    :key="'notif-' + task.id"
                    class="bg-purple-1 rounded-borders q-mb-xs"
                  >
                    <q-item-section avatar>
                      <q-icon name="loop" color="purple" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-caption">{{ task.title }}</q-item-label>
                      <q-item-label caption class="text-purple-8">
                        {{ task.recurringFrequency }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="urgentTasksCount === 0 && recurringTasks.length === 0">
                    <q-item-section class="text-center text-grey">
                      <q-icon name="check_circle" size="lg" color="green" />
                      <div class="text-caption q-mt-xs">ไม่มีการแจ้งเตือน</div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- Filters -->
          <div class="col-6">
            <q-card class="shadow-2 full-height">
              <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 text-weight-bold q-mb-sm">
                  <q-icon name="filter_list" size="sm" /> กรองและค้นหา
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-input outlined dense v-model="searchTerm" placeholder="ค้นหางาน...">
                      <template v-slot:prepend>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      outlined
                      dense
                      v-model="filterStatus"
                      :options="statusOptions"
                      label="สถานะ"
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      outlined
                      dense
                      v-model="filterPriority"
                      :options="priorityOptions"
                      label="ความสำคัญ"
                      emit-value
                      map-options
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Tasks Table -->
        <q-card class="shadow-2">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">
              <q-icon name="list_alt" /> รายการงานทั้งหมด
            </div>

            <!-- Desktop: Table View -->
            <div class="desktop-view">
              <q-table
                :rows="filteredTasks"
                :columns="columns"
                row-key="id"
                flat
                :pagination="{ rowsPerPage: 10 }"
                class="task-table"
              >
                <template v-slot:body-cell-title="props">
                  <q-td :props="props">
                    <div class="row items-center no-wrap">
                      <div
                        class="priority-indicator q-mr-sm"
                        :class="'bg-' + priorityBadgeColor(props.row.priority)"
                      ></div>
                      <div>
                        <div
                          class="text-weight-bold"
                          :class="{ 'text-strike text-grey': props.row.completed }"
                        >
                          {{ props.row.title }}
                        </div>
                        <div class="text-caption text-grey-7">{{ props.row.description }}</div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      :color="statusColor(props.row.status)"
                      text-color="white"
                      :icon="statusIcon(props.row.status)"
                      size="sm"
                    >
                      {{ getStatusLabel(props.row.status) }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-priority="props">
                  <q-td :props="props">
                    <q-chip
                      :color="priorityBadgeColor(props.row.priority)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getPriorityLabel(props.row.priority) }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-dueDate="props">
                  <q-td :props="props">
                    <div class="row items-center no-wrap">
                      <q-icon name="event" size="xs" class="q-mr-xs" />
                      {{ props.row.dueDate }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-recurring="props">
                  <q-td :props="props">
                    <q-chip
                      v-if="props.row.recurring"
                      color="purple-1"
                      text-color="purple"
                      icon="loop"
                      size="sm"
                    >
                      {{ props.row.recurringFrequency }}
                    </q-chip>
                    <span v-else class="text-grey-5">-</span>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <div class="row q-gutter-xs no-wrap">
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="edit"
                        size="sm"
                        @click="openModal(props.row)"
                      >
                        <q-tooltip>แก้ไข</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        :color="props.row.completed ? 'grey' : 'green'"
                        :icon="props.row.completed ? 'radio_button_unchecked' : 'check_circle'"
                        size="sm"
                        @click="toggleComplete(props.row.id)"
                      >
                        <q-tooltip>{{ props.row.completed ? 'ยกเลิกเสร็จ' : 'ทำเสร็จ' }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="deleteTask(props.row.id)"
                      >
                        <q-tooltip>ลบ</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>

            <!-- Mobile: Card View -->
            <div class="mobile-view">
              <div class="q-gutter-md">
                <q-card v-for="task in filteredTasks" :key="task.id || 0" class="task-mobile-card">
                  <div
                    class="priority-bar"
                    :class="'bg-' + priorityBadgeColor(task.priority)"
                  ></div>
                  <q-card-section>
                    <div class="row items-start q-gutter-sm">
                      <div class="col">
                        <div
                          class="text-weight-bold text-body1"
                          :class="{ 'text-strike text-grey': task.completed }"
                        >
                          {{ task.title }}
                        </div>
                        <div class="text-caption text-grey-7 q-mb-sm">{{ task.description }}</div>

                        <div class="row q-gutter-xs q-mb-sm">
                          <q-chip
                            :color="priorityBadgeColor(task.priority)"
                            text-color="white"
                            size="sm"
                          >
                            {{ getPriorityLabel(task.priority) }}
                          </q-chip>
                          <q-chip :color="statusColor(task.status)" text-color="white" size="sm">
                            {{ getStatusLabel(task.status) }}
                          </q-chip>
                          <q-chip
                            v-if="task.recurring"
                            color="purple-1"
                            text-color="purple"
                            icon="loop"
                            size="sm"
                          >
                            {{ task.recurringFrequency }}
                          </q-chip>
                        </div>

                        <div class="text-caption">
                          <q-icon name="event" size="xs" /> {{ task.dueDate }}
                        </div>
                      </div>

                      <div class="col-auto">
                        <div class="column q-gutter-xs">
                          <q-btn
                            flat
                            round
                            dense
                            color="primary"
                            icon="edit"
                            size="sm"
                            @click="openModal(task)"
                          />
                          <q-btn
                            flat
                            round
                            dense
                            :color="task.completed ? 'grey' : 'green'"
                            :icon="task.completed ? 'radio_button_unchecked' : 'check_circle'"
                            size="sm"
                            @click="toggleComplete(task.id)"
                          />
                          <q-btn
                            flat
                            round
                            dense
                            color="negative"
                            icon="delete"
                            size="sm"
                            @click="deleteTask(task.id)"
                          />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div v-if="filteredTasks.length === 0" class="text-center q-pa-xl text-grey">
                  <q-icon name="inbox" size="4rem" />
                  <div class="text-h6 q-mt-md">ไม่พบงานที่ค้นหา</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add/Edit Task Dialog -->
    <q-dialog v-model="showModal" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ formData.id ? 'แก้ไขงาน' : 'เพิ่มงานใหม่' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input
              outlined
              v-model="formData.title"
              label="ชื่องาน *"
              :rules="[(val) => !!val || 'กรุณาระบุชื่องาน']"
            />

            <q-input
              outlined
              v-model="formData.description"
              type="textarea"
              label="รายละเอียด"
              rows="3"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  outlined
                  v-model="formData.priority"
                  :options="priorityOptions.filter((p) => p.value !== 'all')"
                  label="ความสำคัญ"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input outlined v-model="formData.dueDate" type="date" label="วันที่กำหนดส่ง *" />
              </div>
            </div>

            <q-toggle
              v-model="formData.recurring"
              label="เป็นงานประจำที่ต้องทำซ้ำ"
              color="purple"
            />

            <q-input
              v-if="formData.recurring"
              outlined
              v-model="formData.recurringFrequency"
              label="ความถี่ (เช่น ทุกวัน, สัปดาห์ละครั้ง)"
              hint="ระบุความถี่ในการทำงานซ้ำ"
            />

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="ยกเลิก" color="grey-7" v-close-popup />
              <q-btn unelevated label="บันทึก" color="primary" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QTableColumn } from 'quasar'; // 1. นำเข้า type ของ Quasar
import type Task from 'src/types/work';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem('authToken');
const USER_ID = localStorage.getItem('UserID');

// --- DATA ---
const showModal = ref(false);
const searchTerm = ref('');
const filterStatus = ref('all');
const filterPriority = ref('all');

// 3. แก้จุดที่ 2: ระบุ type เป็น Task แทน any
const formData = ref<Task>({
  id: null,
  userId: Number(USER_ID),
  title: '',
  description: '',
  priority: 'normal',
  dueDate: '',
  recurring: false,
  recurringFrequency: '',
  status: 'pending',
  completed: false,
});

// Mockup Data (ระบุ type เป็น Array ของ Task)
const tasks = ref<Task[]>([
  {
    id: 1,
    userId: Number(USER_ID),
    title: 'ส่งรายงานประจำเดือน',
    description: 'ส่งรายงานสรุปผลงานเดือนมกราคมให้หัวหน้า',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2026-01-20',
    recurring: false,
    recurringFrequency: '', // เพิ่มให้ครบตาม interface
    completed: false,
  },
  {
    id: 2,
    userId: Number(USER_ID),
    title: 'ประชุมทีม',
    description: 'วางแผน Sprint ใหม่',
    status: 'in-progress',
    priority: 'normal',
    dueDate: '2026-01-16',
    recurring: true,
    recurringFrequency: 'สัปดาห์ละครั้ง',
    completed: false,
  },
  {
    id: 3,
    userId: Number(USER_ID),
    title: 'ตรวจสอบอีเมล',
    description: 'ตอบอีเมลลูกค้าและพาร์ทเนอร์',
    status: 'pending',
    priority: 'low',
    dueDate: '2026-01-17',
    recurring: true,
    recurringFrequency: 'ทุกวัน',
    completed: false,
  },
  {
    id: 4,
    userId: Number(USER_ID),
    title: 'Review Code',
    description: 'ตรวจสอบ Pull Request ของทีม',
    status: 'completed',
    priority: 'normal',
    dueDate: '2026-01-15',
    recurring: false,
    recurringFrequency: '',
    completed: true,
  },
  {
    id: 5,
    userId: Number(USER_ID),
    title: 'อัพเดทเอกสาร',
    description: 'ปรับปรุง Documentation',
    status: 'in-progress',
    priority: 'low',
    dueDate: '2026-01-18',
    recurring: false,
    recurringFrequency: '',
    completed: false,
  },
]);

// --- TABLE COLUMNS ---
// 4. แก้จุดที่ 1: ระบุ type ให้ตัวแปร columns เป็น QTableColumn[]
const columns: QTableColumn[] = [
  {
    name: 'title',
    label: 'ชื่องาน',
    field: 'title',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'สถานะ',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'priority',
    label: 'ความสำคัญ',
    field: 'priority',
    align: 'center',
    sortable: true,
  },
  {
    name: 'dueDate',
    label: 'กำหนดส่ง',
    field: 'dueDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'recurring',
    label: 'งานประจำ',
    field: 'recurring',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'จัดการ',
    field: 'actions', // แก้ field ให้มีค่า (แม้จะเป็นปุ่ม) เพื่อกัน error บางเคส
    align: 'center',
  },
];

// --- OPTIONS & CONFIG ---
const statusOptions = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'รอดำเนินการ', value: 'pending' },
  { label: 'กำลังทำ', value: 'in-progress' },
  { label: 'เสร็จสิ้น', value: 'completed' },
];

const priorityOptions = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ด่วน', value: 'urgent' },
  { label: 'ปกติ', value: 'normal' },
  { label: 'ไม่ด่วน', value: 'low' },
];

// --- HELPER FUNCTIONS ---
const priorityBadgeColor = (p: string) => {
  if (p === 'urgent') return 'red';
  if (p === 'normal') return 'blue';
  return 'grey';
};

const getPriorityLabel = (p: string) => {
  const found = priorityOptions.find((opt) => opt.value === p);
  return found ? found.label : p;
};

const getStatusLabel = (s: string) => {
  const found = statusOptions.find((opt) => opt.value === s);
  return found ? found.label : s;
};

const statusIcon = (s: string) => {
  if (s === 'completed') return 'check_circle';
  if (s === 'in-progress') return 'schedule';
  return 'radio_button_unchecked';
};

const statusColor = (s: string) => {
  if (s === 'completed') return 'green';
  if (s === 'in-progress') return 'orange';
  return 'grey';
};

// --- COMPUTED ---
const urgentTasksCount = computed(
  () => tasks.value.filter((t) => !t.completed && t.priority === 'urgent').length,
);

const inProgressCount = computed(
  () => tasks.value.filter((t) => t.status === 'in-progress').length,
);

const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);

const recurringTasks = computed(() => tasks.value.filter((t) => t.recurring && !t.completed));

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesStatus = filterStatus.value === 'all' || task.status === filterStatus.value;
    const matchesPriority =
      filterPriority.value === 'all' || task.priority === filterPriority.value;
    return matchesSearch && matchesStatus && matchesPriority;
  });
});

// --- ACTIONS ---
// 5. แก้จุดที่ 3: ระบุ type ของ parameter task เป็น Task | null
const openModal = (task: Task | null = null) => {
  if (task) {
    formData.value = { ...task };
  } else {
    formData.value = {
      id: null,
      userId: Number(USER_ID),
      title: '',
      description: '',
      priority: 'normal',
      dueDate: '',
      recurring: false,
      recurringFrequency: '',
      status: 'pending',
      completed: false,
    };
  }
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.title) {
    return;
  }

  if (formData.value.id) {
    //ถ้ามี id อยู่แล้ว update
    // Update existing task
    const index = tasks.value.findIndex((t) => t.id === formData.value.id);
    if (index !== -1) {
      tasks.value[index] = { ...formData.value };
    }
  } else {
    //เพิ่มงานใหม่
    // Add new task
    const payload = {
      ...formData.value,
    };
    try {
      await fetch(`${API_BASE_URL}/api/insertTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // กำหนดประเภทของข้อมูลที่ส่งไป
          Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
        },
        body: JSON.stringify(payload), // แปลงข้อมูลเป็น JSON string
      });
    } catch (error) {
      console.error('error', error);
    }
    tasks.value.push(payload);
  }

  showModal.value = false;
};

const deleteTask = (id: number | null) => {
  if (id === null) return;
  const index = tasks.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.value.splice(index, 1);
  }
};

const toggleComplete = (id: number | null) => {
  if (id === null) return;
  const task = tasks.value.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'pending';
  }
};
</script>

<style scoped>
.opacity-80 {
  opacity: 0.8;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-90 {
  opacity: 0.9;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.notification-card {
  border-left: 4px solid #ffc107;
}

.priority-indicator {
  width: 4px;
  height: 40px;
  border-radius: 2px;
}

.priority-bar {
  height: 4px;
  width: 100%;
}

.task-mobile-card {
  position: relative;
  overflow: hidden;
}

/* Responsive: Desktop view for table, Mobile view for cards */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }
}

.task-table :deep(.q-table__top) {
  padding: 0;
}

.task-table :deep(th) {
  font-weight: bold;
  background-color: #f5f5f5;
}

.task-table :deep(tr:hover) {
  background-color: #f9f9f9;
}
</style>
