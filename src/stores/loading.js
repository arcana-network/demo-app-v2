import { ref } from "vue";
import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(false);
  const message = ref("");

  function showLoader(msg) {
    isLoading.value = true;
    message.value = msg;
  }

  function hideLoader() {
    isLoading.value = false;
    message.value = "";
  }

  return { isLoading, message, showLoader, hideLoader };
});
