<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title>Upload Firewall Log</v-card-title>

      <v-radio-group v-model="selectedFileType" inline>
        <v-radio label=".log" value="log"></v-radio>
        <v-radio label=".csv" value="csv"></v-radio>
      </v-radio-group>

      <v-select
        v-model="selectedYear"
        :items="
          Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
        "
        label="Select Year"
        prepend-icon="mdi-calendar"
      ></v-select>

      <v-select
        v-model="topic"
        :items="itemsTopic"
        label="Select Topic"
        prepend-icon="mdi-book"
      ></v-select>

      <v-file-input
        v-model="selectedFiles"
        label="Select Firewall Log File"
        prepend-icon="mdi-paperclip"
        :accept="selectedFileType === 'log' ? '.log' : '.csv'"
        :multiple="selectedFileType === 'log'"
        show-size
        chips
      ></v-file-input>

      <v-btn
        color="primary"
        class="mt-3"
        :loading="isUploading"
        @click="uploadFiles"
      >
        Upload
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/plugins/axios';

const selectedFileType = ref('csv');
const selectedYear = ref(new Date().getFullYear());
const selectedFiles = ref([]);
const isUploading = ref(false);
const topic = ref(null);
const itemsTopic = ref(['Antivirus Log', 'IPS Log', 'Firewall Log']);

const uploadFiles = async () => {
  if (!selectedFiles.value.length) {
    alert('Please select at least one file to upload.');
    return;
  }
  if (!topic.value) {
    alert('Please select a topic.');
    return;
  }
  if (!selectedYear.value) {
    alert('Please select a year.');
    return;
  }

  const url = selectedFileType.value === 'log' ? 'upload-log' : 'upload-csv';
  isUploading.value = true;

  const formData = new FormData();
  selectedFiles.value.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('year', selectedYear.value);
  formData.append('topic', topic.value);

  try {
    const response = await api.post(`/firewall/${url}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Upload successful!');
    console.log(response.data);
  } catch (error) {
    alert('Upload failed!');
    console.error(error);
  } finally {
    isUploading.value = false;
  }
};
</script>
