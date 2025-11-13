<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Vouchers</h2>
      <button @click="openModal()" class="btn btn-primary">Thêm Voucher</button>
    </div>
    <div class="card-body">
       <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Tên & Mô tả</th>
            <th>Giá trị</th>
            <th>Điều kiện</th>
            <th>Sử dụng</th>
            <th>Ngày hết hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" style="text-align: center;">Đang tải...</td>
          </tr>
          <tr v-for="voucher in vouchers" :key="voucher.id">
            <td>
                <strong>{{ voucher.code }}</strong><br>
                <small>{{ voucher.type }}</small>
            </td>
            <td>
              <strong>{{ voucher.name }}</strong><br>
              <small v-if="voucher.description" class="text-muted">{{ voucher.description }}</small>
            </td>
            <td>{{ formatValue(voucher) }}</td>
            <td>{{ formatMinOrder(voucher.min_order_value) }}</td>
            <td>{{ formatUsage(voucher) }}</td>
            <td>{{ formatDate(voucher.valid_to) }}</td>
            <td>
              <span :class="['status-badge', voucher.is_active ? 'status-active' : 'status-inactive']">
                {{ voucher.is_active ? 'Hoạt động' : 'Vô hiệu hóa' }}
              </span>
            </td>
            <td>
              <button @click="openModal(voucher)" class="btn btn-secondary" style="margin-right: 8px;">Sửa</button>
              <button @click="openDeleteDialog(voucher.id)" class="btn btn-danger">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Phân trang -->
    <div class="card-footer">
      <ProductPagination
        :current-page="pagination.currentPage"
        :total-items="pagination.totalItems"
        :items-per-page="pagination.itemsPerPage"
        @page-change="handlePageChange"
        @items-per-page-change="handleItemsPerPageChange"
      />
    </div>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <form @submit.prevent="handleSubmit">
            <div class="modal-header">
                <h3 style="margin-top:0;">{{ isEditMode ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới' }}</h3>
                <button type="button" @click="closeModal" class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Mã Voucher (Code)</label>
                    <input type="text" v-model="editableVoucher.code" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Tên Voucher</label>
                    <input type="text" v-model="editableVoucher.name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea v-model="editableVoucher.description" class="form-control" rows="3"></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Loại</label>
                        <select v-model="editableVoucher.type" class="form-control" required>
                            <option value="percentage">Giảm theo %</option>
                            <option value="fixed_amount">Giảm tiền trực tiếp</option>
                            <option value="free_shipping">Miễn phí vận chuyển</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Giá trị</label>
                        <input type="number" v-model.number="editableVoucher.value" class="form-control" required min="0">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Đơn hàng tối thiểu</label>
                        <input type="number" v-model.number="editableVoucher.min_order_value" class="form-control" min="0">
                    </div>
                    <div class="form-group">
                        <label>Giảm tối đa (cho loại %)</label>
                        <input type="number" v-model.number="editableVoucher.max_discount_amount" class="form-control" min="0">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Tổng lượt sử dụng</label>
                        <input type="number" v-model.number="editableVoucher.usage_limit" class="form-control" min="0">
                    </div>
                    <div class="form-group">
                        <label>Lượt sử dụng / người dùng</label>
                        <input type="number" v-model.number="editableVoucher.usage_limit_per_user" class="form-control" min="1">
                    </div>
                </div>
                 <div class="form-group">
                    <label>Ngày hết hạn</label>
                    <input type="date" v-model="editableVoucher.valid_to" class="form-control" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
        </form>
      </div>
    </div>
  </Transition>

  <ConfirmDialog
    :show="showConfirmDialog"
    title="Xác nhận xóa Voucher"
    message="Bạn có chắc chắn muốn xóa voucher này không?"
    confirmText="Đồng ý Xóa"
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ProductPagination from '@/components/ProductPagination.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

// --- State Management ---
const vouchers = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editableVoucher = ref({});
const isEditMode = computed(() => !!editableVoucher.value.id);
const isUpdated = ref(true);

// --- Pagination State ---
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

// --- API Operations ---
const fetchVouchers = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.itemsPerPage,
      offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
    };
    const response = await api.get('/vouchers', { params });
    console.log(response);
    vouchers.value = response.data.data || [];
    pagination.totalItems = response.data.total || 0;
  } catch (error) {
    console.error("Lỗi khi tải danh sách vouchers:", error);
    showToast("Không thể tải danh sách vouchers.", 'error');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  
  try {
    // Chuyển đổi các giá trị rỗng thành null trước khi gửi
    const payload = { ...editableVoucher.value };
    for (const key in payload) {
      if (payload[key] === '') {
        payload[key] = null;
      }
    }

    if (isEditMode.value) {
      await api.patch(`/vouchers/${payload.id}`, payload);
      isUpdated.value = true;
    } else {
      await api.post('/vouchers', payload);
      isUpdated.value = false;
    }
    await fetchVouchers();
    closeModal();
    showToast(isUpdated.value ? 'Cập nhật voucher thành công!' : 'Tạo voucher mới thành công!', 'success');
  } catch (error) {
    const message = error.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
    console.error("Lỗi khi lưu voucher:", message);
    showToast(message, 'error');
  }
};

