<!-- <template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <q-card class="my-card q-mb-md shadow-3">
          <q-card-section>
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-md-8">
                <div class="text-h4 text-weight-bold text-primary">📋 ระบบจัดการงาน</div>
                <div class="text-subtitle1 text-grey-7">จัดการงานคงค้างและติดตามความคืบหน้า</div>
              </div>
              <div class="col-12 col-md-4 text-right">
                <div class="row q-gutter-sm justify-end">
                  <q-btn
                    round
                    flat
                    color="indigo"
                    icon="notifications"
                    @click="showNotifications = !showNotifications"
                  >
                    <q-badge v-if="urgentTasksCount > 0" color="red" floating>{{
                      urgentTasksCount
                    }}</q-badge>
                  </q-btn>
                  <q-btn
                    unelevated
                    color="primary"
                    icon="add"
                    label="เพิ่มงานใหม่"
                    @click="openModal()"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-banner
          v-if="showNotifications"
          class="bg-amber-1 text-brown-10 q-mb-md rounded-borders border-amber"
        >
          <template v-slot:avatar>
            <q-icon name="warning" color="amber-10" />
          </template>
          <div class="text-weight-bold q-mb-xs">🔔 การแจ้งเตือน</div>
          <div v-if="recurringTasks.length > 0">
            <div>งานประจำที่ต้องทำ:</div>
            <ul>
              <li v-for="task in recurringTasks" :key="task.id">
                {{ task.title }} ({{ task.recurringFrequency }})
              </li>
            </ul>
          </div>
          <div v-if="urgentTasksCount > 0">
            คุณมี {{ urgentTasksCount }} งานด่วนที่ต้องดำเนินการ
          </div>
          <template v-slot:action>
            <q-btn flat color="brown-10" label="ปิด" @click="showNotifications = false" />
          </template>
        </q-banner>

        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-blue text-white shadow-2">
              <q-card-section>
                <div class="text-subtitle2 opacity-80">ทั้งหมด</div>
                <div class="text-h3 text-weight-bold">{{ tasks.length }}</div>
                <q-icon
                  name="assessment"
                  size="lg"
                  class="absolute-bottom-right q-ma-md opacity-50"
                />
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-red text-white shadow-2">
              <q-card-section>
                <div class="text-subtitle2 opacity-80">ด่วน</div>
                <div class="text-h3 text-weight-bold">{{ urgentTasksCount }}</div>
                <q-icon
                  name="local_fire_department"
                  size="lg"
                  class="absolute-bottom-right q-ma-md opacity-50"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="q-mb-lg shadow-1">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input outlined dense v-model="searchTerm" placeholder="ค้นหางาน...">
                  <template v-slot:prepend>
                    <q-icon name="search" />
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

        <div class="q-gutter-y-md">
          <q-card
            v-for="task in tasks"
            :key="task.id"
            class="shadow-1 hover-shadow transition-generic"
          >
            <div class="row no-wrap items-center">
              <div
                :class="`q-pa-xs full-height ${priorityColor(task.priority)}`"
                style="width: 6px; border-radius: 4px 0 0 4px"
              >
                &nbsp;
              </div>

              <q-card-section class="col">
                <div class="row items-start">
                  <q-btn
                    flat
                    round
                    :color="statusColor(task.status)"
                    :icon="statusIcon(task.status)"
                    class="q-mr-sm"
                  />

                  <div class="col">
                    <div class="row items-center q-gutter-x-sm">
                      <div class="text-h6" :class="{ 'text-strike text-grey': task.completed }">
                        {{ task.title }}
                      </div>
                      <q-chip
                        v-if="task.recurring"
                        size="sm"
                        color="purple-1"
                        text-color="purple"
                        icon="loop"
                      >
                        {{ task.recurringFrequency }}
                      </q-chip>
                    </div>
                    <div class="text-grey-8 q-mb-sm">{{ task.description }}</div>

                    <div class="row q-gutter-sm">
                      <q-badge :color="priorityBadgeColor(task.priority)">
                        {{ getPriorityLabel(task.priority) }}
                      </q-badge>
                      <q-badge color="grey-3" text-color="black"> 📅 {{ task.dueDate }} </q-badge>
                    </div>
                  </div>

                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="openModal(task)"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="deleteTask(task.id)"
                    />
                  </div>
                </div>
              </q-card-section>
            </div>
          </q-card>

          <div v-if="tasks.length === 0" class="text-center q-pa-xl text-grey">
            <q-icon name="inbox" size="4rem" />
            <div class="text-h6 q-mt-md">ไม่พบงานที่ค้นหา</div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="showModal">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ formData.id ? 'แก้ไขงาน' : 'เพิ่มงานใหม่' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input
              outlined
              v-model="formData.title"
              label="ชื่องาน *"
              :rules="[(val) => !!val || 'กรุณาระบุชื่องาน']"
            />

            <q-input outlined v-model="formData.description" type="textarea" label="รายละเอียด" />

            <q-select
              outlined
              v-model="formData.priority"
              :options="priorityOptions"
              label="ความสำคัญ"
              emit-value
              map-options
            />

            <q-input outlined v-model="formData.dueDate" type="date" label="วันที่กำหนดส่ง *" />

            <q-toggle v-model="formData.recurring" label="เป็นงานประจำที่ต้องทำซ้ำ" />

            <q-input
              v-if="formData.recurring"
              outlined
              v-model="formData.recurringFrequency"
              label="ความถี่ (เช่น ทุกวัน)"
            />

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="ยกเลิก" color="primary" v-close-popup />
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

