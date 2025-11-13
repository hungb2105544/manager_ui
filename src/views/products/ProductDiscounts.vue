
<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Giảm giá Sản phẩm</h2>
      <button @click="openModal()" class="btn btn-primary">
        <span class="icon">+</span> Thêm Giảm giá
      </button>
    </div>

    <div class="filter-section">
      <div class="form-group">
        <label>Lọc theo sản phẩm</label>
        <select v-model="filters.product_id" class="form-control">
          <option :value="null">Tất cả sản phẩm</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }} ({{ product.sku }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Lọc theo trạng thái</label>
        <select v-model="filters.is_active" class="form-control">
          <option :value="null">Tất cả</option>
          <option :value="true">Đang hoạt động</option>
          <option :value="false">Không hoạt động</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tìm kiếm</label>
        <input 
          v-model="filters.name" 
          type="text" 
          class="form-control" 
          placeholder="Tìm theo tên chương trình..."
        >
      </div>
    </div>

    <div class="card-body">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="discounts.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#ccc"/>
        </svg>
        <p>Không tìm thấy chương trình giảm giá nào</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Tên chương trình</th>
              <th>Phạm vi áp dụng</th>
              <th>Loại giảm giá</th>
              <th>Giá trị</th>
              <th>Thời gian áp dụng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="discount in discounts" :key="discount.id" class="table-row">
              <td>
                <strong>{{ discount.name }}</strong>
              </td>
              <td>
                <div v-html="getScopeDisplay(discount)"></div>
              </td>
              <td>
                <span class="badge badge-info">
                  {{ discount.discount_percentage ? 'Phần trăm' : 'Cố định' }}
                </span>
              </td>
              <td>
                <strong class="value-highlight">{{ formatValue(discount) }}</strong>
              </td>
              <td class="date-range">
                <div>{{ formatDate(discount.start_date) }}</div>
                <div class="text-muted">{{ formatDate(discount.end_date) }}</div>
              </td>
              <td>
                <span :class="['status-badge', getStatus(discount).class]">
                  {{ getStatus(discount).text }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="openModal(discount)" 
                    class="btn btn-icon btn-secondary" 
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="openDeleteDialog(discount.id)" 
                    class="btn btn-icon btn-danger"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

  <Transition name="modal">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <form @submit.prevent="handleSubmit">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Chỉnh sửa Giảm giá' : 'Tạo Giảm giá mới' }}</h3>
            <button type="button" @click="closeModal" class="close-button" aria-label="Đóng">
              &times;
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>
                Tên chương trình giảm giá
                <span class="required">*</span>
              </label>
              <input 
                type="text" 
                v-model="editableDiscount.name" 
                class="form-control" 
                required 
                placeholder="VD: Giảm giá hè 20%"
                maxlength="100"
              >
            </div>

            <div class="form-group">
              <label>
                Phạm vi áp dụng
                <span class="required">*</span>
              </label>
              <select 
                v-model="editableDiscount.scope_type" 
                class="form-control" 
                required 
                :disabled="isEditMode"
                @change="handleScopeChange"
              >
                <option value="product">Sản phẩm cụ thể</option>
                <option value="brand">Toàn bộ thương hiệu</option>
                <option value="type">Toàn bộ loại sản phẩm</option>
                <option value="all">Tất cả sản phẩm</option>
              </select>
              <small v-if="isEditMode" class="form-text text-muted">
                Phạm vi áp dụng không thể thay đổi sau khi tạo
              </small>
            </div>

            <div class="form-group" v-if="editableDiscount.scope_type === 'product'">
              <label>
                Chọn sản phẩm
                <span class="required">*</span>
              </label>
              <select 
                v-model="editableDiscount.scope_value" 
                class="form-control" 
                required 
                :disabled="isEditMode"
              >
                <option disabled :value="null">-- Chọn sản phẩm --</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="editableDiscount.scope_type === 'brand'">
              <label>
                Chọn thương hiệu
                <span class="required">*</span>
              </label>
              <select 
                v-model="editableDiscount.scope_value" 
                class="form-control" 
                required 
                :disabled="isEditMode"
              >
                <option disabled :value="null">-- Chọn thương hiệu --</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.brand_name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="editableDiscount.scope_type === 'type'">
              <label>
                Chọn loại sản phẩm
                <span class="required">*</span>
              </label>
              <select 
                v-model="editableDiscount.scope_value" 
                class="form-control" 
                required 
                :disabled="isEditMode"
              >
                <option disabled :value="null">-- Chọn loại sản phẩm --</option>
                <option v-for="type in productTypes" :key="type.id" :value="type.id">
                  {{ type.type_name }}
                </option>
              </select>
            </div>

            <div class="discount-type-section">
              <label class="section-label">Loại giảm giá</label>
              <div class="discount-type-grid">
                <div class="discount-option" :class="{ active: discountMode === 'percentage' }">
                  <input 
                    type="radio" 
                    name="discount-mode" 
                    value="percentage"
                    v-model="discountMode"
                    id="percentage-mode"
                  >
                  <label for="percentage-mode" class="option-label">
                    <span class="option-icon">%</span>
                    <span>Giảm theo phần trăm</span>
                  </label>
                  <input 
                    v-if="discountMode === 'percentage'"
                    type="number" 
                    v-model.number="editableDiscount.discount_percentage" 
                    class="form-control mt-2" 
                    min="0" 
                    max="100"
                    step="0.01"
                    placeholder="Nhập %"
                    required
                  >
                </div>

                <div class="discount-option" :class="{ active: discountMode === 'amount' }">
                  <input 
                    type="radio" 
                    name="discount-mode" 
                    value="amount"
                    v-model="discountMode"
                    id="amount-mode"
                  >
                  <label for="amount-mode" class="option-label">
                    <span class="option-icon">₫</span>
                    <span>Giảm số tiền cố định</span>
                  </label>
                  <input 
                    v-if="discountMode === 'amount'"
                    type="number" 
                    v-model.number="editableDiscount.discount_amount" 
                    class="form-control mt-2" 
                    min="0"
                    step="1000"
                    placeholder="Nhập số tiền"
                    required
                  >
                </div>
              </div>
            </div>

            <div class="grid-2-col">
              <div class="form-group">
                <label>
                  Ngày bắt đầu
                  <span class="required">*</span>
                </label>
                <input 
                  type="date" 
                  v-model="editableDiscount.start_date" 
                  class="form-control" 
                  required
                  :min="minStartDate"
                >
              </div>
              <div class="form-group">
                <label>
                  Ngày kết thúc
                  <span class="required">*</span>
                </label>
                <input 
                  type="date" 
                  v-model="editableDiscount.end_date" 
                  class="form-control" 
                  required
                  :min="editableDiscount.start_date"
                >
              </div>
            </div>

            <div class="form-group">
              <label class="form-check">
                <input 
                  type="checkbox" 
                  v-model="editableDiscount.is_active" 
                  class="form-check-input"
                >
                <span class="form-check-label">Kích hoạt chương trình ngay</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary" :disabled="isSaving">
              Hủy
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving || !isFormValid">
              <span v-if="isSaving" class="spinner-small"></span>
              {{ isSaving ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>

  <ConfirmDialog
    :show="showConfirmDialog"
    title="Xác nhận xóa"
    message="Bạn có chắc chắn muốn xóa chương trình giảm giá này không?"
    confirmText="Đồng ý Xóa"
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useToast } from '@/composables/useToast';
import ProductPagination from '@/components/ProductPagination.vue';

const { showToast } = useToast();

// State
const discounts = ref([]);
const products = ref([]);
const brands = ref([]);
const productTypes = ref([]);
const loading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const editableDiscount = ref({});
const discountMode = ref('percentage');

const filters = reactive({
  name: '',
  product_id: null,
  is_active: null,
});

// State cho phân trang
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

// Computed
const isEditMode = computed(() => !!editableDiscount.value.id);

const minStartDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const isFormValid = computed(() => {
  const d = editableDiscount.value;
  return d.name && 
         d.scope_type && 
         (d.scope_type === 'all' || d.scope_value) &&
         (d.discount_percentage || d.discount_amount) &&
         d.start_date && 
         d.end_date;
});

// Watch discount mode changes
watch(discountMode, (newMode) => {
  if (newMode === 'percentage') {
    editableDiscount.value.discount_amount = null;
  } else {
    editableDiscount.value.discount_percentage = null;
  }
});

// Watch filters với debounce
let debounceTimer = null;
watch(filters, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pagination.currentPage = 1; // Reset về trang 1 khi lọc
    fetchDiscounts();
  }, 500);
}, { deep: true });

const fetchDiscounts = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.itemsPerPage,
      offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
      ...filters
    };
    const response = await api.get('/discounts', { params });
    console.log("Params:", params);
    console.log("Response:", response);
    discounts.value = response.data.data.data|| [];
    pagination.totalItems = response.data.data.total || 0;
    console.log("Danh sách giảm giá:", discounts.value);
    console.log("Tổng số sản phẩm:", pagination.totalItems);
  } catch (error) {
    console.error("Lỗi khi tải danh sách giảm giá:", error);
    showToast("Không thể tải danh sách giảm giá.", 'error');
  } finally {
    loading.value = false;
  }
};

const fetchProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 1000 } }); // Lấy nhiều sản phẩm cho dropdown
    products.value = response.data.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
  }
};

const fetchBrands = async () => {
  try {
    const response = await api.get('/brands');
    brands.value = response.data.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách thương hiệu:", error);
  }
};

const fetchProductTypes = async () => {
  try {
    const response = await api.get('/product-types');
    productTypes.value = response.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách loại sản phẩm:", error);
  }
};

const handleScopeChange = () => {
  editableDiscount.value.scope_value = null;
};

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    const payload = { ...editableDiscount.value };
    if (payload.discount_percentage === '') payload.discount_percentage = null;
    if (payload.discount_amount === '') payload.discount_amount = null;
    const submitPayload = { ...payload };

    if (isEditMode.value) {
      await api.patch(`/discounts/${payload.id}`, submitPayload);
      showToast('Cập nhật thành công!', 'success');
    } else {
      delete submitPayload.id;
      delete submitPayload.products;
      delete submitPayload.brands;
      delete submitPayload.product_types;

      await api.post('/discounts', submitPayload);
      showToast('Tạo mới thành công!', 'success');
    }
    
    await fetchDiscounts();
    closeModal();
  } catch (error) {
    const message = error.response?.data?.message || "Đã xảy ra lỗi.";
    console.error("Lỗi khi lưu giảm giá:", message);
    showToast(message, 'error');
  } finally {
    isSaving.value = false;
  }
};

