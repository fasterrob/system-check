<template>
  <v-container>
    <v-card>
      <v-card-title>Upload System Log</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          item-title="name"
          item-value="id"
          label="Select Table"
          outlined
        ></v-select>

        <v-text-field
          v-model="selectDate"
          label="Month & Year"
          type="month"
          outlined
        ></v-text-field>

        <v-radio-group v-model="filetype" inline>
          <v-radio label="nmon" value="nmon"></v-radio>
          <v-radio label="text" value="text"></v-radio>
        </v-radio-group>

        <v-select
          v-if="filetype === 'text'"
          v-model="selectfileDetails"
          :items="fileDetails"
          item-title="name"
          item-value="id"
          label="Select file type to upload"
          
          outlined
        ></v-select>

        <div v-show="selectfileDetails !== 'other' && filetype === 'text'">
          <!-- เลือกคอลัมน์ที่ต้องการอัปโหลด -->
          <p class="text-caption text-disabled">
            *โปรดเลือก คอลัมน์ ให้ตรงกับข้อมูลที่ต้องการอัปโหลด
          </p>
          <v-autocomplete
            v-model="selectedColumns"
            :items="availableColumns"
            label="Select existing CPU-related columns"
            multiple
            outlined
            dense
          ></v-autocomplete>
        </div>
        <v-file-input
          v-if="filetype === 'text'"
          v-model="file"
          label="Select System Log File (CSV, Excel, Txt, HTML)"
          accept="*"
        ></v-file-input>

        <v-file-input
          v-if="filetype === 'nmon'"
          v-model="file"
          label="Select NMON File"
          accept=".nmon"
          multiple
        >
        </v-file-input>

        <v-btn
          v-if="filetype === 'text'"
          :disabled="!file || !selectedTable"
          color="primary"
          @click="uploadFile"
        >
          Upload
        </v-btn>

        <v-btn
          v-if="filetype === 'nmon'"
          :disabled="!file || !selectedTable"
          color="warning"
          @click="uploadFiles"
        >
          Upload
        </v-btn>
      </v-card-text>

      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-circular>

      <v-alert
        v-if="message"
        :type="uploadSuccess ? 'success' : 'error'"
        class="mt-3"
      >
        {{ message }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/plugins/axios';

export default {
  data() {
    return {
      tableNames: [],
      filetype: 'text',
      file: null,
      loading: false,
      selectedTable: null, // Store selected table as object { id, name }
      message: '',
      uploadSuccess: false,
      selectDate: '',
      selectfileDetails: 'cpu',
      fileDetails: [
        { id: 'cpu', name: 'CPU'},
        { id: 'memory', name: 'Memory' },
        { id: 'other', name: 'Other (Filesystem, Tablespace, Concurrent, AlertLog)' },
      ],
      availableColumns: [
        '%user',
        '%nice',
        '%system',
        '%iowait',
        '%irq',
        '%soft',
        '%steal',
        '%guest',
        '%idle',
      ],
      selectedColumns: [],
    };
  },
  computed: {
    formattedDate() {
      return this.selectDate ? `${this.selectDate}-01` : '';
    },
    selectedTableObject() {
      return (
        this.tableNames.find((table) => table.id === this.selectedTable) || {}
      );
    },
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
        const res = await api.get('/get/table-name');
        const rawData = res.data.site_name;

        // Convert array to [{ id, name }]
        this.tableNames = rawData.map(([id, name]) => ({ id, name }));
        console.log(this.tableNames);
      } catch (e) {
        console.error('Fetch failed:', e);
        this.message = 'Failed to fetch table names.';
        this.uploadSuccess = false;
      } finally {
        this.loading = false;
      }
    },

    async uploadFile() {
      if (!this.file || !this.selectedTable) return;
      this.loading = true;

      let formData = new FormData();
      formData.append('file', this.file); // Get the first file
      formData.append('table_id', this.selectedTableObject.id); // Send ID
      formData.append('table_name', this.selectedTableObject.name); // Send Name
      formData.append('selectDate', this.formattedDate);
      formData.append('year', this.yearFromSelectDate);

      try {
        const response = await api.post('/upload', formData);
        this.message = response.data.message;
        this.uploadSuccess = true;
      } catch (error) {
        console.error('Upload failed:', error);
        this.message = 'Upload failed!';
        this.uploadSuccess = false;
      } finally {
        this.loading = false;
      }
    },

    async uploadFiles() {
      if (!this.file || !this.selectedTable) return;
      this.loading = true;

      const formData = new FormData();
      for (let i = 0; i < this.file.length; i++) {
        formData.append('files', this.file[i]);
      }
      formData.append('table_name', this.selectedTableObject.name); // Send Name
      formData.append('selectDate', this.formattedDate);
      formData.append('year', this.yearFromSelectDate);

      console.log(formData);

      try {
        const response = await api.post('/upload/nmon', formData);
        this.message = response.data.message;
        this.uploadSuccess = true;
      } catch (error) {
        console.error('Upload failed:', error);
        this.message = 'Upload failed!';
        this.uploadSuccess = false;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
