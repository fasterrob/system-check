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
        <v-data-table
          :headers="siteHeaders"
          :items="siteList"
          :items-per-page="5"
          :items-per-page-options="[5, 10, 20]"
          dense
        >
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn size="small" color="red" @click="openDeleteDialog(item)"
              >X</v-btn
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline"
          >Are you sure you want to delete
          {{ siteToDelete.name }}?</v-card-title
        >
        <v-card-actions>
          <v-btn color="blue" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" text @click="deleteSite">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from '@/plugins/axios';

export default {
  data() {
    return {
      loading: false,
      message: '',
      siteName: '',
      siteList: [],
      siteHeaders: [
        { title: 'ID', key: 'id' },
        { title: 'Site Name', key: 'name' },
        { title: 'Created At', key: 'created_at', align: 'end' },
        { title: 'Actions', key: 'actions', align: 'end' },
      ],
      deleteDialog: false,
      siteToDelete: null, // Site to delete
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await api.get('/get/table-name');

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
        const res = await api.post('/site', data);

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
    async deleteSite() {
      if (!this.siteToDelete) return;
      this.loading = true;
      try {
        // Perform the deletion API call
        const res = await api.delete(
          `/site/delete-site/${this.siteToDelete.id}`,
        );
        this.siteList = this.siteList.filter(
          (site) => site.id !== this.siteToDelete.id,
        );
        this.message = 'Site deleted successfully';
      } catch (e) {
        console.error('Delete site failed:', e);
        this.message = 'Failed to delete site.';
      } finally {
        this.deleteDialog = false;
        this.loading = false;
      }
    },
    openDeleteDialog(site) {
      this.siteToDelete = site;
      this.deleteDialog = true;
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString(); // Format for readability
    },
  },
};
</script>
