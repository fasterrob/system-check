<template>
  <v-container>
    <!-- Date Range Picker (Outside the Card) -->
    <v-row justify="end" class="mb-3">
      <v-col cols="3">
        <v-menu v-model="startDatePicker" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="formattedStartDate"
              label="Start Date"
              prepend-inner-icon="mdi-calendar"
              readonly
              v-bind="props"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="startDate"
            @update:modelValue="updateFormattedDate"
          ></v-date-picker>
        </v-menu>
      </v-col>

      <v-col cols="3">
        <v-menu v-model="endDatePicker" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="formattedEndDate"
              label="End Date"
              prepend-inner-icon="mdi-calendar"
              readonly
              v-bind="props"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="endDate"
            @update:modelValue="updateFormattedDate"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>

    <v-card>
      <v-tabs v-model="tab">
        <v-tab value="total">Total Bandwidth</v-tab>
        <v-tab value="sent">Sent Bandwidth</v-tab>
        <v-tab value="receive">Received Bandwidth</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Total Bandwidth -->
        <v-window-item value="total">
          <v-card class="pa-4">
            <v-card-title>Total Bandwidth Usage</v-card-title>
            <v-card-text>
              <canvas ref="totalChart"></canvas>
            </v-card-text>
            <v-data-table
              :headers="totalHeaders"
              :items="totalData"
            ></v-data-table>
          </v-card>
        </v-window-item>

        <!-- Sent Bandwidth -->
        <v-window-item value="sent">
          <v-card class="pa-4">
            <v-card-title>Sent Bandwidth Usage</v-card-title>
            <v-card-text>
              <canvas ref="sentChart"></canvas>
            </v-card-text>
            <v-data-table
              :headers="sentHeaders"
              :items="sentData"
            ></v-data-table>
          </v-card>
        </v-window-item>

        <!-- Received Bandwidth -->
        <v-window-item value="receive">
          <v-card class="pa-4">
            <v-card-title>Received Bandwidth Usage</v-card-title>
            <v-card-text>
              <canvas ref="receiveChart"></canvas>
            </v-card-text>
            <v-data-table
              :headers="receiveHeaders"
              :items="receiveData"
            ></v-data-table>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/plugins/axios';
import { Chart } from 'chart.js/auto';

export default {
  data() {
    return {
      tab: 'total',
      startDate: new Date('2024-02-01'), // Store as Date object
      endDate: new Date('2024-02-29'), // Store as Date object
      formattedStartDate: '01-FEB-24',
      formattedEndDate: '29-FEB-24',
      startDatePicker: false,
      endDatePicker: false,
      totalHeaders: [
        { title: 'Date', key: 'l_date' },
        { title: 'Time', key: 'l_time' },
        { title: 'Usage (MB)', key: 'total_bandwidth' },
      ],
      totalData: [],
      sentHeaders: [
        { title: 'Date', key: 'l_date' },
        { title: 'Time', key: 'l_time' },
        { title: 'Sent (MB)', key: 'sent_bandwidth' },
      ],
      sentData: [],
      receiveHeaders: [
        { title: 'Date', key: 'l_date' },
        { title: 'Time', key: 'l_time' },
        { title: 'Received (MB)', key: 'receive_bandwidth' },
      ],
      receiveData: [],
      totalChartInstance: null,
      sentChartInstance: null,
      receiveChartInstance: null,
    };
  },
  watch: {
    tab(newTab) {
      this.fetchData(newTab);
    },
  },
  methods: {
    updateFormattedDate() {
      this.formattedStartDate = this.formatDate(this.startDate);
      this.formattedEndDate = this.formatDate(this.endDate);
      this.fetchData(this.tab);
    },
    formatDate(date) {
      if (!(date instanceof Date)) return ''; // Ensure valid date object
      const day = String(date.getDate()).padStart(2, '0');
      const month = date
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase(); // Convert to MON
      const year = date.getFullYear().toString().slice(-2); // Extract last two digits of year
      return `${day}-${month}-${year}`;
    },
    async fetchData(type) {
      console.log(
        `Fetching data for ${type} from ${this.formattedStartDate} to ${this.formattedEndDate}...`,
      );
      try {
        let response;

        if (type === 'total') {
          response = await api.get('/total-bandwidth', {
            params: {
              start_date: this.formattedStartDate,
              end_date: this.formattedEndDate,
            },
          });
          this.totalData = response.data.site_name;
          this.renderChart(
            'totalChart',
            'Total Bandwidth (MB)',
            this.totalData,
            'total_bandwidth',
          );
        } else if (type === 'sent') {
          response = await api.get('/sent-bandwidth', {
            params: {
              start_date: this.formattedStartDate,
              end_date: this.formattedEndDate,
            },
          });
          this.sentData = response.data.site_name;
          this.renderChart(
            'sentChart',
            'Sent Bandwidth (MB)',
            this.sentData,
            'sent_bandwidth',
          );
        } else if (type === 'receive') {
          response = await api.get('/receive-bandwidth', {
            params: {
              start_date: this.formattedStartDate,
              end_date: this.formattedEndDate,
            },
          });
          this.receiveData = response.data.site_name;
          this.renderChart(
            'receiveChart',
            'Received Bandwidth (MB)',
            this.receiveData,
            'receive_bandwidth',
          );
        }
      } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
      }
    },
    renderChart(ref, title, data, valueKey) {
      if (!this.$refs[ref]) return;

      const chartInstances = {
        totalChart: 'totalChartInstance',
        sentChart: 'sentChartInstance',
        receiveChart: 'receiveChartInstance',
      };

      if (this[chartInstances[ref]]) {
        this[chartInstances[ref]].destroy();
      }

      this[chartInstances[ref]] = new Chart(this.$refs[ref], {
        type: 'line',
        data: {
          labels: data.map((d) => d.l_time),
          datasets: [
            {
              label: title,
              data: data.map((d) => d[valueKey]),
              borderColor: 'blue',
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { title: { display: true, text: title }, min: 0 },
          },
        },
      });
    },
  },
  mounted() {
    this.fetchData(this.tab);
  },
};
</script>
