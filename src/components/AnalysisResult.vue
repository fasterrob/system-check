<template>
    <v-container>
      <v-btn @click="fetchAnalysis" color="primary">Get AI Analysis</v-btn>
      <v-card v-if="analysis">
        <v-card-title>AI System Analysis</v-card-title>
        <v-card-text>{{ analysis }}</v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        analysis: '',
      };
    },
    methods: {
      async fetchAnalysis() {
        const res = await axios.get('http://localhost:5000/analysis');
        this.analysis = res.data.analysis;
      },
    },
  };
  </script>
  