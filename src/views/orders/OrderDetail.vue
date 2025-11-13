<template>
  <div v-if="order" class="order-detail-container">
    <div class="main-column">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Chi tiết đơn hàng #{{ order.order_number }}</h3>
          <div class="header-actions">
            <button @click="handleRefresh" class="btn btn-light" title="Làm mới dữ liệu">
              Làm mới
            </button>
            <button @click="goBack" class="btn btn-secondary">Quay lại</button>
          </div>
        </div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.order_items" :key="item.id">
                <td>
                  <div class="product-cell">
                    <img :src="getProductImage(item)" alt="product" class="product-thumbnail">
                    <div>
                      <span>{{ getProductName(item) }}</span><br>
                      <small class="product-sku">{{ getProductSku(item) }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ formatCurrency(item.unit_price) }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatCurrency(item.line_total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="side-column">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Thao tác</h3></div>
        <div class="card-body">
          <button v-if="order.status === 'pending'" @click="handleConfirmOrder" class="btn btn-success" style="width: 100%; margin-bottom: 15px;">
            ✔ Xác nhận đơn hàng
          </button>

          <div class="form-group">
            <label>Cập nhật trạng thái (nâng cao)</label>
            <select class="form-control" v-model="newStatus" :disabled="!canBeModified">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipping">Shipping</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button @click="handleUpdateStatus()" class="btn btn-primary" style="width: 100%;" :disabled="!canBeModified">
            Cập nhật
          </button>
          <button v-if="canBeCancelled" @click="openCancelDialog" class="btn btn-danger" style="width: 100%; margin-top: 10px;">
            Hủy đơn hàng
          </button>
        </div>
      </div>

      <!-- THÊM MỚI: Card thông tin chi nhánh xử lý -->
      <div v-if="assignedBranch" class="card">
        <div class="card-header"><h3 class="card-title">Chi nhánh xử lý</h3></div>
        <div class="card-body info-list">
          <p><strong>Tên chi nhánh:</strong> {{ assignedBranch.name }}</p>
          <p><small>Đơn hàng đã được tự động gán cho chi nhánh này dựa trên vị trí và tồn kho.</small></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Thông tin khách hàng</h3></div>
        <div class="card-body info-list" v-if="order.user_profiles?.full_name">
          <p><strong>Tên:</strong> {{ order.user_profiles.full_name }}</p>
          <p><strong>Số điện thoại:</strong> {{ order.user_profiles.phone_number }}</p>
        </div>
      </div>
       <div class="card">
        <div class="card-header"><h3 class="card-title">Địa chỉ giao hàng</h3></div>
        <div class="card-body info-list" v-if="order.user_addresses?.addresses?.receiver_name">
          <p><strong>Người nhận:</strong> {{ order.user_addresses.addresses.receiver_name }}</p>
          <p><strong>SĐT nhận:</strong> {{ order.user_addresses.addresses.receiver_phone }}</p>
          <p><strong>Địa chỉ:</strong> {{ formatAddress(order.user_addresses.addresses) }}</p>
        </div>
      </div>
       <div class="card">
        <div class="card-header"><h3 class="card-title">Tóm tắt thanh toán</h3></div>
        <div class="card-body payment-summary">
          <div><span>Tạm tính</span> <span>{{ formatCurrency(order.subtotal) }}</span></div>
          <div><span>Phí vận chuyển</span> <span>{{ formatCurrency(order.shipping_fee) }}</span></div>
          <div><span>Giảm giá</span> <span>- {{ formatCurrency(order.discount_amount) }}</span></div>
          <hr>
          <div><strong>Tổng cộng</strong> <strong>{{ formatCurrency(order.total) }}</strong></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Đang tải chi tiết đơn hàng...</p>
  </div>

  <ConfirmDialog
    :show="showCancelConfirm"
    title="Xác nhận Hủy Đơn hàng"
    message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ tự động gửi thông báo cho khách hàng."
    confirmText="Đồng ý Hủy"
    @close="closeCancelDialog"
    @confirm="handleConfirmCancel"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const route = useRoute();
const router = useRouter();
const orderId = route.params.id;
const order = ref(null);
const newStatus = ref('');

// --- Computed Properties ---
const canBeCancelled = computed(() => order.value && !['delivered', 'cancelled'].includes(order.value.status));
const canBeModified = computed(() => order.value && !['delivered', 'cancelled'].includes(order.value.status));
const assignedBranch = computed(() => {
  if (order.value?.branch_orders?.length > 0) {
    return order.value.branch_orders[0].branches;
  }
  return null;
});

// --- Fetch Data ---
const fetchOrder = async () => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    order.value = response.data.data;
    newStatus.value = order.value.status;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    router.push('/admin/orders');
  }
};

