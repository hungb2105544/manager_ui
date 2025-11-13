<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Đơn hàng</h2>
      <div class="header-actions">
        <button @click="handleRefresh" class="btn btn-light" :disabled="loading" title="Làm mới danh sách">
          Làm mới
        </button>
      </div>
    </div>

    <!-- Phần thống kê -->
    <div class="stats-section">
      <div class="stat-card total">
        <span class="stat-title">Tất cả đơn hàng</span>
        <span class="stat-value">{{ stats.totalOrders || 0 }}</span>
      </div>
      <div v-for="status in statusList" :key="status.key" :class="['stat-card', `status-${status.key}`]">
        <span class="stat-title">{{ status.label }}</span>
        <span class="stat-value">{{ stats.statusCounts?.[status.key] || 0 }}</span>
      </div>
      <div class="stat-card status-cancelled">
         <span class="stat-title">Đã hủy</span>
         <span class="stat-value">{{ stats.statusCounts?.cancelled || 0 }}</span>
      </div>
    </div>

    <!-- Bộ lọc -->
    <div class="filter-section">
      <div class="form-group">
        <label>Tìm theo mã đơn hàng</label>
        <input type="text" v-model="filters.order_number" class="form-control" placeholder="VD: #12345...">
      </div>
      <div class="form-group">
        <label>Tìm theo tên khách hàng</label>
        <input type="text" v-model="filters.customer_name" class="form-control" placeholder="Nhập tên khách hàng...">
      </div>
      <div class="form-group">
        <label>Lọc theo trạng thái</label>
        <select v-model="filters.status" class="form-control">
          <option :value="null">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipping">Shipping</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Hiển thị lỗi nếu có -->
    <div v-if="error" class="error-banner">
      <span>⚠️ {{ error }}</span>
      <button @click="retryLoad" class="btn-retry">Thử lại</button>
    </div>

    <!-- Bảng dữ liệu -->
    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th>Đơn hàng</th>
            <th>Sản phẩm</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" style="text-align: center;">
              <div class="loading-spinner"></div>
              Đang tải...
            </td>
          </tr>
          <tr v-else-if="error && orders.length === 0">
            <td colspan="6" style="text-align: center; color: #dc3545;">
              Không thể tải dữ liệu. Vui lòng thử lại sau.
            </td>
          </tr>
          <tr v-else-if="orders.length === 0">
            <td colspan="6" style="text-align: center;">Không tìm thấy đơn hàng nào phù hợp.</td>
          </tr>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <strong>{{ order.order_number }}</strong><br>
              <small>{{ formatDate(order.created_at) }}</small>
            </td>
            <td>
              <div v-if="order?.order_items?.length > 0" class="product-cell">
                <img 
                  :src="getProductImage(order.order_items[0])" 
                  alt="product" 
                  class="product-thumbnail"
                  @error="handleImageError"
                >
                <div>
                  <span>{{ getProductName(order.order_items[0]) }}</span><br>
                  <small class="product-sku">{{ getProductSku(order.order_items[0]) }}</small>

                  <div v-if="order.order_items.length > 1" class="more-products">
                    + {{ order.order_items.length - 1 }} sản phẩm khác
                  </div>
                </div>
              </div>
              <div v-else>N/A</div>
            </td>
            <td>
              <template v-if="order.user_profiles">
                <strong>{{ order.user_profiles.full_name || 'N/A' }}</strong>
              </template>
              <template v-else>
                Khách vãng lai
              </template>
            </td>
            <td>{{ formatCurrency(order.total) }}</td>
            <td>
              <span :class="['status-badge', `status-${order.status}`]">
                {{ order.status }}
              </span>
            </td>
            <td>
              <router-link 
                :to="`/admin/orders/${order.id}`" 
                class="btn-icon btn-secondary" 
                title="Xem chi tiết"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
              </router-link>
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watch, computed } from 'vue';
import api from '@/services/api';
import ProductPagination from '@/components/ProductPagination.vue';

// ========== STATE MANAGEMENT ==========
const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const stats = ref({ totalOrders: 0, statusCounts: {} });

// Bộ lọc
const filters = reactive({ 
  order_number: '', 
  customer_name: '', 
  status: null 
});

// Phân trang
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

// Danh sách trạng thái
const statusList = [
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
];

// ========== API FUNCTIONS ==========
const fetchStats = async () => {
  try {
    const response = await api.get('/orders/stats');
    stats.value = response.data.data;
    stats.value.totalOrders = Object.values(response.data.data.statusCounts || {})
      .reduce((sum, count) => sum + count, 0);
    console.log('✅ Stats loaded successfully');
  } catch (err) {
    console.error('❌ Failed to load stats:', err);
    // Stats không quan trọng lắm, không cần hiển thị lỗi
  }
};

