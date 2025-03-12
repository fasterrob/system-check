<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>Enter Your Details</v-card-title>
      <v-card-text>
        <v-text-field
          label="First Name"
          v-model="firstName"
          outlined
        ></v-text-field>
        <v-text-field
          label="Last Name"
          v-model="lastName"
          outlined
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="openConfirmDialog">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Reusable Confirmation Dialog Component -->
  <ConfirmDialog
    v-model:show="confirmDialog"
    title="Confirm Submission"
    message="Are you sure you want to submit?"
    @confirm="submit"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['update:show', 'submit']);

const dialog = ref(props.show);
const confirmDialog = ref(false);
const firstName = ref('');
const lastName = ref('');

watch(
  () => props.show,
  (newValue) => {
    dialog.value = newValue;
  },
);

watch(dialog, (newValue) => {
  if (!newValue) {
    emit('update:show', false);
  }
});

const closeDialog = () => {
  dialog.value = false;
};

const openConfirmDialog = () => {
  confirmDialog.value = true;
};

const submit = () => {
  emit('submit', { firstName: firstName.value, lastName: lastName.value });
  confirmDialog.value = false;
  dialog.value = false;
};
</script>
