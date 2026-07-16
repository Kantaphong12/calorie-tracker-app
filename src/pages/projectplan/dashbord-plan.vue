<template>
  <!--
  ============================================================
  CONSTRUCTION PLANNING DASHBOARD
  Vue 3 + Quasar + Composition API + TypeScript
  Dark Enterprise Theme — Production Grade
  ============================================================
  -->
  <q-page class="db-page">
    <!-- ============================================================
         SIDEBAR NAVIGATION
    ============================================================ -->
    <aside class="db-sidebar" :class="{ 'db-sidebar--collapsed': sidebarCollapsed }">
      <div class="db-sidebar-logo">
        <q-icon name="architecture" size="1.6rem" color="blue-4" />
        <span v-if="!sidebarCollapsed" class="db-sidebar-brand">ConstructPro</span>
      </div>

      <nav class="db-nav">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="db-nav-item"
          :class="{ 'db-nav-item--active': activeNav === item.id }"
          @click="navigate(item.id)"
        >
          <q-icon :name="item.icon" size="1.1rem" />
          <span v-if="!sidebarCollapsed" class="db-nav-label">{{ item.label }}</span>
          <q-badge
            v-if="item.badge && !sidebarCollapsed"
            :label="item.badge"
            color="red-8"
            class="db-nav-badge"
          />
          <q-tooltip v-if="sidebarCollapsed" anchor="center right" self="center left">
            {{ item.label }}
          </q-tooltip>
        </div>
      </nav>

      <div class="db-sidebar-footer">
        <div class="db-nav-item" @click="sidebarCollapsed = !sidebarCollapsed">
          <q-icon :name="sidebarCollapsed ? 'chevron_right' : 'chevron_left'" size="1rem" />
          <span v-if="!sidebarCollapsed" class="db-nav-label">ย่อแถบเมนู</span>
        </div>
      </div>
    </aside>

    <!-- ============================================================
         MAIN CONTENT AREA
    ============================================================ -->
    <div class="db-content" :class="{ 'db-content--expanded': sidebarCollapsed }">
      <!-- ============================================================
           TOP NAVBAR
      ============================================================ -->
      <header class="db-topbar">
        <div class="db-topbar-left">
          <div class="db-breadcrumb">
            <span class="db-breadcrumb-root">ConstructPro</span>
            <q-icon name="chevron_right" size="0.9rem" color="grey-6" />
            <span class="db-breadcrumb-current">{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="db-topbar-right">
          <!-- Search -->
          <div class="db-search-box">
            <q-icon name="search" size="0.9rem" color="grey-5" />
            <input class="db-search-inp" placeholder="ค้นหาโครงการ..." v-model="searchQuery" />
          </div>
          <!-- Notifications -->
          <div class="db-icon-btn-wrap" @click="showNotifications = !showNotifications">
            <q-icon name="notifications_none" size="1.1rem" color="grey-4" />
            <span class="db-notif-dot" v-if="unreadAlerts > 0">{{ unreadAlerts }}</span>
          </div>
          <!-- User -->
          <div class="db-user-chip" @click="showUserMenu = !showUserMenu">
            <div class="db-user-avatar">วศ</div>
            <span class="db-user-name">วศิน ภัทรโกวิท</span>
            <q-icon name="expand_more" size="0.8rem" color="grey-5" />
          </div>
        </div>
      </header>

      <!-- ============================================================
           PAGE: MAIN DASHBOARD
      ============================================================ -->
      <div v-if="activeNav === 'dashboard'" class="db-view db-view-fade">
        <!-- Page Header -->
        <div class="db-page-header">
          <div>
            <h1 class="db-page-title">ภาพรวมโครงการ</h1>
            <p class="db-page-sub">อัปเดตล่าสุด: {{ todayFormatted }} | ปีงบประมาณ 2568</p>
          </div>
          <div class="db-page-actions">
            <button class="db-btn db-btn-ghost" @click="refreshData">
              <q-icon name="refresh" size="0.9rem" />รีเฟรช
            </button>
            <button class="db-btn db-btn-primary" @click="openCreateModal">
              <q-icon name="add" size="0.9rem" />โครงการใหม่
            </button>
          </div>
        </div>

        <!-- KPI SUMMARY CARDS -->
        <div class="db-kpi-grid">
          <div
            v-for="kpi in kpiCards"
            :key="kpi.id"
            class="db-kpi-card"
            :class="'db-kpi-card--' + kpi.variant"
            @click="kpi.action && kpi.action()"
          >
            <div class="db-kpi-icon-wrap">
              <q-icon :name="kpi.icon" size="1.4rem" :color="kpi.iconColor" />
            </div>
            <div class="db-kpi-body">
              <div class="db-kpi-value">{{ kpi.value }}</div>
              <div class="db-kpi-label">{{ kpi.label }}</div>
              <div class="db-kpi-trend" :class="'db-kpi-trend--' + kpi.trendDir">
                <q-icon
                  :name="
                    kpi.trendDir === 'up'
                      ? 'trending_up'
                      : kpi.trendDir === 'down'
                        ? 'trending_down'
                        : 'trending_flat'
                  "
                  size="0.75rem"
                />
                {{ kpi.trend }}
              </div>
            </div>
          </div>
        </div>

        <!-- ALERT PANEL -->
        <div class="db-alerts-row" v-if="activeAlerts.length">
          <div class="db-alerts-header">
            <q-icon name="warning_amber" size="0.95rem" color="orange-5" />
            <span>การแจ้งเตือนสำคัญ ({{ activeAlerts.length }})</span>
            <button class="db-btn-link" @click="dismissAllAlerts">ปิดทั้งหมด</button>
          </div>
          <div class="db-alert-list">
            <div
              v-for="alert in activeAlerts.slice(0, alertsExpanded ? 999 : 3)"
              :key="alert.id"
              class="db-alert-item"
              :class="'db-alert-item--' + alert.severity"
            >
              <q-icon :name="alert.icon" size="0.9rem" />
              <div class="db-alert-text">
                <span class="db-alert-project">{{ alert.project }}</span>
                <span class="db-alert-msg">{{ alert.message }}</span>
              </div>
              <span class="db-alert-time">{{ alert.time }}</span>
              <button class="db-alert-dismiss" @click="dismissAlert(alert.id)">✕</button>
            </div>
          </div>
          <button
            v-if="activeAlerts.length > 3"
            class="db-btn-link db-alert-more"
            @click="alertsExpanded = !alertsExpanded"
          >
            {{ alertsExpanded ? 'ย่อลง' : `แสดงทั้งหมด ${activeAlerts.length} รายการ` }}
          </button>
        </div>

        <!-- PROJECTS + ACTIVITIES ROW -->
        <div class="db-two-col">
          <!-- PROJECT CARDS -->
          <div class="db-section">
            <div class="db-section-header">
              <span class="db-section-title">โครงการทั้งหมด</span>
              <div class="db-section-filters">
                <button
                  v-for="f in projectFilters"
                  :key="f.value"
                  class="db-filter-chip"
                  :class="{ 'db-filter-chip--active': projectFilter === f.value }"
                  @click="projectFilter = f.value"
                >
                  {{ f.label }}
                </button>
              </div>
            </div>
            <div class="db-project-list">
              <div
                v-for="proj in filteredProjects"
                :key="proj.id"
                class="db-project-card"
                :class="'db-project-card--' + proj.status"
                @click="openProject(proj)"
              >
                <div class="db-pc-top">
                  <div class="db-pc-info">
                    <span class="db-pc-code">{{ proj.code }}</span>
                    <span class="db-pc-status-badge" :class="'badge-' + proj.status">{{
                      proj.statusLabel
                    }}</span>
                  </div>
                  <div class="db-pc-type">{{ proj.type }}</div>
                </div>
                <div class="db-pc-name">{{ proj.name }}</div>
                <div class="db-pc-meta">
                  <span><q-icon name="location_on" size="0.75rem" />{{ proj.location }}</span>
                  <span><q-icon name="person" size="0.75rem" />{{ proj.pm }}</span>
                </div>
                <div class="db-pc-progress">
                  <div class="db-pc-progress-bar-wrap">
                    <div class="db-pc-progress-plan" :style="{ width: proj.planPct + '%' }"></div>
                    <div
                      class="db-pc-progress-actual"
                      :style="{ width: proj.actualPct + '%' }"
                    ></div>
                  </div>
                  <div class="db-pc-progress-nums">
                    <span class="plan-num">แผน {{ proj.planPct }}%</span>
                    <span class="actual-num" :class="{ behind: proj.actualPct < proj.planPct }"
                      >จริง {{ proj.actualPct }}%</span
                    >
                    <span
                      class="var-num"
                      :class="{
                        positive: proj.actualPct >= proj.planPct,
                        negative: proj.actualPct < proj.planPct,
                      }"
                    >
                      Δ {{ (proj.actualPct - proj.planPct).toFixed(1) }}%
                    </span>
                  </div>
                </div>
                <!-- ★ CRUD: footer with edit/delete buttons -->
                <div class="db-pc-footer">
                  <span class="db-pc-budget">฿{{ formatBudget(proj.budget) }}</span>
                  <span class="db-pc-days" :class="{ 'db-pc-days--late': proj.daysLeft < 0 }">
                    {{
                      proj.daysLeft > 0
                        ? proj.daysLeft + ' วันคงเหลือ'
                        : Math.abs(proj.daysLeft) + ' วันเกิน'
                    }}
                  </span>
                  <div class="db-pc-actions">
                    <button
                      class="db-pc-action-btn db-pc-action-btn--edit"
                      @click.stop="openEditModal(proj)"
                      title="แก้ไขโครงการ"
                    >
                      <q-icon name="edit" size="0.75rem" />
                    </button>
                    <button
                      class="db-pc-action-btn db-pc-action-btn--delete"
                      @click.stop="openDeleteConfirm(proj)"
                      title="ลบโครงการ"
                    >
                      <q-icon name="delete_outline" size="0.75rem" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIVITY FEED + MINI CHARTS -->
          <div class="db-side-col">
            <!-- Health Summary -->
            <div class="db-section db-health-section">
              <div class="db-section-header">
                <span class="db-section-title">สุขภาพโครงการ</span>
              </div>
              <div class="db-health-grid">
                <div v-for="h in healthItems" :key="h.label" class="db-health-item">
                  <div class="db-health-label">{{ h.label }}</div>
                  <div class="db-health-bar-wrap">
                    <div
                      class="db-health-bar"
                      :class="'db-health-bar--' + h.color"
                      :style="{ width: h.pct + '%' }"
                    ></div>
                  </div>
                  <div class="db-health-val" :class="'text-' + h.color">{{ h.pct }}%</div>
                </div>
              </div>
            </div>

            <!-- Mini S-Curve -->
            <div class="db-section db-scurve-mini-section">
              <div class="db-section-header">
                <span class="db-section-title">S-Curve ภาพรวม</span>
                <span class="db-section-sub">เดือนปัจจุบัน</span>
              </div>
              <canvas
                ref="miniScurveCanvas"
                class="db-mini-scurve"
                width="320"
                height="120"
              ></canvas>
              <div class="db-scurve-legend">
                <span class="db-legend-plan">▬ แผน</span>
                <span class="db-legend-actual">▬ จริง</span>
              </div>
            </div>

            <!-- Activity Feed -->
            <div class="db-section db-activity-section">
              <div class="db-section-header">
                <span class="db-section-title">กิจกรรมล่าสุด</span>
              </div>
              <div class="db-activity-list">
                <div v-for="act in recentActivities" :key="act.id" class="db-activity-item">
                  <div class="db-act-dot" :class="'db-act-dot--' + act.type"></div>
                  <div class="db-act-body">
                    <div class="db-act-text">{{ act.text }}</div>
                    <div class="db-act-meta">{{ act.user }} · {{ act.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           PAGE: PROJECT DETAIL DASHBOARD
      ============================================================ -->
      <div v-if="activeNav === 'project-detail'" class="db-view db-view-fade">
        <!-- Back button -->
        <div class="db-back-row">
          <button class="db-btn db-btn-ghost" @click="navigate('dashboard')">
            <q-icon name="arrow_back" size="0.9rem" />กลับหน้าหลัก
          </button>
          <div class="db-breadcrumb">
            <span class="db-breadcrumb-root">โครงการ</span>
            <q-icon name="chevron_right" size="0.9rem" color="grey-6" />
            <span class="db-breadcrumb-current">{{ selectedProject?.name }}</span>
          </div>
        </div>

        <div class="db-page-header" v-if="selectedProject">
          <div>
            <div class="db-project-code-badge">{{ selectedProject.code }}</div>
            <h1 class="db-page-title">{{ selectedProject.name }}</h1>
            <p class="db-page-sub">
              {{ selectedProject.location }} | PM: {{ selectedProject.pm }} | สัญญา:
              {{ selectedProject.contractNo }}
            </p>
          </div>
          <div class="db-page-actions">
            <button class="db-btn db-btn-ghost" @click="navigate('gantt')">
              <q-icon name="view_timeline" size="0.9rem" />Gantt Chart
            </button>
            <!-- ★ CRUD: Edit button in detail page -->
            <button class="db-btn db-btn-ghost" @click="openEditModal(selectedProject!)">
              <q-icon name="edit" size="0.9rem" />แก้ไขโครงการ
            </button>
            <button class="db-btn db-btn-primary" @click="showUpdateModal = true">
              <q-icon name="edit" size="0.9rem" />อัปเดตความคืบหน้า
            </button>
          </div>
        </div>

        <!-- PROJECT KPI CARDS -->
        <div class="db-kpi-grid" v-if="selectedProject">
          <div
            v-for="kpi in projectKpis"
            :key="kpi.id"
            class="db-kpi-card"
            :class="'db-kpi-card--' + kpi.variant"
          >
            <div class="db-kpi-icon-wrap">
              <q-icon :name="kpi.icon" size="1.4rem" :color="kpi.iconColor" />
            </div>
            <div class="db-kpi-body">
              <div class="db-kpi-value">{{ kpi.value }}</div>
              <div class="db-kpi-label">{{ kpi.label }}</div>
              <div class="db-kpi-trend" :class="'db-kpi-trend--' + kpi.trendDir">
                <q-icon
                  :name="kpi.trendDir === 'up' ? 'trending_up' : 'trending_down'"
                  size="0.75rem"
                />
                {{ kpi.trend }}
              </div>
            </div>
          </div>
        </div>

        <!-- S-CURVE + MILESTONE -->
        <div class="db-two-col">
          <!-- S-Curve Detail -->
          <div class="db-section db-scurve-detail-section">
            <div class="db-section-header">
              <span class="db-section-title">S-Curve ความคืบหน้า</span>
              <div class="db-section-filters">
                <button
                  v-for="p in ['weekly', 'monthly']"
                  :key="p"
                  class="db-filter-chip"
                  :class="{ 'db-filter-chip--active': scurvePeriod === p }"
                  @click="scurvePeriod = p"
                >
                  {{ p === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน' }}
                </button>
              </div>
            </div>
            <canvas
              ref="detailScurveCanvas"
              class="db-detail-scurve"
              width="600"
              height="200"
            ></canvas>
            <div class="db-scurve-table">
              <table class="db-table">
                <thead>
                  <tr>
                    <th>งวด</th>
                    <th>แผน%</th>
                    <th>แผนสะสม%</th>
                    <th>จริง%</th>
                    <th>จริงสะสม%</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in scurveTableRows" :key="row.period">
                    <td>{{ row.period }}</td>
                    <td>{{ (row.plan ?? 0).toFixed(2) }}</td>
                    <td>{{ (row.planCum ?? 0).toFixed(2) }}</td>
                    <td>{{ (row.actual ?? 0) > 0 ? (row.actual ?? 0).toFixed(2) : '–' }}</td>
                    <td>{{ (row.actualCum ?? 0) > 0 ? (row.actualCum ?? 0).toFixed(2) : '–' }}</td>
                    <td
                      :class="{
                        'text-positive': (row.variance ?? 0) > 0,
                        'text-negative': (row.variance ?? 0) < 0,
                      }"
                    >
                      {{
                        (row.actualCum ?? 0) > 0
                          ? ((row.variance ?? 0) > 0 ? '+' : '') + (row.variance ?? 0).toFixed(2)
                          : '–'
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Milestone + Activity -->
          <div class="db-side-col">
            <!-- Milestone Tracker -->
            <div class="db-section">
              <div class="db-section-header">
                <span class="db-section-title">Milestone</span>
              </div>
              <div class="db-milestone-list">
                <div
                  v-for="ms in milestones"
                  :key="ms.id"
                  class="db-milestone-item"
                  :class="'db-ms--' + ms.status"
                >
                  <div class="db-ms-icon">
                    <q-icon
                      :name="
                        ms.status === 'done'
                          ? 'check_circle'
                          : ms.status === 'active'
                            ? 'radio_button_checked'
                            : 'radio_button_unchecked'
                      "
                      size="1rem"
                    />
                  </div>
                  <div class="db-ms-body">
                    <div class="db-ms-name">{{ ms.name }}</div>
                    <div class="db-ms-date">{{ ms.date }}</div>
                  </div>
                  <div class="db-ms-pct" v-if="ms.pct > 0">{{ ms.pct }}%</div>
                </div>
              </div>
            </div>

            <!-- Weekly Progress Bar Chart -->
            <div class="db-section">
              <div class="db-section-header">
                <span class="db-section-title">ความคืบหน้ารายสัปดาห์</span>
              </div>
              <div class="db-weekly-bars">
                <div v-for="wb in weeklyBars" :key="wb.week" class="db-weekly-bar-item">
                  <div class="db-wb-label">{{ wb.week }}</div>
                  <div class="db-wb-bars">
                    <div
                      class="db-wb-plan"
                      :style="{ height: wb.plan * 2.4 + 'px' }"
                      :title="'แผน ' + wb.plan + '%'"
                    ></div>
                    <div
                      class="db-wb-actual"
                      :style="{ height: wb.actual * 2.4 + 'px' }"
                      :title="'จริง ' + wb.actual + '%'"
                    ></div>
                  </div>
                  <div class="db-wb-val">{{ wb.actual > 0 ? wb.actual : '–' }}</div>
                </div>
              </div>
            </div>

            <!-- Budget Overview -->
            <div class="db-section">
              <div class="db-section-header">
                <span class="db-section-title">งบประมาณ</span>
              </div>
              <div class="db-budget-rows" v-if="selectedProject">
                <div class="db-budget-row">
                  <span>งบโครงการ</span>
                  <span class="db-bval">฿{{ formatBudget(selectedProject.budget) }}</span>
                </div>
                <div class="db-budget-row">
                  <span>เบิกจ่ายแล้ว</span>
                  <span class="db-bval text-positive"
                    >฿{{ formatBudget(selectedProject.spent) }}</span
                  >
                </div>
                <div class="db-budget-row">
                  <span>คงเหลือ</span>
                  <span class="db-bval"
                    >฿{{ formatBudget(selectedProject.budget - selectedProject.spent) }}</span
                  >
                </div>
                <div class="db-budget-progress">
                  <div
                    class="db-bp-bar"
                    :style="{
                      width:
                        ((selectedProject.spent / selectedProject.budget) * 100).toFixed(1) + '%',
                    }"
                  ></div>
                </div>
                <div class="db-budget-sub">
                  ใช้ไป {{ ((selectedProject.spent / selectedProject.budget) * 100).toFixed(1) }}%
                  ของงบทั้งหมด
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           PAGE: GANTT CHART (link to existing component)
      ============================================================ -->
      <div v-if="activeNav === 'gantt'" class="db-view db-view-fade">
        <project-planning :project-id="selectedProject?.id" />
        <div class="db-page-header">
          <div>
            <h1 class="db-page-title">Gantt Chart</h1>
            <p class="db-page-sub">
              {{ selectedProject?.name || 'เลือกโครงการเพื่อดู Gantt Chart' }}
            </p>
          </div>
          <div class="db-page-actions">
            <button class="db-btn db-btn-ghost" @click="navigate('project-detail')">
              <q-icon name="arrow_back" size="0.9rem" />กลับ
            </button>
          </div>
        </div>
        <div class="db-gantt-redirect">
          <q-icon name="view_timeline" size="3rem" color="blue-5" />
          <div class="db-gr-title">Gantt Chart Module</div>
          <div class="db-gr-sub">
            Component: <code>ProjectPlanning.vue</code> — ใช้ไฟล์ที่มีอยู่แล้ว
          </div>
          <button
            class="db-btn db-btn-primary"
            style="margin-top: 16px"
            @click="$router.push({ path: '/planning', query: { projectId: selectedProject?.id } })"
          >
            เปิด Gantt Chart
          </button>
        </div>
      </div>

      <!-- ============================================================
           PAGE: REPORTS
      ============================================================ -->
      <div v-if="activeNav === 'reports'" class="db-view db-view-fade">
        <div class="db-page-header">
          <div>
            <h1 class="db-page-title">รายงาน & Analytics</h1>
            <p class="db-page-sub">สรุปผลการดำเนินงานรายไตรมาส</p>
          </div>
          <div class="db-page-actions">
            <button class="db-btn db-btn-ghost" @click="exportReport('pdf')">
              <q-icon name="picture_as_pdf" size="0.9rem" />Export PDF
            </button>
            <button class="db-btn db-btn-primary" @click="exportReport('excel')">
              <q-icon name="table_chart" size="0.9rem" />Export Excel
            </button>
          </div>
        </div>

        <div class="db-report-grid">
          <!-- Summary table -->
          <div class="db-section" style="grid-column: 1/-1">
            <div class="db-section-header">
              <span class="db-section-title">สรุปสถานะโครงการทั้งหมด</span>
            </div>
            <table class="db-table db-table-full">
              <thead>
                <tr>
                  <th>รหัสโครงการ</th>
                  <th>ชื่อโครงการ</th>
                  <th>สถานะ</th>
                  <th>แผน%</th>
                  <th>จริง%</th>
                  <th>Variance</th>
                  <th>งบประมาณ</th>
                  <th>เบิกจ่าย%</th>
                  <th>วันคงเหลือ</th>
                  <th>PM</th>
                  <!-- ★ CRUD: actions column -->
                  <th style="width: 76px; text-align: center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="proj in allProjects"
                  :key="proj.id"
                  @click="openProject(proj)"
                  class="db-table-row-click"
                >
                  <td>
                    <code>{{ proj.code }}</code>
                  </td>
                  <td class="db-table-name">{{ proj.name }}</td>
                  <td>
                    <span class="db-pc-status-badge" :class="'badge-' + proj.status">{{
                      proj.statusLabel
                    }}</span>
                  </td>
                  <td>{{ proj.planPct }}%</td>
                  <td>{{ proj.actualPct }}%</td>
                  <td
                    :class="{
                      'text-positive': proj.actualPct >= proj.planPct,
                      'text-negative': proj.actualPct < proj.planPct,
                    }"
                  >
                    {{ (proj.actualPct - proj.planPct).toFixed(1) }}%
                  </td>
                  <td>฿{{ formatBudget(proj.budget) }}</td>
                  <td>{{ ((proj.spent / proj.budget) * 100).toFixed(0) }}%</td>
                  <td :class="{ 'text-negative': proj.daysLeft < 0 }">
                    {{ proj.daysLeft > 0 ? proj.daysLeft : '⚠ ' + Math.abs(proj.daysLeft) }}
                  </td>
                  <td>{{ proj.pm }}</td>
                  <!-- ★ CRUD: edit/delete per row -->
                  <td @click.stop style="text-align: center">
                    <div class="db-tbl-actions">
                      <button
                        class="db-pc-action-btn db-pc-action-btn--edit"
                        @click="openEditModal(proj)"
                        title="แก้ไข"
                      >
                        <q-icon name="edit" size="0.75rem" />
                      </button>
                      <button
                        class="db-pc-action-btn db-pc-action-btn--delete"
                        @click="openDeleteConfirm(proj)"
                        title="ลบ"
                      >
                        <q-icon name="delete_outline" size="0.75rem" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- /db-content -->

    <!-- ============================================================
         MODAL: CREATE / EDIT PROJECT  ★ CRUD (unified modal)
    ============================================================ -->
    <div v-if="showProjectModal" class="db-modal-overlay" @click.self="closeProjectModal">
      <div class="db-modal db-modal--wide">
        <div class="db-modal-header">
          <q-icon
            :name="isEditMode ? 'edit' : 'add_business'"
            size="1.2rem"
            :color="isEditMode ? 'orange-4' : 'blue-4'"
          />
          <span>{{ isEditMode ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่' }}</span>
          <button class="db-modal-close" @click="closeProjectModal">✕</button>
        </div>

        <div class="db-modal-body">
          <!-- Name -->
          <div class="db-form-group">
            <label class="db-form-label">ชื่อโครงการ <span class="db-form-req">*</span></label>
            <input
              class="db-form-inp"
              :class="{ 'db-form-inp--error': formErrors.name }"
              v-model="projectForm.name"
              placeholder="ชื่อโครงการก่อสร้าง..."
              @input="formErrors.name = ''"
            />
            <span v-if="formErrors.name" class="db-form-error">{{ formErrors.name }}</span>
          </div>

          <!-- Code + Type -->
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label">รหัสโครงการ</label>
              <input class="db-form-inp" v-model="projectForm.code" placeholder="PROJ-001" />
            </div>
            <div class="db-form-group">
              <label class="db-form-label">ประเภท</label>
              <select class="db-form-inp" v-model="projectForm.type">
                <option>ก่อสร้างอาคาร</option>
                <option>ปรับปรุงซ่อมแซม</option>
                <option>งานระบบ MEP</option>
                <option>งานโยธา</option>
              </select>
            </div>
          </div>
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label">เลขที่สัญญา</label>
              <input class="db-form-inp" v-model="projectForm.code" placeholder="PROJ-001" />
            </div>
            <div class="db-form-group">
              <label class="db-form-label">วันที่ลงนามสัญญา</label>
              <input class="db-form-inp" type="date" v-model="projectForm.contractDate" />
            </div>
          </div>

          <!-- Dates -->
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label"
                >วันเริ่มโครงการ <span class="db-form-req">*</span></label
              >
              <input
                class="db-form-inp"
                :class="{ 'db-form-inp--error': formErrors.start }"
                type="date"
                v-model="projectForm.start"
                @change="formErrors.start = ''"
              />
              <span v-if="formErrors.start" class="db-form-error">{{ formErrors.start }}</span>
            </div>
            <div class="db-form-group">
              <label class="db-form-label"
                >วันสิ้นสุดสัญญา <span class="db-form-req">*</span></label
              >
              <input
                class="db-form-inp"
                :class="{ 'db-form-inp--error': formErrors.end }"
                type="date"
                v-model="projectForm.end"
                @change="formErrors.end = ''"
              />
              <span v-if="formErrors.end" class="db-form-error">{{ formErrors.end }}</span>
            </div>
          </div>

          <!-- Budget + PM -->
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label">งบประมาณ (บาท) <span class="db-form-req">*</span></label>
              <input
                class="db-form-inp"
                :class="{ 'db-form-inp--error': formErrors.budget }"
                type="number"
                min="0"
                v-model.number="projectForm.budget"
                placeholder="0"
                @input="formErrors.budget = ''"
              />
              <span v-if="formErrors.budget" class="db-form-error">{{ formErrors.budget }}</span>
            </div>
            <div class="db-form-group">
              <label class="db-form-label">Project Manager</label>
              <input class="db-form-inp" v-model="projectForm.pm" placeholder="ชื่อ PM" />
            </div>
          </div>

          <!-- Location + Status (status only shown in edit mode) -->
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label">สถานที่ก่อสร้าง</label>
              <input
                class="db-form-inp"
                v-model="projectForm.location"
                placeholder="จังหวัด / อำเภอ"
              />
            </div>
            <div class="db-form-group" v-if="isEditMode">
              <label class="db-form-label">สถานะ</label>
              <select class="db-form-inp" v-model="projectForm.status">
                <option value="on-track">กำลังดำเนินการ</option>
                <option value="at-risk">เสี่ยงล่าช้า</option>
                <option value="delayed">ล่าช้า</option>
                <option value="completed">เสร็จสมบูรณ์</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="db-form-group">
            <label class="db-form-label">รายละเอียดโครงการ</label>
            <textarea
              class="db-form-inp db-form-textarea db-form-textarea--tall"
              v-model="projectForm.description"
              placeholder="รายละเอียดเพิ่มเติม เช่น ขอบเขตงาน, เงื่อนไขพิเศษ..."
            ></textarea>
          </div>
        </div>

        <div class="db-modal-footer">
          <button class="db-btn db-btn-ghost" :disabled="modalLoading" @click="closeProjectModal">
            ยกเลิก
          </button>
          <button class="db-btn db-btn-primary" :disabled="modalLoading" @click="submitProjectForm">
            <span v-if="modalLoading" class="db-btn-spinner"></span>
            <q-icon v-else :name="isEditMode ? 'save' : 'add'" size="0.9rem" />
            {{ modalLoading ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการแก้ไข' : 'สร้างโครงการ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         DIALOG: DELETE CONFIRM  ★ CRUD
    ============================================================ -->
    <div
      v-if="showDeleteConfirmDialog"
      class="db-modal-overlay"
      @click.self="showDeleteConfirmDialog = false"
    >
      <div class="db-modal db-modal--narrow">
        <div class="db-modal-header">
          <q-icon name="warning_amber" size="1.2rem" color="red-4" />
          <span>ยืนยันการลบโครงการ</span>
          <button class="db-modal-close" @click="showDeleteConfirmDialog = false">✕</button>
        </div>

        <div class="db-modal-body" style="padding: 20px 20px 12px">
          <p style="font-size: 13px; color: #c9d4e0; margin: 0 0 10px; line-height: 1.5">
            คุณต้องการลบโครงการ
            <strong style="color: #fff">{{ deletingProject?.name }}</strong> ใช่หรือไม่?
          </p>
          <div v-if="deletingProject" class="db-delete-detail">
            รหัส: {{ deletingProject.code }} &nbsp;|&nbsp; งบประมาณ: ฿{{
              formatBudget(deletingProject.budget)
            }}
          </div>
          <p style="font-size: 11px; color: #ef9a9a; margin: 10px 0 0">
            การลบนี้ไม่สามารถกู้คืนได้
          </p>
        </div>

        <div class="db-modal-footer">
          <button class="db-btn db-btn-ghost" @click="showDeleteConfirmDialog = false">
            ยกเลิก
          </button>
          <button class="db-btn db-btn-danger" @click="confirmDelete">
            <q-icon name="delete" size="0.9rem" />ลบโครงการ
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         MODAL: UPDATE PROGRESS (unchanged)
    ============================================================ -->
    <div v-if="showUpdateModal" class="db-modal-overlay" @click.self="showUpdateModal = false">
      <div class="db-modal">
        <div class="db-modal-header">
          <q-icon name="update" size="1.2rem" color="green-4" />
          <span>อัปเดตความคืบหน้า — {{ selectedProject?.name }}</span>
          <button class="db-modal-close" @click="showUpdateModal = false">✕</button>
        </div>
        <div class="db-modal-body">
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label">% ผลงานจริงสะสม</label>
              <input
                class="db-form-inp"
                type="number"
                step="0.1"
                min="0"
                max="100"
                v-model.number="updateForm.actualPct"
              />
            </div>
            <div class="db-form-group">
              <label class="db-form-label">วันที่อัปเดต</label>
              <input class="db-form-inp" type="date" v-model="updateForm.date" />
            </div>
          </div>
          <div class="db-form-group">
            <label class="db-form-label">หมายเหตุ</label>
            <textarea
              class="db-form-inp db-form-textarea"
              v-model="updateForm.remark"
              placeholder="สรุปความคืบหน้า..."
            ></textarea>
          </div>
          <div class="db-update-preview" v-if="selectedProject">
            <div class="db-up-row">
              <span>แผนปัจจุบัน:</span>
              <span>{{ selectedProject.planPct }}%</span>
            </div>
            <div class="db-up-row">
              <span>ผลงานใหม่:</span>
              <span
                :class="{
                  'text-positive': updateForm.actualPct >= selectedProject.planPct,
                  'text-negative': updateForm.actualPct < selectedProject.planPct,
                }"
              >
                {{ updateForm.actualPct }}%
              </span>
            </div>
            <div class="db-up-row">
              <span>Variance:</span>
              <span
                :class="{
                  'text-positive': updateForm.actualPct >= selectedProject.planPct,
                  'text-negative': updateForm.actualPct < selectedProject.planPct,
                }"
              >
                {{ (updateForm.actualPct - selectedProject.planPct).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
        <div class="db-modal-footer">
          <button class="db-btn db-btn-ghost" @click="showUpdateModal = false">ยกเลิก</button>
          <button class="db-btn db-btn-primary" @click="saveProgress">บันทึกความคืบหน้า</button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         NOTIFICATION PANEL
    ============================================================ -->
    <div v-if="showNotifications" class="db-notif-panel">
      <div class="db-notif-header">
        <span>การแจ้งเตือน</span>
        <button class="db-btn-link" @click="showNotifications = false">ปิด</button>
      </div>
      <div
        v-for="n in notifications"
        :key="n.id"
        class="db-notif-item"
        :class="{ 'db-notif-unread': !n.read }"
      >
        <q-icon :name="n.icon" size="0.9rem" :color="n.color" />
        <div class="db-notif-body">
          <div class="db-notif-text">{{ n.text }}</div>
          <div class="db-notif-time">{{ n.time }}</div>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <transition name="db-toast-fade">
      <div v-if="toast.visible" class="db-toast" :class="'db-toast--' + toast.type">
        <q-icon :name="toast.type === 'success' ? 'check_circle' : 'error'" size="1rem" />
        {{ toast.message }}
      </div>
    </transition>
  </q-page>
</template>

<script setup lang="ts">
// ============================================================
// CONSTRUCTION PLANNING DASHBOARD
// Vue 3 + Quasar + Composition API + TypeScript
// ============================================================
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue';
import ProjectPlanning from './project-planning.vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem('authToken');
// ============================================================
// TYPES & INTERFACES
// ============================================================
interface Project {
  id: number;
  code: string;
  name: string;
  type: string;
  location: string;
  pm: string;
  contractNo: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  statusLabel: string;
  planPct: number;
  actualPct: number;
  budget: number;
  spent: number;
  daysLeft: number;
  start: string;
  end: string;
  description?: string;
  contractDate?: string;
}

interface KpiCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  variant: string;
  trend: string;
  trendDir: 'up' | 'down' | 'flat';
  action?: () => void;
}

interface Alert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  project: string;
  message: string;
  time: string;
  icon: string;
  dismissed: boolean;
}

interface Milestone {
  id: number;
  name: string;
  date: string;
  status: 'done' | 'active' | 'pending';
  pct: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

interface Activity {
  id: number;
  type: 'update' | 'alert' | 'milestone' | 'create';
  text: string;
  user: string;
  time: string;
}

interface Toast {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}

// ★ CRUD: Project form shape
interface ProjectForm {
  name: string;
  code: string;
  type: string;
  start: string;
  end: string;
  budget: number;
  pm: string;
  location: string;
  status: string;
  description: string;
  contractDate: string;
}
interface ScurvePoint {
  period: string;
  plan: number;
  planCum: number;
  actual: number;
  actualCum: number;
  variance: number;
}

// ============================================================
// STATE
// ============================================================
const activeNav = ref<string>('dashboard');
const sidebarCollapsed = ref<boolean>(false);
const searchQuery = ref<string>('');
const projectFilter = ref<string>('all');
const alertsExpanded = ref<boolean>(false);
const scurvePeriod = ref<string>('monthly');
const showUpdateModal = ref<boolean>(false);
const showNotifications = ref<boolean>(false);
const showUserMenu = ref<boolean>(false);
const selectedProject = ref<Project | null>(null);
const scurveData = ref<ScurvePoint[]>([]);

// ★ CRUD state
const showProjectModal = ref<boolean>(false);
const showDeleteConfirmDialog = ref<boolean>(false);
const isEditMode = ref<boolean>(false);
const modalLoading = ref<boolean>(false);
const editingProjectId = ref<number | null>(null);
const deletingProject = ref<Project | null>(null);

// Keep old ref for backward compat (openCreateModal sets this)

// Canvas refs
const miniScurveCanvas = ref<HTMLCanvasElement | null>(null);
const detailScurveCanvas = ref<HTMLCanvasElement | null>(null);

// ★ CRUD: unified project form + errors
const blankForm = (): ProjectForm => ({
  name: '',
  code: '',
  type: 'ก่อสร้างอาคาร',
  start: new Date().toISOString().slice(0, 10),
  end: '',
  budget: 0,
  pm: '',
  location: '',
  status: 'on-track',
  description: '',
  contractDate: new Date().toISOString().slice(0, 10),
});
const projectForm = reactive<ProjectForm>(blankForm());
const formErrors = reactive<Partial<Record<keyof ProjectForm, string>>>({});

// Legacy progress update form
const updateForm = reactive({
  actualPct: 0,
  date: new Date().toISOString().slice(0, 10),
  remark: '',
});

// Toast
const toast = reactive<Toast>({ visible: false, message: '', type: 'success' });

// ============================================================
// CONSTANTS
// ============================================================
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'ภาพรวมโครงการ', icon: 'dashboard' },
  { id: 'project-detail', label: 'รายละเอียดโครงการ', icon: 'folder_special' },
  { id: 'gantt', label: 'Gantt Chart', icon: 'view_timeline' },
  { id: 'reports', label: 'รายงาน', icon: 'bar_chart' },
];

const projectFilters = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'กำลังดำเนินการ', value: 'on-track' },
  { label: 'เสี่ยง', value: 'at-risk' },
  { label: 'ล่าช้า', value: 'delayed' },
  { label: 'เสร็จแล้ว', value: 'completed' },
];

// ★ CRUD: status → label map
const statusLabelMap: Record<string, string> = {
  'on-track': 'กำลังดำเนินการ',
  'at-risk': 'เสี่ยงล่าช้า',
  delayed: 'ล่าช้า',
  completed: 'เสร็จสมบูรณ์',
};

// ============================================================
// MOCK DATA — Realistic construction projects
// ============================================================
const allProjects = ref<Project[]>([
  // {
  //   id: 1,
  //   code: 'รพ.ธ.151/66',
  //   name: 'ปรับปรุงอาคารธนาคารทหารไทย โรงพยาบาลธรรมศาสตร์',
  //   type: 'ปรับปรุงซ่อมแซม',
  //   location: 'ปทุมธานี',
  //   pm: 'วศิน ภัทรโกวิท',
  //   contractNo: 'รพ.ธ. 151/2566',
  //   status: 'on-track',
  //   statusLabel: 'กำลังดำเนินการ',
  //   planPct: 68.5,
  //   actualPct: 71.2,
  //   budget: 14699987,
  //   spent: 9845000,
  //   daysLeft: 45,
  //   start: '2022-12-01',
  //   end: '2023-05-29',
  // },
  // {
  //   id: 2,
  //   code: 'MED-CTR-002',
  //   name: 'ก่อสร้างอาคารศูนย์การแพทย์พิเศษ ชั้น 5-8',
  //   type: 'ก่อสร้างอาคาร',
  //   location: 'กรุงเทพฯ',
  //   pm: 'สมชาย วิวัฒน์กุล',
  //   contractNo: 'MED-CTR-002/2566',
  //   status: 'at-risk',
  //   statusLabel: 'เสี่ยงล่าช้า',
  //   planPct: 45.0,
  //   actualPct: 38.5,
  //   budget: 89500000,
  //   spent: 31200000,
  //   daysLeft: 180,
  //   start: '2023-03-01',
  //   end: '2024-06-30',
  // },
  // {
  //   id: 3,
  //   code: 'RD-EXP-003',
  //   name: 'ขยายถนนสายหลัก กม.12-28 พร้อมระบบระบายน้ำ',
  //   type: 'งานโยธา',
  //   location: 'นนทบุรี',
  //   pm: 'พรชัย ศรีอุดม',
  //   contractNo: 'RD-EXP-003/2566',
  //   status: 'delayed',
  //   statusLabel: 'ล่าช้า',
  //   planPct: 82.0,
  //   actualPct: 65.0,
  //   budget: 245000000,
  //   spent: 178000000,
  //   daysLeft: -15,
  //   start: '2022-10-01',
  //   end: '2023-09-30',
  // },
  // {
  //   id: 4,
  //   code: 'SYS-MEP-004',
  //   name: 'ติดตั้งระบบ MEP อาคารสำนักงานกลาง',
  //   type: 'งานระบบ MEP',
  //   location: 'สมุทรปราการ',
  //   pm: 'อนุชา ทองสุข',
  //   contractNo: 'SYS-MEP-004/2566',
  //   status: 'on-track',
  //   statusLabel: 'กำลังดำเนินการ',
  //   planPct: 55.0,
  //   actualPct: 57.3,
  //   budget: 32000000,
  //   spent: 17500000,
  //   daysLeft: 90,
  //   start: '2023-01-15',
  //   end: '2023-12-31',
  // },
  // {
  //   id: 5,
  //   code: 'HOS-REN-005',
  //   name: 'ปรับปรุงห้องผ่าตัด OPD ชั้น 2-4 โรงพยาบาลจังหวัด',
  //   type: 'ปรับปรุงซ่อมแซม',
  //   location: 'เชียงใหม่',
  //   pm: 'ณัฐพล จันทร์เพ็ง',
  //   contractNo: 'HOS-REN-005/2566',
  //   status: 'completed',
  //   statusLabel: 'เสร็จสมบูรณ์',
  //   planPct: 100,
  //   actualPct: 100,
  //   budget: 18500000,
  //   spent: 18200000,
  //   daysLeft: 30,
  //   start: '2022-06-01',
  //   end: '2023-03-31',
  // },
  // {
  //   id: 6,
  //   code: 'PARK-CON-006',
  //   name: 'ก่อสร้างอาคารจอดรถหลายชั้น 800 คัน',
  //   type: 'ก่อสร้างอาคาร',
  //   location: 'ภูเก็ต',
  //   pm: 'ศิริพร มีสุข',
  //   contractNo: 'PARK-CON-006/2566',
  //   status: 'at-risk',
  //   statusLabel: 'เสี่ยงล่าช้า',
  //   planPct: 30.0,
  //   actualPct: 25.1,
  //   budget: 156000000,
  //   spent: 38000000,
  //   daysLeft: 365,
  //   start: '2023-04-01',
  //   end: '2025-03-31',
  // },
]);

const alerts = ref<Alert[]>([
  {
    id: 1,
    severity: 'critical',
    project: 'RD-EXP-003',
    message: 'ผลงานต่ำกว่าแผน 17% — เกินกำหนดส่ง 15 วัน',
    time: '2 ชม.ที่แล้ว',
    icon: 'dangerous',
    dismissed: false,
  },
  {
    id: 2,
    severity: 'warning',
    project: 'MED-CTR-002',
    message: 'Variance -6.5% ต้องเร่งรัดงานโครงสร้าง',
    time: '5 ชม.ที่แล้ว',
    icon: 'warning',
    dismissed: false,
  },
  {
    id: 3,
    severity: 'warning',
    project: 'PARK-CON-006',
    message: 'งานฐานรากล่าช้าเนื่องจากสภาพดิน',
    time: '1 วันที่แล้ว',
    icon: 'report',
    dismissed: false,
  },
  {
    id: 4,
    severity: 'info',
    project: 'รพ.ธ.151/66',
    message: 'Milestone งานสถาปัตยกรรมเสร็จ 100%',
    time: '2 วันที่แล้ว',
    icon: 'info',
    dismissed: false,
  },
  {
    id: 5,
    severity: 'info',
    project: 'SYS-MEP-004',
    message: 'Milestone ระบบไฟฟ้าชั้น 1-3 เสร็จสมบูรณ์',
    time: '3 วันที่แล้ว',
    icon: 'info',
    dismissed: false,
  },
]);

const recentActivities = ref<Activity[]>([
  {
    id: 1,
    type: 'update',
    text: 'อัปเดตความคืบหน้า รพ.ธ.151/66 → 71.2%',
    user: 'วศิน ภ.',
    time: '10 นาทีที่แล้ว',
  },
  {
    id: 2,
    type: 'alert',
    text: 'แจ้งเตือน RD-EXP-003 เกินกำหนดส่ง',
    user: 'ระบบ',
    time: '2 ชม.ที่แล้ว',
  },
  {
    id: 3,
    type: 'milestone',
    text: 'Milestone งานโครงสร้าง MED-CTR-002 ผ่าน 40%',
    user: 'สมชาย ว.',
    time: '4 ชม.ที่แล้ว',
  },
  {
    id: 4,
    type: 'create',
    text: 'สร้างรายการงานใหม่ 3 รายการ SYS-MEP-004',
    user: 'อนุชา ท.',
    time: '1 วันที่แล้ว',
  },
  {
    id: 5,
    type: 'update',
    text: 'Export Gantt Chart รพ.ธ.151/66 → PDF',
    user: 'วศิน ภ.',
    time: '2 วันที่แล้ว',
  },
]);

const notifications = ref([
  {
    id: 1,
    text: 'RD-EXP-003 เกินกำหนดส่ง 15 วัน',
    icon: 'dangerous',
    color: 'red-5',
    time: '2 ชม.',
    read: false,
  },
  {
    id: 2,
    text: 'MED-CTR-002 Variance -6.5%',
    icon: 'warning',
    color: 'orange-5',
    time: '5 ชม.',
    read: false,
  },
  {
    id: 3,
    text: 'รพ.ธ.151/66 บันทึกความคืบหน้าสำเร็จ',
    icon: 'check_circle',
    color: 'green-5',
    time: '10 น.',
    read: true,
  },
]);

const milestones: Milestone[] = [
  { id: 1, name: 'งานเตรียมสถานที่', date: '15 ธ.ค. 65', status: 'done', pct: 100 },
  { id: 2, name: 'งานโครงสร้าง', date: '5 เม.ย. 66', status: 'done', pct: 100 },
  { id: 3, name: 'งานสถาปัตยกรรม', date: '18 พ.ค. 66', status: 'active', pct: 85 },
  { id: 4, name: 'งานระบบ MEP', date: '5 พ.ค. 66', status: 'active', pct: 72 },
  { id: 5, name: 'ทดสอบระบบและส่งมอบ', date: '29 พ.ค. 66', status: 'pending', pct: 0 },
];

const weeklyBars = [
  { week: 'W1', plan: 8.2, actual: 8.9 },
  { week: 'W2', plan: 9.4, actual: 8.1 },
  { week: 'W3', plan: 7.2, actual: 7.8 },
  { week: 'W4', plan: 10.9, actual: 11.2 },
  { week: 'W5', plan: 8.9, actual: 9.1 },
  { week: 'W6', plan: 5.2, actual: 4.8 },
  { week: 'W7', plan: 3.3, actual: 3.1 },
  { week: 'W8', plan: 0.7, actual: 0 },
];

const monthlyData = computed(() =>
  allProjects.value.map((p) => ({
    period: p.code,
    plan: p.planPct,
    planCum: p.planPct,
    actual: p.actualPct,
    actualCum: p.actualPct,
    variance: p.actualPct - p.planPct,
  })),
);

const healthItems = computed(() =>
  allProjects.value.map((p) => ({
    label: p.code,
    pct: p.actualPct,
    color: p.actualPct >= p.planPct ? 'green' : p.actualPct >= p.planPct - 10 ? 'orange' : 'red',
  })),
);

//fetch data from API on mounted (simulated with timeout here)
const fetchProject = async (): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE_URL}/planapi/getProject`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
      },
    });
    const data = await res.json();
    allProjects.value = data;
    // console.log('Data loaded', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const fetchScurve = async (projectId: number, period = 'monthly') => {
  const res = await fetch(`${API_BASE_URL}/planapi/getScurve/${projectId}?period=${period}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${AUTH_TOKEN}`,
    },
  });
  scurveData.value = await res.json();
  // console.log('Scurve data', scurveData.value);
  // console.log('scurve raw:', JSON.stringify(scurveData.value, null, 2));
  await nextTick();
  drawDetailScurve();
};
onMounted(async () => {
  // Simulate API call delay
  await fetchProject();
});

// ============================================================
// COMPUTED
// ============================================================
const currentPageTitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: 'ภาพรวมโครงการ',
    'project-detail': selectedProject.value?.name || 'รายละเอียดโครงการ',
    gantt: 'Gantt Chart',
    reports: 'รายงาน',
  };
  return map[activeNav.value] || 'Dashboard';
});

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
});

const activeAlerts = computed(() => alerts.value.filter((a) => !a.dismissed));
const unreadAlerts = computed(() => notifications.value.filter((n) => !n.read).length);

const filteredProjects = computed(() => {
  let list = allProjects.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }
  if (projectFilter.value !== 'all') {
    list = list.filter((p) => p.status === projectFilter.value);
  }
  return list;
});

const kpiCards = computed<KpiCard[]>(() => {
  const total = allProjects.value.length;
  const delayed = allProjects.value.filter((p) => p.status === 'delayed').length;
  const atRisk = allProjects.value.filter((p) => p.status === 'at-risk').length;
  const done = allProjects.value.filter((p) => p.status === 'completed').length;
  const totalBudget = allProjects.value.reduce((s, p) => s + p.budget, 0);
  const totalSpent = allProjects.value.reduce((s, p) => s + p.spent, 0);
  const avgActual = allProjects.value.reduce((s, p) => s + p.actualPct, 0) / (total || 1);
  const avgPlan = allProjects.value.reduce((s, p) => s + p.planPct, 0) / (total || 1);

  return [
    {
      id: 'total',
      label: 'โครงการทั้งหมด',
      value: String(total),
      icon: 'folder',
      iconColor: 'blue-4',
      variant: 'blue',
      trend: `${done} เสร็จสมบูรณ์`,
      trendDir: 'flat',
    },
    {
      id: 'delayed',
      label: 'โครงการล่าช้า',
      value: String(delayed),
      icon: 'schedule',
      iconColor: 'red-4',
      variant: 'red',
      trend: `${atRisk} เสี่ยงล่าช้า`,
      trendDir: 'down',
      action: () => {
        projectFilter.value = 'delayed';
      },
    },
    {
      id: 'budget',
      label: 'งบประมาณรวม',
      value: '฿' + formatBudget(totalBudget),
      icon: 'account_balance',
      iconColor: 'teal-4',
      variant: 'teal',
      trend: `เบิกจ่าย ${((totalSpent / (totalBudget || 1)) * 100).toFixed(0)}%`,
      trendDir: 'up',
    },
    {
      id: 'progress',
      label: 'ความคืบหน้าเฉลี่ย',
      value: avgActual.toFixed(1) + '%',
      icon: 'donut_large',
      iconColor: 'green-4',
      variant: 'green',
      trend: `Variance ${(avgActual - avgPlan).toFixed(1)}%`,
      trendDir: avgActual >= avgPlan ? 'up' : 'down',
    },
  ];
});

const projectKpis = computed<KpiCard[]>(() => {
  const p = selectedProject.value;
  if (!p) return [];
  const variance = p.actualPct - p.planPct;
  const spentPct = (p.spent / p.budget) * 100;
  return [
    {
      id: 'plan',
      label: 'แผนสะสม',
      value: p.planPct + '%',
      icon: 'timeline',
      iconColor: 'blue-4',
      variant: 'blue',
      trend: 'ณ วันนี้',
      trendDir: 'flat',
    },
    {
      id: 'actual',
      label: 'ผลงานจริงสะสม',
      value: p.actualPct + '%',
      icon: 'check_circle',
      iconColor: 'green-4',
      variant: 'green',
      trend: variance >= 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`,
      trendDir: variance >= 0 ? 'up' : 'down',
    },
    {
      id: 'days',
      label: 'วันคงเหลือ',
      value: p.daysLeft > 0 ? p.daysLeft + ' วัน' : 'เกิน ' + Math.abs(p.daysLeft) + ' วัน',
      icon: 'event',
      iconColor: p.daysLeft < 0 ? 'red-4' : 'orange-4',
      variant: p.daysLeft < 0 ? 'red' : 'orange',
      trend: p.end,
      trendDir: 'flat',
    },
    {
      id: 'budget',
      label: 'เบิกจ่ายงบ',
      value: spentPct.toFixed(0) + '%',
      icon: 'payments',
      iconColor: 'teal-4',
      variant: 'teal',
      trend: `฿${formatBudget(p.spent)} / ฿${formatBudget(p.budget)}`,
      trendDir: 'flat',
    },
  ];
});
const scurveTableRows = computed<ScurvePoint[]>(() => scurveData.value);
// const scurveTableRows = computed(() => {
//   const data =
//     scurvePeriod.value === 'monthly'
//       ? monthlyData.value
//       : weeklyBars.map((w) => ({
//           period: w.week,
//           plan: w.plan,
//           actual: w.actual,
//         }));
//   let planCum = 0,
//     actualCum = 0;
//   return data.map((d) => {
//     planCum += d.plan;
//     if (d.actual > 0) actualCum += d.actual;
//     const variance = d.actual > 0 ? actualCum - planCum : 0;
//     return { period: d.period, plan: d.plan, planCum, actual: d.actual, actualCum, variance };
//   });
// });

