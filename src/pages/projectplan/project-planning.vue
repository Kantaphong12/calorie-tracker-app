<template>
  <!--
  ============================================================
  PAGE WRAPPER — โครงสร้างหลักของหน้า Gantt Chart
  Production-Ready | Data-Driven | Backend-Ready
  ============================================================
  -->
  <q-page class="gantt-page">
    <!-- ============================================================
         HEADER SECTION — หัวข้อโครงการ + ปุ่ม action
    ============================================================ -->
    <div class="gp-header">
      <div class="gp-header-title">
        <span class="gp-title-main">{{ projectSummary.name }}</span>
        <span class="gp-title-sub">ประเภทโครงการ: {{ projectSummary.subtitle }}</span>
        <span class="gp-title-meta">
          สัญญาจ้างเลขที่ {{ projectSummary.contractNo }} | ลงวันที่
          {{ projectSummary.contractDate }} | Factor F &amp; VAT = {{ projectSummary.factorF }} |
          มูลค่ารวม {{ projectSummary.totalCostFormatted }} บาท
        </span>
      </div>
      <div class="gp-header-actions">
        <button class="gp-btn gp-btn-white" @click="openModal(null, 'group')">
          + เพิ่มหมวดงาน
        </button>
        <button class="gp-btn gp-btn-outline" @click="exportCSV">⬇ Export CSV</button>
        <button class="gp-btn gp-btn-outline" @click="exportExcel">⬇ Export Excel</button>
        <button class="gp-btn gp-btn-outline" @click="printPage">🖨 Print</button>
        <span v-if="apiState.loading" class="gp-loading-badge">⏳ กำลังบันทึก...</span>
        <span v-if="apiState.error" class="gp-error-badge" @click="apiState.error = ''"
          >⚠ {{ apiState.error }}</span
        >
      </div>
    </div>

    <!-- ============================================================
         MAIN CONTAINER — Left panel + Right Gantt
    ============================================================ -->
    <div class="gp-main" ref="mainContainer">
      <!-- ==========================================
           LEFT PANEL — รายการงาน + คอลัมน์ข้อมูล
      ========================================== -->
      <div class="gp-left" :style="{ width: LAYOUT.LEFT_W + 'px', minWidth: LAYOUT.LEFT_W + 'px' }">
        <!-- Left Header -->
        <div class="gp-left-header" :style="{ height: LAYOUT.HDR_H + 'px' }">
          <div class="glh glh-no">ลำดับ</div>
          <div class="glh glh-name">รายการงาน</div>
          <div class="glh glh-pct">%<br />งาน</div>
          <div class="glh glh-cost">มูลค่า (บาท)<br />incl. Factor F+VAT</div>
          <div class="glh glh-start">Start</div>
          <div class="glh glh-end">Finish</div>
          <div class="glh glh-dur">วัน</div>
          <div class="glh glh-act">จัดการ</div>
        </div>

        <!-- Left Body -->
        <div class="gp-left-body" ref="leftScroll" @scroll="onLeftScroll">
          <div
            v-for="task in sortedTasks"
            :key="'left-' + task.id"
            class="gp-left-row"
            :class="{
              'glr-group': task.type === 'group',
              'glr-sub': task.type === 'sub',
            }"
            :style="{ height: LAYOUT.ROW_H + 'px' }"
            @click="editTask(task)"
          >
            <div class="glc glc-no">{{ task.type === 'group' ? task.groupNo : '' }}</div>
            <div
              class="glc glc-name"
              :class="{ 'glc-name-sub': task.type === 'sub' }"
              :title="task.name"
            >
              <span v-if="task.type === 'group'" class="glc-arrow">▶</span>
              {{ task.name }}
            </div>
            <div class="glc glc-pct">
              {{ computedTaskPct(task) > 0 ? computedTaskPct(task).toFixed(2) + '%' : '–' }}
            </div>
            <div class="glc glc-cost">
              {{
                computedTaskCost(task) > 0 ? computedTaskCost(task).toLocaleString('th-TH') : '–'
              }}
            </div>
            <div class="glc glc-date">{{ formatDate(computedTaskStart(task)) }}</div>
            <div class="glc glc-date">{{ formatDate(computedTaskEnd(task)) }}</div>
            <div class="glc glc-dur">
              {{ getWorkingDaysBetween(computedTaskStart(task), computedTaskEnd(task)) }}
            </div>
            <div class="glc glc-act">
              <button
                v-if="task.type === 'group'"
                class="gp-icon-btn"
                @click.stop="openModal(task.id, 'sub')"
                title="เพิ่มงานย่อย"
              >
                ＋
              </button>
              <button
                class="gp-icon-btn gp-icon-del"
                @click.stop="handleDeleteTask(task.id)"
                title="ลบ"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- ============================================================
               BOTTOM SUMMARY SECTION (LEFT SIDE LABELS)
          ============================================================ -->
          <div class="gp-sum-section">
            <!-- รวมทั้งโครงการ -->
            <div class="gp-sum-row gp-sum-total" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">รวมทั้งโครงการ</div>
              <div class="glc glc-pct gp-sum-val">{{ projectSummary.totalPct.toFixed(2) }}%</div>
              <div class="glc glc-cost gp-sum-val">{{ projectSummary.totalCostFormatted }}</div>
              <div class="glc glc-date gp-sum-val">{{ formatDate(projectSummary.start) }}</div>
              <div class="glc glc-date gp-sum-val">{{ formatDate(projectSummary.end) }}</div>
              <div class="glc glc-dur gp-sum-val">{{ projectSummary.totalDuration }}</div>
              <div class="glc glc-act"></div>
            </div>

            <!-- % แผนงานรายเดือน -->
            <div class="gp-sum-row gp-sum-month" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">% แผนงานรายเดือน</div>
              <div class="glc glc-pct gp-sum-val">{{ projectSummary.totalPct.toFixed(1) }}%</div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- % แผนงานสะสมรายเดือน -->
            <div class="gp-sum-row gp-sum-month-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">% แผนงานสะสมรายเดือน</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- % แผนงานรายสัปดาห์ -->
            <div class="gp-sum-row gp-sum-week" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">% แผนงานรายสัปดาห์</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- % สะสมรายสัปดาห์ -->
            <div class="gp-sum-row gp-sum-week-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">% สะสมรายสัปดาห์</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- % ผลงานความก้าวหน้าสะสม -->
            <div class="gp-sum-row gp-sum-actual" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">% ผลงานความก้าวหน้าสะสมรายสัปดาห์</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- วันทำงาน -->
            <div class="gp-sum-row gp-sum-wday" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">วันทำงาน</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- วันสะสม -->
            <div class="gp-sum-row gp-sum-wday-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
              <div class="glc glc-no"></div>
              <div class="glc glc-name gp-sum-label">วันสะสม</div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>

            <!-- S-Curve label -->
            <div class="gp-sum-row gp-sum-scurve-label" :style="{ height: LAYOUT.SCURVE_H + 'px' }">
              <div class="glc glc-no"></div>
              <div
                class="glc glc-name gp-sum-label"
                style="flex-direction: column; align-items: flex-start; gap: 4px"
              >
                <span style="font-weight: 700">S-Curve</span>
                <span style="font-size: 9px; color: #1565c0">—— แผน</span>
                <span style="font-size: 9px; color: #e53935">—— ผลงาน</span>
              </div>
              <div class="glc glc-pct"></div>
              <div class="glc glc-cost"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-date"></div>
              <div class="glc glc-dur"></div>
              <div class="glc glc-act"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           RIGHT PANEL — Timeline Header + Gantt bars
      ========================================== -->
      <div class="gp-right" ref="rightOuter">
        <!-- Timeline Header -->
        <div
          class="gp-timeline-header"
          ref="timelineHeader"
          :style="{ height: LAYOUT.HDR_H + 'px' }"
        >
          <div class="gp-month-row" style="height: 27px">
            <div
              v-for="(m, i) in months"
              :key="'m' + i"
              class="gp-month-cell"
              :style="{ width: m.count * LAYOUT.COL_W + 'px' }"
            >
              {{ m.label }}
            </div>
          </div>
          <div class="gp-week-row" style="height: 27px">
            <div
              v-for="(w, i) in weeks"
              :key="'w' + i"
              class="gp-week-cell"
              :style="{ width: LAYOUT.COL_W + 'px' }"
            >
              {{ w.label }}
            </div>
          </div>
        </div>

        <!-- Gantt Body -->
        <div class="gp-gantt-scroll" ref="rightScroll" @scroll="onRightScroll">
          <div class="gp-gantt-inner" :style="{ width: totalW + 'px', height: totalBodyH + 'px' }">
            <!-- Canvas Grid -->
            <canvas
              ref="ganttCanvas"
              class="gp-canvas-bg"
              :width="totalW"
              :height="totalBodyH"
            ></canvas>

            <!-- Gantt Bars Layer -->
            <div class="gp-bars-layer">
              <div
                v-for="(task, barIdx) in sortedTasks"
                :key="'bar-' + task.id"
                class="gp-bar-row"
                :style="{ top: barIdx * LAYOUT.ROW_H + 'px', height: LAYOUT.ROW_H + 'px' }"
              >
                <div
                  class="gp-bar"
                  :class="{
                    'gp-bar-group': task.type === 'group',
                    'gp-bar-sub': task.type === 'sub',
                  }"
                  :style="{
                    left: taskX(task) + 'px',
                    width: taskW(task) + 'px',
                  }"
                  @click="editTask(task)"
                  @mouseenter="showTooltip($event, task)"
                  @mouseleave="hideTooltip"
                >
                  <span v-if="taskW(task) > 55" class="gp-bar-label">{{ task.name }}</span>
                </div>

                <!-- Actual progress bar overlay -->
                <div
                  v-if="getTaskProgress(task.id)"
                  class="gp-bar gp-bar-actual"
                  :style="{
                    left: taskActualX(task) + 'px',
                    width: taskActualW(task) + 'px',
                  }"
                ></div>
              </div>
            </div>

            <!-- Overlay SVG — Plan + Actual polylines -->
            <svg
              class="gp-overlay-svg"
              :width="totalW"
              :height="overlayH"
              :style="{
                position: 'absolute',
                top: '0',
                left: '0',
                pointerEvents: 'none',
                zIndex: 10,
              }"
            >
              <!-- Plan S-Curve overlay -->
              <polyline
                v-if="overlayPlanPoints.length > 1"
                :points="overlayPlanPoints"
                fill="none"
                stroke="#1565c0"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <circle
                v-for="(pt, i) in overlayPlanDots"
                :key="'pd' + i"
                :cx="pt.x"
                :cy="pt.y"
                r="2.5"
                fill="#1565c0"
              />
              <!-- Actual S-Curve overlay (แสดงเมื่อมีข้อมูล) -->
              <polyline
                v-if="overlayActualPoints.length > 1"
                :points="overlayActualPoints"
                fill="none"
                stroke="#e53935"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-dasharray="none"
              />
              <circle
                v-for="(pt, i) in overlayActualDots"
                :key="'ad' + i"
                :cx="pt.x"
                :cy="pt.y"
                r="2.5"
                fill="#e53935"
              />
            </svg>

            <!-- ============================================================
                 BOTTOM SUMMARY SECTION (RIGHT SIDE)
            ============================================================ -->
            <div
              class="gp-sum-right"
              :style="{ top: sortedTasks.length * LAYOUT.ROW_H + 'px', width: totalW + 'px' }"
            >
              <!-- รวมโครงการ row -->
              <div class="gp-sr gp-sr-total" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(w, i) in weeks"
                  :key="'tot' + i"
                  class="gp-src"
                  :style="{ width: LAYOUT.COL_W + 'px' }"
                ></div>
              </div>

              <!-- % แผนงานรายเดือน -->
              <div class="gp-sr gp-sr-month" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(m, i) in months"
                  :key="'pm' + i"
                  class="gp-src gp-src-month"
                  :style="{ width: m.count * LAYOUT.COL_W + 'px' }"
                >
                  {{ safeMonthPlan(i) > 0 ? safeMonthPlan(i).toFixed(2) + '%' : '' }}
                </div>
              </div>

              <!-- % แผนงานสะสมรายเดือน -->
              <div class="gp-sr gp-sr-month-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(m, i) in months"
                  :key="'pmc' + i"
                  class="gp-src gp-src-month-cum"
                  :style="{ width: m.count * LAYOUT.COL_W + 'px' }"
                >
                  {{ safeMonthCum(i) > 0 ? safeMonthCum(i).toFixed(2) + '%' : '' }}
                </div>
              </div>

              <!-- % แผนงานรายสัปดาห์ -->
              <div class="gp-sr gp-sr-week" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(_w, i) in weeks"
                  :key="'pw' + i"
                  class="gp-src gp-src-week"
                  :style="{ width: LAYOUT.COL_W + 'px' }"
                >
                  {{ safeWeekPct(i) > 0 ? safeWeekPct(i).toFixed(2) : '' }}
                </div>
              </div>

              <!-- % สะสมรายสัปดาห์ -->
              <div class="gp-sr gp-sr-week-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(_w, i) in weeks"
                  :key="'wc' + i"
                  class="gp-src gp-src-week-cum"
                  :style="{ width: LAYOUT.COL_W + 'px' }"
                >
                  {{ safeWeekCum(i) > 0 ? safeWeekCum(i).toFixed(2) : '' }}
                </div>
              </div>

              <!-- % ผลงานความก้าวหน้าสะสม (actual) -->
              <div class="gp-sr gp-sr-actual" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(_w, i) in weeks"
                  :key="'act' + i"
                  class="gp-src"
                  :style="{ width: LAYOUT.COL_W + 'px', color: '#c62828', fontWeight: 700 }"
                >
                  {{ safeActualWeekCum(i) > 0 ? safeActualWeekCum(i).toFixed(2) : '' }}
                </div>
              </div>

              <!-- วันทำงาน -->
              <div class="gp-sr gp-sr-wday" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(_w, i) in weeks"
                  :key="'wd' + i"
                  class="gp-src gp-src-wday"
                  :style="{ width: LAYOUT.COL_W + 'px' }"
                >
                  {{ safeWdays(i) > 0 ? safeWdays(i) : '' }}
                </div>
              </div>

              <!-- วันสะสม -->
              <div class="gp-sr gp-sr-wday-cum" :style="{ height: LAYOUT.SUM_ROW_H + 'px' }">
                <div
                  v-for="(_w, i) in weeks"
                  :key="'wdc' + i"
                  class="gp-src gp-src-wday-cum"
                  :style="{ width: LAYOUT.COL_W + 'px' }"
                >
                  {{ safeWdayCum(i) > 0 ? safeWdayCum(i) : '' }}
                </div>
              </div>

              <!-- S-Curve Canvas -->
              <div
                class="gp-sr gp-sr-scurve"
                :style="{ height: LAYOUT.SCURVE_H + 'px', position: 'relative' }"
              >
                <canvas
                  ref="scurveCanvas"
                  class="gp-scurve-canvas"
                  :width="totalW"
                  :height="LAYOUT.SCURVE_H"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         FOOTER / REMARK SECTION
    ============================================================ -->
    <div class="gp-footer">
      <div class="gp-footer-left">
        <span class="gp-footer-title">Remark:</span>
        <span class="gp-footer-item" style="color: #1565c0">▬ แผน (Plan)</span>
        <span class="gp-footer-item" style="color: #e53935">▬ ผลงานจริง (Actual)</span>
        <span
          class="gp-footer-item"
          style="background: #e3f2fd; padding: 1px 6px; border-radius: 2px"
          >หมวดงานหลัก</span
        >
        <span
          class="gp-footer-item"
          style="background: #bbdefb; padding: 1px 6px; border-radius: 2px"
          >งานย่อย</span
        >
        <span class="gp-footer-item" style="color: #888">
          ความคืบหน้า: แผน {{ projectSummary.totalPct.toFixed(1) }}% | จริง
          {{ projectSummary.actualPct.toFixed(1) }}% | Variance
          {{ (projectSummary.actualPct - projectSummary.totalPct).toFixed(1) }}%
        </span>
      </div>
      <div class="gp-footer-right">
        วันสิ้นสุดสัญญา: <strong>{{ formatDate(projectSummary.end) }}</strong> | ระยะเวลาโครงการ:
        <strong>{{ projectSummary.totalDuration }} วัน</strong>
      </div>
    </div>

    <!-- ============================================================
         TOOLTIP
    ============================================================ -->
    <div
      v-if="tooltip.visible"
      class="gp-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="gp-tt-name">{{ tooltip.name }}</div>
      <div class="gp-tt-row">เริ่ม: {{ tooltip.start }} | สิ้นสุด: {{ tooltip.end }}</div>
      <div class="gp-tt-row">
        ระยะเวลา: {{ tooltip.dur }} วัน | แผน: {{ tooltip.pct.toFixed(2) }}%
      </div>
      <div v-if="tooltip.cost > 0" class="gp-tt-row">
        มูลค่า: {{ tooltip.cost.toLocaleString('th-TH') }} บาท
      </div>
      <div v-if="tooltip.actualPct > 0" class="gp-tt-row" style="color: #ffcdd2">
        ผลงานจริง: {{ tooltip.actualPct.toFixed(2) }}% | Variance:
        {{ (tooltip.actualPct - tooltip.pct).toFixed(2) }}%
      </div>
    </div>

    <!-- ============================================================
         MODAL — เพิ่ม/แก้ไข Task
    ============================================================ -->
    <div v-if="showModal" class="gp-modal-overlay" @click.self="closeModal">
      <div class="gp-modal">
        <div class="gp-modal-header">
          <span>
            <q-icon
              :name="formData.id ? 'edit_note' : 'control_point'"
              :class="formData.id ? 'text-white' : 'text-white'"
              size="1.5rem"
              class="q-mr-xs"
            />
            {{ formData.id ? 'แก้ไขรายการงาน' : 'เพิ่มรายการงานใหม่' }}
          </span>
          <button class="gp-modal-close" @click="closeModal">✕</button>
        </div>
        <div class="gp-modal-body">
          <div v-if="validationErrors.length" class="gp-validation-errors">
            <div v-for="err in validationErrors" :key="err" class="gp-validation-error">
              ⚠ {{ err }}
            </div>
          </div>

          <label class="gp-lbl">ชื่อรายการงาน *</label>
          <input class="gp-inp" v-model="formData.name" placeholder="ระบุชื่อรายการ" />

          <div class="gp-form-row">
            <div>
              <label class="gp-lbl">ประเภท</label>
              <select class="gp-inp" v-model="formData.type">
                <option value="group">หมวดงานหลัก</option>
                <option value="sub">งานย่อย</option>
              </select>
            </div>
            <div>
              <label class="gp-lbl">สังกัดหมวดงาน</label>
              <select class="gp-inp" v-model="formData.pid">
                <option :value="0">(ไม่มี — หมวดหลัก)</option>
                <option v-for="g in groupTasks" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>
          </div>

          <div class="gp-form-row">
            <div>
              <label class="gp-lbl">% มูลค่างาน</label>
              <input
                class="gp-inp"
                type="number"
                step="0.01"
                min="0"
                max="100"
                v-model.number="formData.pct"
              />
            </div>
            <div>
              <label class="gp-lbl">มูลค่า (บาท)</label>
              <input class="gp-inp" type="number" step="1" v-model.number="formData.cost" />
            </div>
          </div>

          <div class="gp-form-row">
            <div>
              <label class="gp-lbl">วันเริ่มต้น</label>
              <input class="gp-inp" type="date" v-model="formData.start" />
            </div>
            <div>
              <label class="gp-lbl">วันสิ้นสุด</label>
              <input class="gp-inp" type="date" v-model="formData.end" />
            </div>
          </div>

          <!-- Actual Progress Section -->
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee">
            <label class="gp-lbl" style="color: #c62828">📊 ผลงานจริง (Actual Progress)</label>
            <div class="gp-form-row">
              <div>
                <label class="gp-lbl">% ผลงานจริง</label>
                <input
                  class="gp-inp"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  v-model.number="formData.actualPct"
                />
              </div>
              <div>
                <label class="gp-lbl">วันเริ่มจริง</label>
                <input class="gp-inp" type="date" v-model="formData.actualStart" />
              </div>
            </div>
            <div class="gp-form-row">
              <div>
                <label class="gp-lbl">วันสิ้นสุดจริง</label>
                <input class="gp-inp" type="date" v-model="formData.actualEnd" />
              </div>
            </div>
          </div>

          <!-- Dependency Section -->
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee">
            <label class="gp-lbl">🔗 Dependency (Task ID | Type | Lag days)</label>
            <div class="gp-form-row">
              <div>
                <label class="gp-lbl">Task ID ที่ขึ้นต่อ</label>
                <input
                  class="gp-inp"
                  type="number"
                  v-model.number="formData.dependsOnId"
                  placeholder="Task ID"
                />
              </div>
              <div>
                <label class="gp-lbl">ประเภท Dependency</label>
                <select class="gp-inp" v-model="formData.dependsOnType">
                  <option value="">ไม่มี</option>
                  <option value="FS">FS (Finish-to-Start)</option>
                  <option value="SS">SS (Start-to-Start)</option>
                  <option value="FF">FF (Finish-to-Finish)</option>
                </select>
              </div>
              <div>
                <label class="gp-lbl">Lag (วัน)</label>
                <input
                  class="gp-inp"
                  type="number"
                  v-model.number="formData.dependsOnLag"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="gp-modal-footer">
          <button
            v-if="formData.id"
            class="gp-btn gp-btn-danger"
            @click="handleDeleteTask(formData.id!)"
          >
            ลบรายการ
          </button>
          <span style="flex: 1"></span>
          <button class="gp-btn gp-btn-cancel" @click="closeModal">ยกเลิก</button>
          <button class="gp-btn gp-btn-primary" @click="saveTask">บันทึก</button>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// import { log } from 'console';
