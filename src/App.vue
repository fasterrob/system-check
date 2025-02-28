<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-list-item title="System Health Check" />
        <v-divider></v-divider>
        <v-list-item
          link
          to="/"
          prepend-icon="mdi-view-dashboard"
          @click="title = 'System Health Check'"
        >
          Dashboard
        </v-list-item>
        <v-list-item
          link
          to="/create-site"
          prepend-icon="mdi-table"
          @click="title = 'System Health Check'"
        >
          Create Site
        </v-list-item>
        <v-list-item
          link
          to="/upload"
          prepend-icon="mdi-upload"
          @click="title = 'System Health Check'"
        >
          Upload Logs
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-item title="Firewall" />
        <v-divider></v-divider>
        <v-list-item
          link
          to="/bandwidth"
          prepend-icon="mdi-wifi"
          @click="title = 'Firewall'"
        >
          Bandwidth
        </v-list-item>
        <v-list-item
          link
          to="/denied-access"
          prepend-icon="mdi-cancel"
          @click="title = 'Firewall'"
        >
          Denied Access
        </v-list-item>
        <v-list-item
          link
          to="/threat"
          prepend-icon="mdi-alert-outline"
          @click="title = 'Firewall'"
        >
          Threat
        </v-list-item>
        <v-list-item
          link
          to="/antivirus"
          prepend-icon="mdi-virus"
          @click="title = 'Firewall'"
        >
          Antivirus
        </v-list-item>
        <v-list-item
          link
          to="/ips"
          prepend-icon="mdi-ip"
          @click="title = 'Firewall'"
        >
          IPS
        </v-list-item>
        <v-list-item
          link
          to="/uploadfirewall"
          prepend-icon="mdi-upload"
          @click="title = 'Firewall'"
        >
          Upload Firewall logs
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
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
      title: 'System Healthy Check', // ค่าเริ่มต้น
    };
  },
};
</script>
