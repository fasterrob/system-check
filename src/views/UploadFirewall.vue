<template>
  <v-container>
    <!-- Report Gen -->
    <v-card class="pa-5">
      <v-card-title class="mb-2">Generate Monthly Report</v-card-title>

      <!-- Month Selector -->
      <v-select
        v-model="selectedMonth"
        :items="[
          { text: 'January', value: 1 },
          { text: 'February', value: 2 },
          { text: 'March', value: 3 },
          { text: 'April', value: 4 },
          { text: 'May', value: 5 },
          { text: 'June', value: 6 },
          { text: 'July', value: 7 },
          { text: 'August', value: 8 },
          { text: 'September', value: 9 },
          { text: 'October', value: 10 },
          { text: 'November', value: 11 },
          { text: 'December', value: 12 },
        ]"
        item-title="text"
        item-value="value"
        label="Select Month"
        prepend-icon="mdi-calendar"
      ></v-select>

      <!-- Year Selector -->
      <v-select
        v-model="selectedYear"
        :items="
          Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
        "
        label="Select Year"
        prepend-icon="mdi-calendar"
      ></v-select>

      <!-- Directory Selector (Simulated v-file-input) -->
      <v-text-field
        v-model="inputFullname"
        label="Input Editor Name"
        prepend-icon="mdi-rename"
      />

      <!-- Generate Button -->
      <div class="d-flex justify-center mt-3">
        <v-btn
          color="orange"
          class="mt-3"
          :loading="isProcessing"
          @click="generateReport"
        >
          Generate
        </v-btn>
      </div>
    </v-card>

    <!-- Log Import -->
    <div class="mt-5">
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
       >
       </v-select>
 
       <v-file-input
         v-model="selectedFile"
         label="Select Firewall Log File"
         prepend-icon="mdi-paperclip"
         :accept="selectedFileType === 'log' ? '.log' : '.csv'"
         :multiple="selectedFileType === 'log'"
       ></v-file-input>
 

       <div class="d-flex justify-center mt-3">
         <v-btn
           color="primary"
           class="mt-3"
           :loading="isUploading"
           @click="uploadFile"
           >Upload</v-btn>
       </div>
     </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/plugins/axios';

// Generate Report Logic
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(null);
const inputFullname = ref('');
const isProcessing = ref(false);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateReport = async () => {
  if (!selectedMonth.value || !selectedYear.value || !inputFullname.value) {
    alert('Please select month, year, and input editor name.');
    return;
  }

  isProcessing.value = true;
  try {
    const response = await api.get('/firewall-report/report-gen', {
      params: {
        input_month: selectedMonth.value,
        input_year: selectedYear.value,
        input_editor: inputFullname.value,
      },
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    const monthName = monthNames[selectedMonth.value - 1];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/['\"]/g, '')
      : `Firewall_Report_${monthName}_${selectedYear.value}.docx`;

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert('Error generating report.');
    console.error('Error generating report:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Upload File Logic
const selectedFileType = ref('csv');
const selectedFile = ref([]);
const isUploading = ref(false);
const topic = ref(null);
const itemsTopic = ref(['Antivirus Log', 'IPS Log', 'Firewall Log']);

const uploadFile = async () => {
  if (!selectedFile.value) {
    alert('Please select a file to upload.');
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

  isUploading.value = true;
  const url = selectedFileType.value === 'log' ? 'upload-log' : 'upload-csv';

  const formData = new FormData();
  selectedFile.value.forEach((file) => {
     formData.append('file', file);
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
