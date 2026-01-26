<template>
  <div v-if="loading" class="loading-pulse">
    <div class="loading-overlay">
      <div class="loading-pulse">
        <div class="pulse-container">
          <div class="pulse-dot"></div>
          <div class="pulse-dot"></div>
          <div class="pulse-dot"></div>
        </div>
        <div class="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    </div>
  </div>
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
                      clickable
                      class="cursor-pointer"
                      :color="statusColor(props.row.status)"
                      text-color="white"
                      :icon="statusIcon(props.row.status)"
                      size="sm"
                      @click="openModalStatus(props.row)"
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
                      <!-- <q-btn
                        flat
                        round
                        dense
                        :color="props.row.completed ? 'grey' : 'green'"
                        :icon="props.row.completed ? 'radio_button_unchecked' : 'check_circle'"
                        size="sm"
                        @click="toggleComplete(props.row.id)"
                      >
                        <q-tooltip>{{ props.row.completed ? 'ยกเลิกเสร็จ' : 'ทำเสร็จ' }}</q-tooltip>
                      </q-btn> -->
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

  <!-- Dialog for Status Update -->
  <q-dialog v-model="showModalStatus">
    <q-card style="width: 350px">
      <q-card-section class="bg-primary text-white row items-center">
        <div class="text-h6">อัปเดตสถานะงาน</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div v-if="selectedTaskForStatus" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold">{{ selectedTaskForStatus.title }}</div>
          <div class="text-caption text-grey">เลือกสถานะที่ต้องการเปลี่ยน</div>
        </div>

        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="tempStatus" val="pending" color="grey" />
            </q-item-section>
            <q-item-section>
              <q-item-label>รอดำเนินการ (Pending)</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="radio_button_unchecked" color="grey" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="tempStatus" val="in-progress" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>กำลังดำเนินการ (In Progress)</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="schedule" color="orange" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-radio v-model="tempStatus" val="completed" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label>เสร็จสิ้น (Completed)</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="check_circle" color="green" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
        <q-btn unelevated label="บันทึกสถานะ" color="primary" @click="saveStatusChange" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { date, type QTableColumn } from 'quasar'; // 1. นำเข้า type ของ Quasar
import type Task from 'src/types/work';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem('authToken');
const USER_ID = localStorage.getItem('UserID');

const showModal = ref(false);
const showModalStatus = ref(false);
const searchTerm = ref('');
const filterStatus = ref('all');
const filterPriority = ref('all');

const selectedTaskForStatus = ref<Task | null>(null);
const tempStatus = ref('');

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
  date_completed: '',
});

// Mockup Data (ระบุ type เป็น Array ของ Task)
const tasks = ref<Task[]>([]);

// --- TABLE COLUMNS ---
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
      dueDate: date.formatDate(Date.now(), 'YYYY-MM-DD'),
      recurring: false,
      recurringFrequency: '',
      status: 'pending',
      completed: false,
      date_completed: '',
    };
  }
  showModal.value = true;
};
const openModalStatus = (task: Task) => {
  selectedTaskForStatus.value = task; // กำหนดงานที่เลือก
  tempStatus.value = task.status; // ตั้งค่าเริ่มต้นให้ตรงกับสถานะปัจจุบัน
  showModalStatus.value = true;
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
      UpdateData(formData.value.id);
    }
  } else {
    //เพิ่มงานใหม่
    // Add new task
    const payload = {
      ...formData.value,
    };
    try {
      await fetch(`${API_BASE_URL}/taskapi/insertTask`, {
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
  console.log('tasktask:', task);

  if (task?.status == 'completed') {
    task.completed = false;
    task.status = 'pending';
    UpdateData(Number(id));
    return;
  }
  if (task?.status == 'pending') {
    task.completed = false;
    task.status = 'in-progress';
    UpdateData(Number(id));
    return;
  }
  if (task?.status == 'in-progress') {
    task.completed = true;
    task.status = 'completed';
    UpdateData(Number(id));
    return;
  }
  // console.log('test:', test);
};

// handleCode here
const token = localStorage.getItem('authToken');
const loading = ref(false);
async function loadData() {
  const responseAPI = await fetch(
    `${API_BASE_URL}/taskapi/getTask/${localStorage.getItem('UserID')}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`, // เพิ่ม header สำหรับ token
      },
    },
  ); //ดึงข้อมูลแคลอรีจาก API
  if (!responseAPI.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await responseAPI.json();
  console.log(data);

  showTask(data);

  loading.value = false;
}
function UpdateData(id: number) {
  loading.value = true;
  const taskUpdate = tasks.value.find((t) => t.id === id);
  if (taskUpdate?.status === 'completed') {
    taskUpdate.completed = true;
    taskUpdate.date_completed = date.formatDate(Date.now(), 'YYYY-MM-DD');
  } else if (taskUpdate?.status === 'in-progress') {
    taskUpdate.completed = false;
    taskUpdate.date_completed = '';
  } else if (taskUpdate?.status === 'pending') {
    taskUpdate.completed = false;
    taskUpdate.date_completed = '';
  }

  if (!taskUpdate) {
    console.error('ไม่พบงานที่ต้องการอัปเดต');
    loading.value = false;
    return;
  }
  try {
    const update = fetch(`${API_BASE_URL}/taskapi/updateTask/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json', // กำหนดประเภทของข้อมูลที่ส่งไป
        Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
      },
      body: JSON.stringify(taskUpdate), // แปลงข้อมูลเป็น JSON string
    });
    console.log(update);
    loading.value = false;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
    loading.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await loadData();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดใน onMounted:', error);
  }
});

function showTask(data: Task[]) {
  // 1. หา date string ของวันนี้
  const today = date.formatDate(Date.now(), 'YYYY-MM-DD');

  // 2. กรองข้อมูลก่อนยัดใส่ tasks.value
  tasks.value = data.filter((task) => {
    // เงื่อนไข 1: ถ้ายังทำไม่เสร็จ (completed = false) ให้เอามาแสดงเสมอ
    if (!task.completed) {
      return true;
    }

    // เงื่อนไข 2: ถ้าทำเสร็จแล้ว (completed = true)
    // ให้เช็คว่า date_completed ตรงกับวันนี้หรือไม่?
    // (ถ้าตรง return true = เอา, ถ้าไม่ตรง return false = ทิ้งไป)
    return task.date_completed === today;
  });
}

const saveStatusChange = () => {
  if (selectedTaskForStatus.value) {
    selectedTaskForStatus.value.status = tempStatus.value;

    // อัปเดตข้อมูลใน backend
    // UpdateData(selectedTaskForStatus.value.id!);
    UpdateData(Number(selectedTaskForStatus.value.id));
  }
  showModalStatus.value = false;
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

/* Loading Pulse Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(0.5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-pulse {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pulse-container {
  display: flex;
  gap: 10px;
}

.pulse-dot {
  width: 15px;
  height: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
}

.pulse-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.pulse-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-text {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
/* end loading styles */
</style>
