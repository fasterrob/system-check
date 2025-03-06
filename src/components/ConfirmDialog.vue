<template>
  <v-dialog v-model="show" persistent max-width="400px">
    <v-card class="text-center pa-4">
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="primary" variant="tonal" text @click="handleYes">
          Yes
        </v-btn>
        <v-btn color="red" variant="tonal" text @click="handleNo">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(false);
const title = ref('Confirm Action');
const message = ref('Are you sure you want to proceed?');
let resolvePromise = null;

const open = ({
  title: newTitle = 'Confirm Action',
  message: newMessage = 'Are you sure?',
}) => {
  title.value = newTitle;
  message.value = newMessage;
  show.value = true;

  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const handleYes = () => {
  show.value = false;
  if (resolvePromise) resolvePromise(true);
};

const handleNo = () => {
  show.value = false;
  if (resolvePromise) resolvePromise(false);
};

// Expose the `open` method for external use
defineExpose({ open });
</script>
