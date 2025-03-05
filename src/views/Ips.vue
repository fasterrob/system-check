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

    <!-- IPS Table -->
    <v-card elevation="2">
      <v-card-title>IPS Log</v-card-title>
      <v-data-table
        :headers="ipsHeader"
        :items="ipsDataTable"
        :items-per-page="10"
        class="elevation-1"
        density="compact"
      >
        <template v-slot:item.Severity="{ item }">
          <v-chip :color="getChipColor(item.Severity)" dark>
            {{ item.Severity }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/plugins/axios';
import { ref } from 'vue';

export default {
  setup() {
    const search_input = ref('');
    const startDate = ref(
      new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .split('T')[0],
    );
    const endDate = ref(new Date().toISOString().split('T')[0]);
    const ipsDataTable = ref([]);

    const ipsHeader = ref([
      { title: 'Date', key: 'Date' },
      { title: 'User', key: 'User' },
      { title: 'Source', key: 'Source' },
      { title: 'Destination', key: 'Destination' },
      { title: 'Severity', key: 'Severity' },
      { title: 'Attack ID', key: 'AttackID' },
      { title: 'Incidents', key: 'Counts' },
    ]);

    const fetchData = async () => {
      try {
        let response = await api.get(`/firewall/ips-log`, {
          params: {
            start_date: startDate.value,
            end_date: endDate.value,
            search_input: search_input.value,
          },
        });
        ipsDataTable.value = response.data.site_name;
      } catch (error) {
        console.error(`Error fetching ips log data:`, error);
      }
    };

    const getChipColor = (level) => {
      switch (level) {
        case 'Critical':
          return 'red';
        case 'High':
          return 'orange';
        case 'Medium':
          return '#ebcc02';
        case 'Low':
          return 'green';
        default:
          return 'grey';
      }
    };

    return {
      search_input,
      startDate,
      endDate,
      ipsDataTable,
      ipsHeader,
      fetchData,
      getChipColor,
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
