<template>
  <v-container>
    <v-card>
      <v-card-title>Dashboard</v-card-title>
      <v-card-text>
        <!-- Table Selection Dropdown -->
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          label="Select Table"
          outlined
        ></v-select>

        <!-- Date Range Inputs -->
        <v-row class="mt-3">
          <v-col cols="6">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Search Button -->
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              color="primary"
              :disabled="!selectedTable || !startDate || !endDate"
              @click="fetchMockData"
            >
              Search Data
            </v-btn>
          </v-col>
        </v-row>

        <!-- Display Selected Information -->
        <v-alert
          v-if="selectedTable && startDate && endDate"
          type="info"
          class="mt-3"
        >
          Selected Site: <strong>{{ selectedTable }}</strong> <br />
          Date Range: <strong>{{ startDate }}</strong> to
          <strong>{{ endDate }}</strong>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Charts Section -->
    <v-card class="mt-5">
      <v-card-title>CPU & Memory Usage</v-card-title>
      <v-card-text>
        <canvas ref="cpuChart"></canvas>
        <v-card-text> Min : {{ maxCpu }} </v-card-text>
        <v-card-text> Max : {{ minCpu }} </v-card-text>
        <v-card-text> Average : {{ averageCpu }} </v-card-text>
      </v-card-text>
    </v-card>

    <v-card class="mt-5">
      <v-card-title>Memory Usage</v-card-title>
      <v-card-text>
        <canvas ref="memoryChart"></canvas>
      </v-card-text>
    </v-card>

    <!-- Filesystem Table -->
    <v-card class="mt-5">
      <v-card-title>Filesystem Usage</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="filesystemHeaders"
          :items="filesystemData"
          dense
          :items-per-page="-1"
          hide-default-footer
          class="elevation-1"
        ></v-data-table>
      </v-card-text>
    </v-card>

    <!-- Tablespace Table -->
    <v-card class="mt-5">
      <v-card-title>Database Tablespace Usage</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="tablespaceHeaders"
          :items="tablespaceData"
          dense
          :items-per-page="-1"
          hide-default-footer
          class="elevation-1"
        ></v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      selectedTable: '',
      startDate: '',
      endDate: '',
      tableNames: ['BRLN', 'TYM', 'BURAPA'],
      cpuData: [],
      memoryData: [],
      filesystemData: [],
      tablespaceData: [],
      filesystemHeaders: [
        { title: 'Filesystem', value: 'filesystem' },
        { title: 'Current Usage (%)', value: 'currentUsage' },
        { title: 'Previous Usage (%)', value: 'previousUsage' },
        { title: 'Change (%)', value: 'change' },
      ],
      tablespaceHeaders: [
        { title: 'Tablespace', value: 'tablespace' },
        { title: 'Current Usage (GB)', value: 'currentUsage' },
        { title: 'Previous Usage (GB)', value: 'previousUsage' },
        { title: 'Change (%)', value: 'change' },
      ],
    };
  },
  methods: {
    fetchMockData() {
      console.log(
        'Fetching mock data for:',
        this.selectedTable,
        'Between:',
        this.startDate,
        'and',
        this.endDate,
      );

      const mockTimestamps = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      // Mock CPU Data (User, System, IO Wait)
      this.cpuData = mockTimestamps.map((timestamp) => ({
        timestamp,
        user: Math.random() * 50,
        system: Math.random() * 30,
        iowait: Math.random() * 20,
      }));

      // Mock Memory Data
      this.memoryData = mockTimestamps.map((timestamp) => ({
        timestamp,
        usage: Math.random() * 90,
      }));

      // Mock Filesystem Data (Comparison Between Selected Date & Previous Month)
      this.filesystemData = [
        {
          filesystem: '/dev/sda1',
          currentUsage: (Math.random() * 80).toFixed(2),
          previousUsage: (Math.random() * 75).toFixed(2),
          change: this.calculateChange(),
        },
        {
          filesystem: '/dev/sdb1',
          currentUsage: (Math.random() * 70).toFixed(2),
          previousUsage: (Math.random() * 65).toFixed(2),
          change: this.calculateChange(),
        },
      ];

      // Mock Tablespace Data (Comparison Between Selected Date & Previous Month)
      this.tablespaceData = [
        {
          tablespace: 'TS_DATA_01',
          currentUsage: (Math.random() * 50).toFixed(2),
          previousUsage: (Math.random() * 45).toFixed(2),
          change: this.calculateChange(),
        },
        {
          tablespace: 'TS_INDEX_01',
          currentUsage: (Math.random() * 40).toFixed(2),
          previousUsage: (Math.random() * 35).toFixed(2),
          change: this.calculateChange(),
        },
      ];

      this.renderCharts();
    },

    renderCharts() {
      this.createCpuChart();
      this.createChart(
        this.$refs.memoryChart,
        'Memory Usage (%)',
        this.memoryData,
        'blue',
      );
    },

    createCpuChart() {
      if (!this.$refs.cpuChart) return;
      new Chart(this.$refs.cpuChart, {
        type: 'line',
        data: {
          labels: this.cpuData.map((d) => d.timestamp),
          datasets: [
            {
              label: 'User (%)',
              data: this.cpuData.map((d) => d.user),
              borderColor: 'blue',
              fill: false,
            },
            {
              label: 'System (%)',
              data: this.cpuData.map((d) => d.system),
              borderColor: 'green',
              fill: false,
            },
            {
              label: 'IO Wait (%)',
              data: this.cpuData.map((d) => d.iowait),
              borderColor: 'red',
              fill: false,
            },
          ],
        },
      });
    },

    createChart(canvasRef, label, data, color) {
      if (!canvasRef) return;
      new Chart(canvasRef, {
        type: 'line',
        data: {
          labels: data.map((d) => d.timestamp),
          datasets: [
            {
              label: label,
              data: data.map((d) => d.usage),
              borderColor: color,
              fill: false,
            },
          ],
        },
      });
    },

    calculateChange() {
      const prev = Math.random() * 50;
      const curr = Math.random() * 50;
      const change = (((curr - prev) / prev) * 100).toFixed(2);
      return change > 0 ? `+${change}%` : `${change}%`;
    },
  },
};
</script>
