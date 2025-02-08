<template>
    <v-container>
      <v-card>
        <v-card-title>Create New Site</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addSite">
            <v-text-field v-model="siteName" label="Site Name" required></v-text-field>
            <v-btn type="submit" color="primary" :disabled="!siteName">Add Site</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
  
      <!-- Display Created Sites -->
      <v-card class="mt-5">
        <v-card-title>Existing Sites</v-card-title>
        <v-card-text>
          <v-data-table :headers="siteHeaders" :items="siteList" dense></v-data-table>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        siteName: '',
        siteDescription: '',
        siteList: [
          { name: 'BRLN'},
          { name: 'TYM'},
          { name: 'BURAPA' },
        ],
        siteHeaders: [
          { text: 'Site Name', value: 'name' }
        ],
      };
    },
    methods: {
      addSite() {
        if (this.siteName.trim()) {
          this.siteList.push({
            name: this.siteName,
            description: this.siteDescription || 'No Description',
          });
          this.siteName = '';
          this.siteDescription = '';
        }
      },
    },
  };
  </script>
  