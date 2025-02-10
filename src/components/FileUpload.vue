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
        <v-select
          v-model="selectedYear"
          :items="years"
          label="Select Year"
          outlined
        ></v-select>
        <v-text-field
          v-model="selectDate"
          label="Date"
          type="date"
          outlined
        ></v-text-field>
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
      tableNames: ['BRLN', 'TYM', 'BURAPA'],
      file: null,
      loading: false,
      selectedTable: '',
      message: '',
      selectDate: '',
      selectedYear: new Date().getFullYear(), // Default to the current year
      years: this.getYears(2000, new Date().getFullYear()), // Generate years dynamically
    };
  },
  methods: {
    getYears(startYear, endYear) {
      let years = [];
      for (let year = endYear; year >= startYear; year--) {
        years.push(year);
      }
      return years;
    },
    async uploadFile() {
      if (!this.file) return;
      this.loading = true;
      let formData = new FormData();
      formData.append('file', this.file);
      formData.append('table_name', this.selectedTable);
      formData.append('date ', this.selectDate);
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
