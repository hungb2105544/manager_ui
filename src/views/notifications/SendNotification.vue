<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Gửi thông báo đến người dùng</h2>
      <p class="card-subtitle">
        Thông báo này sẽ được gửi đến tất cả người dùng đã cài đặt ứng dụng.
      </p>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSendNotification">
        <div class="form-group">
          <label for="notification-title">Tiêu đề thông báo *</label>
          <input 
            id="notification-title"
            type="text" 
            v-model="notification.title" 
            class="form-control" 
            placeholder="Ví dụ: 🔥 Khuyến mãi cuối tuần!" 
            required
          />
        </div>

        <div class="form-group">
          <label for="notification-content">Nội dung thông báo *</label>
          <textarea 
            id="notification-content"
            v-model="notification.content" 
            class="form-control" 
            rows="5" 
            placeholder="Nhập nội dung chi tiết bạn muốn gửi đến người dùng..." 
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg" :disabled="isSending">
            <span v-if="isSending" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isSending ? 'Đang gửi...' : 'Gửi thông báo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const notification = reactive({
  title: '',
  content: '',
});

const isSending = ref(false);

const handleSendNotification = async () => {
  if (!notification.title || !notification.content) {
    showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung.', 'error');
    return;
  }

  if (!confirm('Bạn có chắc chắn muốn gửi thông báo này đến TẤT CẢ người dùng không?')) {
    return;
  }

  isSending.value = true;
  try {
    const payload = {
      title: notification.title,
      content: notification.content,
    };

    await api.post('/notifications/system', payload);

    showToast('Gửi thông báo thành công!', 'success');
    // Reset form
    notification.title = '';
    notification.content = '';
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi không xác định.';
    showToast(`Gửi thất bại: ${errorMessage}`, 'error');
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.card-subtitle {
  margin-top: 5px;
  color: #6c757d;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.btn-lg {
  padding: 12px 25px;
  font-size: 1.1rem;
}
</style>