// import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem('authToken');
// const route = useRoute();
// ============================================================
// TYPES & INTERFACES — Database-Ready Architecture
// ============================================================
const props = defineProps<{
  projectId?: number | undefined;
}>();
/** Raw task from database */
interface Task {
  // ข้อมูลงานที่เก็บในฐานข้อมูล (เชื่อมกับ TaskProgress ผ่าน id)
  id: number;
  pid: number; // parent group id (0 = root group)
  p_id: number; // project id
  name: string;
  pct: number; // % มูลค่างาน (for sub tasks only — group auto-computed)
  cost: number; // มูลค่า บาท (for sub tasks only — group auto-computed)
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  type: 'group' | 'sub';
  groupNo?: string; // auto-assigned during sort
}

/** Actual progress record */
interface TaskProgress {
  // ข้อมูลความก้าวหน้าจริงที่อัพเดตโดยผู้ใช้ (เชื่อมกับ Task ผ่าน taskId)
  taskId: number;
  actualPct: number;
  actualStart: string;
  actualEnd: string;
}

/** Task dependency record */
interface TaskDependency {
  //แสดงความสัมพันธ์ระหว่างงาน เช่น งาน A ต้องเสร็จสิ้นก่อนงาน B เริ่ม (FS), หรือ งาน C ต้องเริ่มพร้อมกับงาน D (SS)
  id: number;
  fromTaskId: number;
  toTaskId: number;
  type: 'FS' | 'SS' | 'FF'; // Finish-to-Start, Start-to-Start, Finish-to-Finish
  lagDays: number;
}

