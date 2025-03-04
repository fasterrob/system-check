<template>
    <v-container>
      <v-row justify="end" class="mb-3">
        <!-- Search Bar -->
        <v-col cols="12" md="3" class="d-flex align-end">
          <v-text-field
            v-model="search"
            label="Search"
            variant="outlined"
            append-inner-icon="mdi-magnify"
            clearable
            dense
          ></v-text-field>
        </v-col>

        <!-- Date Range Picker -->
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
        <v-window v-model="tab">
          <v-window-item value="total">
            <v-card class="pa-4">
              <v-card-title>Threat</v-card-title>
              <v-data-table
                :headers="deniedHeader"
                :items="deniedDataTable"
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
        deniedData: [],
        deniedDataTable: [],
        deniedHeader: [
          { title: 'Threat Level', key: 'L_DATE' },
          { title: 'Report Type', key: 'REMIP' },
          { title: 'Counts', key: 'LOGDESC' },
        ],
      };
    },
    methods: {
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
          let response = await api.get(`/firewall/${type}-`, {
            params: {
              start_date: this.formattedStartDate,
              end_date: this.formattedEndDate,
            },
          });
  
          let rawData = response.data.site_name;
          
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
};
  </script>
  