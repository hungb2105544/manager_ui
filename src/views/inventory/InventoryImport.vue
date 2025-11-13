<!-- <template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Nhập hàng hàng loạt</h2>
      <div class="header-actions">
        <button @click="toggleImportMode" class="btn btn-secondary" :disabled="isLoading">
          {{ isBulkMode ? 'Chế độ đơn lẻ' : 'Chế độ hàng loạt' }}
        </button>
        <button @click="resetForm" class="btn btn-light" :disabled="isLoading" title="Làm mới form">
          Làm mới
        </button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-if="isBulkMode" class="bulk-mode">
        <div class="mode-info alert alert-info">
          <strong>💡 Chế độ hàng loạt:</strong> Thêm nhiều sản phẩm cho nhiều chi nhánh cùng lúc
        </div>

        <div class="form-group">
          <label>Chọn chi nhánh nhập hàng *</label>
          <div class="branch-selection">
            <div v-for="branch in branches" :key="branch.id" class="branch-checkbox">
              <input 
                type="checkbox" 
                :id="'branch-' + branch.id" 
                :value="branch.id"
                v-model="selectedBranches"
              />
              <label :for="'branch-' + branch.id">{{ branch.name }}</label>
            </div>
          </div>
          <small class="text-muted">Đã chọn: {{ selectedBranches.length }} chi nhánh</small>
        </div>

        <div class="products-section">
          <div class="section-header">
            <h4>Danh sách sản phẩm nhập</h4>
            <button @click="addProductRow" class="btn btn-sm btn-success">
              + Thêm sản phẩm
            </button>
          </div>

          <div class="products-table-wrapper">
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 30%">Sản phẩm</th>
                  <th style="width: 25%">Phiên bản</th>
                  <th style="width: 15%">Số lượng</th>
                  <th style="width: 15%">Tồn hiện tại</th>
                  <th style="width: 10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in productRows" :key="item.id" class="product-row">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <select v-model="item.productId" @change="onProductChange(item)" class="form-control form-control-sm">
                      <option :value="null">-- Chọn sản phẩm --</option>
                      <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }} ({{ product.sku || 'N/A' }})
                      </option>
                    </select>
                  </td>
                  <td>
                    <select 
                      v-model="item.variantId" 
                      class="form-control form-control-sm"
                      :disabled="!item.variants || item.variants.length === 0"
                    >
                      <option :value="null">{{ item.variants?.length > 0 ? '-- Chọn phiên bản --' : 'Không có phiên bản' }}</option>
                      <option v-for="variant in item.variants" :key="variant.id" :value="variant.id">
                        {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }}
                      </option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      class="form-control form-control-sm"
                      min="1"
                      placeholder="Số lượng"
                    />
                  </td>
                  <td>
                    <span class="stock-info" :class="getStockClass(item.currentStock)">
                      {{ item.currentStock !== null ? item.currentStock : '-' }}
                    </span>
                  </td>
                  <td>
                    <button @click="removeProductRow(index)" class="btn btn-sm btn-danger" title="Xóa">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-card">
            <h5>📊 Tóm tắt nhập hàng</h5>
            <p><strong>Chi nhánh:</strong> {{ selectedBranches.length }} chi nhánh</p>
            <p><strong>Sản phẩm:</strong> {{ validProductRows.length }} sản phẩm</p>
            <p><strong>Tổng giao dịch:</strong> {{ selectedBranches.length * validProductRows.length }} lần nhập</p>
          </div>
        </div>

        <div class="form-actions">
          <button @click="handleBulkSubmit" class="btn btn-primary btn-lg" :disabled="isLoading || !canSubmitBulk">
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận nhập hàng hàng loạt' }}
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="grid-container">

          <div class="form-column">
            <div class="form-group">
              <label for="branch">Chi nhánh nhập hàng *</label>
              <select id="branch" v-model="form.branchId" class="form-control" required>
                <option :value="null" disabled>-- Chọn chi nhánh --</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="product">Sản phẩm *</label>
              <select id="product" v-model="selectedProduct" class="form-control" required>
                <option :value="null" disabled>-- Tìm & chọn sản phẩm --</option>
                <option v-for="product in products" :key="product.id" :value="product">
                  {{ product.name }} (SKU: {{ product.sku || 'N/A' }})
                </option>
              </select>
            </div>

            <div v-if="variants.length > 0" class="form-group">
              <label for="variant">Phiên bản (Màu sắc/Size) *</label>
              <select id="variant" v-model="form.variantId" class="form-control" required>
                <option :value="null" disabled>-- Chọn phiên bản --</option>
                <option v-for="variant in variants" :key="variant.id" :value="variant.id">
                  {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }} (SKU: {{ variant.sku }})
                </option>
              </select>
            </div>
            <div v-else-if="selectedProduct && variants.length === 0" class="form-group">
              <p class="text-muted">Sản phẩm này không có phiên bản.</p>
            </div>

            <div class="form-group">
              <label for="quantity">Số lượng nhập *</label>
              <input
                id="quantity"
                type="number"
                v-model.number="form.quantity"
                class="form-control"
                placeholder="Nhập số lượng"
                min="1"
                required
              />
            </div>
          </div>
          <div class="preview-column">
            <h4>Thông tin xem trước</h4>
            <div v-if="!selectedProduct" class="preview-placeholder">
              Vui lòng chọn sản phẩm để xem thông tin.
            </div>
            <div v-else class="preview-content">
              <img :src="previewImage" alt="Product Image" class="preview-image" @error="handleImageError">
              <p><strong>Tên:</strong> {{ selectedProduct.name }}</p>
              <p><strong>SKU:</strong> {{ previewSku }}</p>
              <p><strong>Tồn kho hiện tại:</strong> <span class="text-primary font-weight-bold">{{ currentStock !== null ? currentStock : 'Đang tải...' }}</span></p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận nhập hàng' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