const openModal = (discount = null) => {
  if (discount) {
    let scope_type = 'all';
    let scope_value = null;
    
    if (discount.product_id) {
      scope_type = 'product';
      scope_value = discount.product_id;
    } else if (discount.brand_id) {
      scope_type = 'brand';
      scope_value = discount.brand_id;
    } else if (discount.type_id) {
      scope_type = 'type';
      scope_value = discount.type_id;
    }

    editableDiscount.value = { 
      ...discount,
      scope_type,
      scope_value,
      start_date: new Date(discount.start_date).toISOString().split('T')[0],
      end_date: new Date(discount.end_date).toISOString().split('T')[0],
    };
    
    discountMode.value = discount.discount_percentage ? 'percentage' : 'amount';
  } else {
    editableDiscount.value = {
      name: '',
      scope_type: 'product',
      scope_value: null,
      discount_percentage: null,
      discount_amount: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true,
    };
    discountMode.value = 'percentage';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editableDiscount.value = {};
};

const showConfirmDialog = ref(false);
const discountIdToDelete = ref(null);

const openDeleteDialog = (id) => {
  discountIdToDelete.value = id;
  showConfirmDialog.value = true;
};

const closeDeleteDialog = () => {
  showConfirmDialog.value = false;
  discountIdToDelete.value = null;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/discounts/${discountIdToDelete.value}`);
    await fetchDiscounts();
    showToast('Đã xóa thành công.', 'success');
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa.";
    showToast(message, 'error');
  } finally {
    closeDeleteDialog();
  }
};

// Hàm xử lý sự kiện phân trang
const handlePageChange = (page) => {
  pagination.currentPage = page;
  fetchDiscounts();
};

const handleItemsPerPageChange = (items) => {
  pagination.itemsPerPage = items;
  pagination.currentPage = 1; // Reset về trang đầu
  fetchDiscounts();
};

const formatValue = (discount) => {
  if (discount.discount_percentage) {
    return `${discount.discount_percentage}%`;
  }
  if (discount.discount_amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount.discount_amount);
  }
  return 'N/A';
};

const getScopeDisplay = (discount) => {
  if (discount.product_id && discount.products) {
    return `Sản phẩm: <strong>${discount.products.name}</strong>`;
  }
  if (discount.brand_id && discount.brands) {
    return `Thương hiệu: <strong>${discount.brands.brand_name}</strong>`;
  }
  if (discount.type_id && discount.product_types) {
    return `Loại: <strong>${discount.product_types.type_name}</strong>`;
  }
  if (discount.apply_to_all) {
    return `<strong>Tất cả sản phẩm</strong>`;
  }
  return 'Chưa xác định';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getStatus = (discount) => {
  const now = new Date();
  const start = new Date(discount.start_date);
  const end = new Date(discount.end_date);
  end.setHours(23, 59, 59, 999);

  if (!discount.is_active) return { text: 'Vô hiệu hóa', class: 'status-inactive' };
  if (now < start) return { text: 'Sắp diễn ra', class: 'status-upcoming' };
  if (now > end) return { text: 'Đã kết thúc', class: 'status-expired' };
  return { text: 'Đang diễn ra', class: 'status-active' };
};

onMounted(() => {
  fetchDiscounts();
  fetchProducts();
  fetchBrands();
  fetchProductTypes();
});
</script>

<style scoped>
/* ====== Bố cục tổng ====== */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(to right, #f8f9fa, #fdfdff);
}

.card-footer {
  padding: 0 24px;
  border-top: 1px solid #e9ecef;
  background-color: #fdfdfd;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* ====== Nút ====== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #007bff, #0056d2);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(90deg, #0056d2, #003ea3);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 91, 255, 0.2);
}

.btn-secondary {
  background: #f1f3f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e2e6ea;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #d9363e;
}

/* ====== Khu vực lọc ====== */
.filter-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e9ecef;
}

.filter-section label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe4;
  border-radius: 8px;
  background: white;
  transition: border 0.25s ease;
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
}

/* ====== Loading & Empty ====== */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 70px 20px;
  color: #6c757d;
}

.loading-state p, .empty-state p {
  margin-top: 12px;
  font-size: 0.95rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ====== Bảng ====== */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table thead {
  background: #f5f6f8;
  color: #444;
}

.table th, .table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.table-row:hover {
  background: #f8faff;
}

.value-highlight {
  color: #28a745;
  font-weight: 600;
}

/* ====== Badge & Trạng thái ====== */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-info {
  background: #e7f3ff;
  color: #0366d6;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.85rem;
}

.status-active {
  background: #e6f7f0;
  color: #08979c;
}

.status-upcoming {
  background: #e6f4ff;
  color: #1677ff;
}

.status-expired {
  background: #f9f9f9;
  color: #888;
}

.status-inactive {
  background: #f5f5f5;
  color: #999;
}

/* ====== Nút hành động ====== */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.btn-icon {
  border: none;
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

/* ====== Modal ====== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-content {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  overflow-y: auto;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  transform: scale(1);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 20px 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fafbfc;
  gap: 10px;
}

/* ====== Discount Type Section ====== */
.discount-type-section {
  margin: 20px 0;
  padding: 18px;
  border-radius: 10px;
  background: #f7f9fc;
  border: 1px solid #e5eaf0;
}

.discount-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.discount-option {
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 16px;
  background: white;
  transition: all 0.25s;
  cursor: pointer;
}

.discount-option.active {
  border-color: #007bff;
  background: #f0f6ff;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.option-icon {
  font-size: 22px;
  color: #007bff;
}

/* ====== Form Grid ====== */
.grid-2-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .filter-section {
    grid-template-columns: 1fr;
  }
  .discount-type-grid {
    grid-template-columns: 1fr;
  }
  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
