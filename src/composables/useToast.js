import { ref, readonly } from "vue";

const toasts = ref([]);
let nextId = 0;

const showToast = (message, type = "info", duration = 4000) => {
  const id = nextId++;
  toasts.value.push({ id, message, type });

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

export function useToast() {
  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
  };
}
