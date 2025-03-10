<template>
  <v-container>
    <v-card class="mt-5">
      <v-card-title>Create New Site</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addSite">
          <v-text-field
            v-model="siteName"
            label="Site Name"
            required
          ></v-text-field>
          <v-row justify="end">
            <v-btn
              class="ma-3"
              type="submit"
              color="primary"
              :disabled="!siteName || loading"
            >
              Create Site
            </v-btn>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <v-alert v-if="message" class="mt-3">
      {{ message }}
    </v-alert>

    <v-card class="mt-5">
      <v-card-title>Existing Sites</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="siteHeaders"
          :items="siteList"
          :items-per-page="5"
          :items-per-page-options="[5, 10, 20]"
          density="compact"
        >
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn size="small" color="red" @click="openDeleteDialog(item)">
              X
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to delete {{ siteToDelete?.name }}?
        </v-card-title>
        <v-card-actions>
          <v-btn color="blue" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" @click="deleteSite">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';

const loading = ref(false);
const message = ref('');
const siteName = ref('');
const siteList = ref([]);
const deleteDialog = ref(false);
const siteToDelete = ref(null);

const siteHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Site Name', key: 'name' },
  { title: 'Created At', key: 'created_at', align: 'end' },
  { title: 'Actions', key: 'actions', align: 'end' },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/get/table-name');
    siteList.value = res.data.site_name.map((item) => ({
      id: item[0],
      name: item[1],
      created_at: item[2],
    }));
  } catch (e) {
    console.error('Fetch failed:', e);
    message.value = 'Failed to fetch sites.';
  } finally {
    loading.value = false;
  }
};

const addSite = async () => {
  if (!siteName.value.trim()) return;

  loading.value = true;
  try {
    const data = { site: siteName.value };
    const res = await api.post('/site', data);
    message.value = res.data.message || 'Site added successfully';
    siteList.value.push({
      id: siteList.value.length + 1,
      name: siteName.value,
      created_at: new Date().toISOString(),
    });
    siteName.value = '';
  } catch (e) {
    console.error('Create site failed:', e);
    message.value = 'Failed to create site.';
  } finally {
    loading.value = false;
  }
};

const deleteSite = async () => {
  if (!siteToDelete.value) return;
  loading.value = true;
  try {
    await api.delete(`/site/delete-site/${siteToDelete.value.id}`);
    siteList.value = siteList.value.filter(
      (site) => site.id !== siteToDelete.value.id,
    );
    message.value = 'Site deleted successfully';
  } catch (e) {
    console.error('Delete site failed:', e);
    message.value = 'Failed to delete site.';
  } finally {
    deleteDialog.value = false;
    loading.value = false;
  }
};

const openDeleteDialog = (site) => {
  siteToDelete.value = site;
  deleteDialog.value = true;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

onMounted(fetchData);
</script>
