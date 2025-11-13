<template>
  <Sidebar />
  <div class="main-wrapper">
    <AppHeader />
    <main class="main-content">
      <!-- Thêm key để buộc Vue tạo mới component mỗi khi route thay đổi -->
      <router-view :key="routeKey" />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import Sidebar from '@/components/Sidebar.vue';
import AppHeader from '@/components/AppHeader.vue';

const route = useRoute();
const authStore = useAuthStore();

// Key sẽ thay đổi khi route hoặc user thay đổi
// Điều này buộc Vue destroy và tạo mới component, đảm bảo state được reset hoàn toàn
const routeKey = computed(() => {
  // Chỉ sử dụng path và user ID, không dùng Date.now() để tránh re-render liên tục
  return `${route.path}-${authStore.user?.id || 'guest'}`;
});
</script>

<style scoped>
/* Giữ nguyên style của bạn */
</style>