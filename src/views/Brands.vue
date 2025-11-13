<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Thương hiệu</h2>
      <button @click="openModal()" class="btn btn-primary">Thêm thương hiệu mới</button>
    </div>
    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên thương hiệu</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="brand in brands" :key="brand.id">
            <td>
              <img v-if="brand.image_url" :src="brand.image_url" alt="brand logo" width="80" height="40" style="object-fit: contain;">
              <span v-else>N/A</span>
            </td>
            <td>{{ brand.brand_name }}</td>
            <td>{{ brand.description || 'Không có mô tả' }}</td>
            <td>
              <button @click="openModal(brand)" class="btn btn-secondary" style="margin-right: 8px;">Sửa</button>
              <button @click="openDeleteDialog(brand.id)" class="btn btn-danger">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <form @submit.prevent="handleSubmit">
          <div class="modal-header">
            <h3 class="card-title">{{ isEditMode ? 'Chỉnh sửa Thương hiệu' : 'Tạo Thương hiệu mới' }}</h3>
            <button type="button" @click="closeModal" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên thương hiệu</label>
              <input type="text" v-model="editableBrand.brand_name" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea v-model="editableBrand.description" class="form-control" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>Hình ảnh</label>
              <input type="file" @change="handleFileSelect" class="form-control" accept="image/*">
              <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="preview" style="max-width: 100px; margin-top: 10px;">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Hủy</button>
            <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Lưu thay đổi' : 'Tạo mới' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>

  <ConfirmDialog
    :show="showConfirmDialog"
    title="Xác nhận xóa thương hiệu"
    message="Bạn có chắc chắn muốn xóa thương hiệu này? Tất cả sản phẩm liên quan có thể bị ảnh hưởng."
    confirmText="Đồng ý Xóa"
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const brands = ref([]);
const showModal = ref(false);
const editableBrand = ref({});
const brandImageFile = ref(null);
const imagePreviewUrl = ref(null);

const isEditMode = computed(() => !!editableBrand.value.id);

// --- CRUD Operations ---
const fetchBrands = async () => {
  try {
    const response = await api.get('/brands');
    brands.value = response.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách thương hiệu:", error);
  }
};

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('brand_name', editableBrand.value.brand_name);
  if (editableBrand.value.description) {
    formData.append('description', editableBrand.value.description);
  }
  if (brandImageFile.value) {
    formData.append('image', brandImageFile.value);
  }

  try {
    if (isEditMode.value) {
      // API của bạn dùng PUT, không phải POST
      await api.put(`/brands/${editableBrand.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    await fetchBrands(); // Tải lại danh sách
    closeModal();
  } catch (error) {
    console.error("Lỗi khi lưu thương hiệu:", error.response?.data?.message || error.message);
    alert(error.response?.data?.message || "Đã xảy ra lỗi.");
  }
};

// --- Modal Control ---
const openModal = (brand = null) => {
  if (brand) {
    // Chế độ sửa: sao chép dữ liệu để tránh thay đổi trực tiếp
    editableBrand.value = { ...brand };
    imagePreviewUrl.value = brand.image_url;
  } else {
    // Chế độ tạo mới
    editableBrand.value = {};
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editableBrand.value = {};
  brandImageFile.value = null;
  imagePreviewUrl.value = null;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    brandImageFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};


// --- Delete Confirmation ---
const showConfirmDialog = ref(false);
const brandIdToDelete = ref(null);

const openDeleteDialog = (id) => {
  brandIdToDelete.value = id;
  showConfirmDialog.value = true;
};

const closeDeleteDialog = () => {
  showConfirmDialog.value = false;
  brandIdToDelete.value = null;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/brands/${brandIdToDelete.value}`);
    await fetchBrands();
  } catch (error) {
    console.error("Lỗi khi xóa thương hiệu:", error.response?.data?.message || error.message);
    alert(error.response?.data?.message || "Không thể xóa thương hiệu.");
  } finally {
    closeDeleteDialog();
  }
};


// --- Lifecycle Hook ---
onMounted(fetchBrands);
</script>

<style scoped>
/* Scoped CSS cho modal, copy từ ConfirmDialog và điều chỉnh nếu cần */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 600px;
  max-width: 90%;
  padding: 0;
}
.modal-header, .modal-body, .modal-footer {
  padding: 20px 25px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
</style>