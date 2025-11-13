<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Quản lý Loại sản phẩm</h2>
      <button @click="openModal()" class="btn btn-primary">Thêm loại mới</button>
    </div>
    <div class="card-body">
      <table class="table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên loại sản phẩm</th>
            <th>Loại cha</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" style="text-align: center;">Đang tải dữ liệu...</td>
          </tr>
          <tr v-for="type in productTypes" :key="type.id">
            <td>
              <img v-if="type.image_url" :src="type.image_url" alt="type icon" width="60" height="60" style="object-fit: cover; border-radius: 4px;">
              <span v-else>N/A</span>
            </td>
            <td>{{ type.type_name }}</td>
            <td>{{ getParentTypeName(type.parent_id) || 'Không có' }}</td>
            <td>
              <button @click="openModal(type)" class="btn btn-secondary" style="margin-right: 8px;">Sửa</button>
              <button @click="openDeleteDialog(type.id)" class="btn btn-danger">Xóa</button>
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
            <h3 class="card-title">{{ isEditMode ? 'Chỉnh sửa Loại sản phẩm' : 'Tạo Loại sản phẩm mới' }}</h3>
            <button type="button" @click="closeModal" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên loại sản phẩm</label>
              <input type="text" v-model="editableType.type_name" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea v-model="editableType.description" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Loại cha</label>
              <select v-model="editableType.parent_id" class="form-control">
                <option :value="null">-- Không có loại cha --</option>
                <option v-for="parentOption in parentTypeOptions" :key="parentOption.id" :value="parentOption.id">
                  {{ parentOption.type_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Hình ảnh</label>
              <input type="file" @change="handleFileSelect" class="form-control" accept="image/*">
              <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="preview" style="max-width: 100px; margin-top: 10px; border-radius: 4px;">
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
    title="Xác nhận xóa Loại sản phẩm"
    message="Bạn có chắc chắn muốn xóa không? Nếu loại này là cha của các loại khác, bạn có thể cần cập nhật chúng."
    confirmText="Đồng ý Xóa"
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const productTypes = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editableType = ref({});
const typeImageFile = ref(null);
const imagePreviewUrl = ref(null);

const isEditMode = computed(() => !!editableType.value.id);

// Lọc ra các lựa chọn cho dropdown "Loại cha"
// Một loại không thể tự làm cha của chính nó
const parentTypeOptions = computed(() => {
  if (isEditMode.value) {
    return productTypes.value.filter(type => type.id !== editableType.value.id);
  }
  return productTypes.value;
});

// --- Helper Functions ---
const getParentTypeName = (parentId) => {
  if (!parentId) return '';
  const parent = productTypes.value.find(type => type.id === parentId);
  return parent ? parent.type_name : 'Không rõ';
};

// --- CRUD Operations ---
const fetchProductTypes = async () => {
  loading.value = true;
  try {
    const response = await api.get('/product-types');
    productTypes.value = response.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách loại sản phẩm:", error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('type_name', editableType.value.type_name);
  if (editableType.value.description) {
    formData.append('description', editableType.value.description);
  }
  if (editableType.value.parent_id) {
    formData.append('parent_id', editableType.value.parent_id);
  }
  if (typeImageFile.value) {
    formData.append('image', typeImageFile.value);
  }

  try {
    if (isEditMode.value) {
      await api.put(`/product-types/${editableType.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post('/product-types', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    await fetchProductTypes();
    closeModal();
  } catch (error) {
    const message = error.response?.data?.message || "Đã xảy ra lỗi khi lưu loại sản phẩm.";
    console.error("Lỗi khi lưu loại sản phẩm:", message);
    showToast(message, 'error');
  }
};

// --- Modal Control ---
const openModal = (type = null) => {
  if (type) {
    editableType.value = { ...type };
    imagePreviewUrl.value = type.image_url;
  } else {
    editableType.value = { parent_id: null };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editableType.value = {};
  typeImageFile.value = null;
  imagePreviewUrl.value = null;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    typeImageFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  } else {
    typeImageFile.value = null;
    imagePreviewUrl.value = isEditMode.value ? editableType.value.image_url : null;
  }
};

// --- Delete Confirmation ---
const showConfirmDialog = ref(false);
const typeIdToDelete = ref(null);

const openDeleteDialog = (id) => {
  typeIdToDelete.value = id;
  showConfirmDialog.value = true;
};

const closeDeleteDialog = () => {
  showConfirmDialog.value = false;
  typeIdToDelete.value = null;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/product-types/${typeIdToDelete.value}`);
    await fetchProductTypes();
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa loại sản phẩm này.";
    console.error("Lỗi khi xóa:", message);
    showToast(message, 'error');
  } finally {
    closeDeleteDialog();
  }
};

// --- Lifecycle Hook ---
onMounted(fetchProductTypes);
</script>

<style scoped>
/* Reusing Modal CSS from previous components */
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
</style>