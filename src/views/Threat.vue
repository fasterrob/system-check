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
          <v-text-field
            v-model="startDate"
            label="Start Date"
            type="date"
            outlined
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            v-model="endDate"
            label="End Date"
            type="date"
            @keyup.enter="fetchData"
            outlined
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- Antivirus Table -->
      <v-card elevation="2" class="pa-5">
        <v-card-title>Threat</v-card-title>
        <v-data-table
          :headers="threatHeader"
          :items="threatDataTable"
          :items-per-page="10"
          class="elevation-1"
          density="compact"
          hide-default-footer
        >
        </v-data-table>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import api from '@/plugins/axios';
  import { ref, onMounted } from 'vue';
  
  export default {
    setup() {
      const search_input = ref('');
      const startDate = ref(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
      );
      const endDate = ref(new Date().toISOString().split('T')[0]);
      const threatDataTable = ref([]);
      const threatHeader = ref([
        { title: 'Report Type', key: 'AUDITREPORTTYPE' },
        { title: 'Audit Score', key: 'AUDITSCORE' },
        { title: 'Critical', key: 'CRITICALCOUNT' },
        { title: 'High', key: 'HIGHCOUNT' },
        { title: 'Medium', key: 'MEDIUMCOUNT' },
        { title: 'Low', key: 'LOWCOUNT' },
      ]);
  
      const fetchData = async () => {
        try {
          let response = await api.get(`/firewall/threat`, {
            params: {
              start_date: startDate.value,
              end_date: endDate.value,
              search_input: search_input.value,
            },
          });
          threatDataTable.value = response.data.site_name;
        } catch (error) {
          console.error(`Error fetching denied access data:`, error);
        }
      };
  
      return {
        search_input,
        startDate,
        endDate,
        threatDataTable,
        threatHeader,
        fetchData,
      };
    },
  };
  </script>
  
  <style scoped>
  .v-container {
    max-width: 1200px;
    margin: auto;
  }
  </style>
  