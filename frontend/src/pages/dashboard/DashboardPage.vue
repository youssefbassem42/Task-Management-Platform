<template>
  <div class="space-y-8">
    <section class="rounded-[34px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_50px_-30px_rgba(0,37,102,0.55)] backdrop-blur">
        <span class="inline-flex items-center rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-on-primary-fixed">Workspace overview</span>
        <h1 class="mt-4 font-['Sora'] text-4xl font-[700] tracking-[-0.05em] text-on-surface">Here’s what’s moving today.</h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">The dashboard now mirrors the `/stitch` direction with stronger cards, cleaner hierarchy, and clearer progress signals.</p>

        <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article
            v-for="card in statCards"
            :key="card.label"
            class="group relative overflow-hidden rounded-[28px] border border-outline-variant/10 bg-surface-container-low p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-30px_rgba(0,37,102,0.5)]"
          >
            <div class="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl" :class="card.blurClass"></div>
            <div class="relative z-10 flex items-center justify-between">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">{{ card.label }}</p>
                <p class="mt-4 text-4xl font-black tracking-[-0.05em] text-on-surface">{{ card.value }}</p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="card.iconClass">
                <span class="material-symbols-outlined text-[22px]">{{ card.icon }}</span>
              </div>
            </div>
          </article>
        </div>
    </section>

    <div v-if="dashboardStore.isLoading" class="flex justify-center rounded-[28px] border border-white/70 bg-white/70 p-16">
      <AppSpinner size="3rem" />
    </div>

    <template v-else-if="dashboardStore.hasData">
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div class="space-y-6">
          <section class="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_50px_-34px_rgba(0,37,102,0.45)]">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 class="font-['Sora'] text-xl font-[700] tracking-[-0.04em] text-on-surface">Tasks by Priority</h2>
                <p class="mt-1 text-sm text-on-surface-variant">A clearer at-a-glance chart for triaging workload.</p>
              </div>
            </div>
            <VueApexCharts type="bar" height="300" :options="priorityChartOptions" :series="prioritySeries" />
          </section>

          <section class="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_50px_-34px_rgba(0,37,102,0.45)]">
            <div class="mb-6 flex flex-col gap-1">
              <h2 class="font-['Sora'] text-xl font-[700] tracking-[-0.04em] text-on-surface">Task Distribution</h2>
              <p class="text-sm text-on-surface-variant">Overall progress across all active boards.</p>
            </div>

            <div class="flex flex-col gap-8 md:flex-row md:items-center">
              <div class="flex-1 space-y-4">
                <div v-for="item in distributionItems" :key="item.label" class="rounded-2xl bg-surface-container-low p-4">
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <span class="h-3 w-3 rounded-full" :class="item.dotClass"></span>
                      <span class="font-semibold text-on-surface">{{ item.label }}</span>
                    </div>
                    <span class="font-bold text-on-surface-variant">{{ item.percent }}%</span>
                  </div>
                  <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                    <div class="h-full rounded-full" :class="item.barClass" :style="{ width: `${item.percent}%` }"></div>
                  </div>
                </div>
              </div>

              <div class="mx-auto">
                <VueApexCharts type="donut" width="240" :options="donutChartOptions" :series="donutSeries" />
              </div>
            </div>
          </section>
        </div>

        <aside class="rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_50px_-34px_rgba(0,37,102,0.45)]">
          <div class="border-b border-outline-variant/10 px-6 py-5">
            <h2 class="font-['Sora'] text-xl font-[700] tracking-[-0.04em] text-on-surface">My Priorities</h2>
            <p class="mt-1 text-sm text-on-surface-variant">Assigned to you right now.</p>
          </div>

          <div class="flex max-h-[720px] flex-col gap-3 overflow-y-auto p-4">
            <article
              v-for="task in dashboardStore.myTasks"
              :key="task._id"
              class="group rounded-[24px] border border-outline-variant/10 bg-surface-container-low p-4 transition duration-200 hover:border-primary/20 hover:bg-white"
              :class="{ 'opacity-60': task.status === 'DONE' }"
            >
              <div class="mb-3 flex items-start justify-between gap-3">
                <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]" :class="getPriorityClass(task.priority)">
                  {{ task.priority }}
                </span>
                <span class="material-symbols-outlined text-on-surface-variant transition-colors group-hover:text-primary">more_horiz</span>
              </div>

              <h3 class="text-sm font-semibold leading-6 text-on-surface" :class="{ 'line-through': task.status === 'DONE' }">
                {{ task.title }}
              </h3>

              <div class="mt-4 flex items-center justify-between gap-3">
                <div class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-on-surface-variant">
                  <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{{ formatDate(task.dueDate) || 'No date' }}</span>
                </div>
                <img v-if="task.assigneeId?.avatar" :src="task.assigneeId.avatar" class="h-7 w-7 rounded-full border-2 border-white object-cover" />
              </div>
            </article>

            <AppEmptyState v-if="!dashboardStore.myTasks?.length" title="No tasks assigned to you" description="You're all caught up for today." />
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import axiosClient from '@/api/axiosClient'
import AppSpinner from '@/components/shared/AppSpinner.vue'
import AppEmptyState from '@/components/shared/AppEmptyState.vue'
import VueApexCharts from 'vue3-apexcharts'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'