const fetchOrders = async (retries = 3, delay = 2000) => {
  loading.value = true;
  error.value = null;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const params = {
        limit: pagination.itemsPerPage,
        offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
      };

      if (filters.order_number?.trim()) {
        params.order_number = filters.order_number.trim();
      }
      if (filters.customer_name?.trim()) {
        params.customer_name = filters.customer_name.trim();
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await api.get('/orders', { params });
      orders.value = response.data.data || [];
      console.log('Fetched orders:', orders.value);
      pagination.totalItems = response.data.total || 0;

      console.log(`✅ Orders loaded successfully on attempt ${attempt}`);
      loading.value = false;
      return; // Success, exit the function
    } catch (err) {
      console.error(`❌ Attempt ${attempt}/${retries} failed:`, err.message);

      if (attempt === retries) {
        // Last attempt failed, set final error message
        if (err.response?.status === 403) {
          error.value = 'Bạn không có quyền truy cập chức năng này.';
        } else if (err.response?.status === 500) {
          error.value = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          error.value = 'Yêu cầu hết hạn. API có thể đang khởi động hoặc quá tải.';
        } else if (!navigator.onLine) {
          error.value = 'Không có kết nối internet. Vui lòng kiểm tra lại.';
        } else {
          error.value = 'Không thể tải danh sách đơn hàng sau nhiều lần thử.';
        }
        
        if (orders.value.length === 0) {
          orders.value = [];
        }
        loading.value = false;
      } else {
        // Wait before the next retry
        await sleep(delay);
      }
    }
  }
};

// ========== HELPER FUNCTIONS ==========
const getProductImage = (item) => {
  try {
    const variantImages = item?.product_variants?.product_variant_images;
    if (variantImages?.length > 0) {
      return variantImages[0].image_url;
    }
    const productImages = item?.products?.image_urls;
    if (productImages?.length > 0) {
      return productImages[0];
    }
  } catch (err) {
    console.warn('Error getting product image:', err);
  }
  return 'https://via.placeholder.com/60?text=No+Image';
};

const getProductName = (item) => {
  try {
    let name = item?.products?.name || 'Sản phẩm không xác định';
    if (item?.product_variants?.color) {
      name += ` - ${item.product_variants.color}`;
    }
    const quantity = item?.quantity || 1;
    return `${name} (x${quantity})`;
  } catch (err) {
    console.warn('Error getting product name:', err);
    return 'N/A';
  }
};

const getProductSku = (item) => {
  return item?.product_variants?.sku || item?.products?.sku || 'N/A';
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A';
  try {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  } catch (err) {
    return `${value} ₫`;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (err) {
    return dateString;
  }
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/60?text=Error';
};

const retryLoad = () => {
  error.value = null;
  fetchOrders();
  fetchStats();
};

// THÊM MỚI: Hàm xử lý làm mới dữ liệu
const handleRefresh = () => {
  if (loading.value) return; // Ngăn chặn click khi đang tải
  retryLoad();
};

// ========== PAGINATION ==========
const handlePageChange = (page) => {
  pagination.currentPage = page;
  fetchOrders();
};

const handleItemsPerPageChange = (items) => {
  pagination.itemsPerPage = items;
  pagination.currentPage = 1; // Reset về trang đầu
  fetchOrders();
};

// ========== WATCH & LIFECYCLE ==========
let debounceTimer = null;

// Watch filters với debounce
watch(filters, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pagination.currentPage = 1; // Reset về trang 1 khi filter
    fetchOrders();
  }, 500); // Đợi 500ms sau khi user ngừng nhập
}, { 
  deep: true 
});

onMounted(() => {
  console.log('🚀 OrderList component mounted');
  // Load dữ liệu tuần tự để dễ debug
  fetchOrders();
  fetchStats();
});

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
  console.log('👋 OrderList component unmounted');
});
</script>

<style scoped>
/* THÊM MỚI: Style cho header */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions {
  display: flex;
  gap: 10px;
}
/* Stats section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
}
.stat-card {
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
}
.stat-card .stat-title {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 8px;
}
.stat-card .stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}
.stat-card.total {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #212529;
}
.stat-card.total .stat-value {
  color: #0d6efd;
}

/* Filter section */
.filter-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
}
.filter-section .form-group {
  margin-bottom: 0;
}

/* Error banner */
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: #fff3cd;
  border-bottom: 1px solid #ffc107;
  color: #856404;
}
.btn-retry {
  padding: 5px 15px;
  background-color: #ffc107;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-retry:hover {
  background-color: #e0a800;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Product cell */
.product-cell { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}
.product-thumbnail { 
  width: 60px; 
  height: 60px; 
  object-fit: cover; 
  border-radius: 4px; 
  border: 1px solid #eee; 
}
.product-sku { 
  font-family: monospace; 
  color: #6c757d; 
}
.more-products { 
  color: #6c757d; 
  font-style: italic; 
  font-size: 0.85rem;
  margin-top: 4px;
}

/* Status badges */
.status-badge { 
  padding: 4px 10px; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  font-weight: 600; 
  text-transform: capitalize; 
  white-space: nowrap;
}
.status-pending { background-color: #fff0c2; color: #7a4f01; }
.status-confirmed { background-color: #d1e7fd; color: #0d6efd; }
.status-processing { background-color: #e7d6ff; color: #6610f2; }
.status-shipping { background-color: #cff4fc; color: #0dcaf0; }
.status-delivered { background-color: #d1f2eb; color: #0f5132; }
.status-cancelled { background-color: #f8d7da; color: #842029; }

/* Pagination */
.card-footer {
  padding: 15px 25px;
  border-top: 1px solid var(--border-color);
  background-color: #fdfdfd;
}
.page-info {
  font-weight: 500;
  color: #495057;
}

/* Button icon */
.btn-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s;
}
.btn-icon:hover {
  transform: scale(1.1);
}
</style>