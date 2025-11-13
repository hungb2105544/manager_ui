<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script setup>
// Layout này không cần logic JavaScript, nó chỉ làm nhiệm vụ hiển thị.
</script>

<style scoped>
.auth-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center;    /* Căn giữa theo chiều dọc */
  background-color: var(--background-color); /* Sử dụng màu nền chung */
}
</style>