// State
const branches = ref([]);
const products = ref([]);
const variants = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentStock = ref(null);
const isBulkMode = ref(false);

// Bulk mode state
const selectedBranches = ref([]);
const productRows = ref([]);
let rowIdCounter = 0;

const form = reactive({
  branchId: null,
  productId: null,
  variantId: null,
  quantity: null,
});

const selectedProduct = ref(null);

// Computed
const validProductRows = computed(() => {
  return productRows.value.filter(row => 
    row.productId && 
    row.quantity > 0 &&
    (row.variants?.length === 0 || row.variantId)
  );
});

const canSubmitBulk = computed(() => {
  return selectedBranches.value.length > 0 && validProductRows.value.length > 0;
});

const previewImage = computed(() => {
  if (!selectedProduct.value) return 'https://via.placeholder.com/150?text=No+Image';
  
  if (form.variantId) {
    const variant = variants.value.find(v => v.id === form.variantId);
    if (variant?.product_variant_images?.length > 0) {
      return variant.product_variant_images[0].image_url;
    }
  }
  
  if (selectedProduct.value.image_urls?.length > 0) {
    return selectedProduct.value.image_urls[0];
  }
  
  return 'https://via.placeholder.com/150?text=No+Image';
});

const previewSku = computed(() => {
  if (!selectedProduct.value) return 'N/A';
  if (form.variantId) {
    const variant = variants.value.find(v => v.id === form.variantId);
    return variant?.sku || 'N/A';
  }
  return selectedProduct.value.sku || 'N/A';
});

// Methods
const toggleImportMode = () => {
  isBulkMode.value = !isBulkMode.value;
  resetForm();
};

const addProductRow = () => {
  productRows.value.push({
    id: ++rowIdCounter,
    productId: null,
    variantId: null,
    quantity: null,
    variants: [],
    currentStock: null
  });
};

const removeProductRow = (index) => {
  productRows.value.splice(index, 1);
};

const onProductChange = async (item) => {
  item.variantId = null;
  item.variants = [];
  item.currentStock = null;
  
  if (!item.productId) return;
  
  try {
    const response = await api.get(`/products/${item.productId}`);
    item.variants = response.data.data.product_variants || [];
    
    // Fetch current stock for first selected branch
    if (selectedBranches.value.length > 0) {
      await fetchStockForRow(item, selectedBranches.value[0]);
    }
  } catch (err) {
    console.error('Lỗi khi tải phiên bản:', err);
  }
};

