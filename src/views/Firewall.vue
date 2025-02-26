<template>
  <v-container>
    <v-card>
      <v-tabs v-model="tab">
        <v-tab value="bandwidth">Bandwidth</v-tab>
        <v-tab value="ips">IPS</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Bandwidth Tab -->
        <v-window-item value="bandwidth">
          <v-card>
            <v-card-title>Bandwidth</v-card-title>
            <v-card-text>
              <v-sparkline :value="[10, 20, 15, 30, 25, 40]" color="blue" />
            </v-card-text>
            <v-data-table :items="bandwidthData" :headers="bandwidthHeaders" />
          </v-card>
        </v-window-item>

        <!-- IPS Tab -->
        <v-window-item value="ips">
          <v-card>
            <v-card-title>
              IPS
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchIP"
                label="Search IP"
                dense
                outlined
                hide-details
              />
              <v-btn  @click="search">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-card-title>
            <v-data-table :items="ipsData" :headers="ipsHeaders" />
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      tab: 'bandwidth',
      searchIP: '',
      bandwidthHeaders: [
        { text: 'Time', value: 'time' },
        { text: 'Usage (%)', value: 'usage' },
      ],
      bandwidthData: [
        { time: '12:00', usage: 50 },
        { time: '12:30', usage: 70 },
      ],
      ipsHeaders: [
        { text: 'Priority', value: 'priority' },
        { text: 'IP Address', value: 'ip' },
        { text: 'Status', value: 'status' },
      ],
      ipsData: [{ priority: 'Critical', ip: '10.10.10.0', status: '10e' }],
    };
  },
  methods: {
    search() {
      console.log('Searching for', this.searchIP);
    },
  },
};
</script>