// ============================================================
// HELPERS
// ============================================================
const formatBudget = (n: number): string => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toLocaleString('th-TH');
};

const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
  toast.message = message;
  toast.type = type;
  toast.visible = true;
  setTimeout(() => {
    toast.visible = false;
  }, 3200);
};

// ============================================================
// ACTIONS — Navigation
// ============================================================
const navigate = (id: string): void => {
  activeNav.value = id;
  showNotifications.value = false;
  showUserMenu.value = false;
};

const openProject = (proj: Project): void => {
  // เมื่อคลิกที่โครงการในรายการ
  selectedProject.value = proj; // ตั้งค่าโครงการที่เลือก
  updateForm.actualPct = proj.actualPct; // เตรียมฟอร์มอัปเดตความคืบหน้า
  navigate('project-detail'); // ไปที่หน้าแสดงรายละเอียดโครงการ
};

const dismissAlert = (id: number): void => {
  const a = alerts.value.find((x) => x.id === id);
  if (a) a.dismissed = true;
};

const dismissAllAlerts = (): void => {
  alerts.value.forEach((a) => (a.dismissed = true));
};

const refreshData = async (): Promise<void> => {
  await fetchProject();
  showToast('รีเฟรชข้อมูลสำเร็จ', 'success');
};

const exportReport = (format: string): void => {
  showToast(`กำลัง Export ${format.toUpperCase()}...`, 'success');
};

