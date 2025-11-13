<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Sản phẩm</h2>
      <div class="header-actions">
        <button @click="handleRefresh" class="btn btn-light" :disabled="loading" title="Làm mới danh sách">
          Làm mới
        </button>
        <router-link to="/admin/products/new" class="btn btn-primary">Thêm sản phẩm mới</router-link>
      </div>
    </div>

    <div class="filter-section">
      <div class="form-group">
        <label>Tìm theo tên sản phẩm</label>
        <input type="text" v-model="filters.name" class="form-control" placeholder="Nhập tên sản phẩm...">
      </div>
      <div class="form-group">
        <label>Lọc theo thương hiệu</label>
        <select v-model="filters.brand_id" class="form-control">
          <option :value="null">Tất cả thương hiệu</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.brand_name }}</option>
        </select>
      </div>
       <div class="form-group">
        <label>Lọc theo loại sản phẩm</label>
        <select v-model="filters.type_id" class="form-control">
          <option :value="null">Tất cả các loại</option>
          <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.type_name }}</option>
        </select>
      </div>
    </div>

    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>SKU</th>
            <th>Thương hiệu</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" style="text-align: center;">Đang tải...</td>
          </tr>
          <tr v-else-if="products.length === 0">
            <td colspan="6" style="text-align: center;">Không tìm thấy sản phẩm nào phù hợp.</td>
          </tr>
          <tr v-for="product in products" :key="product.id">
            <td><img :src="product.image_urls?.[0] || 'https://via.placeholder.com/60'" alt="product" width="60" height="60" style="object-fit: cover; border-radius: 4px;"></td>
            <td>{{ product.name }}</td>
            <td>{{ product.sku }}</td>
            <td>{{ product.brands?.brand_name }}</td>
            <td>
              <span :class="['status-badge', product.is_active ? 'status-active' : 'status-inactive']">
                {{ product.is_active ? 'Hoạt động' : 'Ẩn' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <router-link :to="`/admin/products/${product.id}`" class="btn-icon btn-secondary" title="Sửa sản phẩm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                </router-link>
                <button @click="openDeleteDialog(product.id)" class="btn-icon btn-danger" title="Xóa sản phẩm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
   <ConfirmDialog
    :show="showDeleteConfirm"
    title="Xác nhận xóa Sản phẩm"
    message="Bạn có chắc chắn muốn xóa sản phẩm này không? (Hành động này chỉ ẩn sản phẩm)"
    confirmText="Đồng ý Xóa"
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useToast } from '@/composables/useToast';
import ProductPagination from '@/components/ProductPagination.vue';

const { showToast } = useToast();

const products = ref([]);
const loading = ref(false);

// State cho bộ lọc và dữ liệu dropdown
const filters = reactive({
  name: '',
  brand_id: null,
  type_id: null,
});
const brands = ref([]);
const productTypes = ref([]);

// State cho phân trang
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

// Hàm fetchProducts giờ sẽ nhận tham số từ state
const fetchProducts = async () => {
  loading.value = true;
  try {
    // Xây dựng các tham số hợp lệ
    const params = {
      limit: pagination.itemsPerPage,
      offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
    };
    if (filters.name) params.name = filters.name;
    if (filters.brand_id) params.brand_id = filters.brand_id;
    if (filters.type_id) params.type_id = filters.type_id;

    const response = await api.get('/products', { params });
    // API trả về { data: [...], total: number }
    products.value = response.data.data.data|| [];
    pagination.totalItems = response.data.data.total || 0;
    console.log(pagination.totalItems);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
  } finally {
      loading.value = false;
  }
};

// Hàm để tải dữ liệu cho các dropdown bộ lọc
const fetchFilterData = async () => {
    try {
        const [brandsRes, typesRes] = await Promise.all([
            api.get('/brands'),
            api.get('/product-types')
        ]);
        brands.value = brandsRes.data.data;
        productTypes.value = typesRes.data.data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu bộ lọc:", error);
    }
};

// Hàm để làm mới dữ liệu
const handleRefresh = async () => {
  pagination.currentPage = 1;
  await fetchProducts();
};

// Sử dụng watch để tự động lọc khi người dùng thay đổi input
let debounceTimer = null;
watch(filters, (newFilters, oldFilters) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        pagination.currentPage = 1; // Reset về trang 1 khi lọc
        fetchProducts();
    }, 500); // Chờ 500ms sau khi người dùng ngừng nhập/chọn rồi mới gọi API
}, { 
    deep: true
});

// Logic cho việc xóa
const showDeleteConfirm = ref(false);
const productIdToDelete = ref(null);

const openDeleteDialog = (id) => {
    productIdToDelete.value = id;
    showDeleteConfirm.value = true;
};
const closeDeleteDialog = () => {
    productIdToDelete.value = null;
    showDeleteConfirm.value = false;
};
const confirmDelete = async () => {
  try {
    await api.delete(`/products/${productIdToDelete.value}`);
    // Tải lại danh sách để cập nhật trạng thái
    await fetchProducts();
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    showToast('Không thể xóa sản phẩm. Vui lòng thử lại.', 'error');
  } finally {
      closeDeleteDialog();
  }
};

// Hàm xử lý sự kiện phân trang
const handlePageChange = (page) => {
  pagination.currentPage = page;
  fetchProducts();
};

const handleItemsPerPageChange = (items) => {
  pagination.itemsPerPage = items;
  pagination.currentPage = 1; // Reset về trang đầu
  fetchProducts();
};

onMounted(() => {
    fetchProducts();
    fetchFilterData();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}
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
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
}
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