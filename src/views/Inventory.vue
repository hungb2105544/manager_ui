<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Kho hàng</h2>
      <div class="header-actions">
        <button @click="handleExport" class="btn btn-success" :disabled="isExporting">
          {{ isExporting ? 'Đang xuất...' : 'Xuất Excel' }}
        </button>
      </div>
    </div>
    
    <!-- Thống kê kho hàng -->
    <div class="stats-section">
      <div class="stat-card total-items">
        <span class="stat-title">Tổng sản phẩm</span>
        <span class="stat-value">{{ stats.total_items || 0 }}</span>
      </div>
      <div class="stat-card total-quantity">
        <span class="stat-title">Tổng số lượng</span>
        <span class="stat-value">{{ stats.total_quantity || 0 }}</span>
      </div>
      <div class="stat-card low-stock">
        <span class="stat-title">Sắp hết hàng</span>
        <span class="stat-value">{{ stats.low_stock_items || 0 }}</span>
      </div>
      <div class="stat-card out-of-stock">
        <span class="stat-title">Hết hàng</span>
        <span class="stat-value">{{ stats.out_of_stock_items || 0 }}</span>
      </div>
    </div>

    <div class="filter-section">
      <div class="form-group">
        <label>Lọc theo chi nhánh</label>
        <select v-model="filterBranch" class="form-control">
          <option value="">Tất cả chi nhánh</option>
          <option v-for="branch in branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Tìm kiếm theo tên sản phẩm</label>
        <input type="text" v-model="filterSearchText" class="form-control" placeholder="Nhập tên sản phẩm...">
      </div>
    </div>

    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Biến thể (Màu)</th>
            <th>Size</th>
            <th>Chi nhánh</th>
            <th>Tồn kho</th>
            <th>Đang giữ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" style="text-align: center;">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="inventoryList.length === 0">
             <td colspan="6" style="text-align: center;">Không tìm thấy dữ liệu phù hợp.</td>
          </tr>
          <tr v-for="item in inventoryList" :key="item.id">
            <td>{{ item.products?.name }}</td>
            <td>{{ item.product_variants?.color || 'N/A' }}</td>
            <td>{{ item.product_variants?.sizes?.size_name || 'N/A' }}</td>
            <td>{{ item.branches?.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.reserved_quantity }}</td>
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
import { ref, onMounted, computed, reactive, watch } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import ProductPagination from '@/components/ProductPagination.vue';

const { showToast } = useToast();

const inventoryList = ref([]);
const branches = ref([]);
const loading = ref(true);
const isExporting = ref(false);

const stats = ref({});
// --- Filter State ---
const filterBranch = ref('');
const filterSearchText = ref('');

// --- Pagination State ---
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});


// --- API Calls ---
const fetchInventory = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.itemsPerPage,
      offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
      branch_id: filterBranch.value || null,
      product_name: filterSearchText.value || null,
    };

    const response = await api.get('/inventory', { params });
    inventoryList.value = response.data.data;
    pagination.totalItems = response.data.total;

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu kho hàng:", error);
    showToast("Không thể tải dữ liệu kho hàng. Vui lòng thử lại.", 'error');
  } finally {
    loading.value = false;
  }
};

const fetchBranches = async () => {
  try {
    const response = await api.get('/branches');
    branches.value = response.data.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách chi nhánh:", error);
  }
};

const fetchStats = async () => {
  try {
    const params = {};
    if (filterBranch.value) {
      params.branch_id = filterBranch.value;
    }
    const response = await api.get('/inventory/summary', { params });
    stats.value = response.data.data;
  } catch (error) {
    console.error("Lỗi khi tải thống kê kho:", error);
    // Không cần hiển thị toast cho lỗi này vì nó không quá quan trọng
  }
};

// --- Watchers for filters ---
let debounceTimer = null;
watch([filterBranch, filterSearchText], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pagination.currentPage = 1; // Reset về trang 1 khi lọc
    fetchInventory();
    fetchStats(); // Cập nhật lại thống kê khi lọc
  }, 500); // Debounce 500ms
});

// --- Export Handler ---
const handleExport = async () => {
  isExporting.value = true;
  try {
    // Tìm tên chi nhánh được chọn để gửi lên server
    const selectedBranch = branches.value.find(b => b.id === parseInt(filterBranch.value));
    const branchName = selectedBranch ? selectedBranch.name : null;

    const params = {
      branch_id: filterBranch.value || null,
      product_name: filterSearchText.value || null,
      branch_name: branchName, // Thêm branch_name vào params
    };

    const response = await api.get('/inventory/export', { 
      params,
      responseType: 'blob' // Quan trọng: để nhận dữ liệu file
    });

    // Lấy tên file từ header 'Content-Disposition' do server trả về
    const contentDisposition = response.headers['content-disposition'];
    let filename = `BaoCaoTonKho_${new Date().toISOString().slice(0, 10)}.xlsx`; // Tên mặc định
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = decodeURIComponent(filenameMatch[1]); // Giải mã tên file nếu có ký tự đặc biệt
      }
    }

    // Tạo URL tạm thời từ blob và trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    link.remove();
    window.URL.revokeObjectURL(url);
    showToast('Xuất file Excel thành công!', 'success');
  } catch (error) {
    console.error("Lỗi khi xuất file Excel:", error);
    showToast("Không thể xuất file. Vui lòng thử lại.", 'error');
  } finally {
    isExporting.value = false;
  }
};

// --- Pagination Handlers ---
const handlePageChange = (page) => {
  pagination.currentPage = page;
  fetchInventory();
};

const handleItemsPerPageChange = (items) => {
  pagination.itemsPerPage = items;
  pagination.currentPage = 1; // Reset về trang đầu
  fetchInventory();
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchInventory();
  fetchBranches();
  fetchStats();
});

</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
}
.stat-card {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.stat-card .stat-title { font-size: 0.9rem; font-weight: 500; margin-bottom: 8px; color: #6c757d; }
.stat-card .stat-value { font-size: 2rem; font-weight: 700; }

.total-items { background-color: #e7f3ff; color: #0056b3; }
.total-quantity { background-color: #e8f5e9; color: #1a7336; }
.low-stock { background-color: #fff3cd; color: #856404; }
.out-of-stock { background-color: #f8d7da; color: #721c24; }

.filter-section {
  display: flex;
  gap: 20px;
  padding: 0 25px 20px 25px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}
.filter-section .form-group {
  margin-bottom: 0;
}
.card-footer {
  padding: 0 25px;
  border-top: 1px solid var(--border-color);
  background-color: #fdfdfd;
}

.btn-success {
  background-color: #198754;
  color: white;
}

</style>