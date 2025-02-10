<template>
  <v-container>
    <v-card>
      <v-card-title>Dashboard</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          label="Select Table"
          outlined
        ></v-select>

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

        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              color="primary"
              :disabled="!selectedTable || !startDate || !endDate"
              @click="fetchData"
            >
              Search Data
            </v-btn>
          </v-col>
        </v-row>

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

    <v-card class="mt-5">
      <v-card-title>CPU Usage</v-card-title>
      <v-card-text>
        <canvas ref="cpuChart"></canvas>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      selectedTable: '',
      startDate: '',
      endDate: '',
      tableNames: ['BRLN', 'TYM', 'BURAPA'],
      cpuData: [],
      cpuChartInstance: null,
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/cpu-usage', {
          params: {
            site: this.selectedTable,
            start_date: this.startDate,
            end_date: this.endDate,
          },
        });
        this.cpuData = response.data.cpu_usage.map((item) => ({
          timestamp: item.datetime_log,
          user: item.user_percent,
          system: item.system_percent,
          iowait: item.iowait_percent,
          idle: item.idle_percent,
        }));
        this.renderCharts();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    renderCharts() {
      if (!this.$refs.cpuChart) return;
      if (this.cpuChartInstance) {
        this.cpuChartInstance.destroy();
      }
      this.cpuChartInstance = new Chart(this.$refs.cpuChart, {
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
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'CPU UTILIZATION',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true,
                },
                mode: 'x',
              },
              pan: {
                enabled: true,
                mode: 'x',
              },
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Value',
              },
              max: 100,
            },
          },
        },
      });
    },
  },
};
</script>
