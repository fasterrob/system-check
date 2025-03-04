<template>
  <v-container>
    <v-row justify="end" class="mb-3">
      <!-- Search Bar -->
      <v-col cols="4" md="3">
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
    <v-alert v-if="startDate && endDate" type="info" class="mt-3">
      Date Range: <strong>{{ startDate }}</strong> to
      <strong>{{ endDate }}</strong>
    </v-alert>

    <!-- Denied Access Table -->
    <v-card elevation="2">
      <v-card-title>Denied Access</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-data-table
          :headers="deniedHeader"
          :items="deniedDataTable"
          :items-per-page="5"
          density="compact"
        ></v-data-table>
      </v-card-text>
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
    const deniedDataTable = ref([]);
    const deniedHeader = ref([
      { title: 'Date', key: 'L_DATE' },
      { title: 'Remote IP', key: 'REMIP' },
      { title: 'Description', key: 'LOGDESC' },
      { title: 'Reason', key: 'REASON' },
      { title: 'Fail Count', key: 'Fail Counts' },
    ]);

    const fetchData = async () => {
      try {
        let response = await api.get(`/firewall/denied-access`, {
          params: {
            start_date: startDate.value,
            end_date: endDate.value,
            search_input: search_input.value,
          },
        });
        deniedDataTable.value = response.data.site_name;
      } catch (error) {
        console.error(`Error fetching denied access data:`, error);
      }
    };

    onMounted(fetchData);

    return {
      search_input,
      startDate,
      endDate,
      deniedDataTable,
      deniedHeader,
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