// ============================================================
// ★ CRUD — Form helpers
// ============================================================
const validateForm = (): boolean => {
  // Reset errors
  (Object.keys(formErrors) as Array<keyof ProjectForm>).forEach((k) => {
    formErrors[k] = '';
  });
  let ok = true;

  if (!projectForm.name.trim()) {
    formErrors.name = 'กรุณาระบุชื่อโครงการ';
    ok = false;
  }
  if (!projectForm.start) {
    formErrors.start = 'กรุณาระบุวันเริ่มต้น';
    ok = false;
  }
  if (!projectForm.end) {
    formErrors.end = 'กรุณาระบุวันสิ้นสุด';
    ok = false;
  }
  if (projectForm.start && projectForm.end && projectForm.end < projectForm.start) {
    formErrors.end = 'วันสิ้นสุดต้องหลังวันเริ่มต้น';
    ok = false;
  }
  if (!projectForm.budget || projectForm.budget <= 0) {
    formErrors.budget = 'กรุณาระบุงบประมาณ (ต้องมากกว่า 0)';
    ok = false;
  }
  return ok;
};

const closeProjectModal = (): void => {
  showProjectModal.value = false;
  Object.assign(projectForm, blankForm());
  (Object.keys(formErrors) as Array<keyof typeof formErrors>).forEach((k) => {
    formErrors[k] = '';
  });
};

