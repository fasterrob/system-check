<template>
  <v-container>
    <v-row justify="end" class="mb-3">
      <!-- Search Bar -->
      <v-col cols="12" md="3" class="d-flex align-end">
        <v-text-field
          v-model="search_input"
          @keyup.enter="fetchData"
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
      <v-card class="pa-4">
        <v-card-title>Denied Access</v-card-title>
        <v-data-table
          :headers="deniedHeader"
          :items="deniedDataTable"
          :items-per-page="5"
          class="elevation-1"
        ></v-data-table>
      </v-card>
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
      search_ip: '',
      deniedData: [],
      deniedDataTable: [],
      deniedHeader: [
        { title: 'Date', key: 'L_DATE' },
        { title: 'Remote IP', key: 'REMIP' },
        { title: 'Description', key: 'LOGDESC' },
        { title: 'Reason', key: 'REASON' },
        { title: 'Fail Count', key: 'Fail Counts' },
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
    async fetchData() {
      try {
        let response = await api.get(`/firewall/denied-access`, {
          params: {
            start_date: this.formattedStartDate,
            end_date: this.formattedEndDate,
            search_input: this.search_input,
          },
        });

        this.deniedDataTable = response.data.site_name;
        console.log(response.data)
      } catch (error) {
        console.error(`Error fetching denied access data:`, error);
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
  },
};
</script>
