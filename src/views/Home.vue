<template>
  <v-container>
    <v-card>
      <v-card-title>Dashboard</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          label="Select Site"
          variant="outlined"
        ></v-select>

        <v-row class="mt-3">
          <v-col cols="6">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              @keyup.enter="fetchData"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              color="warning"
              :disabled="!selectedTable || !startDate || !endDate"
              @click="showDialog = true"
            >
              Generate Report
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              :disabled="!selectedTable || !startDate || !endDate"
              @click="fetchData"
              :loading="loading"
            >
              Search Data
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="selectedTable && startDate && endDate && !error"
          type="info"
          class="mt-3"
        >
          Selected Site: <strong>{{ selectedTable }}</strong> <br />
          Date Range: <strong>{{ startDate }}</strong> to
          <strong>{{ endDate }}</strong>
        </v-alert>
        <v-alert v-if="error" type="error" class="mt-3">
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-card v-show="instanceInfoData.length > 0" class="mt-5">
      <v-row class="mt-2">
        <v-col cols="6">
          <v-card-title>Database and Instance Information</v-card-title>
          <v-table density="compact" class="custom-table">
            <tbody>
              <tr v-for="(item, index) in instanceInfoData" :key="index">
                <td class="label">{{ item.label }}</td>
                <td class="value">{{ item.value }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col cols="6">
          <v-card-title>SGA Information</v-card-title>
          <v-table density="compact" class="custom-table">
            <tbody>
              <tr v-for="(item, index) in sgaData" :key="index">
                <td class="label">{{ item.label }}</td>
                <td class="value">{{ item.value }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-card-title>
            Processes
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn size="x-small" variant="plain" icon v-bind="props">
                  <v-icon color="grey-lighten-1">mdi-tooltip</v-icon>
                </v-btn>
              </template>
              <span>{{ processes_tooltip }}</span>
            </v-tooltip>
          </v-card-title>
          <v-table density="compact" class="custom-table">
            <tbody>
              <tr v-for="(item, index) in processData" :key="index">
                <td class="label">{{ item.label }}</td>
                <td class="value">{{ item.value }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-card-title>
            Buffer Cache Hit Ratio
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-btn size="x-small" variant="plain" icon v-bind="props">
                  <v-icon color="grey-lighten-1">mdi-tooltip</v-icon>
                </v-btn>
              </template>
              <span>{{ buffer_tooltip }}</span>
            </v-tooltip>
          </v-card-title>
          <v-table density="compact" class="custom-table">
            <tbody>
              <tr v-for="(item, index) in bufferData" :key="index">
                <td class="label">{{ item.label }}</td>
                <td class="value">{{ item.value }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-show="cpuData.length > 0" class="mt-5">
      <v-card-title>CPU Usage</v-card-title>
      <v-card-text class="pb-0">
        <canvas ref="cpuChart"></canvas>
      </v-card-text>
      <v-card-text class="pt-0">
        <v-data-table
          :headers="headersCpuSummary"
          :items="cpuSummary"
          class="elevation-1"
          hide-default-footer
        >
          <template v-slot:item.average="{ item }">
            {{ item.average.toFixed(2) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card v-show="memoryData.length > 0" class="mt-5">
      <v-card-title>Memory Usage</v-card-title>
      <v-card-text>
        <canvas ref="memoryChart"></canvas>
      </v-card-text>
    </v-card>

    <v-card v-show="fsData.length > 0" class="mt-5">
      <v-card-title>Filesystem Usage ({{ fsData[0]?.date }})</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="fsHeaders"
          :items="fsData"
          item-value="filesystem"
          density="compact"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.usepercent >= 90 ? 'success' : 'error'" dark>
              {{ item.usepercent >= 90 ? 'High Usage' : 'Normal' }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card v-show="tbData.length > 0" class="mt-5">
      <v-card-title
        >Tablespace Usage ({{ tbData[0]?.datetime_log }})</v-card-title
      >
      <v-card-text>
        <v-data-table
          :headers="tbHeaders"
          :items="tbData"
          item-value="name"
          class="elevation-1"
          density="compact"
          :items-per-page="-1"
        >
          <template v-slot:item.statusforRead="{ item }">
            <v-chip
              :color="
                item.free_percent <= 1
                  ? 'red'
                  : item.free_percent <= 10
                    ? 'orange'
                    : 'green'
              "
              dark
            >
              {{
                item.free_percent <= 1
                  ? 'Critical'
                  : item.free_percent <= 10
                    ? 'Waning'
                    : 'Normal'
              }}
            </v-chip>
          </template>
        </v-data-table>
        <v-data-table
          :headers="headersTbSummary"
          :items="tbSummary"
          class="elevation-1"
          hide-default-footer
        >
          <template v-slot:item.mb="{ item }">
            {{ item.mb.toLocaleString() }} MB
          </template>
          <template v-slot:item.gb="{ item }">{{ item.gb }} GB</template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-card v-show="concurrent.length > 0" class="mt-5">
      <v-card-title>Concurrent</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="concurrentheaders"
          :items="concurrent"
          items-per-page="20"
          density="compact"
          class="elevation-1"
        ></v-data-table>
      </v-card-text>
    </v-card>

    <v-card v-show="starupData.length > 0" class="mt-5">
      <v-card-title>Startup Time</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="starupHeaders"
          :items="starupData"
          item-value="datetime_log"
          class="elevation-1"
        ></v-data-table>
      </v-card-text>
    </v-card>

    <DialogInput v-model:show="showDialog" @submit="handleSubmit" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/plugins/axios';
import Chart from 'chart.js/auto';
import DialogInput from '@/components/DialogInput.vue';

// Reactive references
const showDialog = ref(false);
const loading = ref(false);
const error = ref('');
const selectedTable = ref('');
const startDate = ref('');
const endDate = ref('');
const tableNames = ref([]);
const instanceInfoData = ref([]);
const sgaData = ref([]);
const processData = ref([]);
const bufferData = ref([]);
const concurrent = ref([]);
const cpuData = ref([]);
const cpuSummary = ref([]);
const memoryData = ref([]);
const fsData = ref([]);
const tbData = ref([]);
const tbSummary = ref([]);
const starupData = ref([]);
const cpuChartInstance = ref(null);
const memoryChartInstance = ref(null);
const cpuChart = ref(null);
const memoryChart = ref(null);

// Tooltip data
const processes_tooltip =
  'ถ้าค่าของ Current No. of Processes ที่ได้มีค่ามากกว่า 90% ของ Max No. of Processes ควรจะพิจารณาปรับเพิ่ม Max No. of Processes ที่กำหนดไว้ มิเช่นนั้นจะทำให้เกิดปัญหา Session ไม่สามารถ Connect Database ได้';
const buffer_tooltip =
  'ค่า Buffer Cache Hit Ratio จะเกี่ยวพันกับ RDBMS Size, SGA Size และประเภทของ Application ที่ใช้งานอยู่ ในกรณีที่เป็น OLTP ค่าของ Buffer Cache Hit Ratio ที่ได้ไม่ควรต่ำกว่า 95% ';

// Table headers
const headersCpuSummary = [
  { title: 'Type', align: 'start', key: 'type' },
  { title: 'Min (%)', key: 'min' },
  { title: 'Max (%)', key: 'max' },
  { title: 'Average (%)', key: 'average' },
];

const fsHeaders = [
  { title: 'Filesystem', key: 'filesystem' },
  { title: 'Used (MB)', key: 'used' },
  { title: 'Available (MB)', key: 'available' },
  {
    title: '% Used',
    key: 'usepercent',
  },
  {
    title: 'Status',
    key: 'status',
  },
];

const tbHeaders = [
  { title: 'Status', key: 'status' },
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Extent Management', key: 'extent_management' },
  { title: 'Size (MB)', key: 'size_mb' },
  { title: 'Free (MB)', key: 'free_mb' },
  {
    title: 'Free (%)',
    key: 'free_percent',
  },
  {
    title: 'Status',
    key: 'statusforRead',
  },
];

const headersTbSummary = [
  { title: 'Metric', key: 'metric' },
  { title: 'Value (MB)', key: 'mb' },
  { title: 'Value (GB)', key: 'gb' },
];

const starupHeaders = [
  { title: 'Date', key: 'datetime_log' },
  { title: 'Instance', key: 'instance' },
  { title: 'Startup Time (s)', key: 'startup_time' },
];

const concurrentheaders = [
  { title: 'Program Name', key: 'USER_CONCURRENT_PROGRAM_NAME' },
  { title: 'Min Running', key: 'MIN_RUNNING' },
  { title: 'Max Running', key: 'MAX_RUNNING' },
  { title: 'Avg Running', key: 'AVG_RUNNING' },
  { title: 'Min Waiting', key: 'MIN_WAITING' },
  { title: 'Max Waiting', key: 'MAX_WAITING' },
  { title: 'Avg Waiting', key: 'AVG_WAITING' },
];

// Methods
const fetchSite = async () => {
  loading.value = true;
  try {
    const res = await api.get('/get/table-name');
    tableNames.value = res.data.site_name.map((item) => item[1]);
  } catch (e) {
    console.error('Fetch failed:', e);
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/dashboard/dashboard-usage', {
      params: {
        site: selectedTable.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
    });

    // Clear previous chart instances
    if (cpuChartInstance.value) {
      cpuChartInstance.value.destroy();
      cpuChartInstance.value = null;
    }
    if (memoryChartInstance.value) {
      memoryChartInstance.value.destroy();
      memoryChartInstance.value = null;
    }

    // Check if response data is empty
    if (!response.data || Object.keys(response.data).length === 0) {
      resetData();
      error.value = 'No data found for the selected site and date range';
      return;
    }

    const instanceInfo = response.data.instance_info[0];

    instanceInfoData.value = [
      { label: 'DB Name', value: instanceInfo[2] },
      { label: 'Global Name', value: instanceInfo[3] },
      { label: 'DB Version', value: instanceInfo[4] },
      { label: 'Host Name', value: instanceInfo[5] },
      { label: 'Instance Name', value: instanceInfo[6] },
      {
        label: 'Instance Start Time',
        value: new Date(instanceInfo[7]).toDateString(),
      },
      { label: 'Restricted Mode', value: instanceInfo[8] },
      {
        label: 'Archive Log Mode',
        value: instanceInfo[9],
      },
      { label: 'Read Only Mode', value: instanceInfo[10] },
    ];

    const sga = response.data.sga_info[0];

    sgaData.value = [
      { label: 'Database Buffers', value: sga[2] },
      { label: 'Fixed Size', value: sga[3] },
      { label: 'Redo Buffers', value: sga[4] },
      { label: 'Variable Size', value: sga[5] },
    ];

    const process = response.data.process_info[0];

    processData.value = [
      { label: 'Current No. of Processes', value: process[2] },
      { label: 'Max No. of Processes', value: process[3] },
    ];

    const buffer = response.data.buffer_cache[0];

    bufferData.value = [
      {
        label: 'Buffer Cache Hit Ratio',
        value: buffer[2],
      },
    ];

    // Process CPU data
    cpuData.value =
      response.data.cpu_usage?.map((item) => ({
        timestamp: item.datetime_log.split(' ')[0],
        user: item.user_avg,
        system: item.system_avg,
        iowait: item.iowait_avg,
      })) || [];

    cpuSummary.value = [
      {
        type: 'User %',
        ...(response.data.cpu_summary?.user_percent || {}),
      },
      {
        type: 'System %',
        ...(response.data.cpu_summary?.system_percent || {}),
      },
      {
        type: 'I/O Wait %',
        ...(response.data.cpu_summary?.iowait_percent || {}),
      },
    ];

    memoryData.value =
      response.data.memory_usage?.map((item) => ({
        timestamp: item.datetime_log.split(' ')[0],
        kbswpfree: item.kbswpfree_max,
        kbswpused: item.kbswpused_max,
        swpused_percent: (item.kbswpused_max / item.kbswpfree_max) * 100,
      })) || [];

    fsData.value =
      response.data.filesystem_comparison?.map((item) => ({
        date: item.entrydate.split(' ')[0],
        filesystem: item.filesystem,
        used: item.used,
        available: item.available,
        usepercent: item.usepercent,
      })) || [];

    tbData.value =
      response.data.tablespace_usage?.map((item) => ({
        datetime_log: item.datetime_log.split(' ')[0],
        status: item.status,
        name: item.name,
        type: item.type,
        extent_management: item.extent_management,
        size_mb: item.size_mb,
        free_mb: item.free_mb,
        free_percent: parseFloat(item.free_percent),
      })) || [];

    tbSummary.value = [
      {
        metric: 'Allocated',
        mb: response.data.tablespace_summary?.total_size || 0,
        gb: (
          (response.data.tablespace_summary?.total_size || 0) / 1024
        ).toFixed(2),
      },
      {
        metric: 'Used',
        mb:
          (response.data.tablespace_summary?.total_size || 0) -
          (response.data.tablespace_summary?.total_free || 0),
        gb: (
          ((response.data.tablespace_summary?.total_size || 0) -
            (response.data.tablespace_summary?.total_free || 0)) /
          1024
        ).toFixed(2),
      },
      {
        metric: 'Used(No UNDO, TEMP)',
        mb:
          (response.data.tablespace_summary?.without_temp_undo_size || 0) -
          (response.data.tablespace_summary?.without_temp_undo_free || 0),
        gb: (
          ((response.data.tablespace_summary?.without_temp_undo_size || 0) -
            (response.data.tablespace_summary?.without_temp_undo_free || 0)) /
          1024
        ).toFixed(2),
      },
    ];

    concurrent.value = response.data.concurrent;

    // If no data, show error and reset all variables
    if (
      cpuData.value.length === 0 &&
      memoryData.value.length === 0 &&
      fsData.value.length === 0 &&
      tbData.value.length === 0
    ) {
      resetData();
      error.value = 'No data found for the selected site and date range';
      return;
    }

    // Render charts only if data exists
    if (cpuData.value.length > 0) renderCPUChart();
    if (memoryData.value.length > 0) renderMemoryChart();
  } catch (error) {
    console.error('Error fetching data:', error);
    error.value = 'An error occurred while fetching data';
  } finally {
    loading.value = false;
  }
};

const renderMemoryChart = () => {
  if (!memoryChart.value) return;
  if (memoryChartInstance.value) {
    memoryChartInstance.value.destroy();
  }
  memoryChartInstance.value = new Chart(memoryChart.value, {
    type: 'line',
    data: {
      labels: memoryData.value.map((d) => d.timestamp),
      datasets: [
        {
          label: 'Swap Used (%)',
          data: memoryData.value.map((d) => d.swpused_percent),
          borderColor: 'red',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'MEMORY USAGE' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'KB' } },
      },
    },
  });
};

const renderCPUChart = () => {
  if (!cpuChart.value) return;
  if (cpuChartInstance.value) {
    cpuChartInstance.value.destroy();
  }
  cpuChartInstance.value = new Chart(cpuChart.value, {
    type: 'line',
    data: {
      labels: cpuData.value.map((d) => d.timestamp),
      datasets: [
        {
          label: 'User (%)',
          data: cpuData.value.map((d) => d.user),
          borderColor: 'blue',
          fill: true,
        },
        {
          label: 'System (%)',
          data: cpuData.value.map((d) => d.system),
          borderColor: 'green',
          fill: true,
        },
        {
          label: 'IO Wait (%)',
          data: cpuData.value.map((d) => d.iowait),
          borderColor: 'red',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'CPU UTILIZATION' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Percentage' } },
      },
    },
  });
};

const downloadReport = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dashboard/generate-report', {
      params: {
        site: selectedTable.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthCheckReport_${selectedTable.value}_${startDate.value}_${endDate.value}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    loading.value = false;
  }
};

const resetData = () => {
  instanceInfoData.value = [];
  sgaData.value = [];
  bufferData.value = [];
  cpuData.value = [];
  cpuSummary.value = [];
  memoryData.value = [];
  fsData.value = [];
  tbData.value = [];
  tbSummary.value = [];
  starupData.value = [];

  // Destroy chart instances if exist
  if (cpuChartInstance.value) {
    cpuChartInstance.value.destroy();
    cpuChartInstance.value = null;
  }
  if (memoryChartInstance.value) {
    memoryChartInstance.value.destroy();
    memoryChartInstance.value = null;
  }
};

const handleSubmit = (data) => {
  console.log('First Name:', data.firstName);
  console.log('Last Name:', data.lastName);
  downloadReport();
};

// Lifecycle hooks
onMounted(() => {
  fetchSite();
});
</script>

<style>
.high-usage {
  color: red !important;
  background-color: red !important;
}

.medium-usage {
  background-color: #fac063 !important;
}

.low-usage {
  background-color: #c3f7c8 !important;
}

.custom-table {
  border: 1px solid #ccc;
  width: 100%;
}

.label {
  background-color: #2196f3;
  font-weight: bold;
  color: white;
  text-align: left;
  width: 200px;
}

.value {
  background-color: #f7f7e7;
  text-align: left;
}
</style>