const dashboardStore = ref({
  isLoading: true,
  hasData: false,
  stats: {},
  myTasks: []
})

const statusStats = computed(() => dashboardStore.value.stats?.statusBreakdown || { TODO: 0, IN_PROGRESS: 0, DONE: 0 })
const priorityStats = computed(() => dashboardStore.value.stats?.priorityBreakdown || { LOW: 0, MEDIUM: 0, HIGH: 0 })
const totalTasks = computed(() => dashboardStore.value.stats?.totalTasks || 0)
const statCards = computed(() => [
  {
    label: 'To Do',
    value: statusStats.value.TODO,
    icon: 'radio_button_unchecked',
    iconClass: 'bg-primary-fixed text-on-primary-fixed',
    blurClass: 'bg-primary-fixed'
  },
  {
    label: 'In Progress',
    value: statusStats.value.IN_PROGRESS,
    icon: 'pending',
    iconClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    blurClass: 'bg-tertiary-fixed'
  },
  {
    label: 'Done',
    value: statusStats.value.DONE,
    icon: 'check_circle',
    iconClass: 'bg-secondary-container text-secondary',
    blurClass: 'bg-secondary-fixed'
  }
])
const distributionItems = computed(() => [
  {
    label: 'To Do',
    percent: getPercentage(statusStats.value.TODO),
    dotClass: 'bg-primary-fixed',
    barClass: 'bg-primary'
  },
  {
    label: 'In Progress',
    percent: getPercentage(statusStats.value.IN_PROGRESS),
    dotClass: 'bg-tertiary-fixed',
    barClass: 'bg-[#ffb95f]'
  },
  {
    label: 'Done',
    percent: getPercentage(statusStats.value.DONE),
    dotClass: 'bg-secondary-container',
    barClass: 'bg-secondary'
  }
])

const getPercentage = (count) => {
  if (!totalTasks.value) return 0;
  return Math.round((count / totalTasks.value) * 100);
}

const getPriorityClass = (priority) => {
  if (priority === 'HIGH') return 'text-on-error-container bg-error-container';
  if (priority === 'MEDIUM') return 'text-on-tertiary-fixed-variant bg-tertiary-fixed';
  return 'text-on-surface-variant bg-surface-dim';
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

const fetchDashboardStats = async () => {
  try {
    dashboardStore.value.isLoading = true;
    const response = await axiosClient.get('/boards/dashboard-stats');
    dashboardStore.value.stats = response.stats;
    dashboardStore.value.myTasks = response.myTasks;
    dashboardStore.value.hasData = true;
  } catch (e) {
    console.error('Failed to fetch dashboard stats', e);
  } finally {
    dashboardStore.value.isLoading = false;
  }
}

onMounted(() => {
  fetchDashboardStats()
})

const priorityChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  plotOptions: { bar: { columnWidth: '42%', borderRadius: 8, distributed: true } },
  dataLabels: { enabled: false },
  legend: { show: false },
  colors: ['#b4c5ff', '#ffddb8', '#96f7b2'],
  xaxis: {
    categories: ['Low', 'Medium', 'High'],
    labels: { style: { colors: '#737686', fontSize: '11px', fontWeight: 700, cssClass: 'uppercase' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { show: false },
  grid: { show: false },
  tooltip: { theme: 'light' }
}))

const prioritySeries = computed(() => [{
  name: 'Tasks',
  data: [priorityStats.value.LOW, priorityStats.value.MEDIUM, priorityStats.value.HIGH]
}])

const donutChartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['To Do', 'In Progress', 'Done'],
  colors: ['#dbe1ff', '#ffddb8', '#93f4af'],
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '65%' } } },
  stroke: { show: false },
  legend: { show: false },
  tooltip: { theme: 'light' }
}))

const donutSeries = computed(() => [
  statusStats.value.TODO,
  statusStats.value.IN_PROGRESS,
  statusStats.value.DONE
])
</script>