/** Calendar day override */
interface CalendarDay {
  // ใช้สำหรับกำหนดวันหยุดหรือวันทำงานพิเศษในปฏิทิน
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  description?: string;
}

/** Project metadata */
interface Project {
  // ข้อมูลโครงการหลักที่ใช้แสดงใน header และ summary
  id: number;
  name: string;
  subtitle: string;
  contractNo: string;
  contractDate: string;
  factorF: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
}

/** Form data for modal (combines Task + TaskProgress + dependency info) */
interface TaskFormData extends Partial<Task> {
  actualPct?: number;
  actualStart?: string;
  actualEnd?: string;
  dependsOnId: number | null;
  dependsOnType: string | null;
  dependsOnLag?: number;
}

// ============================================================
// LAYOUT CONSTANTS — all sizes in one object (no magic numbers)
// ============================================================
const LAYOUT = Object.freeze({
  COL_W: 30, // ความกว้างแต่ละคอลัมน์สัปดาห์ (px)
  ROW_H: 26, // ความสูงแต่ละ row งาน (px)
  HDR_H: 54, // ความสูง header timeline (px)
  SUM_ROW_H: 22, // ความสูงแต่ละ row สรุป (px)
  SCURVE_H: 90, // ความสูง S-Curve chart (px)
  LEFT_W: 580, // ความกว้าง left panel (px)
  SUM_ROW_COUNT: 8, // จำนวน summary rows (ไม่รวม S-Curve)
});

// ============================================================
// THAI MONTH LABELS
// ============================================================
const TH_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

// ============================================================
// PROJECT CONFIG — single source of truth
// ============================================================
const projectConfig = reactive<Project>({
  id: props.projectId ?? 1,
  name: 'แผนงานโครงการปรับปรุงอาคารธนาคารทหารไทย',
  subtitle: 'โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ',
  contractNo: 'รพ.ธ. 151/2566',
  contractDate: '4 พฤศจิกายน พ.ศ. 2565',
  factorF: '1.2823',
  totalBudget: 14699987.03,
  startDate: '2025-12-01',
  endDate: '2026-07-15',
});

// ============================================================
// WORKING CALENDAR — configurable holidays
// ============================================================
const holidays = ref<CalendarDay[]>([
  //เพิ่มเติมวันหยุดพิเศษหรือวันทำงานพิเศษได้ที่นี่ โดยระบุวันที่และคำอธิบาย เช่น วันหยุดราชการ, วันหยุดประจำปี, หรือแม้แต่วันทำงานพิเศษที่ต้องการให้แสดงในปฏิทิน
  // Thai public holidays during project period
  { date: '2025-12-05', isHoliday: true, description: 'วันพ่อแห่งชาติ' },
  { date: '2025-12-10', isHoliday: true, description: 'วันรัฐธรรมนูญ' },
  { date: '2026-01-02', isHoliday: true, description: 'วันขึ้นปีใหม่ (ชดเชย)' },
  { date: '2026-02-06', isHoliday: true, description: 'วันมาฆบูชา' },
  { date: '2026-04-06', isHoliday: true, description: 'วันจักรี' },
  { date: '2026-04-13', isHoliday: true, description: 'วันสงกรานต์' },
  { date: '2026-04-14', isHoliday: true, description: 'วันสงกรานต์' },
  { date: '2026-04-15', isHoliday: true, description: 'วันสงกรานต์' },
  { date: '2026-05-01', isHoliday: true, description: 'วันแรงงาน' },
  { date: '2026-05-04', isHoliday: true, description: 'วันฉัตรมงคล' },
  { date: '2026-05-05', isHoliday: true, description: 'วันวิสาขบูชา' },
]);

// ============================================================
// CALENDAR HELPERS — Dynamic working day calculation
// ============================================================
const holidaySet = computed<Set<string>>(() => {
  return new Set(holidays.value.filter((h) => h.isHoliday).map((h) => h.date));
});

/** Check if a given date is a working day (not weekend, not holiday) */
const isWorkingDay = (date: Date): boolean => {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false; // Sunday=0, Saturday=6
  const iso = toISODate(date);
  return !holidaySet.value.has(iso);
};