// ============================================================
// ★ CRUD — Open modals
// ============================================================
const openCreateModal = (): void => {
  isEditMode.value = false;
  editingProjectId.value = null;
  Object.assign(projectForm, blankForm());
  showProjectModal.value = true;
};
// ฟังก์ชันช่วยแปลงค่าให้เป็น YYYY-MM-DD
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0]; // ตัดเอาเฉพาะส่วนวันที่ 2022-12-01
};

const openEditModal = (proj: Project): void => {
  isEditMode.value = true;
  editingProjectId.value = proj.id;
  // console.log('เปิด modal แก้ไขสำหรับโครงการ:', proj.start);
  Object.assign(projectForm, {
    name: proj.name,
    code: proj.code,
    type: proj.type,
    start: formatDate(proj.start),
    end: formatDate(proj.end),
    budget: proj.budget,
    pm: proj.pm,
    location: proj.location,
    status: proj.status,
    description: proj.description ?? '',
    contractDate: proj.contractDate ?? '',
  });
  showProjectModal.value = true;
};

const openDeleteConfirm = (proj: Project): void => {
  deletingProject.value = proj;
  showDeleteConfirmDialog.value = true;
};

// ============================================================
// ★ CRUD — Submit handlers
// ============================================================
const submitProjectForm = async (): Promise<void> => {
  if (!validateForm()) return;

  modalLoading.value = true;
  await new Promise((r) => setTimeout(r, 550)); // simulated async

  if (isEditMode.value && editingProjectId.value !== null) {
    //ถ้าอยู่ในโหมดแก้ไขและมี ID ที่กำลังแก้ไข
    // ── EDIT ─────────────────────────────────────────────────
    const idx = allProjects.value.findIndex((p) => p.id === editingProjectId.value);
    if (idx !== -1) {
      const existing = allProjects.value[idx] as Project; // ✅ assert ครั้งเดียว

      const daysLeft = projectForm.end
        ? Math.round((new Date(projectForm.end).getTime() - Date.now()) / 864e5)
        : existing.daysLeft; // ✅ ไม่ undefined

      const updated: Project = {
        // ✅ typed explicitly
        ...existing,
        name: projectForm.name,
        code: projectForm.code || existing.code,
        type: projectForm.type,
        start: projectForm.start,
        end: projectForm.end,
        budget: projectForm.budget,
        pm: projectForm.pm || existing.pm,
        location: projectForm.location || existing.location,
        status: projectForm.status as Project['status'],
        statusLabel: statusLabelMap[projectForm.status] ?? projectForm.status,
        description: projectForm.description,
        contractDate: projectForm.contractDate,
        daysLeft,
      };
      await saveTaskToAPI(updated); // ฟังก์ชันนี้สำหรับบันทึกข้อมูลไปยัง backend

      allProjects.value[idx] = updated; // ✅ clean assignment

      if (selectedProject.value?.id === editingProjectId.value) {
        selectedProject.value = { ...updated }; // ✅ ไม่ undefined
      }
      console.log('ข้อมูลที่ส่งไป API (แก้ไข):', updated);
    }
    showToast(`แก้ไขโครงการ "${projectForm.name}" สำเร็จ`, 'success');
    recentActivities.value.unshift({
      id: Date.now(),
      type: 'update',
      text: `แก้ไขข้อมูลโครงการ ${projectForm.code || projectForm.name}`,
      user: 'วศิน ภ.',
      time: 'เมื่อกี้',
    });
  } else {
    // ถ้าไม่ใช่โหมดแก้ไข → สร้างใหม่
    // ── CREATE ────────────────────────────────────────────────
    const proj: Project = {
      id: undefined as unknown as number, // ✅ จะถูกกำหนดโดย backend
      code: projectForm.code || `PROJ-${String(allProjects.value.length + 1).padStart(3, '0')}`,
      name: projectForm.name,
      type: projectForm.type,
      location: projectForm.location || '–',
      pm: projectForm.pm || '–',
      contractNo: `${projectForm.code || 'PROJ'}/${new Date().getFullYear()}`,
      status: 'on-track',
      statusLabel: 'กำลังดำเนินการ',
      planPct: 0,
      actualPct: 0,
      budget: projectForm.budget,
      spent: 0,
      daysLeft: projectForm.end
        ? Math.round((new Date(projectForm.end).getTime() - Date.now()) / 864e5)
        : 365,
      start: projectForm.start,
      end: projectForm.end,
      description: projectForm.description,
    };
    await saveTaskToAPI(proj); // ฟังก์ชันนี้สำหรับบันทึกข้อมูลไปยัง backend
    allProjects.value.unshift(proj);
    showToast(`สร้างโครงการ "${proj.name}" สำเร็จ`, 'success');
    recentActivities.value.unshift({
      id: Date.now(),
      type: 'create',
      text: `สร้างโครงการใหม่ ${proj.code} — ${proj.name}`,
      user: 'วศิน ภ.',
      time: 'เมื่อกี้',
    });
  }

  modalLoading.value = false;
  closeProjectModal();
};
const saveTaskToAPI = async (proj: Project): Promise<Project> => {
  try {
    // alert('ฟังก์ชัน saveTaskToAPI ถูกเรียกใช้งานแล้ว (ดู console log)');
    // console.log('ข้อมูลที่จะส่งไป API:', proj);
    // TODO: replace with real API call
    await fetch(
      `${API_BASE_URL}/planapi/${isEditMode.value ? 'updateProject' : 'insertProject'}/${proj.id || ''}`,
      {
        method: proj.id ? 'PUT' : 'POST', // ใช้ POST สำหรับสร้างใหม่, PUT สำหรับอัพเดต
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
        },
        body: JSON.stringify(proj),
      },
    );
    // return await res.json();
    // console.log('result from API:', res.status, res.statusText);
    await new Promise((r) => setTimeout(r, 0));
    return proj;
  } catch (error) {
    console.error('API error:', error);
    throw new Error('ไม่สามารถบันทึกข้อมูลได้');
  }
};