// --- DATA ---
const showModal = ref(false);
const showNotifications = ref(false);
const searchTerm = ref('');
const filterStatus = ref('all');
const filterPriority = ref('all');

const formData = ref<any>({
  id: null,
  title: '',
  description: '',
  priority: 'normal',
  dueDate: '',
  recurring: false,
  recurringFrequency: '',
});

// Mockup Data
const tasks = ref([
  {
    id: 1,
    title: 'ส่งรายงานประจำเดือน',
    description: 'ส่งรายงานสรุปผลงานเดือนมกราคมให้หัวหน้า',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2026-01-20',
    recurring: false,
    completed: false,
  },
  {
    id: 2,
    title: 'ประชุมทีม',
    description: 'วางแผน Sprint ใหม่',
    status: 'in-progress',
    priority: 'normal',
    dueDate: '2026-01-16',
    recurring: true,
    recurringFrequency: 'สัปดาห์ละครั้ง',
    completed: false,
  },
]);

// --- OPTIONS & CONFIG ---
const statusOptions = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'รอดำเนินการ', value: 'pending' },
  { label: 'กำลังทำ', value: 'in-progress' },
  { label: 'เสร็จสิ้น', value: 'completed' },
];

const priorityOptions = [
  { label: 'ทั้งหมด', value: 'all' }, // สำหรับ filter
  { label: 'ด่วน', value: 'urgent' },
  { label: 'ปกติ', value: 'normal' },
  { label: 'ไม่ด่วน', value: 'low' },
];

// --- HELPER FUNCTIONS (สำหรับ UI) ---
const priorityColor = (p: string) => {
  if (p === 'urgent') return 'bg-red';
  if (p === 'normal') return 'bg-blue';
  return 'bg-grey';
};

const priorityBadgeColor = (p: string) => {
  if (p === 'urgent') return 'red';
  if (p === 'normal') return 'blue';
  return 'grey';
};

const getPriorityLabel = (p: string) => {
  const found = priorityOptions.find((opt) => opt.value === p);
  return found ? found.label : p;
};

const statusIcon = (s: string) => {
  if (s === 'completed') return 'check_circle';
  if (s === 'in-progress') return 'schedule';
  return 'radio_button_unchecked';
};

const statusColor = (s: string) => {
  if (s === 'completed') return 'green';
  if (s === 'in-progress') return 'blue';
  return 'grey';
};

// Computed Stats
const urgentTasksCount = computed(
  () => tasks.value.filter((t) => !t.completed && t.priority === 'urgent').length,
);
const recurringTasks = computed(() => tasks.value.filter((t) => t.recurring && !t.completed));

// --- LOGIC PLACEHOLDERS ---
const openModal = (task: any = null) => {
  if (task) {
    formData.value = { ...task };
  } else {
    formData.value = {
      id: null,
      title: '',
      description: '',
      priority: 'normal',
      dueDate: '',
      recurring: false,
      recurringFrequency: '',
    };
  }
  showModal.value = true;
};

const handleSubmit = () => {
  console.log('บันทึก:', formData.value);
  showModal.value = false;
  // TODO: เขียน logic บันทึกจริงตรงนี้
};

const deleteTask = (id: number) => {
  console.log('ลบ:', id);
  // TODO: เขียน logic ลบจริงตรงนี้
};
</script>

<style scoped>
/* CSS เล็กๆ น้อยๆ สำหรับ Effect ที่ Quasar ไม่มี */
.opacity-80 {
  opacity: 0.8;
}
.opacity-50 {
  opacity: 0.5;
}
.border-amber {
  border-left: 5px solid #ffc107;
}
</style> -->