const fetchStockForRow = async (item, branchId) => {
  try {
    const params = {
      branch_id: branchId,
      product_id: item.productId,
      variant_id: item.variantId || null,
    };
    const response = await api.get('/inventory', { params });
    if (response.data.data && response.data.data.length > 0) {
      item.currentStock = response.data.data[0].quantity;
    } else {
      item.currentStock = 0;
    }
  } catch (err) {
    console.error('Lỗi khi lấy tồn kho:', err);
    item.currentStock = 'Lỗi';
  }
};

const getStockClass = (stock) => {
  if (stock === null || stock === 'Lỗi') return '';
  if (stock === 0) return 'stock-empty';
  if (stock < 10) return 'stock-low';
  return 'stock-ok';
};

const resetForm = () => {
  form.branchId = null;
  form.productId = null;
  form.variantId = null;
  form.quantity = null;
  selectedProduct.value = null;
  error.value = null;
  
  // Bulk mode reset
  selectedBranches.value = [];
  productRows.value = [];
  rowIdCounter = 0;
};

const handleBulkSubmit = async () => {
  error.value = null;
  
  if (!canSubmitBulk.value) {
    showToast('Vui lòng chọn ít nhất 1 chi nhánh và 1 sản phẩm hợp lệ.', 'error');
    return;
  }

  isLoading.value = true;
  
  const requests = [];
  let successCount = 0;
  let failCount = 0;
  
  try {
    // Tạo danh sách các request
    for (const branchId of selectedBranches.value) {
      for (const item of validProductRows.value) {
        requests.push({
          branch_id: branchId,
          product_id: item.productId,
          variant_id: item.variantId || null,
          quantity: item.quantity,
        });
      }
    }
    
    // Thực hiện từng request (có thể dùng Promise.all nếu muốn nhanh hơn)
    for (const payload of requests) {
      try {
        await api.post('/inventory/increase', payload);
        successCount++;
      } catch (err) {
        failCount++;
        console.error('Lỗi khi nhập hàng:', err);
      }
    }
    
    if (failCount === 0) {
      showToast(`✅ Nhập hàng thành công ${successCount} giao dịch!`, 'success');
      resetForm();
    } else {
      showToast(`⚠️ Hoàn thành ${successCount} giao dịch, ${failCount} thất bại.`, 'warning');
    }
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi nhập hàng.';
    error.value = errorMessage;
    showToast(errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    const [branchRes, productRes] = await Promise.all([
      api.get('/branches?is_active=true'),
      api.get('/products?limit=1000')
    ]);
    branches.value = branchRes.data.data.data;
    products.value = productRes.data.data.data;
  } catch (err) {
    error.value = 'Không thể tải dữ liệu cần thiết (chi nhánh, sản phẩm).';
    showToast(error.value, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchVariants = async (productId) => {
  if (!productId) {
    variants.value = [];
    return;
  }
  try {
    const response = await api.get(`/products/${productId}`);
    variants.value = response.data.data.product_variants || [];
  } catch (err) {
    console.error('Lỗi khi tải phiên bản:', err);
    variants.value = [];
  }
};

const fetchCurrentStock = async () => {
  if (!form.branchId || !form.productId) {
    currentStock.value = null;
    return;
  }
  
  currentStock.value = null;
  try {
    const params = {
      branch_id: form.branchId,
      product_id: form.productId,
      variant_id: form.variantId || null,
    };
    const response = await api.get('/inventory', { params });
    if (response.data.data && response.data.data.length > 0) {
      currentStock.value = response.data.data[0].quantity;
    } else {
      currentStock.value = 0;
    }
  } catch (err) {
    console.error('Lỗi khi lấy tồn kho hiện tại:', err);
    currentStock.value = 'Lỗi';
  }
};

const handleSubmit = async () => {
  error.value = null;
  if (!form.branchId || !form.productId || !form.quantity || form.quantity <= 0) {
    showToast('Vui lòng điền đầy đủ thông tin và số lượng phải lớn hơn 0.', 'error');
    return;
  }

  if (variants.value.length > 0 && !form.variantId) {
    showToast('Sản phẩm này có phiên bản, vui lòng chọn một phiên bản.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      branch_id: form.branchId,
      product_id: form.productId,
      variant_id: form.variantId || null,
      quantity: form.quantity,
    };
    
    await api.post('/inventory/increase', payload);
    
    showToast('Nhập hàng thành công!', 'success');
    resetForm();
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi nhập hàng.';
    error.value = errorMessage;
    showToast(errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/150?text=Error';
};

// Watchers
watch(selectedProduct, (newProduct) => {
  form.productId = newProduct ? newProduct.id : null;
  form.variantId = null;
  if (newProduct) {
    fetchVariants(newProduct.id);
  } else {
    variants.value = [];
  }
});

watch(() => [form.branchId, form.productId, form.variantId], () => {
  fetchCurrentStock();
}, { deep: true });

// Lifecycle
onMounted(() => {
  fetchInitialData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.mode-info {
  margin-bottom: 20px;
}
.branch-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}
.branch-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}
.branch-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.branch-checkbox label {
  cursor: pointer;
  margin: 0;
}
.products-section {
  margin-top: 30px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.products-table-wrapper {
  overflow-x: auto;
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #dee2e6;
}
.products-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.product-row:hover {
  background-color: #f8f9fa;
}
.stock-info {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}
.stock-ok {
  color: #28a745;
  background: #d4edda;
}
.stock-low {
  color: #ffc107;
  background: #fff3cd;
}
.stock-empty {
  color: #dc3545;
  background: #f8d7da;
}
.summary-section {
  margin-top: 30px;
}
.summary-card {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 20px;
}
.summary-card h5 {
  margin-bottom: 15px;
  color: #0056b3;
}
.summary-card p {
  margin: 8px 0;
}
.grid-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}
.form-column {
  display: flex;
  flex-direction: column;
}
.preview-column {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
}
.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}
.preview-content p {
  margin-bottom: 10px;
}
.preview-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  margin: 0 auto 15px auto;
  display: block;
  border: 1px solid #dee2e6;
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
.alert {
  margin-bottom: 20px;
}
.text-primary {
  color: #0d6efd !important;
}
.font-weight-bold {
  font-weight: 700;
}
@media (max-width: 992px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .preview-column {
    margin-top: 20px;
  }
  .branch-selection {
    grid-template-columns: 1fr;
  }
}
</style> -->
<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Nhập hàng hàng loạt</h2>
      <div class="header-actions">
        <button @click="toggleImportMode" class="btn btn-secondary" :disabled="isLoading">
          {{ isBulkMode ? 'Chế độ đơn lẻ' : 'Chế độ hàng loạt' }}
        </button>
        <button @click="resetForm" class="btn btn-light" :disabled="isLoading" title="Làm mới form">
          Làm mới
        </button>
      </div>
    </div>

    <div class="card-body">
      <!-- Hiển thị lỗi chung -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- CHẾ ĐỘ HÀNG LOẠT -->
      <div v-if="isBulkMode" class="bulk-mode">
        <div class="mode-info alert alert-info">
          <strong>💡 Chế độ hàng loạt:</strong> Thêm nhiều sản phẩm cho nhiều chi nhánh cùng lúc
        </div>

        <!-- Chọn chi nhánh -->
        <div class="form-group">
          <label>Chọn chi nhánh nhập hàng *</label>
          <div class="branch-selection">
            <div v-for="branch in branches" :key="branch.id" class="branch-checkbox">
              <input 
                type="checkbox" 
                :id="'branch-' + branch.id" 
                :value="branch.id"
                v-model="selectedBranches"
              />
              <label :for="'branch-' + branch.id">{{ branch.name }}</label>
            </div>
          </div>
          <small class="text-muted">Đã chọn: {{ selectedBranches.length }} chi nhánh</small>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="products-section">
          <div class="section-header">
            <h4>Danh sách sản phẩm nhập</h4>
            <button @click="addProductRow" class="btn btn-sm btn-success">
              + Thêm sản phẩm
            </button>
          </div>

          <div class="products-table-wrapper">
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 25%">Sản phẩm</th>
                  <th style="width: 20%">Phiên bản</th>
                  <th style="width: 10%">Số lượng</th>
                  <th style="width: 30%">Tồn kho theo chi nhánh</th>
                  <th style="width: 10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in productRows" :key="item.id" class="product-row">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <v-select
                      v-model="item.selectedProduct"
                      :options="products"
                      :reduce="product => product"
                      label="name"
                      placeholder="🔍 Tìm sản phẩm..."
                      :filterable="true"
                      @option:selected="onProductSelected(item, $event)"
                      class="vue-select-small"
                    >
                      <template #option="{ name, sku }">
                        <div class="select-option">
                          <strong>{{ name }}</strong>
                          <span class="text-muted"> (SKU: {{ sku || 'N/A' }})</span>
                        </div>
                      </template>
                      <template #selected-option="{ name, sku }">
                        {{ name }} ({{ sku || 'N/A' }})
                      </template>
                    </v-select>
                  </td>
                  <td>
                    <v-select
                      v-model="item.variantId"
                      :options="item.variants"
                      :reduce="variant => variant.id"
                      label="display_name"
                      placeholder="-- Chọn phiên bản --"
                      :disabled="!item.variants || item.variants.length === 0"
                      @option:selected="fetchStockForAllBranches(item)"
                      class="vue-select-small"
                    >
                      <template #option="variant">
                        {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }}
                      </template>
                      <template #selected-option="variant">
                        {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }}
                      </template>
                    </v-select>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      class="form-control form-control-sm"
                      min="1"
                      placeholder="Số lượng"
                    />
                  </td>
                  <td>
                    <div v-if="item.branchStocks && Object.keys(item.branchStocks).length > 0" class="branch-stocks">
                      <div v-for="(stock, branchId) in item.branchStocks" :key="branchId" class="branch-stock-item">
                        <span class="branch-name">{{ getBranchName(branchId) }}:</span>
                        <span class="stock-info" :class="getStockClass(stock)">
                          {{ stock !== null ? stock : '-' }}
                        </span>
                      </div>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <button @click="removeProductRow(index)" class="btn btn-sm btn-danger" title="Xóa">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tóm tắt -->
        <div class="summary-section">
          <div class="summary-card">
            <h5>📊 Tóm tắt nhập hàng</h5>
            <p><strong>Chi nhánh:</strong> {{ selectedBranches.length }} chi nhánh</p>
            <p><strong>Sản phẩm:</strong> {{ validProductRows.length }} sản phẩm</p>
            <p><strong>Tổng giao dịch:</strong> {{ selectedBranches.length * validProductRows.length }} lần nhập</p>
          </div>
        </div>

        <!-- Nút xác nhận -->
        <div class="form-actions">
          <button @click="handleBulkSubmit" class="btn btn-primary btn-lg" :disabled="isLoading || !canSubmitBulk">
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận nhập hàng hàng loạt' }}
          </button>
        </div>
      </div>

      <!-- CHẾ ĐỘ ĐƠN LẺ -->
      <form v-else @submit.prevent="handleSubmit">
        <div class="grid-container">
          <!-- Cột 1: Thông tin cơ bản -->
          <div class="form-column">
            <div class="form-group">
              <label for="branch">Chi nhánh nhập hàng *</label>
              <select id="branch" v-model="form.branchId" class="form-control" required>
                <option :value="null" disabled>-- Chọn chi nhánh --</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="product">Sản phẩm *</label>
              <v-select
                v-model="selectedProduct"
                :options="products"
                :reduce="product => product"
                label="name"
                placeholder="🔍 Tìm kiếm sản phẩm..."
                :filterable="true"
                required
              >
                <template #option="{ name, sku }">
                  <div class="select-option">
                    <strong>{{ name }}</strong>
                    <span class="text-muted"> (SKU: {{ sku || 'N/A' }})</span>
                  </div>
                </template>
                <template #selected-option="{ name, sku }">
                  {{ name }} ({{ sku || 'N/A' }})
                </template>
              </v-select>
            </div>

            <div v-if="variants.length > 0" class="form-group">
              <label for="variant">Phiên bản (Màu sắc/Size) *</label>
              <v-select
                v-model="form.variantId"
                :options="variants"
                :reduce="variant => variant.id"
                label="display_name"
                placeholder="-- Chọn phiên bản --"
                required
              >
                <template #option="variant">
                  <div class="select-option">
                    {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }}
                    <span class="text-muted"> (SKU: {{ variant.sku }})</span>
                  </div>
                </template>
                <template #selected-option="variant">
                  {{ variant.color }} - {{ variant.sizes?.size_name || 'N/A' }} ({{ variant.sku }})
                </template>
              </v-select>
            </div>
            <div v-else-if="selectedProduct && variants.length === 0" class="form-group">
              <p class="text-muted">Sản phẩm này không có phiên bản.</p>
            </div>

            <div class="form-group">
              <label for="quantity">Số lượng nhập *</label>
              <input
                id="quantity"
                type="number"
                v-model.number="form.quantity"
                class="form-control"
                placeholder="Nhập số lượng"
                min="1"
                required
              />
            </div>
          </div>

          <!-- Cột 2: Thông tin xem trước -->
          <div class="preview-column">
            <h4>Thông tin xem trước</h4>
            <div v-if="!selectedProduct" class="preview-placeholder">
              Vui lòng chọn sản phẩm để xem thông tin.
            </div>
            <div v-else class="preview-content">
              <img :src="previewImage" alt="Product Image" class="preview-image" @error="handleImageError">
              <p><strong>Tên:</strong> {{ selectedProduct.name }}</p>
              <p><strong>SKU:</strong> {{ previewSku }}</p>
              <p><strong>Tồn kho hiện tại:</strong> <span class="text-primary font-weight-bold">{{ currentStock !== null ? currentStock : 'Đang tải...' }}</span></p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận nhập hàng' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

// State
const branches = ref([]);
const products = ref([]);
const variants = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentStock = ref(null);
const isBulkMode = ref(false);

// Bulk mode state
const selectedBranches = ref([]);
const productRows = ref([]);
let rowIdCounter = 0;

const form = reactive({
  branchId: null,
  productId: null,
  variantId: null,
  quantity: null,
});

const selectedProduct = ref(null);

// Computed
const validProductRows = computed(() => {
  return productRows.value.filter(row => 
    row.productId && 
    row.quantity > 0 &&
    (row.variants?.length === 0 || row.variantId)
  );
});

const canSubmitBulk = computed(() => {
  return selectedBranches.value.length > 0 && validProductRows.value.length > 0;
});

const previewImage = computed(() => {
  if (!selectedProduct.value) return 'https://via.placeholder.com/150?text=No+Image';
  
  if (form.variantId) {
    const variant = variants.value.find(v => v.id === form.variantId);
    if (variant?.product_variant_images?.length > 0) {
      return variant.product_variant_images[0].image_url;
    }
  }
  
  if (selectedProduct.value.image_urls?.length > 0) {
    return selectedProduct.value.image_urls[0];
  }
  
  return 'https://via.placeholder.com/150?text=No+Image';
});

const previewSku = computed(() => {
  if (!selectedProduct.value) return 'N/A';
  if (form.variantId) {
    const variant = variants.value.find(v => v.id === form.variantId);
    return variant?.sku || 'N/A';
  }
  return selectedProduct.value.sku || 'N/A';
});

// Methods
const toggleImportMode = () => {
  isBulkMode.value = !isBulkMode.value;
  resetForm();
};

const addProductRow = () => {
  productRows.value.push({
    id: ++rowIdCounter,
    productId: null,
    selectedProduct: null,
    variantId: null,
    quantity: null,
    variants: [],
    branchStocks: {}
  });
};

const removeProductRow = (index) => {
  productRows.value.splice(index, 1);
};

const onProductSelected = async (item, product) => {
  item.productId = product.id;
  item.variantId = null;
  item.variants = [];
  item.branchStocks = {};
  
  try {
    const response = await api.get(`/products/${product.id}`);
    item.variants = response.data.data.product_variants || [];
    
    // Add display_name for vue-select
    item.variants = item.variants.map(v => ({
      ...v,
      display_name: `${v.color} - ${v.sizes?.size_name || 'N/A'}`
    }));
    
    // Fetch stock cho tất cả chi nhánh đã chọn
    await fetchStockForAllBranches(item);
  } catch (err) {
    console.error('Lỗi khi tải phiên bản:', err);
  }
};

const fetchStockForAllBranches = async (item) => {
  if (selectedBranches.value.length === 0) return;
  
  item.branchStocks = {};
  
  for (const branchId of selectedBranches.value) {
    try {
      const params = {
        branch_id: branchId,
        product_id: item.productId,
        variant_id: item.variantId || null,
      };
      const response = await api.get('/inventory', { params });
      if (response.data.data && response.data.data.length > 0) {
        item.branchStocks[branchId] = response.data.data[0].quantity;
      } else {
        item.branchStocks[branchId] = 0;
      }
    } catch (err) {
      console.error(`Lỗi khi lấy tồn kho chi nhánh ${branchId}:`, err);
      item.branchStocks[branchId] = 'Lỗi';
    }
  }
};

const getBranchName = (branchId) => {
  const branch = branches.value.find(b => b.id === parseInt(branchId));
  return branch ? branch.name : `Chi nhánh ${branchId}`;
};

const getStockClass = (stock) => {
  if (stock === null || stock === 'Lỗi') return '';
  if (stock === 0) return 'stock-empty';
  if (stock < 10) return 'stock-low';
  return 'stock-ok';
};

const resetForm = () => {
  form.branchId = null;
  form.productId = null;
  form.variantId = null;
  form.quantity = null;
  selectedProduct.value = null;
  error.value = null;
  
  // Bulk mode reset
  selectedBranches.value = [];
  productRows.value = [];
  rowIdCounter = 0;
};

const handleBulkSubmit = async () => {
  error.value = null;
  
  if (!canSubmitBulk.value) {
    showToast('Vui lòng chọn ít nhất 1 chi nhánh và 1 sản phẩm hợp lệ.', 'error');
    return;
  }

  isLoading.value = true;
  
  const requests = [];
  let successCount = 0;
  let failCount = 0;
  
  try {
    // Tạo danh sách các request
    for (const branchId of selectedBranches.value) {
      for (const item of validProductRows.value) {
        requests.push({
          branch_id: branchId,
          product_id: item.productId,
          variant_id: item.variantId || null,
          quantity: item.quantity,
        });
      }
    }
    
    // Thực hiện từng request
    for (const payload of requests) {
      try {
        await api.post('/inventory/increase', payload);
        successCount++;
      } catch (err) {
        failCount++;
        console.error('Lỗi khi nhập hàng:', err);
      }
    }
    
    if (failCount === 0) {
      showToast(`✅ Nhập hàng thành công ${successCount} giao dịch!`, 'success');
      resetForm();
    } else {
      showToast(`⚠️ Hoàn thành ${successCount} giao dịch, ${failCount} thất bại.`, 'warning');
    }
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi nhập hàng.';
    error.value = errorMessage;
    showToast(errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    const [branchRes, productRes] = await Promise.all([
      api.get('/branches?is_active=true'),
      api.get('/products?limit=1000')
    ]);
    branches.value = branchRes.data.data.data;
    products.value = productRes.data.data.data;
  } catch (err) {
    error.value = 'Không thể tải dữ liệu cần thiết (chi nhánh, sản phẩm).';
    showToast(error.value, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchVariants = async (productId) => {
  if (!productId) {
    variants.value = [];
    return;
  }
  try {
    const response = await api.get(`/products/${productId}`);
    const variantsList = response.data.data.product_variants || [];
    // Add display_name for vue-select
    variants.value = variantsList.map(v => ({
      ...v,
      display_name: `${v.color} - ${v.sizes?.size_name || 'N/A'}`
    }));
  } catch (err) {
    console.error('Lỗi khi tải phiên bản:', err);
    variants.value = [];
  }
};

const fetchCurrentStock = async () => {
  if (!form.branchId || !form.productId) {
    currentStock.value = null;
    return;
  }
  
  currentStock.value = null;
  try {
    const params = {
      branch_id: form.branchId,
      product_id: form.productId,
      variant_id: form.variantId || null,
    };
    const response = await api.get('/inventory', { params });
    if (response.data.data && response.data.data.length > 0) {
      currentStock.value = response.data.data[0].quantity;
    } else {
      currentStock.value = 0;
    }
  } catch (err) {
    console.error('Lỗi khi lấy tồn kho hiện tại:', err);
    currentStock.value = 'Lỗi';
  }
};

const handleSubmit = async () => {
  error.value = null;
  if (!form.branchId || !form.productId || !form.quantity || form.quantity <= 0) {
    showToast('Vui lòng điền đầy đủ thông tin và số lượng phải lớn hơn 0.', 'error');
    return;
  }

  if (variants.value.length > 0 && !form.variantId) {
    showToast('Sản phẩm này có phiên bản, vui lòng chọn một phiên bản.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      branch_id: form.branchId,
      product_id: form.productId,
      variant_id: form.variantId || null,
      quantity: form.quantity,
    };
    
    await api.post('/inventory/increase', payload);
    
    showToast('Nhập hàng thành công!', 'success');
    resetForm();
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi nhập hàng.';
    error.value = errorMessage;
    showToast(errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/150?text=Error';
};

// Watchers
watch(selectedBranches, () => {
  // Cập nhật tồn kho cho tất cả sản phẩm khi thay đổi chi nhánh
  productRows.value.forEach(item => {
    if (item.productId) {
      fetchStockForAllBranches(item);
    }
  });
});

watch(selectedProduct, (newProduct) => {
  form.productId = newProduct ? newProduct.id : null;
  form.variantId = null;
  if (newProduct) {
    fetchVariants(newProduct.id);
  } else {
    variants.value = [];
  }
});

watch(() => [form.branchId, form.productId, form.variantId], () => {
  fetchCurrentStock();
}, { deep: true });

// Lifecycle
onMounted(() => {
  fetchInitialData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.mode-info {
  margin-bottom: 20px;
}
.branch-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}
.branch-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}
.branch-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.branch-checkbox label {
  cursor: pointer;
  margin: 0;
}
.products-section {
  margin-top: 30px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.products-table-wrapper {
  overflow-x: auto;
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #dee2e6;
  vertical-align: middle;
}
.products-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.product-row:hover {
  background-color: #f8f9fa;
}

/* Vue Select Custom Styles */
.vue-select-small :deep(.vs__dropdown-toggle) {
  min-height: 31px;
  padding: 2px 0;
}
.vue-select-small :deep(.vs__search) {
  margin: 2px 0;
  padding: 3px 8px;
  font-size: 0.875rem;
}
.vue-select-small :deep(.vs__selected) {
  margin: 2px 2px;
  padding: 2px 6px;
  font-size: 0.875rem;
}
.vue-select-small :deep(.vs__actions) {
  padding: 2px 6px;
}
.select-option {
  padding: 2px 0;
}
.select-option strong {
  color: #212529;
}
.select-option .text-muted {
  font-size: 0.9em;
  color: #6c757d;
}

.stock-info {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}
.stock-ok {
  color: #28a745;
  background: #d4edda;
}
.stock-low {
  color: #ffc107;
  background: #fff3cd;
}
.stock-empty {
  color: #dc3545;
  background: #f8d7da;
}
.branch-stocks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.branch-stock-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.branch-name {
  font-weight: 500;
  color: #495057;
  min-width: 100px;
}
.summary-section {
  margin-top: 30px;
}
.summary-card {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 20px;
}
.summary-card h5 {
  margin-bottom: 15px;
  color: #0056b3;
}
.summary-card p {
  margin: 8px 0;
}
.grid-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}
.form-column {
  display: flex;
  flex-direction: column;
}
.preview-column {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
}
.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}
.preview-content p {
  margin-bottom: 10px;
}
.preview-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  margin: 0 auto 15px auto;
  display: block;
  border: 1px solid #dee2e6;
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
.alert {
  margin-bottom: 20px;
}
.text-primary {
  color: #0d6efd !important;
}
.font-weight-bold {
  font-weight: 700;
}
.text-muted {
  color: #6c757d !important;
}
.products-table td {
  position: relative;
  overflow: visible !important;
}

.products-table-wrapper {
  overflow: visible !important;
}

.searchable-select {
  position: relative;
  z-index: 100;
}

.searchable-select .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 9999;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

@media (max-width: 992px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .preview-column {
    margin-top: 20px;
  }
  .branch-selection {
    grid-template-columns: 1fr;
  }
}
</style>