/** Count working days between two date strings (inclusive) */
const getWorkingDaysBetween = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  // ✅ parse local time
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const start = new Date(sy!, sm! - 1, sd);
  const end = new Date(ey!, em! - 1, ed);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (isWorkingDay(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// ============================================================
// API STATE — placeholder async API layer
// ============================================================
const apiState = reactive({
  loading: false,
  error: '',
  lastSaved: null as Date | null,
});
// เผือมีการเปลี่ยนแปลง projectId จากภายนอก (เช่น ผ่าน props) ให้รีเฟรชข้อมูลใหม่
watch(
  () => props.projectId,
  async (newId) => {
    if (newId) {
      projectConfig.id = newId;
      await fetchProject();
      await redraw();
    }
  },
);
/** Placeholder: fetch project from backend */
const fetchProject = async (): Promise<void> => {
  const projectId = props.projectId;
  // console.log('projectIdByUrl:', 'Auth token:', projectIdByUrl, AUTH_TOKEN);
  apiState.loading = true;
  try {
    // TODO: replace with real API call
    const res = await fetch(`${API_BASE_URL}/planapi/getPlanning/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
      },
    });
    const projRes = await fetch(`${API_BASE_URL}/planapi/getProject/${projectId}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `${AUTH_TOKEN}` },
    });
    const data = await res.json(); // คาดว่าจะได้รูปแบบ { tasks: Task[], progress: TaskProgress[], dependencies: TaskDependency[] }
    const projData = await projRes.json(); // คาดว่าจะได้รูปแบบ Project
    if (projData) {
      projectConfig.name = projData.name ?? '';
      projectConfig.subtitle = projData.type ?? ''; // ประเภทงาน
      projectConfig.contractNo = projData.contractNo ?? '';
      projectConfig.totalBudget = projData.budget ?? 0;
      projectConfig.startDate = projData.start?.slice(0, 10) ?? projectConfig.startDate;
      projectConfig.endDate = projData.end?.slice(0, 10) ?? projectConfig.endDate;
      projectConfig.contractDate = projData.contractDate ?? '';
      // ถ้า projectConfig มี field เพิ่มเติม
      // projectConfig.pm         = proj.pm ?? ''
      // projectConfig.location   = proj.location ?? ''
      // projectConfig.status     = proj.status ?? ''
    }
    // console.log('projData', projData);
    tasks.value = data;
    // โหลด actual_pct จาก tasks เข้า taskProgressMap
    const newMap = new Map<number, TaskProgress>();
    data.forEach(
      (task: Task & { actual_pct?: number; actual_start?: string; actual_end?: string }) => {
        if (task.type === 'sub' && (task.actual_pct ?? 0) > 0) {
          newMap.set(task.id, {
            taskId: task.id,
            actualPct: task.actual_pct ?? 0,
            actualStart: task.actual_start ?? task.start,
            actualEnd: task.actual_end ?? task.end,
          });
        }
      },
    );

    taskProgressMap.value = newMap;
    // console.log('Loaded tasks and progress from API:', tasks.value[5], taskProgressMap.value);
    // taskProgressMap.value = data.progress;
    await new Promise((r) => setTimeout(r, 0)); // รอให้ state อัพเดตก่อน (ถ้ามี)
  } catch (e) {
    apiState.error = 'ไม่สามารถโหลดข้อมูลได้';
    throw e;
  } finally {
    apiState.loading = false;
  }
};
/** Placeholder: save task to backend */
const saveTaskToAPI = async (task: Task): Promise<Task> => {
  // alert('บันทึกข้อมูลไปยัง API (ดู console log สำหรับรายละเอียด)', AUTH_TOKEN);
  // console.log('Saving task to API:', task, 'Auth token:', AUTH_TOKEN);
  apiState.loading = true;
  try {
    // TODO: replace with real API call
    await fetch(
      `${API_BASE_URL}/planapi/${task.id ? 'updatePlanning' : 'insertPlanning'}/${task.id || ''}`,
      {
        method: task.id ? 'PUT' : 'POST', // ใช้ POST สำหรับสร้างใหม่, PUT สำหรับอัพเดต
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
        },
        body: JSON.stringify(task),
      },
    );
    // return await res.json();
    // console.log('result from API:', res.status, res.statusText);
    await new Promise((r) => setTimeout(r, 0));
    apiState.lastSaved = new Date();
    return task;
  } catch (e) {
    apiState.error = 'บันทึกไม่สำเร็จ';
    throw e;
  } finally {
    apiState.loading = false;
  }
};

/** Placeholder: delete task from backend */
const deleteTaskFromAPI = async (id: number): Promise<void> => {
  apiState.loading = true;
  try {
    // TODO: replace with real API call
    await fetch(`${API_BASE_URL}/planapi/deletePlanning/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTH_TOKEN}`, // เพิ่ม header สำหรับการยืนยันตัวตน
      },
    });
    // log(`Deleted task with id ${id} from API`);
    // console.log(`Deleted task with id ${id} from API`);
    await fetchProject(); // รีเฟรชข้อมูลหลังลบ
    await new Promise((r) => setTimeout(r, 0));
  } catch (e) {
    apiState.error = 'ลบไม่สำเร็จ';
    throw e;
  } finally {
    apiState.loading = false;
  }
};

// ============================================================
// RAW STATE — tasks + progress + dependencies
// ============================================================
const tasks = ref<Task[]>([]);

// Actual progress map: taskId → TaskProgress
const taskProgressMap = ref<Map<number, TaskProgress>>(new Map());

// Task dependencies
const taskDependencies = ref<TaskDependency[]>([]);

let nextId = 0;

const idForm = computed(() => props.projectId ?? 1);

// ============================================================
// VALIDATION SYSTEM
// ============================================================
const validationErrors = ref<string[]>([]);

const validateTaskForm = (data: TaskFormData): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('กรุณาระบุชื่อรายการงาน');
  }

  if (data.start && data.end && data.start > data.end) {
    errors.push('วันเริ่มต้องก่อนหรือเท่ากับวันสิ้นสุด');
  }

  if (data.pct !== undefined && (data.pct < 0 || data.pct > 100)) {
    errors.push('% มูลค่างานต้องอยู่ระหว่าง 0-100');
  }

  if (data.actualPct !== undefined && (data.actualPct < 0 || data.actualPct > 100)) {
    errors.push('% ผลงานจริงต้องอยู่ระหว่าง 0-100');
  }

  // Check project date bounds
  if (data.start && data.start < projectConfig.startDate) {
    errors.push(`วันเริ่มต้นต้องไม่ก่อน ${formatDate(projectConfig.startDate)}`);
  }

  if (data.end && data.end > projectConfig.endDate) {
    errors.push(`วันสิ้นสุดต้องไม่เกิน ${formatDate(projectConfig.endDate)}`);
  }

  // Validate dependency: no circular parents
  if (data.id && data.pid && data.id === data.pid) {
    errors.push('งานไม่สามารถอ้างถึงตัวเองเป็น parent ได้');
  }

  // Validate parent exists if pid != 0
  if (data.pid && data.pid !== 0) {
    const parentExists = tasks.value.some((t) => t.id === data.pid && t.type === 'group');
    if (!parentExists) {
      errors.push('ไม่พบ parent หมวดงานที่ระบุ');
    }
  }

  // If type is sub, must have valid parent
  if (data.type === 'sub' && (!data.pid || data.pid === 0)) {
    errors.push('งานย่อยต้องมีหมวดงานหลัก (parent)');
  }

  return errors;
};

// ============================================================
// AUTO GROUP AGGREGATION — computed (never stored in raw state)
// ============================================================

/** Get all sub-tasks for a given group id */
const getChildren = (groupId: number): Task[] => {
  return tasks.value.filter((t) => t.pid === groupId && t.type === 'sub');
};

/** Computed pct for display — group: sum of children; sub: own value */
const computedTaskPct = (task: Task): number => {
  if (task.type === 'sub') return task.pct;
  const children = getChildren(task.id);
  if (children.length === 0) return task.pct; // fallback if no children
  return parseFloat(children.reduce((s, c) => s + c.pct, 0).toFixed(4));
};

/** Computed cost for display — group: sum of children; sub: own value */
const computedTaskCost = (task: Task): number => {
  if (task.type === 'sub') return task.cost;
  const children = getChildren(task.id);
  if (children.length === 0) return task.cost;
  return children.reduce((s, c) => s + c.cost, 0);
};

/** Computed start — group: earliest child start; sub: own */
const computedTaskStart = (task: Task): string => {
  // ใช้ start จาก DB เสมอ ไม่คำนวณจาก children
  return task.start;
};

/** Computed end — group: latest child end; sub: own */
const computedTaskEnd = (task: Task): string => {
  // ใช้ end จาก DB เสมอ ไม่คำนวณจาก children
  return task.end;
};

// ============================================================
// PROJECT SUMMARY — fully computed, no hardcoded values
// ============================================================
const projectSummary = computed(() => {
  const subTasks = tasks.value.filter((t) => t.type === 'sub');

  const totalPct = parseFloat(subTasks.reduce((s, t) => s + t.pct, 0).toFixed(4));
  const totalCost = subTasks.reduce((s, t) => s + t.cost, 0);

  const allStarts = subTasks
    .map((t) => t.start)
    .filter(Boolean)
    .sort();
  const allEnds = subTasks
    .map((t) => t.end)
    .filter(Boolean)
    .sort();

  const projectStart = allStarts.length > 0 ? allStarts[0]! : projectConfig.startDate;
  const projectEnd = allEnds.length > 0 ? allEnds[allEnds.length - 1]! : projectConfig.endDate;

  const totalDuration = getWorkingDaysBetween(projectStart, projectEnd);

  // Compute actual % from progress map
  const totalActualPct = Array.from(taskProgressMap.value.values()).reduce(
    (s, p) => s + p.actualPct * (getTaskPctWeight(p.taskId) / 100),
    0,
  );

  return {
    name: projectConfig.name,
    subtitle: projectConfig.subtitle,
    contractNo: projectConfig.contractNo,
    contractDate: projectConfig.contractDate,
    factorF: projectConfig.factorF,
    totalBudget: projectConfig.totalBudget,
    totalPct,
    totalCost,
    totalCostFormatted: Math.round(totalCost).toLocaleString('th-TH'),
    start: projectStart,
    end: projectEnd,
    totalDuration,
    actualPct: parseFloat(totalActualPct.toFixed(2)),
    scheduleVariance: parseFloat((totalActualPct - totalPct).toFixed(2)),
  };
});

/** Get pct weight of a task for variance calculation */
const getTaskPctWeight = (taskId: number): number => {
  const task = tasks.value.find((t) => t.id === taskId);
  return task ? task.pct : 0;
};