// THÊM MỚI: Hàm xử lý làm mới dữ liệu
const handleRefresh = async () => {
  try {
    await fetchOrder();
    showToast('Dữ liệu đơn hàng đã được làm mới.', 'info');
  } catch (error) {
    showToast('Không thể làm mới dữ liệu.', 'error');
  }
};
// --- Actions ---
const handleUpdateStatus = async (statusToUpdate) => {
  // Nếu không có status truyền vào, lấy từ v-model
  const finalStatus = statusToUpdate || newStatus.value.trim();
  console.log('Final Status:', finalStatus);

  // THÊM MỚI: Kiểm tra phía client để tránh gọi API không cần thiết
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
  if (!finalStatus || !validStatuses.includes(finalStatus)) {
    alert(`Trạng thái "${finalStatus}" không hợp lệ. Vui lòng chọn một trạng thái từ danh sách.`);
    return;
  }

  if (!confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${finalStatus}" không?`)) {
    return;
  }
  try {
    await api.patch(`/orders/${orderId}/status`, { status: finalStatus });
    showToast('Cập nhật trạng thái thành công!', 'success');
    await fetchOrder();
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái.';
    showToast(`Lỗi: ${errorMessage}`, 'error');
  }
};

// TỐI ƯU: Hàm xử lý xác nhận đơn hàng
const handleConfirmOrder = async () => {
  handleUpdateStatus('confirmed');
};


// --- Cancel Order Logic ---
const showCancelConfirm = ref(false);
const openCancelDialog = () => { showCancelConfirm.value = true; };
const closeCancelDialog = () => { showCancelConfirm.value = false; };
const handleConfirmCancel = async () => {
  try {
    await api.delete(`/orders/${orderId}`);
    showToast('Đã hủy đơn hàng thành công!', 'success');
    await fetchOrder();
  } catch (error) {
     console.error("Lỗi khi hủy đơn hàng:", error);
    const errorMessage = error.response?.data?.message || 'Không thể hủy đơn hàng.';
    showToast(`Lỗi: ${errorMessage}`, 'error');
  } finally {
    closeCancelDialog();
  }
};

// THÊM MỚI: Hàm để quay lại trang trước
const goBack = () => {
  router.back();
};

// --- Helper Functions ---
const getProductImage = (item) => {
  const variantImages = item.product_variants?.product_variant_images;
  if (variantImages && variantImages.length > 0) return variantImages[0].image_url;
  const productImages = item.products?.image_urls;
  if (productImages && productImages.length > 0) return productImages[0];
  return 'https://via.placeholder.com/60';
};
const getProductName = (item) => {
  let name = item.products?.name || 'Sản phẩm không xác định';
  if (item.product_variants?.color) name += ` - ${item.product_variants.color}`;
  return name;
};
const getProductSku = (item) => item.product_variants?.sku || item.products?.sku || 'N/A';
const formatAddress = (addr) => `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`;
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

onMounted(fetchOrder);
</script>

<style scoped>
.order-detail-container { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
.side-column { display: flex; flex-direction: column; gap: 20px; }
/* THÊM MỚI: Style cho header của card */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions {
  display: flex;
  gap: 10px;
}
.card-body.info-list p { margin: 0 0 10px 0; }
.product-cell { display: flex; align-items: center; gap: 15px; }
.product-thumbnail { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
.product-sku { font-family: monospace; color: #6c757d; }
.payment-summary div { display: flex; justify-content: space-between; margin-bottom: 8px; }
.payment-summary hr { border: 0; border-top: 1px solid #eee; margin: 10px 0; }
/* THÊM MỚI: Style cho nút màu xanh lá */
.btn-success { background-color: #198754; color: white; }
@media (max-width: 1200px) {
  .order-detail-container { grid-template-columns: 1fr; }
}
</style>