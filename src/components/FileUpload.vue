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
        <v-file-input
          v-model="file"
          label="Select System Log File (CSV, Excel)"
          accept=".csv,.xlsx"
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
    };
  },
  methods: {
    async uploadFile() {
      if (!this.file) return;
      this.loading = true;
      let formData = new FormData();
      formData.append('file', this.file);
      try {
        const response = await axios.post(
          'http://localhost:5000/upload',
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
