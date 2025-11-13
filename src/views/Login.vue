<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <!-- Giả sử bạn có logo ở src/assets/logo.svg -->
        <!-- <img src="@/assets/logo.svg" alt="App Logo" class="logo"> -->
        <h2>Đăng nhập vào trang quản trị</h2>
        <p>Vui lòng nhập thông tin của bạn để tiếp tục</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" class="form-control" v-model="email" required placeholder="your-email@example.com">
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input type="password" id="password" class="form-control" v-model="password" required placeholder="••••••••">
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref(null);
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  error.value = null;
  loading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    // Nếu không có lỗi, auth store sẽ tự động điều hướng
    // nhưng để chắc chắn, ta có thể thêm một điều hướng ở đây
    router.push('/admin/dashboard');
  } catch (err) {
    error.value = 'Email hoặc mật khẩu không chính xác.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  height: 50px;
  margin-bottom: 20px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  font-size: 1.75rem;
  color: #333;
}

.login-header p {
  margin: 0;
  color: #6c757d;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>