// ── DELETE ────────────────────────────────────────────────────
const confirmDelete = (): void => {
  if (!deletingProject.value) return;
  const { name, code, id } = deletingProject.value;

  allProjects.value = allProjects.value.filter((p) => p.id !== id);

  // If currently viewing the deleted project → go back to dashboard
  if (selectedProject.value?.id === id) {
    selectedProject.value = allProjects.value[0] ?? null;
    navigate('dashboard');
  }

  showDeleteConfirmDialog.value = false;
  showToast(`ลบโครงการ "${name}" เรียบร้อย`, 'success');
  recentActivities.value.unshift({
    id: Date.now(),
    type: 'alert',
    text: `ลบโครงการ ${code} ออกจากระบบ`,
    user: 'วศิน ภ.',
    time: 'เมื่อกี้',
  });
};

// ── SAVE PROGRESS (unchanged) ─────────────────────────────────
const saveProgress = (): void => {
  if (!selectedProject.value) return;
  selectedProject.value.actualPct = updateForm.actualPct;
  const projInList = allProjects.value.find((p) => p.id === selectedProject.value!.id);
  if (projInList) projInList.actualPct = updateForm.actualPct;
  showUpdateModal.value = false;
  showToast('บันทึกความคืบหน้าสำเร็จ', 'success');
  recentActivities.value.unshift({
    id: Date.now(),
    type: 'update',
    text: `อัปเดตความคืบหน้า ${selectedProject.value.code} → ${updateForm.actualPct}%`,
    user: 'วศิน ภ.',
    time: 'เมื่อกี้',
  });
  void nextTick(() => drawDetailScurve());
};

