<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="closeDialog">Cancel</v-btn>
        <v-btn color="green" @click="confirm">Yes, Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  show: Boolean,
  title: String,
  message: String,
});

const emit = defineEmits(["update:show", "confirm"]);

const dialog = ref(props.show);

watch(
  () => props.show,
  (newValue) => {
    dialog.value = newValue;
  }
);

watch(dialog, (newValue) => {
  if (!newValue) {
    emit("update:show", false);
  }
});

const closeDialog = () => {
  dialog.value = false;
};

const confirm = () => {
  emit("confirm");
  dialog.value = false;
};
</script>