// ============================================================
// SORTED TASKS — computed rendering order
// ============================================================
const sortedTasks = computed<Task[]>(() => {
  const groups = tasks.value
    .filter((t) => t.pid === 0)
    .sort(
      (a, b) => new Date(computedTaskStart(a)).getTime() - new Date(computedTaskStart(b)).getTime(),
    );

  const out: Task[] = [];
  let gNo = 1;
  groups.forEach((g) => {
    out.push({ ...g, groupNo: String(gNo++) });
    tasks.value
      .filter((t) => t.pid === g.id)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .forEach((s) => out.push({ ...s, groupNo: '' }));
  });
  return out;
});

const groupTasks = computed(() => tasks.value.filter((t) => t.type === 'group'));

// ============================================================
// TIMELINE — weeks and months (driven by task data, not hardcoded)
// ============================================================
const projectStartDate = computed(() => new Date(projectSummary.value.start));
const projectEndDate = computed(() => new Date(projectSummary.value.end));

const weeks = computed(() => {
  const w: { start: Date; end: Date; label: string }[] = [];
  const c = new Date(projectStartDate.value);
  // Normalize to start of week (Monday)
  const dayOfWeek = c.getDay();
  const daysToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  c.setDate(c.getDate() + daysToMon);

  while (c <= projectEndDate.value) {
    const wEnd = new Date(c);
    wEnd.setDate(wEnd.getDate() + 6);
    w.push({
      start: new Date(c),
      end: wEnd,
      label: c.getDate() + '/' + (c.getMonth() + 1),
    });
    c.setDate(c.getDate() + 7);
  }
  return w;
});

const months = computed(() => {
  const m: Record<string, { label: string; count: number }> = {};
  weeks.value.forEach((w) => {
    const k = w.start.getFullYear() + '-' + (w.start.getMonth() + 1);
    if (!m[k]) {
      m[k] = {
        label: TH_MONTHS[w.start.getMonth()]! + ' ' + (w.start.getFullYear() + 543),
        count: 0,
      };
    }
    m[k].count++;
  });
  return Object.values(m);
});

// ============================================================
// DYNAMIC WEEKLY DISTRIBUTION ENGINE
// Generates weekly plan % from actual task schedules and weights
// ============================================================

/** Distribute a task's pct across the weeks it spans */
const distributeTaskAcrossWeeks = (task: Task, numWeeks: number): number[] => {
  const dist = new Array<number>(numWeeks).fill(0);
  const taskPct = task.type === 'sub' ? task.pct : computedTaskPct(task);
  if (taskPct === 0) return dist;

  const taskStart = new Date(task.start);
  const taskEnd = new Date(task.end);

  // Find which weeks overlap with this task
  let totalTaskWorkDays = 0;
  const weekWorkDays: number[] = new Array(numWeeks).fill(0);

  weeks.value.forEach((week, wi) => {
    const overlapStart = new Date(Math.max(taskStart.getTime(), week.start.getTime()));
    const overlapEnd = new Date(Math.min(taskEnd.getTime(), week.end.getTime()));
    if (overlapStart <= overlapEnd) {
      const wd = getWorkingDaysBetween(toISODate(overlapStart), toISODate(overlapEnd));
      weekWorkDays[wi] = wd;
      totalTaskWorkDays += wd;
    }
  });

  if (totalTaskWorkDays === 0) return dist;

  // Distribute pct proportional to working days in each week
  weeks.value.forEach((_, wi) => {
    dist[wi] = (weekWorkDays[wi]! / totalTaskWorkDays) * taskPct;
  });

  return dist;
};

/** Dynamic weekly plan pct — derived from all sub-tasks' schedules and weights */
const dynamicWeekPct = computed((): number[] => {
  const nw = weeks.value.length;
  const dist = new Array<number>(nw).fill(0);

  tasks.value
    .filter((t) => t.type === 'sub' && t.pct > 0)
    .forEach((task) => {
      const taskDist = distributeTaskAcrossWeeks(task, nw);
      taskDist.forEach((v, i) => {
        dist[i]! += v;
      });
    });

  return dist.map((v) => parseFloat(v.toFixed(4)));
});

/** Weekly cumulative plan */
const weekCum = computed((): number[] => {
  let s = 0;
  return dynamicWeekPct.value.map((v) => {
    s += v;
    return parseFloat(s.toFixed(4));
  });
});

/** Dynamic working days per week */
const dynamicWdays = computed((): number[] => {
  return weeks.value.map((week) => {
    return getWorkingDaysBetween(toISODate(week.start), toISODate(week.end));
  });
});

/** Cumulative working days */
const wdayCum = computed((): number[] => {
  let s = 0;
  return dynamicWdays.value.map((v) => {
    s += v;
    return s;
  });
});

/** Monthly plan pct — summed from weekly */
const monthPlanPct = computed((): number[] => {
  return months.value.map((_m, mi) => {
    let startWIdx = 0;
    for (let i = 0; i < mi; i++) {
      startWIdx += months.value[i]?.count ?? 0;
    }
    const count = months.value[mi]?.count ?? 0;
    let sum = 0;
    for (let i = startWIdx; i < startWIdx + count; i++) {
      sum += dynamicWeekPct.value[i] ?? 0;
    }
    return parseFloat(sum.toFixed(4));
  });
});

/** Monthly cumulative plan */
const monthCumPct = computed((): number[] => {
  let s = 0;
  return monthPlanPct.value.map((v) => {
    s += v;
    return parseFloat(s.toFixed(4));
  });
});

// ============================================================
// ACTUAL PROGRESS SYSTEM — cumulative actual per week
// ============================================================

/** Get TaskProgress for a task */
const getTaskProgress = (taskId: number): TaskProgress | undefined => {
  return taskProgressMap.value.get(taskId);
};

/** Compute actual pct contribution of each task per week */
const actualWeekPct = computed((): number[] => {
  const nw = weeks.value.length;
  const dist = new Array<number>(nw).fill(0);

  taskProgressMap.value.forEach((progress, taskId) => {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task || !progress.actualStart || !progress.actualEnd) return;

    const taskActualPct = (progress.actualPct / 100) * task.pct;
    if (taskActualPct === 0) return;

    const modifiedTask: Task = {
      ...task,
      pct: taskActualPct,
      start: progress.actualStart,
      end: progress.actualEnd,
    };

    const taskDist = distributeTaskAcrossWeeks(modifiedTask, nw);
    taskDist.forEach((v, i) => {
      dist[i]! += v;
    });
  });

  return dist.map((v) => parseFloat(v.toFixed(4)));
});

/** Actual weekly cumulative */
const actualWeekCum = computed((): number[] => {
  let s = 0;
  return actualWeekPct.value.map((v) => {
    s += v;
    return parseFloat(s.toFixed(4));
  });
});

// ============================================================
// SAFE ARRAY ACCESSORS
// ============================================================
const safeMonthPlan = (i: number): number => monthPlanPct.value[i] ?? 0;
const safeMonthCum = (i: number): number => monthCumPct.value[i] ?? 0;
const safeWeekPct = (i: number): number => dynamicWeekPct.value[i] ?? 0;
const safeWeekCum = (i: number): number => weekCum.value[i] ?? 0;
const safeWdays = (i: number): number => dynamicWdays.value[i] ?? 0;
const safeWdayCum = (i: number): number => wdayCum.value[i] ?? 0;
const safeActualWeekCum = (i: number): number => actualWeekCum.value[i] ?? 0;

// ============================================================
// DIMENSIONS — computed
// ============================================================
const totalW = computed(() => weeks.value.length * LAYOUT.COL_W);
const totalBodyH = computed(
  () =>
    sortedTasks.value.length * LAYOUT.ROW_H +
    LAYOUT.SUM_ROW_H * LAYOUT.SUM_ROW_COUNT +
    LAYOUT.SCURVE_H,
);

// ============================================================
// DATE HELPERS
// ============================================================
const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// const daysBetween = (a: string | Date, b: string | Date): number =>
//   Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

const formatDate = (s: string | Date | undefined): string => {
  if (!s) return '–';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '–';
  return d.getDate() + '/' + (d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2);
};

// ============================================================
// GANTT BAR POSITION — using project start from computed data
// ============================================================
/** หา x position จากวันที่ โดยอิง weeks array จริงๆ */
const dateToX = (dateStr: string): number => {
  // ✅ parse แบบ local time แทน UTC
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y!, m! - 1, d);

  for (let i = 0; i < weeks.value.length; i++) {
    const w = weeks.value[i]!;
    if (date >= w.start && date <= w.end) {
      const totalMs = w.end.getTime() - w.start.getTime();
      const offsetMs = date.getTime() - w.start.getTime();
      const frac = totalMs > 0 ? offsetMs / totalMs : 0;
      return i * LAYOUT.COL_W + frac * LAYOUT.COL_W;
    }
  }
  if (date < weeks.value[0]!.start) return 0;
  return weeks.value.length * LAYOUT.COL_W;
};

const taskX = (t: Task): number => {
  return Math.max(0, dateToX(computedTaskStart(t)));
};

const taskW = (t: Task): number => {
  const x1 = dateToX(computedTaskStart(t));
  const x2 = dateToX(computedTaskEnd(t));
  return Math.max(LAYOUT.COL_W * 0.4, x2 - x1);
};

const taskActualX = (t: Task): number => {
  const progress = getTaskProgress(t.id);
  if (!progress?.actualStart) return taskX(t);
  return Math.max(0, dateToX(progress.actualStart));
};

const taskActualW = (t: Task): number => {
  const progress = getTaskProgress(t.id);
  if (!progress?.actualStart) return 0;
  const end = progress.actualEnd || progress.actualStart;
  return Math.max(4, dateToX(end) - dateToX(progress.actualStart));
};

// ============================================================
// OVERLAY SVG — plan + actual polylines over gantt area
// ============================================================
const overlayH = computed(() => sortedTasks.value.length * LAYOUT.ROW_H);

