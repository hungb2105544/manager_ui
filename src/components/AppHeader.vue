<template>
  <header class="app-header">
    <div class="user-info">
      <span v-if="authStore.user">Xin chào, {{ authStore.user.role }}</span>
    </div>
    <button @click="handleLogout" class="logout-btn">
      Đăng xuất
    </button>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';

// Khởi tạo auth store để truy cập state và actions
const authStore = useAuthStore();

// Hàm xử lý việc đăng xuất
const handleLogout = () => {
  // Gọi action logout từ store
  // Action này sẽ xóa token, user data và điều hướng về trang login
  authStore.logout();
};
</script>

<style scoped>
/* Scoped CSS để chỉ áp dụng cho component này */
.app-header {
  /* Các style chính đã được định nghĩa trong main.css */
  /* Ở đây chúng ta chỉ thêm các style bổ sung nếu cần */
  gap: 20px; /* Tạo khoảng cách giữa các phần tử bên trong header */
}

.user-info {
  font-weight: 500;
  color: var(--dark-color);
}
</style>