// --- Modal Control ---
const openModal = (voucher = null) => {
  if (voucher) {
    editableVoucher.value = { 
      ...voucher,
      valid_to: new Date(voucher.valid_to).toISOString().split('T')[0]
    };
  } else {
    // THÊM MỚI: Thêm các giá trị mặc định cho form tạo mới
    editableVoucher.value = {
      type: 'percentage',
      value: 10,
      min_order_value: 0,
      usage_limit_per_user: 1,
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editableVoucher.value = {};
};

// --- Delete Confirmation ---
const showConfirmDialog = ref(false);
const voucherIdToDelete = ref(null);

const openDeleteDialog = (id) => {
  voucherIdToDelete.value = id;
  showConfirmDialog.value = true;
};

const closeDeleteDialog = () => {
  showConfirmDialog.value = false;
  voucherIdToDelete.value = null;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/vouchers/${voucherIdToDelete.value}`);
    await fetchVouchers();
    showToast('Đã xóa voucher thành công.', 'success');
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa voucher.";
    console.error("Lỗi khi xóa voucher:", message);
    showToast(message, 'error');
  } finally {
    closeDeleteDialog();
  }
};

// --- Pagination Handlers ---
const handlePageChange = (page) => {
  pagination.currentPage = page;
  fetchVouchers();
};

const handleItemsPerPageChange = (items) => {
  pagination.itemsPerPage = items;
  pagination.currentPage = 1; // Reset về trang đầu
  fetchVouchers();
};

// --- Helper Functions ---
const formatValue = (voucher) => {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  if (voucher.type === 'percentage') {
    let text = `${voucher.value}%`;
    if (voucher.max_discount_amount) {
      text += ` (tối đa ${currencyFormatter.format(voucher.max_discount_amount)})`;
    }
    return text;
  }
  if (voucher.type === 'fixed_amount') {
    return currencyFormatter.format(voucher.value);
  }
  return 'Miễn phí vận chuyển';
};

// THÊM MỚI: Các hàm helper để hiển thị dữ liệu đẹp hơn
const formatMinOrder = (value) => {
  if (!value || value === 0) return 'Mọi đơn hàng';
  return `Đơn > ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}`;
};

const formatUsage = (voucher) => {
  const limit = voucher.usage_limit === null ? 'Không giới hạn' : voucher.usage_limit;
  const perUser = voucher.usage_limit_per_user;
  return `Đã dùng: ${voucher.used_count} / ${limit} (tối đa ${perUser}/người)`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// --- Lifecycle Hook ---
onMounted(fetchVouchers);
</script>

<style scoped>
/* Scoped CSS cho modal, copy từ các component trước để đảm bảo tính nhất quán */
.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 600px; max-width: 90%; padding: 0;
}
.modal-header, .modal-body, .modal-footer {
  padding: 20px 25px;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid var(--border-color);
}
.close-button {
  background: none; border: none; font-size: 1.75rem; cursor: pointer; color: #6c757d;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
/* THÊM MỚI: CSS cho trạng thái */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-active {
  color: #1a7336;
  background-color: #e8f5e9;
}
.status-inactive {
  color: #5f6368;
  background-color: #f1f3f4;
}
.card-footer {
  padding: 0 25px;
  border-top: 1px solid var(--border-color);
  background-color: #fdfdfd;
}
</style>