const overlayY = (pct: number): number => {
  const h = overlayH.value;
  return Math.max(4, Math.min(h - 4, h - (pct / 100) * h));
};

const overlayX = (i: number): number => (i + 0.5) * LAYOUT.COL_W;

const overlayPlanPoints = computed((): string => {
  return weekCum.value
    .map((v, i) => {
      if (i >= weeks.value.length || v === 0) return null;
      return `${overlayX(i)},${overlayY(v)}`;
    })
    .filter(Boolean)
    .join(' ');
});

const overlayPlanDots = computed(() =>
  weekCum.value
    .map((v, i) => ({ x: overlayX(i), y: overlayY(v), v }))
    .filter((pt, i) => i < weeks.value.length && pt.v > 0),
);

const overlayActualPoints = computed((): string => {
  return actualWeekCum.value
    .map((v, i) => {
      if (i >= weeks.value.length || v === 0) return null;
      return `${overlayX(i)},${overlayY(v)}`;
    })
    .filter(Boolean)
    .join(' ');
});

const overlayActualDots = computed(() =>
  actualWeekCum.value
    .map((v, i) => ({ x: overlayX(i), y: overlayY(v), v }))
    .filter((pt, i) => i < weeks.value.length && pt.v > 0),
);

// ============================================================
// VARIANCE CALCULATIONS
// ============================================================
computed(() => {
  return weeks.value.map((_, i) => ({
    weekIdx: i,
    planned: safeWeekCum(i),
    actual: safeActualWeekCum(i),
    scheduleVariance: parseFloat((safeActualWeekCum(i) - safeWeekCum(i)).toFixed(4)),
    progressVariance:
      safeWeekCum(i) > 0
        ? parseFloat(((safeActualWeekCum(i) / safeWeekCum(i) - 1) * 100).toFixed(2))
        : 0,
  }));
});
// console.log('debug', _weeklyVariance);

// ============================================================
// CANVAS DRAWING — requestAnimationFrame batched
// ============================================================
let rafHandle: number | null = null;

const scheduleRedraw = () => {
  if (rafHandle !== null) return;
  rafHandle = requestAnimationFrame(() => {
    rafHandle = null;
    drawGrid();
    drawSCurve();
  });
};

const drawGrid = (): void => {
  const canvas = ganttCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = totalW.value;
  const H = totalBodyH.value;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const taskH = sortedTasks.value.length * LAYOUT.ROW_H;

  // Alternating column backgrounds
  weeks.value.forEach((_, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#fafafa' : '#f0f4ff';
    ctx.fillRect(i * LAYOUT.COL_W, 0, LAYOUT.COL_W, H);
  });

  // Vertical week grid lines
  ctx.strokeStyle = '#d0d8e8';
  ctx.lineWidth = 0.5;
  weeks.value.forEach((_, i) => {
    ctx.beginPath();
    ctx.moveTo(i * LAYOUT.COL_W, 0);
    ctx.lineTo(i * LAYOUT.COL_W, H);
    ctx.stroke();
  });

  // Month divider lines (thicker)
  let wIdx = 0;
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 1;
  months.value.forEach((m) => {
    ctx.beginPath();
    ctx.moveTo(wIdx * LAYOUT.COL_W, 0);
    ctx.lineTo(wIdx * LAYOUT.COL_W, H);
    ctx.stroke();
    wIdx += m.count;
  });

  // Horizontal row lines
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  sortedTasks.value.forEach((_, i) => {
    ctx.beginPath();
    ctx.moveTo(0, i * LAYOUT.ROW_H);
    ctx.lineTo(W, i * LAYOUT.ROW_H);
    ctx.stroke();
  });

  // Task / summary divider
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, taskH);
  ctx.lineTo(W, taskH);
  ctx.stroke();

  // Summary row backgrounds
  const sumColors = [
    '#bbdefb',
    '#e3f2fd',
    '#e3f2fd',
    '#e8f5e9',
    '#c8e6c9',
    '#fff8e1',
    '#f3e5f5',
    '#e1bee7',
  ];
  sumColors.forEach((color, i) => {
    const y = taskH + i * LAYOUT.SUM_ROW_H;
    ctx.fillStyle = color;
    ctx.fillRect(0, y, W, LAYOUT.SUM_ROW_H);
    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y + LAYOUT.SUM_ROW_H);
    ctx.lineTo(W, y + LAYOUT.SUM_ROW_H);
    ctx.stroke();
  });

  // Today line
  // const todayX = (daysBetween(projectSummary.value.start, new Date()) / 7) * LAYOUT.COL_W;
  const todayX = dateToX(toISODate(new Date()));
  if (todayX >= 0 && todayX <= W) {
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(todayX, 0);
    ctx.lineTo(todayX, taskH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e53935';
    ctx.font = 'bold 8px Sarabun, sans-serif';
    ctx.fillText('TODAY', todayX + 2, 10);
  }
};

