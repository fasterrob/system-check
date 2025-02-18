<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-item title="System Health Check" />
        <v-divider></v-divider>

        <v-list-item link to="/" prepend-icon="mdi-view-dashboard">
          Dashboard
        </v-list-item>
        <v-list-item link to="/create-site" prepend-icon="mdi-table">
          Create Site
        </v-list-item>
        <v-list-item link to="/upload" prepend-icon="mdi-upload">
          Upload Logs
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>System Health Check</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
    };
  },
};
</script>
