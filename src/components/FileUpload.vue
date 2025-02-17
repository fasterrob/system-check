<template>
  <v-container>
    <v-card>
      <v-card-title>Upload System Log</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          label="Select Table"
          outlined
        ></v-select>
        <v-text-field
          v-model="selectDate"
          label="Month & Year"
          type="month"
          outlined
        ></v-text-field>
        {{ selectDate + '-01' }}
        <v-file-input
          v-model="file"
          label="Select System Log File (CSV, Excel, Txt, HTML)"
          accept=".csv,.xlsx,.txt,.html"
        ></v-file-input>
        <v-btn :disabled="!file" color="primary" @click="uploadFile"
          >Upload</v-btn
        >
      </v-card-text>
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </v-card>

    <v-alert v-if="message" type="success" class="mt-3">
      {{ message }}
    </v-alert>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      tableNames: [],
      file: null,
      loading: false,
      selectedTable: '',
      message: '',
      selectDate: '',
      selectedYear: new Date().getFullYear(), // Default to the current year
    };
  },
  computed: {
    yearFromSelectDate() {
      return this.selectDate
        ? this.selectDate.split('-')[0]
        : this.selectedYear; // Get the year from selectDate
    },
  },
  mounted() {
    this.fetchSite();
  },
  methods: {
    async fetchSite() {
      this.loading = true;
      try {
        const res = await axios.get('http://127.0.0.1:8000/get/table-name');

        // Convert array of arrays to array of objects
        this.tableNames = res.data.site_name.map((item) => item[1]);
      } catch (e) {
        console.error('Fetch failed:', e);
        this.message = 'Failed to fetch sites.';
      } finally {
        this.loading = false;
      }
    },
    async uploadFile() {
      if (!this.file) return;
      this.loading = true;
      let formData = new FormData();
      formData.append('file', this.file);
      formData.append('table_name', this.selectedTable);
      formData.append('selectDate', this.selectDate + '-01');
      formData.append('year', this.yearFromSelectDate);
      console.log(formData);
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/upload',
          formData,
        );
        this.message = response.data.message;
      } catch (error) {
        console.error('Upload failed:', error);
        this.message = 'Upload failed!';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
