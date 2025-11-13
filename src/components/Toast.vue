<template>
  <transition name="fade">
    <div v-if="visible" class="toast" :class="type">
      <!-- Icon -->
      <div class="toast-icon">
        <template v-if="type === 'success'">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>

        <template v-else-if="type === 'info'">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
        </template>

        <template v-else-if="type === 'warning'">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </template>

        <template v-else-if="type === 'error'">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </template>
      </div>

      <!-- Content -->
      <div class="toast-content">
        <h4 class="toast-title">{{ title }}</h4>
        <p class="toast-message">{{ message }}</p>
      </div>

      <!-- Close -->
      <button class="toast-close" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon close" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  type: { type: String, default: "info" }, // success | info | warning | error
  title: { type: String, default: "Info" },
  message: { type: String, default: "" },
  duration: { type: Number, default: 4000 }
});

const visible = ref(true);
const close = () => (visible.value = false);

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(close, props.duration);
  }
});
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin: 10px 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-left: 5px solid;
  position: relative;
  width: 360px;
  animation: slideIn 0.3s ease;
}
.toast-icon {
  margin-right: 12px;
  margin-top: 2px;
}
.toast-content {
  flex: 1;
}
.toast-title {
  font-weight: 600;
  margin: 0;
}
.toast-message {
  font-size: 14px;
  color: #555;
  margin: 4px 0 0;
}
.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 12px;
  top: 14px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.toast-close:hover {
  opacity: 1;
}

.icon {
  width: 20px;
  height: 20px;
}
.icon.success { color: #22c55e; }
.icon.info { color: #3b82f6; }
.icon.warning { color: #facc15; }
.icon.error { color: #ef4444; }
.icon.close { color: #999; }

.toast.success { border-color: #22c55e; }
.toast.info { border-color: #3b82f6; }
.toast.warning { border-color: #facc15; }
.toast.error { border-color: #ef4444; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
