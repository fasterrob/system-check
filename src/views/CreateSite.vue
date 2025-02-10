<template>
  <v-container>
    <v-card>
      <v-card-title>Create New Site</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addSite">
          <v-text-field
            v-model="siteName"
            label="Site Name"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" :disabled="!siteName || loading">
            Add Site
          </v-btn>
        </v-form>
        <p v-if="message">{{ message }}</p>
      </v-card-text>
    </v-card>

    <!-- Display Created Sites -->
    <v-card class="mt-5">
      <v-card-title>Existing Sites</v-card-title>
      <v-card-text>
        <v-data-table :headers="siteHeaders" :items="siteList" dense>
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false,
      message: '',
      siteName: '',
      siteList: [],
      siteHeaders: [
        { text: 'ID', value: 'id' },
        { text: 'Site Name', value: 'name' },
        { text: 'Created At', value: 'created_at' },
      ],
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await axios.get('http://127.0.0.1:8000/table-name');

        // Convert array of arrays to array of objects
        this.siteList = res.data.site_name.map((item) => ({
          id: item[0], // ID
          name: item[1], // Site Name
          created_at: item[2], // Timestamp
        }));
      } catch (e) {
        console.error('Fetch failed:', e);
        this.message = 'Failed to fetch sites.';
      } finally {
        this.loading = false;
      }
    },
    async addSite() {
      if (!this.siteName.trim()) return;

      console.log(this.siteName);
      this.loading = true;
      try {
        const data = { site: this.siteName };
        const res = await axios.post('http://127.0.0.1:8000/create-site', data);

        console.log(res);

        this.message = res.data.message || 'Site added successfully';

        // Add the new site to the table (assuming API doesn't return the new entry)
        this.siteList.push({
          id: this.siteList.length + 1, // Temporary ID
          name: this.siteName,
          created_at: new Date().toISOString(), // Current timestamp
        });

        this.siteName = '';
      } catch (e) {
        console.error('Create site failed:', e);
        this.message = 'Failed to create site.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString(); // Format for readability
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
