<template>
  <v-dialog v-model="show" persistent max-width="400px">
    <v-card class="text-center pa-4">
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="primary" variant="tonal" text @click="handleYes"
          >Yes</v-btn
        >
        <v-btn color="red" variant="tonal" text @click="handleNo">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      resolve: null,
    };
  },
  methods: {
    open({ title = 'Confirm Action', message = 'Are you sure?' }) {
      this.title = title;
      this.message = message;
      this.show = true;

      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    handleYes() {
      this.show = false;
      if (this.resolve) this.resolve(true);
    },
    handleNo() {
      this.show = false;
      if (this.resolve) this.resolve(false);
    },
  },
};
</script>
