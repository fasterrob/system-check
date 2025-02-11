<template>
    <v-container>
      <v-card>
        <v-card-title>CPU Utilization</v-card-title>
        <v-card-text>
          <canvas ref="cpuChart"></canvas>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  import axios from 'axios';
  
  export default {
    data() {
      return { cpuData: [] };
    },
    async mounted() {
      const res = await axios.get('http://localhost:5000/cpu-data');
      this.cpuData = res.data;
  
      new Chart(this.$refs.cpuChart, {
        type: 'line',
        data: {
          labels: this.cpuData.map((d) => d.timestamp),
          datasets: [
            {
              label: 'CPU Usage (%)',
              data: this.cpuData.map((d) => d.usage),
              borderColor: 'red',
              fill: false,
            },
          ],
        },
      });
    },
  };
  </script>
  