// ============================================================
// CANVAS DRAWING — Mini S-Curve (dashboard overview)
// ============================================================
const drawMiniScurve = (): void => {
  const canvas = miniScurveCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width,
    H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, W, H);

  const gridPcts = [25, 50, 75, 100];
  gridPcts.forEach((v: number) => {
    const y = H - (v / 100) * (H - 16) - 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '7px sans-serif';
    ctx.fillText(v + '%', 2, y - 1);
  });

  const pts = monthlyData;
  const stepX = (W - 20) / (pts.value.length - 1);

  ctx.beginPath();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2;
  pts.value.forEach((d, i: number) => {
    const x = 10 + i * stepX;
    const y = H - ((d.planCum * 100) / 100) * (H - 24) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#81c784';
  ctx.lineWidth = 2;
  pts.value
    .filter((d) => d.actual > 0)
    .forEach((d, i: number) => {
      const x = 10 + i * stepX;
      const y = H - (d.actual / 100) * (H - 16) - 6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
  ctx.stroke();

  pts.value.forEach((d, i: number) => {
    const x = 10 + i * stepX;
    const yPlan = H - (d.plan / 100) * (H - 16) - 6;
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(x, yPlan, 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (d.actual > 0) {
      const yAct = H - (d.actual / 100) * (H - 16) - 6;
      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.arc(x, yAct, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

// ============================================================
// CANVAS DRAWING — Detail S-Curve (project page)
// ============================================================
const drawDetailScurve = (): void => {
  const canvas = detailScurveCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width,
    H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, W, H);

  const rows = scurveTableRows.value;
  const stepX = (W - 40) / Math.max(rows.length - 1, 1);

  // ✅ เปลี่ยนจาก [20,40,60,80,100] เป็น fraction 0-1
  const gridPcts: number[] = [0.2, 0.4, 0.6, 0.8, 1.0];
  gridPcts.forEach((v: number) => {
    const y = H - v * (H - 24) - 10;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(W - 10, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px Sarabun,sans-serif';
    ctx.fillText(v * 100 + '%', 2, y + 3); // ✅ แสดง label เป็น % ปกติ
  });

  // ✅ Plan fill area — เปลี่ยน /100 → ใช้ค่าตรงๆ
  ctx.beginPath();
  ctx.fillStyle = 'rgba(79,195,247,0.1)';
  rows.forEach((d, i: number) => {
    const x = 20 + i * stepX;
    const y = H - d.planCum * (H - 24) - 10; // ✅
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  const lastX = 20 + (rows.length - 1) * stepX;
  ctx.lineTo(lastX, H - 10);
  ctx.lineTo(20, H - 10);
  ctx.closePath();
  ctx.fill();

  // ✅ Plan line
  ctx.beginPath();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2.5;
  rows.forEach((d, i: number) => {
    const x = 20 + i * stepX;
    const y = H - d.planCum * (H - 24) - 10; // ✅
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // ✅ Actual line
  const actualRows = rows.filter((r) => r.actualCum > 0);
  if (actualRows.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 2.5;
    actualRows.forEach((d, i: number) => {
      const origIdx = rows.indexOf(d);
      const x = 20 + origIdx * stepX;
      const y = H - d.actualCum * (H - 24) - 10; // ✅
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // X-axis labels (period)
  rows.forEach((d, i: number) => {
    if (i % 2 === 0) {
      const x = 20 + i * stepX;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px Sarabun,sans-serif';
      ctx.fillText(d.period, x - 12, H - 1);
    }
  });

  // ✅ Dots
  rows.forEach((d, i: number) => {
    const x = 20 + i * stepX;
    const yPlan = H - d.planCum * (H - 24) - 10; // ✅
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(x, yPlan, 3, 0, Math.PI * 2);
    ctx.fill();
    if (d.actualCum > 0) {
      const yAct = H - d.actualCum * (H - 24) - 10; // ✅
      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.arc(x, yAct, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Legend
  ctx.fillStyle = '#4fc3f7';
  ctx.fillRect(W - 90, 8, 14, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '9px Sarabun,sans-serif';
  ctx.fillText('แผน', W - 74, 13);
  ctx.fillStyle = '#81c784';
  ctx.fillRect(W - 90, 20, 14, 2);
  ctx.fillText('จริง', W - 74, 25);
};

// ============================================================
// WATCHERS & LIFECYCLE
// ============================================================
watch(activeNav, async (val) => {
  if (val === 'project-detail' && selectedProject.value) {
    await fetchScurve(selectedProject.value.id, scurvePeriod.value);
  }
});

watch(scurvePeriod, async () => {
  if (selectedProject.value) {
    await fetchScurve(selectedProject.value.id, scurvePeriod.value);
  }
});

onMounted(async () => {
  selectedProject.value = allProjects.value[0] ?? null;
  updateForm.actualPct = selectedProject.value?.actualPct ?? 0;
  await nextTick();
  drawMiniScurve();
});
</script>

<style scoped>
/* ============================================================
   FONTS
============================================================ */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

/* ============================================================
   ROOT / PAGE — Dark Navy Enterprise Theme
============================================================ */
.db-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #080f1a;
  font-family: 'Sarabun', 'Inter', sans-serif;
  font-size: 12px;
  color: #c9d4e0;
}

/* ============================================================
   SIDEBAR
============================================================ */
.db-sidebar {
  width: 220px;
  min-width: 220px;
  background: #0a1628;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition:
    width 0.2s ease,
    min-width 0.2s ease;
  z-index: 100;
}
.db-sidebar--collapsed {
  width: 52px;
  min-width: 52px;
}
.db-sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  height: 56px;
}
.db-sidebar-brand {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.db-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.db-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.12s;
  color: #8899aa;
  white-space: nowrap;
  position: relative;
}
.db-nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #c9d4e0;
}
.db-nav-item--active {
  background: rgba(79, 195, 247, 0.1);
  color: #4fc3f7;
  border-left: 2px solid #4fc3f7;
}
.db-nav-label {
  font-size: 12px;
  font-weight: 500;
}
.db-nav-badge {
  margin-left: auto;
  font-size: 9px;
}
.db-sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 0;
}

/* ============================================================
   TOP NAVBAR
============================================================ */
.db-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s;
}
.db-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background: #0a1628;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.db-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.db-topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.db-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.db-breadcrumb-root {
  color: #607080;
}
.db-breadcrumb-current {
  color: #c9d4e0;
  font-weight: 600;
}
.db-search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 5px 10px;
}
.db-search-inp {
  background: none;
  border: none;
  outline: none;
  color: #c9d4e0;
  font-size: 11px;
  width: 160px;
  font-family: inherit;
}
.db-search-inp::placeholder {
  color: #5a6a7a;
}
.db-icon-btn-wrap {
  position: relative;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.12s;
}
.db-icon-btn-wrap:hover {
  background: rgba(255, 255, 255, 0.06);
}
.db-notif-dot {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef5350;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  border-radius: 8px;
  padding: 0 3px;
  min-width: 14px;
  text-align: center;
  line-height: 14px;
}
.db-user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
.db-user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1565c0, #4fc3f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
}
.db-user-name {
  font-size: 11px;
  color: #c9d4e0;
}

/* ============================================================
   VIEW CONTAINER
============================================================ */
.db-view {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
.db-view::-webkit-scrollbar {
  width: 5px;
}
.db-view::-webkit-scrollbar-thumb {
  background: #1e3050;
  border-radius: 3px;
}
.db-view-fade {
  animation: fadeInUp 0.2s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================
   PAGE HEADER
============================================================ */
.db-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.db-page-title {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 2px 0;
}
.db-page-sub {
  font-size: 11px;
  color: #607080;
  margin: 0;
}
.db-page-actions {
  display: flex;
  gap: 8px;
}
.db-project-code-badge {
  display: inline-block;
  background: rgba(79, 195, 247, 0.12);
  color: #4fc3f7;
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 6px;
}
.db-back-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* ============================================================
   BUTTONS
============================================================ */
.db-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  transition: all 0.12s;
  white-space: nowrap;
}
.db-btn-primary {
  background: #1565c0;
  color: #fff;
}
.db-btn-primary:hover {
  background: #1976d2;
}
.db-btn-ghost {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8899aa;
}
.db-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #c9d4e0;
}
.db-btn-link {
  background: none;
  border: none;
  cursor: pointer;
  color: #4fc3f7;
  font-size: 11px;
  font-family: inherit;
}
.db-btn-link:hover {
  text-decoration: underline;
}
/* ★ CRUD: danger button */
.db-btn-danger {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 5px;
  background: linear-gradient(135deg, #c62828, #b71c1c);
  color: #ffcdd2;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  transition: opacity 0.12s;
}
.db-btn-danger:hover {
  opacity: 0.85;
}
/* Disabled state for all buttons */
.db-btn:disabled,
.db-btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ============================================================
   KPI CARDS
============================================================ */
.db-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.db-kpi-card {
  background: #0d1e30;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.db-kpi-card:hover {
  border-color: rgba(79, 195, 247, 0.3);
  background: #0e2235;
}
.db-kpi-card--red {
  border-left: 3px solid #ef5350;
}
.db-kpi-card--blue {
  border-left: 3px solid #42a5f5;
}
.db-kpi-card--green {
  border-left: 3px solid #66bb6a;
}
.db-kpi-card--teal {
  border-left: 3px solid #26c6da;
}
.db-kpi-card--orange {
  border-left: 3px solid #ffa726;
}
.db-kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  flex-shrink: 0;
}
.db-kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.2;
}
.db-kpi-label {
  font-size: 10px;
  color: #607080;
  margin: 2px 0 4px;
}
.db-kpi-trend {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.db-kpi-trend--up {
  color: #66bb6a;
}
.db-kpi-trend--down {
  color: #ef5350;
}
.db-kpi-trend--flat {
  color: #8899aa;
}

/* ============================================================
   ALERT PANEL
============================================================ */
.db-alerts-row {
  background: #0d1e30;
  border: 1px solid rgba(255, 165, 0, 0.2);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 20px;
}
.db-alerts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #ffa726;
  margin-bottom: 8px;
}
.db-alerts-header .db-btn-link {
  margin-left: auto;
  color: #607080;
}
.db-alert-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.db-alert-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 11px;
}
.db-alert-item--critical {
  background: rgba(239, 83, 80, 0.12);
  color: #ef9a9a;
}
.db-alert-item--warning {
  background: rgba(255, 167, 38, 0.1);
  color: #ffcc80;
}
.db-alert-item--info {
  background: rgba(79, 195, 247, 0.08);
  color: #80d8ff;
}
.db-alert-text {
  display: flex;
  gap: 6px;
  flex: 1;
}
.db-alert-project {
  font-weight: 700;
  white-space: nowrap;
}
.db-alert-msg {
  color: inherit;
  opacity: 0.85;
}
.db-alert-time {
  font-size: 10px;
  color: #607080;
  white-space: nowrap;
  margin-left: 8px;
}
.db-alert-dismiss {
  background: none;
  border: none;
  color: #607080;
  cursor: pointer;
  font-size: 11px;
  padding: 0 2px;
}
.db-alert-more {
  display: block;
  margin-top: 6px;
  font-size: 11px;
}

/* ============================================================
   TWO-COLUMN LAYOUT
============================================================ */
.db-two-col {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}
.db-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ============================================================
   SECTION CARD
============================================================ */
.db-section {
  background: #0d1e30;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  padding: 14px;
}
.db-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.db-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #c9d4e0;
}
.db-section-sub {
  font-size: 10px;
  color: #607080;
}
.db-section-filters {
  display: flex;
  gap: 4px;
}
.db-filter-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #607080;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
}
.db-filter-chip--active {
  background: rgba(79, 195, 247, 0.15);
  border-color: rgba(79, 195, 247, 0.4);
  color: #4fc3f7;
}

/* ============================================================
   PROJECT CARDS
============================================================ */
.db-project-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-project-card {
  background: #0a1628;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 7px;
  padding: 12px 14px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.1s;
}
.db-project-card:hover {
  border-color: rgba(79, 195, 247, 0.3);
  transform: translateX(2px);
}
.db-project-card--delayed {
  border-left: 3px solid #ef5350;
}
.db-project-card--at-risk {
  border-left: 3px solid #ffa726;
}
.db-project-card--on-track {
  border-left: 3px solid #66bb6a;
}
.db-project-card--completed {
  border-left: 3px solid #42a5f5;
  opacity: 0.7;
}
.db-pc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.db-pc-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.db-pc-code {
  font-size: 10px;
  font-weight: 700;
  color: #4fc3f7;
  font-family: monospace;
}
.db-pc-type {
  font-size: 10px;
  color: #607080;
}
.db-pc-name {
  font-size: 12px;
  font-weight: 600;
  color: #c9d4e0;
  margin-bottom: 4px;
  line-height: 1.4;
}
.db-pc-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.db-pc-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #607080;
}
.db-pc-status-badge {
  font-size: 9px;
  font-weight: 700;
  border-radius: 3px;
  padding: 2px 6px;
}
.badge-on-track {
  background: rgba(102, 187, 106, 0.15);
  color: #81c784;
}
.badge-at-risk {
  background: rgba(255, 167, 38, 0.15);
  color: #ffa726;
}
.badge-delayed {
  background: rgba(239, 83, 80, 0.15);
  color: #ef9a9a;
}
.badge-completed {
  background: rgba(66, 165, 245, 0.15);
  color: #64b5f6;
}
.db-pc-progress {
  margin-bottom: 8px;
}
.db-pc-progress-bar-wrap {
  height: 4px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}
.db-pc-progress-plan {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(79, 195, 247, 0.4);
  border-radius: 2px;
}
.db-pc-progress-actual {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #66bb6a;
  border-radius: 2px;
}
.db-pc-progress-nums {
  display: flex;
  gap: 10px;
  font-size: 10px;
}
.plan-num {
  color: #4fc3f7;
}
.actual-num {
  color: #81c784;
}
.actual-num.behind {
  color: #ef9a9a;
}
.var-num.positive {
  color: #66bb6a;
}
.var-num.negative {
  color: #ef5350;
}
.db-pc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.db-pc-budget {
  font-size: 11px;
  font-weight: 700;
  color: #c9d4e0;
}
.db-pc-days {
  font-size: 10px;
  color: #607080;
}
.db-pc-days--late {
  color: #ef5350;
}

/* ★ CRUD: card action buttons (show on hover) */
.db-pc-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  margin-left: 6px;
}
.db-project-card:hover .db-pc-actions {
  opacity: 1;
}
.db-pc-action-btn {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #8899aa;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.12s,
    color 0.12s,
    border-color 0.12s;
  padding: 0;
}
.db-pc-action-btn--edit:hover {
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
  border-color: rgba(79, 195, 247, 0.5);
}
.db-pc-action-btn--delete:hover {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
  border-color: rgba(239, 83, 80, 0.5);
}

/* ★ CRUD: table action cell */
.db-tbl-actions {
  display: inline-flex;
  gap: 4px;
}

/* ============================================================
   HEALTH GRID
============================================================ */
.db-health-grid {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.db-health-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.db-health-label {
  font-size: 10px;
  color: #607080;
  width: 90px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.db-health-bar-wrap {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
}
.db-health-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s;
}
.db-health-bar--green {
  background: #66bb6a;
}
.db-health-bar--orange {
  background: #ffa726;
}
.db-health-bar--red {
  background: #ef5350;
}
.db-health-bar--blue {
  background: #42a5f5;
}
.db-health-val {
  font-size: 10px;
  font-weight: 700;
  width: 32px;
  text-align: right;
}
.text-green {
  color: #66bb6a;
}
.text-orange {
  color: #ffa726;
}
.text-red {
  color: #ef5350;
}
.text-blue {
  color: #42a5f5;
}

/* ============================================================
   MINI S-CURVE
============================================================ */
.db-mini-scurve {
  width: 100%;
  height: 120px;
  display: block;
  border-radius: 4px;
  background: #0d1b2a;
}
.db-scurve-legend {
  display: flex;
  gap: 14px;
  margin-top: 6px;
  font-size: 10px;
}
.db-legend-plan {
  color: #4fc3f7;
  font-weight: 600;
}
.db-legend-actual {
  color: #81c784;
  font-weight: 600;
}

/* ============================================================
   ACTIVITY FEED
============================================================ */
.db-activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.db-activity-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.db-activity-item:last-child {
  border-bottom: none;
}
.db-act-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.db-act-dot--update {
  background: #4fc3f7;
}
.db-act-dot--alert {
  background: #ef5350;
}
.db-act-dot--milestone {
  background: #66bb6a;
}
.db-act-dot--create {
  background: #ffa726;
}
.db-act-text {
  font-size: 11px;
  color: #c9d4e0;
  line-height: 1.4;
  margin-bottom: 2px;
}
.db-act-meta {
  font-size: 10px;
  color: #607080;
}

/* ============================================================
   MILESTONE
============================================================ */
.db-milestone-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.db-milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.db-ms--done .db-ms-icon {
  color: #66bb6a;
}
.db-ms--active .db-ms-icon {
  color: #4fc3f7;
}
.db-ms--pending .db-ms-icon {
  color: #607080;
}
.db-ms-name {
  font-size: 11px;
  color: #c9d4e0;
}
.db-ms-date {
  font-size: 10px;
  color: #607080;
}
.db-ms-pct {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  color: #4fc3f7;
}

/* ============================================================
   WEEKLY BARS
============================================================ */
.db-weekly-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 80px;
  padding: 0 4px;
}
.db-weekly-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 2px;
}
.db-wb-label {
  font-size: 9px;
  color: #607080;
}
.db-wb-bars {
  display: flex;
  gap: 2px;
  align-items: flex-end;
}
.db-wb-plan {
  width: 8px;
  background: rgba(79, 195, 247, 0.4);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}
.db-wb-actual {
  width: 8px;
  background: #66bb6a;
  border-radius: 2px 2px 0 0;
  min-height: 2px;
}
.db-wb-val {
  font-size: 8px;
  color: #607080;
}

/* ============================================================
   BUDGET
============================================================ */
.db-budget-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.db-budget-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.db-bval {
  font-weight: 700;
  color: #c9d4e0;
}
.db-budget-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  overflow: hidden;
}
.db-bp-bar {
  height: 100%;
  background: linear-gradient(90deg, #1565c0, #4fc3f7);
  border-radius: 2px;
}
.db-budget-sub {
  font-size: 10px;
  color: #607080;
}

/* ============================================================
   DETAIL S-CURVE
============================================================ */
.db-detail-scurve {
  width: 100%;
  height: 200px;
  display: block;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #0d1b2a;
}
.db-scurve-table {
  max-height: 200px;
  overflow-y: auto;
}

/* ============================================================
   TABLES
============================================================ */
.db-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.db-table th {
  background: #0a1628;
  color: #607080;
  font-weight: 600;
  padding: 7px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
}
.db-table td {
  padding: 7px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #c9d4e0;
}
.db-table-row-click:hover {
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}
.db-table-full {
  width: 100%;
}
.db-table-name {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-positive {
  color: #66bb6a !important;
  font-weight: 700;
}
.text-negative {
  color: #ef5350 !important;
  font-weight: 700;
}

/* ============================================================
   GANTT REDIRECT PAGE
============================================================ */
.db-gantt-redirect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 10px;
}
.db-gr-title {
  font-size: 18px;
  font-weight: 700;
  color: #c9d4e0;
}
.db-gr-sub {
  font-size: 12px;
  color: #607080;
}
.db-gantt-redirect code {
  background: rgba(79, 195, 247, 0.12);
  color: #4fc3f7;
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 12px;
}

/* ============================================================
   MODALS
============================================================ */
.db-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.db-modal {
  background: #0d1e30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
/* ★ CRUD: wider modal for project form */
.db-modal--wide {
  width: 560px;
}
.db-modal--narrow {
  width: 420px;
}

.db-modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: #0a1628;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}
.db-modal-close {
  background: none;
  border: none;
  color: #607080;
  cursor: pointer;
  font-size: 16px;
  margin-left: auto;
}
.db-modal-close:hover {
  color: #ef5350;
}
.db-modal-body {
  padding: 18px 20px;
}
.db-modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  background: #0a1628;
}
.db-form-group {
  margin-bottom: 10px;
}
.db-form-label {
  display: block;
  font-size: 10px;
  color: #607080;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.db-form-inp {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 8px 10px;
  color: #c9d4e0;
  font-size: 12px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.db-form-inp:focus {
  outline: none;
  border-color: #4fc3f7;
}
.db-form-inp option {
  background: #0d1e30;
}
.db-form-textarea {
  height: 70px;
  resize: none;
}
/* ★ CRUD: taller description textarea */
.db-form-textarea--tall {
  height: 80px;
}
.db-form-row {
  display: flex;
  gap: 10px;
}
.db-form-row .db-form-group {
  flex: 1;
}
/* ★ CRUD: validation */
.db-form-req {
  color: #ef5350;
  margin-left: 2px;
}
.db-form-error {
  display: block;
  font-size: 10px;
  color: #ef5350;
  margin-top: 3px;
}
.db-form-inp--error {
  border-color: #ef5350 !important;
}
.db-form-inp--error:focus {
  box-shadow: 0 0 0 2px rgba(239, 83, 80, 0.15);
}

/* ★ CRUD: loading spinner */
.db-btn-spinner {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: db-spin 0.6s linear infinite;
  margin-right: 2px;
}
@keyframes db-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ★ CRUD: delete confirm detail box */
.db-delete-detail {
  background: rgba(239, 83, 80, 0.08);
  border: 1px solid rgba(239, 83, 80, 0.2);
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 11px;
  color: #ef9a9a;
}

.db-update-preview {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 10px 14px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.db-up-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

/* ============================================================
   NOTIFICATION PANEL
============================================================ */
.db-notif-panel {
  position: fixed;
  top: 56px;
  right: 12px;
  z-index: 500;
  width: 300px;
  background: #0d1e30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.db-notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 11px;
  font-weight: 700;
  color: #c9d4e0;
}
.db-notif-item {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.1s;
}
.db-notif-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.db-notif-unread {
  background: rgba(79, 195, 247, 0.04);
}
.db-notif-text {
  font-size: 11px;
  color: #c9d4e0;
  margin-bottom: 2px;
}
.db-notif-time {
  font-size: 10px;
  color: #607080;
}

/* ============================================================
   TOAST
============================================================ */
.db-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.db-toast--success {
  background: #1b5e20;
  color: #a5d6a7;
  border: 1px solid #2e7d32;
}
.db-toast--error {
  background: #b71c1c;
  color: #ffcdd2;
  border: 1px solid #c62828;
}
.db-toast-fade-enter-active {
  transition: all 0.2s ease;
}
.db-toast-fade-leave-active {
  transition: all 0.3s ease;
}
.db-toast-fade-enter-from,
.db-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ============================================================
   REPORT GRID
============================================================ */
.db-report-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* ============================================================
   RESPONSIVE
============================================================ */
@media (max-width: 1200px) {
  .db-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .db-two-col {
    grid-template-columns: 1fr;
  }
  .db-side-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .db-sidebar {
    display: none;
  }
  .db-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .db-page-header {
    flex-direction: column;
    gap: 12px;
  }
  .db-topbar {
    padding: 0 12px;
  }
  .db-user-name {
    display: none;
  }
}
</style>