const drawSCurve = (): void => {
  const canvas = scurveCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = totalW.value;
  const H = LAYOUT.SCURVE_H;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#f0f4ff';
  ctx.fillRect(0, 0, W, H);

  // Horizontal % grid lines
  const horizLines: number[] = [20, 40, 60, 80, 100];
  horizLines.forEach((v: number) => {
    const y = H - (v / 100) * (H - 14) - 4;
    ctx.strokeStyle = '#c5cae9';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.fillStyle = '#7986cb';
    ctx.font = '8px Sarabun, sans-serif';
    ctx.fillText(v + '%', 3, y - 1);
  });

  // Vertical week lines
  weeks.value.forEach((_, i) => {
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(i * LAYOUT.COL_W, 0);
    ctx.lineTo(i * LAYOUT.COL_W, H);
    ctx.stroke();
  });

  // Helper to get y from pct
  const pctY = (v: number) => H - (v / 100) * (H - 14) - 4;

  // Draw plan S-Curve (blue)
  const cumArr = weekCum.value;
  if (cumArr.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2;
    let started = false;
    cumArr.forEach((v, i) => {
      if (i >= weeks.value.length) return;
      const x = (i + 0.5) * LAYOUT.COL_W;
      const y = pctY(v);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Plan dots
    cumArr.forEach((v, i) => {
      if (i >= weeks.value.length || v === 0) return;
      ctx.fillStyle = '#1565c0';
      ctx.beginPath();
      ctx.arc((i + 0.5) * LAYOUT.COL_W, pctY(v), 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw actual S-Curve (red) — only if there's actual data
  const actualCumArr = actualWeekCum.value;
  const hasActual = actualCumArr.some((v) => v > 0);
  if (hasActual) {
    ctx.beginPath();
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    let started = false;
    actualCumArr.forEach((v, i) => {
      if (i >= weeks.value.length || v === 0) return;
      const x = (i + 0.5) * LAYOUT.COL_W;
      const y = pctY(v);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Actual dots
    actualCumArr.forEach((v, i) => {
      if (i >= weeks.value.length || v === 0) return;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc((i + 0.5) * LAYOUT.COL_W, pctY(v), 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Legend
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 90, 10);
  ctx.lineTo(W - 70, 10);
  ctx.stroke();
  ctx.fillStyle = '#1565c0';
  ctx.font = 'bold 8px Sarabun,sans-serif';
  ctx.fillText('แผน', W - 68, 13);

  if (hasActual) {
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - 90, 22);
    ctx.lineTo(W - 70, 22);
    ctx.stroke();
    ctx.fillStyle = '#e53935';
    ctx.fillText('จริง', W - 68, 25);
  }
};

// ============================================================
// SCROLL SYNC
// ============================================================
let syncLock = false;

const onLeftScroll = (): void => {
  if (syncLock) return;
  syncLock = true;
  if (rightScroll.value && leftScroll.value) {
    rightScroll.value.scrollTop = leftScroll.value.scrollTop;
  }
  syncLock = false;
};

const onRightScroll = (): void => {
  if (syncLock) return;
  syncLock = true;
  if (leftScroll.value && rightScroll.value) {
    leftScroll.value.scrollTop = rightScroll.value.scrollTop;
  }
  if (timelineHeader.value && rightScroll.value) {
    timelineHeader.value.scrollLeft = rightScroll.value.scrollLeft;
  }
  syncLock = false;
};

// ============================================================
// TOOLTIP
// ============================================================
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  name: '',
  start: '',
  end: '',
  dur: 0,
  pct: 0,
  cost: 0,
  actualPct: 0,
});

const showTooltip = (e: MouseEvent, task: Task): void => {
  const progress = getTaskProgress(task.id);
  tooltip.value = {
    visible: true,
    x: e.clientX + 12,
    y: e.clientY - 8,
    name: task.name,
    start: formatDate(computedTaskStart(task)),
    end: formatDate(computedTaskEnd(task)),
    dur: getWorkingDaysBetween(computedTaskStart(task), computedTaskEnd(task)),
    pct: computedTaskPct(task),
    cost: computedTaskCost(task),
    actualPct: progress?.actualPct ?? 0,
  };
};

const hideTooltip = (): void => {
  tooltip.value.visible = false;
};

// ============================================================
// MODAL STATE
// ============================================================
const showModal = ref(false);
const formData = ref<TaskFormData>({
  id: 0,
  pid: 0,
  name: '',
  pct: 0,
  cost: 0,
  start: '',
  end: '',
  type: 'sub',
  p_id: 1, //เริ่มต้นเป็น sub เพื่อให้ฟอร์มแสดงฟิลด์ที่จำเป็นสำหรับงานย่อย

  actualPct: 0,
  actualStart: '',
  actualEnd: '',

  dependsOnId: null,
  dependsOnType: null,
  dependsOnLag: 0,
});

const openModal = (pid: number | null = null, type: 'group' | 'sub' = 'sub'): void => {
  validationErrors.value = [];
  formData.value = {
    pid: pid || 0,
    type,
    pct: 0,
    cost: 0,
    start: projectConfig.startDate,
    end: projectConfig.startDate,
    actualPct: 0,
    actualStart: '',
    actualEnd: '',
    dependsOnId: null,
    dependsOnType: null,
    dependsOnLag: 0,
  };
  showModal.value = true;
};

const editTask = (task: Task): void => {
  validationErrors.value = [];
  const progress = getTaskProgress(task.id);
  const dep = taskDependencies.value.find((d) => d.toTaskId === task.id);
  formData.value = {
    ...task,
    actualPct: progress?.actualPct ?? 0,
    actualStart: progress?.actualStart ?? '',
    actualEnd: progress?.actualEnd ?? '',
    dependsOnId: dep?.fromTaskId ?? null,
    dependsOnType: dep?.type ?? null,
    dependsOnLag: dep?.lagDays ?? 0,
  };
  showModal.value = true;
};

const closeModal = (): void => {
  showModal.value = false;
  validationErrors.value = [];
};
//Promise<void> เพื่อให้ฟังก์ชัน saveTask สามารถทำงานแบบอะซิงโครนัสได้ และสามารถใช้ await ภายในฟังก์ชันนี้ได้
const saveTask = async (): Promise<void> => {
  //เรียกใช้ฟังก์ชัน validateTaskForm เพื่อตรวจสอบความถูกต้องของข้อมูลใน formData.value และเก็บข้อผิดพลาดที่พบในตัวแปร errors
  const errors = validateTaskForm(formData.value);
  if (errors.length > 0) {
    validationErrors.value = errors;
    return;
  }
  //สร้างอ็อบเจ็กต์ taskData จากข้อมูลใน formData.value โดยกำหนดค่าเริ่มต้นสำหรับ id, pid, name, pct, cost, start, end และ type
  const taskData: Task = {
    id: formData.value.id || nextId++,
    pid: formData.value.pid ?? 0, //เชื่อมโยงกับงานกลุ่ม (group) หากเป็นงานย่อย (sub) หรือกำหนดเป็น 0 หากไม่มี
    p_id: idForm.value ?? 0, //อิงตัวโปรเจคหลัก
    name: formData.value.name!.trim(),
    pct: formData.value.pct ?? 0,
    cost: formData.value.cost ?? 0,
    start: formData.value.start!,
    end: formData.value.end!,
    type: formData.value.type ?? 'sub',
  };

  try {
    await saveTaskToAPI(taskData);

    // Optimistic update
    // if (formData.value.id) {
    //   const idx = tasks.value.findIndex((t) => t.id === formData.value.id);
    //   if (idx !== -1) tasks.value[idx] = taskData;
    // } else {
    //   tasks.value.push(taskData);
    // }

    // หลังจากบันทึกงานแล้ว ให้ตรวจสอบว่ามีการกรอกข้อมูลความคืบหน้าจริงหรือไม่ (actualPct > 0) ถ้ามีให้บันทึกข้อมูลความคืบหน้าใน taskProgressMap โดยใช้ taskId เป็นกุญแจ และเก็บข้อมูล actualPct, actualStart, และ actualEnd ลงในแผนที่นั้น
    // if ((formData.value.actualPct ?? 0) > 0) {
    //   taskProgressMap.value.set(taskData.id, {
    //     taskId: taskData.id,
    //     actualPct: formData.value.actualPct ?? 0,
    //     actualStart: formData.value.actualStart ?? taskData.start,
    //     actualEnd: formData.value.actualEnd ?? taskData.end,
    //   });
    // }

    // // หลังจากบันทึกงานแล้ว ให้ตรวจสอบว่ามีการกรอกข้อมูลการขึ้นต่อกันของงานหรือไม่ (dependsOnId และ dependsOnType) ถ้ามีให้สร้างอ็อบเจ็กต์ TaskDependency และบันทึกลงใน taskDependencies โดยเชื่อมโยงจาก dependsOnId ไปยัง taskData.id พร้อมกับประเภทของความสัมพันธ์และระยะเวลาหน่วง (lagDays) ที่กำหนดไว้
    // if (formData.value.dependsOnId && formData.value.dependsOnType) {
    //   const existingIdx = taskDependencies.value.findIndex((d) => d.toTaskId === taskData.id);
    //   const dep: TaskDependency = {
    //     id: existingIdx >= 0 ? taskDependencies.value[existingIdx]!.id : Date.now(),
    //     fromTaskId: formData.value.dependsOnId,
    //     toTaskId: taskData.id,
    //     type: formData.value.dependsOnType as 'FS' | 'SS' | 'FF',
    //     lagDays: formData.value.dependsOnLag ?? 0,
    //   };
    //   if (existingIdx >= 0) taskDependencies.value[existingIdx] = dep;
    //   else taskDependencies.value.push(dep);
    // }
    await fetchProject();
    closeModal();
  } catch {
    // error already set in apiState
  }
};

const handleDeleteTask = async (id: number): Promise<void> => {
  if (!confirm('ยืนยันลบรายการนี้? (งานย่อยทั้งหมดจะถูกลบด้วย)')) return;
  try {
    await deleteTaskFromAPI(id);
    // tasks.value = tasks.value.filter((t) => t.id !== id && t.pid !== id);
    // taskProgressMap.value.delete(id);
    // taskDependencies.value = taskDependencies.value.filter(
    //   (d) => d.fromTaskId !== id && d.toTaskId !== id,
    // );
    closeModal();
  } catch {
    // error already set in apiState
  }
};

// ============================================================
// EXPORT SYSTEM
// ============================================================
const exportCSV = (): void => {
  let csv =
    '\uFEFFลำดับ,รายการ,ประเภท,% มูลค่า,มูลค่า (บาท),วันเริ่ม,วันสิ้นสุด,วันทำงาน,% จริง,Variance\n';
  sortedTasks.value.forEach((t, i) => {
    const pct = computedTaskPct(t);
    const cost = computedTaskCost(t);
    const start = computedTaskStart(t);
    const end = computedTaskEnd(t);
    const workDays = getWorkingDaysBetween(start, end);
    const progress = getTaskProgress(t.id);
    const actualPct = progress?.actualPct ?? 0;
    const variance = actualPct - pct;
    csv += `${i + 1},"${t.name}",${t.type},${pct},${cost},${start},${end},${workDays},${actualPct},${variance}\n`;
  });
  // Summary row
  const s = projectSummary.value;
  csv += `\n"รวมทั้งโครงการ",,,"${s.totalPct.toFixed(2)}%","${s.totalCostFormatted}","${s.start}","${s.end}","${s.totalDuration}","${s.actualPct.toFixed(2)}%","${s.scheduleVariance.toFixed(2)}%"\n`;

  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'gantt_thammasat.csv';
  a.click();
};

const exportExcel = (): void => {
  // Placeholder — in production, use SheetJS (xlsx) library
  console.log('Export Excel — TODO: implement with SheetJS');
  alert('Export Excel: โปรด integrate SheetJS library (npm install xlsx)');
};

const printPage = (): void => window.print();

// ============================================================
// REFS
// ============================================================
const leftScroll = ref<HTMLElement | null>(null);
const rightScroll = ref<HTMLElement | null>(null);
const rightOuter = ref<HTMLElement | null>(null);
const timelineHeader = ref<HTMLElement | null>(null);
const ganttCanvas = ref<HTMLCanvasElement | null>(null);
const scurveCanvas = ref<HTMLCanvasElement | null>(null);
const mainContainer = ref<HTMLElement | null>(null);

// ============================================================
// LIFECYCLE — watch + redraw on any data change
// ============================================================
const redraw = async (): Promise<void> => {
  await nextTick();
  scheduleRedraw();
};

// Reactivity: watch ALL relevant state changes
watch(
  [
    () => sortedTasks.value,
    () => weekCum.value,
    () => actualWeekCum.value,
    () => dynamicWdays.value,
    () => totalW.value,
    () => totalBodyH.value,
  ],
  redraw,
  { deep: false },
);

onMounted(async () => {
  await fetchProject();
  await redraw();
});
</script>

<style scoped>
/* ============================================================
   FONT
============================================================ */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

.gantt-page {
  font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
  font-size: 11px;
  background: #eceff1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

/* ============================================================
   HEADER
============================================================ */
.gp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px;
  background: linear-gradient(90deg, #0d47a1 0%, #1976d2 100%);
  color: #fff;
  flex-shrink: 0;
  min-height: 44px;
  gap: 10px;
}
.gp-header-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.gp-title-main {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gp-title-sub {
  font-size: 11px;
  opacity: 0.9;
}
.gp-title-meta {
  font-size: 9px;
  opacity: 0.75;
}
.gp-header-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}
.gp-loading-badge {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}
.gp-error-badge {
  font-size: 10px;
  background: #e53935;
  padding: 2px 8px;
  border-radius: 10px;
  cursor: pointer;
}

.gp-btn {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: background 0.15s;
}
.gp-btn-white {
  background: #fff;
  color: #1565c0;
}
.gp-btn-outline {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.gp-btn-outline:hover {
  background: rgba(255, 255, 255, 0.3);
}
.gp-btn-primary {
  background: #1565c0;
  color: #fff;
  border-color: #1565c0;
}
.gp-btn-danger {
  background: #c62828;
  color: #fff;
  border-color: #c62828;
}
.gp-btn-cancel {
  background: #f5f5f5;
  color: #333;
  border-color: #ccc;
}

/* ============================================================
   MAIN LAYOUT
============================================================ */
.gp-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-top: 2px solid #1565c0;
}

/* ============================================================
   LEFT PANEL
============================================================ */
.gp-left {
  display: flex;
  flex-direction: column;
  border-right: 2px solid #1565c0;
  background: #fff;
  flex-shrink: 0;
}
.gp-left-header {
  display: flex;
  align-items: stretch;
  background: linear-gradient(180deg, #1565c0, #1976d2);
  color: #fff;
  font-weight: 700;
  font-size: 10px;
  flex-shrink: 0;
  border-bottom: 2px solid #0d47a1;
}
.glh {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 4px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  line-height: 1.3;
}
.glh-no {
  width: 28px;
  flex-shrink: 0;
}
.glh-name {
  flex: 1;
  justify-content: flex-start;
  padding-left: 6px;
}
.glh-pct {
  width: 42px;
  flex-shrink: 0;
}
.glh-cost {
  width: 90px;
  flex-shrink: 0;
}
.glh-start {
  width: 50px;
  flex-shrink: 0;
}
.glh-end {
  width: 50px;
  flex-shrink: 0;
}
.glh-dur {
  width: 30px;
  flex-shrink: 0;
}
.glh-act {
  width: 40px;
  flex-shrink: 0;
  border-right: none;
}

.gp-left-body {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
}
.gp-left-body::-webkit-scrollbar {
  width: 5px;
}
.gp-left-body::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}

.gp-left-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  transition: filter 0.1s;
}
.gp-left-row:hover {
  filter: brightness(0.93);
}
.glr-group {
  background: #e3f2fd;
  font-weight: 700;
}
.glr-sub {
  background: #fff;
}

.glc {
  display: flex;
  align-items: center;
  padding: 0 3px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #ebebeb;
  font-size: 10px;
}
.glc-no {
  width: 28px;
  flex-shrink: 0;
  justify-content: center;
  color: #888;
}
.glc-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.glc-name-sub {
  padding-left: 14px !important;
}
.glc-arrow {
  margin-right: 4px;
  color: #1565c0;
  font-size: 9px;
}
.glc-pct {
  width: 42px;
  flex-shrink: 0;
  justify-content: flex-end;
  color: #1565c0;
  font-weight: 700;
}
.glc-cost {
  width: 90px;
  flex-shrink: 0;
  justify-content: flex-end;
  color: #555;
  font-size: 9px;
}
.glc-date {
  width: 50px;
  flex-shrink: 0;
  justify-content: center;
  color: #555;
  font-size: 9px;
}
.glc-dur {
  width: 30px;
  flex-shrink: 0;
  justify-content: center;
  color: #555;
  font-size: 9px;
}
.glc-act {
  width: 40px;
  flex-shrink: 0;
  gap: 2px;
  justify-content: center;
  border-right: none;
}

.gp-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 3px;
  border-radius: 3px;
  font-size: 11px;
  color: #888;
  line-height: 1;
}
.gp-icon-btn:hover {
  background: #e0e0e0;
  color: #333;
}
.gp-icon-del:hover {
  background: #ffcdd2;
  color: #c62828;
}

/* ============================================================
   SUMMARY SECTION (LEFT)
============================================================ */
.gp-sum-section {
  display: flex;
  flex-direction: column;
}
.gp-sum-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #cfd8dc;
  font-weight: 600;
  font-size: 10px;
}
.gp-sum-total {
  background: #bbdefb;
}
.gp-sum-month {
  background: #e3f2fd;
}
.gp-sum-month-cum {
  background: #e3f2fd;
}
.gp-sum-week {
  background: #e8f5e9;
}
.gp-sum-week-cum {
  background: #c8e6c9;
}
.gp-sum-actual {
  background: #fff8e1;
}
.gp-sum-wday {
  background: #f3e5f5;
}
.gp-sum-wday-cum {
  background: #e1bee7;
}
.gp-sum-scurve-label {
  background: #f0f4ff;
}

.gp-sum-label {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 9.5px;
  font-weight: 700;
  padding-left: 6px;
  color: #1a237e;
}
.gp-sum-val {
  font-weight: 700;
  color: #0d47a1;
}

/* ============================================================
   RIGHT PANEL
============================================================ */
.gp-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.gp-timeline-header {
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(180deg, #e8eaf6, #e3f2fd);
  border-bottom: 2px solid #1565c0;
}
.gp-month-row {
  display: flex;
  border-bottom: 1px solid #90caf9;
}
.gp-month-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid #1565c0;
  font-size: 10px;
  font-weight: 700;
  color: #0d47a1;
  flex-shrink: 0;
  overflow: hidden;
}
.gp-week-row {
  display: flex;
}
.gp-week-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #b0bec5;
  font-size: 8.5px;
  color: #37474f;
  flex-shrink: 0;
}

.gp-gantt-scroll {
  flex: 1;
  overflow: scroll;
}
.gp-gantt-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.gp-gantt-scroll::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}

.gp-gantt-inner {
  position: relative;
}

.gp-canvas-bg {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  pointer-events: none;
}

.gp-bars-layer {
  position: absolute;
  top: 0;
  left: 0;
}
.gp-bar-row {
  position: absolute;
  width: 100%;
}

.gp-bar {
  position: absolute;
  border-radius: 3px;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: filter 0.15s;
  top: 4px;
  height: 18px;
}
.gp-bar:hover {
  filter: brightness(0.85);
}
.gp-bar-group {
  background: linear-gradient(90deg, #1565c0, #1976d2);
  border-radius: 2px;
  height: 14px;
  top: 6px;
}
.gp-bar-sub {
  background: linear-gradient(90deg, #42a5f5, #64b5f6);
  height: 16px;
  top: 5px;
}
.gp-bar-actual {
  background: rgba(229, 57, 53, 0.5);
  border: 1px solid #c62828;
  height: 8px;
  top: 14px;
  border-radius: 2px;
  cursor: default;
  z-index: 5;
}
.gp-bar-label {
  font-size: 8px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* ============================================================
   SUMMARY RIGHT SECTION
============================================================ */
.gp-sum-right {
  position: absolute;
  display: flex;
  flex-direction: column;
}
.gp-sr {
  display: flex;
  flex-shrink: 0;
}
.gp-sr-total {
  background: #bbdefb;
}
.gp-sr-month {
  background: #e3f2fd;
}
.gp-sr-month-cum {
  background: #e3f2fd;
}
.gp-sr-week {
  background: #e8f5e9;
}
.gp-sr-week-cum {
  background: #c8e6c9;
}
.gp-sr-actual {
  background: #fff8e1;
}
.gp-sr-wday {
  background: #f3e5f5;
}
.gp-sr-wday-cum {
  background: #e1bee7;
}
.gp-sr-scurve {
  background: #f0f4ff;
}

.gp-src {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #cfd8dc;
  font-size: 8.5px;
  text-align: center;
  flex-shrink: 0;
  padding: 0 1px;
  white-space: nowrap;
  overflow: hidden;
}
.gp-src-month {
  color: #0d47a1;
  font-weight: 700;
}
.gp-src-month-cum {
  color: #1565c0;
  font-weight: 700;
}
.gp-src-week {
  color: #1b5e20;
  font-weight: 600;
}
.gp-src-week-cum {
  color: #1b5e20;
  font-weight: 700;
}
.gp-src-wday {
  color: #4a148c;
}
.gp-src-wday-cum {
  color: #4a148c;
  font-weight: 700;
}

.gp-scurve-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* ============================================================
   OVERLAY SVG
============================================================ */
.gp-overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
  overflow: visible;
}

/* ============================================================
   FOOTER
============================================================ */
.gp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px;
  background: #e8eaf6;
  border-top: 1px solid #9fa8da;
  flex-shrink: 0;
  font-size: 10px;
  color: #333;
}
.gp-footer-title {
  font-weight: 700;
  margin-right: 8px;
}
.gp-footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.gp-footer-right {
  font-size: 10px;
  color: #555;
}
.gp-footer-item {
  font-size: 10px;
}

/* ============================================================
   TOOLTIP
============================================================ */
.gp-tooltip {
  position: fixed;
  background: #212121;
  color: #fff;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 10px;
  z-index: 999;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  line-height: 1.6;
}
.gp-tt-name {
  font-weight: 700;
  font-size: 11px;
}
.gp-tt-row {
  opacity: 0.85;
}

/* ============================================================
   MODAL
============================================================ */
.gp-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gp-modal {
  background: #fff;
  border-radius: 8px;
  width: 480px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}
.gp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #1565c0, #1976d2);
  color: #fff;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
}
.gp-modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
.gp-modal-body {
  padding: 16px 20px;
}
.gp-modal-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: #fff;
}
.gp-lbl {
  display: block;
  font-size: 10px;
  color: #555;
  margin-top: 10px;
  margin-bottom: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.gp-inp {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 9px;
  font-size: 12px;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.gp-inp:focus {
  outline: none;
  border-color: #1565c0;
  box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.12);
}
.gp-form-row {
  display: flex;
  gap: 10px;
}
.gp-form-row > div {
  flex: 1;
}

.gp-validation-errors {
  background: #ffebee;
  border: 1px solid #e53935;
  border-radius: 4px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.gp-validation-error {
  font-size: 11px;
  color: #c62828;
  margin-bottom: 2px;
}

/* ============================================================
   PRINT
============================================================ */
@media print {
  .gp-header-actions,
  .gp-icon-btn,
  .gp-footer {
    display: none !important;
  }
  .gantt-page {
    height: auto;
    overflow: visible;
  }
  .gp-main {
    overflow: visible;
  }
  .gp-left-body,
  .gp-gantt-scroll {
    overflow: visible;
    height: auto;
  }
  @page {
    size: A3 landscape;
    margin: 8mm;
  }
}
</style>
