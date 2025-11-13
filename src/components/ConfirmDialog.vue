<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content card">
        <div class="modal-header">
          <h3 class="card-title" style="margin-bottom: 0;">{{ title }}</h3>
          <button @click="handleClose" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button @click="handleClose" class="btn btn-secondary">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="btn btn-danger">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Định nghĩa các props mà component cha có thể truyền vào
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Xác nhận hành động',
  },
  message: {
    type: String,
    default: 'Bạn có chắc chắn muốn tiếp tục?',
  },
  confirmText: {
    type: String,
    default: 'Xác nhận',
  },
  cancelText: {
    type: String,
    default: 'Hủy',
  },
});

// Định nghĩa các event mà component sẽ phát ra cho component cha
const emit = defineEmits(['close', 'confirm']);

const handleClose = () => {
  emit('close');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 450px;
  max-width: 90%;
  padding: 0; /* Ghi đè padding của .card */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  border-bottom: 1px solid var(--border-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 25px;
  font-size: 1rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 25px;
  border-top: 1px solid var(--border-color);
  background-color: #f8f9fa;
}

/* Hiệu ứng mờ dần (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>