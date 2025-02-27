<template>
  <v-container>
    <!-- Date Range Picker -->
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

    <!-- Tabs -->
    <v-card>
      <v-tabs v-model="tab">
        <v-tab value="total">Total Bandwidth</v-tab>
        <v-tab value="sent">Sent Bandwidth</v-tab>
        <v-tab value="receive">Received Bandwidth</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="total">
          <v-card class="pa-4">
            <v-card-title>Total Bandwidth Usage</v-card-title>
            <v-card-text><canvas ref="totalChart"></canvas></v-card-text>
            <v-data-table
              :headers="totalDataHeader"
              :items="totalDataTable"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </v-card>
        </v-window-item>

        <v-window-item value="sent">
          <v-card class="pa-4">
            <v-card-title>Sent Bandwidth Usage</v-card-title>
            <v-card-text><canvas ref="sentChart"></canvas></v-card-text>
            <v-data-table
              :headers="sentDataHeader"
              :items="sentDataTable"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </v-card>
        </v-window-item>

        <v-window-item value="receive">
          <v-card class="pa-4">
            <v-card-title>Received Bandwidth Usage</v-card-title>
            <v-card-text><canvas ref="receiveChart"></canvas></v-card-text>
            <v-data-table
              :headers="receiveDataHeader"
              :items="receiveDataTable"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/plugins/axios';
import Chart from 'chart.js/auto';
import downsamplePlugin from 'chartjs-plugin-downsample';

// Ensure the plugin is correctly registered
if (downsamplePlugin && downsamplePlugin.id) {
  Chart.register(downsamplePlugin);
} else {
  console.warn('Downsample plugin not properly imported');
}

export default {
  data() {
    return {
      tab: 'total',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      formattedStartDate: '01-DEC-24',
      formattedEndDate: '31-DEC-24',
      startDatePicker: false,
      endDatePicker: false,
      totalData: [],
      totalDataTable: [],
      totalDataHeader: [
        { title: 'Date', key: 'L_DATE' },
        { title: 'Time', key: 'L_TIME' },
        { title: 'Total Bandwidth (MB)', key: 'TOTAL_BANDWIDTH' },
      ],
      sentData: [],
      sentDataTable: [],
      sentDataHeader: [
        { title: 'Date', key: 'L_DATE' },
        { title: 'Time', key: 'L_TIME' },
        { title: 'Sent Bandwidth (MB)', key: 'SENT_BANDWIDTH' },
      ],
      receiveData: [],
      receiveDataTable: [],
      receiveDataHeader: [
        { title: 'Date', key: 'L_DATE' },
        { title: 'Time', key: 'L_TIME' },
        { title: 'Received Bandwidth (MB)', key: 'RECEIVE_BANDWIDTH' },
      ],
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
      if (!(date instanceof Date)) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = date
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase();
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    },
    async fetchData(type) {
      console.log(
        `Fetching ${type} data from ${this.formattedStartDate} to ${this.formattedEndDate}...`,
      );
      try {
        let response = await api.get(`/firewall/${type}-bandwidth`, {
          params: {
            start_date: this.formattedStartDate,
            end_date: this.formattedEndDate,
          },
        });

        let rawData = response.data.site_name;

        let groupedData = this.aggregateData(
          rawData,
          'L_DATE',
          type === 'total'
            ? 'TOTAL_BANDWIDTH'
            : type === 'sent'
              ? 'SENT_BANDWIDTH'
              : 'RECEIVE_BANDWIDTH',
        );

        if (type === 'total') {
          this.totalDataTable = rawData;
          this.totalData = groupedData;
          this.renderChart(
            'totalChart',
            'Total Bandwidth (MB)',
            this.totalData,
            'TOTAL_BANDWIDTH',
          );
        } else if (type === 'sent') {
          this.sentDataTable = rawData;
          this.sentData = groupedData;
          this.renderChart(
            'sentChart',
            'Sent Bandwidth (MB)',
            this.sentData,
            'SENT_BANDWIDTH',
          );
        } else if (type === 'receive') {
          this.receiveDataTable = rawData;
          this.receiveData = groupedData;
          this.renderChart(
            'receiveChart',
            'Received Bandwidth (MB)',
            this.receiveData,
            'RECEIVE_BANDWIDTH',
          );
        }
      } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
      }
    },
    aggregateData(data, dateKey, valueKey) {
      let aggregated = {};
      data.forEach((row) => {
        let timestamp = row[dateKey].slice(0, 13);
        if (!aggregated[timestamp]) {
          aggregated[timestamp] = { L_DATE: timestamp, [valueKey]: 0 };
        }
        aggregated[timestamp][valueKey] += parseFloat(row[valueKey]);
      });
      return Object.values(aggregated);
    },
    renderChart(chartRef, label, data, dataKey) {
      if (this[chartRef]) this[chartRef].destroy();

      let ctx = this.$refs[chartRef].getContext('2d');
      this[chartRef] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((d) => d.L_DATE),
          datasets: [
            {
              label,
              data: data.map((d) => d[dataKey]),
              borderColor: 'blue',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            downsample: { enabled: true, threshold: 5000, auto: true },
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
