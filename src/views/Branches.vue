<template>
  <div class="branch-management">
    <div class="card">
      <div class="card-header">
        <div class="header-content">
          <div class="header-left">
            <h2 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3zM11 2.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5z"/>
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v8A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 13.5 3H12v1h1.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-8A.5.5 0 0 1 2.5 4H4V3H2.5z"/>
              </svg>
              Quản lý Chi nhánh
            </h2>
            <p class="subtitle">Quản lý thông tin các chi nhánh của hệ thống</p>
          </div>
          <button @click="openModal()" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Thêm chi nhánh
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách chi nhánh...</p>
        </div>

        <div v-else-if="branches.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3zM11 2.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5z"/>
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v8A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 13.5 3H12v1h1.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-8A.5.5 0 0 1 2.5 4H4V3H2.5z"/>
          </svg>
          <h3>Chưa có chi nhánh nào</h3>
          <p>Hãy thêm chi nhánh đầu tiên để bắt đầu quản lý</p>
          <button @click="openModal()" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Thêm chi nhánh đầu tiên
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Tên chi nhánh</th>
                <th>Thông tin liên hệ</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="branch in branches" :key="branch.id">
                <td>
                  <div class="branch-name">
                    <strong>{{ branch.name }}</strong>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <div class="contact-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                      </svg>
                      {{ branch.phone }}
                    </div>
                    <div class="contact-item" v-if="branch.email">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                      </svg>
                      {{ branch.email }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="address-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    {{ formatAddress(branch.addresses) }}
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', branch.is_active ? 'status-active' : 'status-inactive']">
                    <span class="status-dot"></span>
                    {{ branch.is_active ? 'Hoạt động' : 'Vô hiệu hóa' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="openModal(branch)" class="btn-icon btn-secondary" title="Sửa chi nhánh">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                      </svg>
                    </button>
                    <button @click="openDeleteDialog(branch.id)" class="btn-icon btn-danger" title="Xóa chi nhánh">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content card">
          <form @submit.prevent="handleSubmit">
            <div class="modal-header">
              <h3 class="modal-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v8A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 13.5 3H12v1h1.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-8A.5.5 0 0 1 2.5 4H4V3H2.5z"/>
                </svg>
                {{ isEditMode ? 'Chỉnh sửa Chi nhánh' : 'Tạo Chi nhánh mới' }}
              </h3>
              <button type="button" @click="closeModal" class="close-button">&times;</button>
            </div>
            
            <div class="modal-body">
              <div class="form-section">
                <h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm.256 7a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.740.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z"/>
                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z"/>
                  </svg>
                  Thông tin chi nhánh
                </h4>
                <div class="form-group">
                  <label>Tên chi nhánh*</label>
                  <input type="text" v-model="editableBranch.name" class="form-control" required placeholder="Nhập tên chi nhánh">
                </div>
                <div class="grid-2-col">
                  <div class="form-group">
                    <label>Số điện thoại*</label>
                    <input type="tel" v-model="editableBranch.phone" class="form-control" required placeholder="0123456789">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="editableBranch.email" class="form-control" placeholder="email@example.com">
                  </div>
                </div>
              </div>

              <hr>

              <div class="form-section">
                <h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  Địa chỉ chi nhánh
                </h4>
                <div class="form-group">
                  <label>Tên người quản lí*</label>
                  <input type="text" v-model="editableBranch.address.receiver_name" class="form-control" required placeholder="Tên người nhận hàng">
                </div>
                <div class="form-group">
                  <label>Số điện thoại quản lí*</label>
                  <input type="tel" v-model="editableBranch.address.receiver_phone" class="form-control" required placeholder="0123456789">
                </div>
                <div class="form-group">
                  <label>Số nhà, Tên đường*</label>
                  <input type="text" v-model="editableBranch.address.street" class="form-control" required placeholder="Ví dụ: 123 Đường ABC">
                </div>
                <div class="grid-3-col">
                  <div class="form-group">
                    <label>Tỉnh/Thành phố*</label>
                    <select v-model="editableBranch.address.province" class="form-control" required :disabled="isLoadingProvinces">
                      <option disabled value="">{{ isLoadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành' }}</option>
                      <option v-for="p in provinces" :key="p.code" :value="p.name">{{ p.name }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Quận/Huyện*</label>
                    <select v-model="editableBranch.address.district" class="form-control" required :disabled="!editableBranch.address.province || isLoadingDistricts">
                      <option disabled value="">{{ isLoadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện' }}</option>
                      <option v-for="d in districts" :key="d.code" :value="d.name">{{ d.name }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Phường/Xã*</label>
                    <select v-model="editableBranch.address.ward" class="form-control" required :disabled="!editableBranch.address.district || isLoadingWards">
                      <option disabled value="">{{ isLoadingWards ? 'Đang tải...' : 'Chọn Phường/Xã' }}</option>
                      <option v-for="w in wards" :key="w.code" :value="w.name">{{ w.name }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr>

              <LocationPicker v-model="editableBranch.location" />
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
                Hủy
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
                <div v-else class="spinner-small"></div>
                {{ isSaving ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Thêm Chi nhánh') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <ConfirmDialog 
      :show="showDeleteConfirm" 
      title="Xác nhận xóa"
      message="Bạn có chắc chắn muốn xóa (vô hiệu hóa) chi nhánh này không?"
      @close="closeDeleteDialog" 
      @confirm="confirmDelete" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';
import axios from 'axios';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import LocationPicker from '@/components/LocationPicker.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const branches = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editableBranch = ref({});
const isSaving = ref(false);
const isEditMode = computed(() => !!editableBranch.value.id);

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const isLoadingProvinces = ref(false);
const isLoadingDistricts = ref(false);
const isLoadingWards = ref(false);
const API_HOST = "https://provinces.open-api.vn/api";

const fetchBranches = async () => {
  loading.value = true;
  try {
    const response = await api.get('/branches');
    branches.value = response.data.data.data;
    console.log("Danh sách chi nhánh:", branches.value);
  } catch (error) {
    console.error("Lỗi khi tải danh sách chi nhánh:", error);
  } finally {
    loading.value = false;
  }
};

const fetchProvinces = async () => {
  isLoadingProvinces.value = true;
  try {
    const response = await axios.get(`${API_HOST}/p/`);
    provinces.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách tỉnh/thành:", error);
  } finally {
    isLoadingProvinces.value = false;
  }
};

const fetchDistricts = async (provinceCode, callback) => {
  isLoadingDistricts.value = true;
  districts.value = [];
  wards.value = [];
  editableBranch.value.address.district = '';
  editableBranch.value.address.ward = '';
  
  try {
    const response = await axios.get(`${API_HOST}/p/${provinceCode}?depth=2`);
    districts.value = response.data.districts;
    if (callback) callback();
  } catch (error) {
    console.error("Lỗi khi tải danh sách quận/huyện:", error);
  } finally {
    isLoadingDistricts.value = false;
  }
};

const fetchWards = async (districtCode, callback) => {
  isLoadingWards.value = true;
  wards.value = [];
  editableBranch.value.address.ward = '';
  
  try {
    const response = await axios.get(`${API_HOST}/d/${districtCode}?depth=2`);
    wards.value = response.data.wards;
    if (callback) callback();
  } catch (error) {
    console.error("Lỗi khi tải danh sách phường/xã:", error);
  } finally {
    isLoadingWards.value = false;
  }
};

onMounted(fetchBranches);
onMounted(fetchProvinces);

const getNewBranchTemplate = () => ({
  name: '', 
  phone: '', 
  email: '',
  address: {
    street: '', 
    ward: '', 
    district: '', 
    province: '',
    receiver_name: '', 
    receiver_phone: ''
  },
  location: { 
    latitude: 10.7769, 
    longitude: 106.7009 
  }
});

const openModal = async (branch = null) => {
  if (branch) {
    editableBranch.value = JSON.parse(JSON.stringify(branch));
    if (!editableBranch.value.address) {
      editableBranch.value.address = getNewBranchTemplate().address;
    }
    if (!editableBranch.value.location) {
      editableBranch.value.location = { latitude: 10.7769, longitude: 106.7009 };
    }
    if (provinces.value.length > 0 && branch.address) {
      const selectedProvince = provinces.value.find(p => p.name === branch.address.province);
      if (selectedProvince) {
        await fetchDistricts(selectedProvince.code, async () => {
          const selectedDistrict = districts.value.find(d => d.name === branch.address.district);
          if (selectedDistrict) await fetchWards(selectedDistrict.code);
        });
      }
    }
  } else {
    editableBranch.value = getNewBranchTemplate();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    editableBranch.value = {};
    districts.value = [];
    wards.value = [];
  }, 300);
};

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    if (isEditMode.value) {
      await api.put(`/branches/${editableBranch.value.id}`, editableBranch.value);
      showToast('Cập nhật chi nhánh thành công!', 'success');
    } else {
      await api.post('/branches', editableBranch.value);
      showToast('Tạo chi nhánh mới thành công!', 'success');
    }
    await fetchBranches();
    closeModal();
  } catch (error) {
    console.error("Lỗi khi lưu chi nhánh:", error.response?.data?.message || error.message);
    showToast(error.response?.data?.message || "Đã xảy ra lỗi.", 'error');
  } finally {
    isSaving.value = false;
  }
};

const showDeleteConfirm = ref(false);
const branchIdToDelete = ref(null);

const openDeleteDialog = (id) => {
  branchIdToDelete.value = id;
  showDeleteConfirm.value = true;
};

const closeDeleteDialog = () => {
  branchIdToDelete.value = null;
  showDeleteConfirm.value = false;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/branches/${branchIdToDelete.value}`);
    showToast('Đã vô hiệu hóa chi nhánh thành công.', 'success');
    await fetchBranches();
  } catch (error) {
    console.error("Lỗi khi xóa chi nhánh:", error.response?.data?.message || error.message);
    showToast(error.response?.data?.message || "Không thể xóa chi nhánh.", 'error');
  } finally {
    closeDeleteDialog();
  }
};

const formatAddress = (address) => {
  console.log("Địa chỉ:", address);
  if (!address) return 'N/A';
  return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
};

watch(
  () => editableBranch.value.address?.province,
  (newProvince, oldProvince) => {
    if (newProvince && newProvince !== oldProvince) {
      const selectedProvince = provinces.value.find(p => p.name === newProvince);
      if (selectedProvince) {
        fetchDistricts(selectedProvince.code);
      }
    } else if (!newProvince) {
      districts.value = [];
      wards.value = [];
    }
  }
);

watch(
  () => editableBranch.value.address?.district,
  (newDistrict, oldDistrict) => {
    if (newDistrict && newDistrict !== oldDistrict) {
      const selectedDistrict = districts.value.find(d => d.name === newDistrict);
      if (selectedDistrict) {
        fetchWards(selectedDistrict.code);
      }
    } else if (!newDistrict) {
      wards.value = [];
    }
  }
);

watch(
  () => editableBranch.value.name,
  (newName) => {
    if (!isEditMode.value && editableBranch.value.address) {
      editableBranch.value.address.receiver_name = newName;
    }
  }
);

watch(
  () => editableBranch.value.phone,
  (newPhone) => {
    if (!isEditMode.value && editableBranch.value.address) {
      editableBranch.value.address.receiver_phone = newPhone;
    }
  }
);
</script>

<style scoped>
.branch-management {
  padding: 20px;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 24px 30px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.card-body {
  padding: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state svg {
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 0.95rem;
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: #f8f9fa;
}

.table th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e8e8e8;
}

.table td {
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.table tbody tr {
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.branch-name strong {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.95rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 0.875rem;
}

.contact-item svg {
  flex-shrink: 0;
  color: #888;
}

.address-info {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #555;
  font-size: 0.875rem;
  line-height: 1.5;
}

.address-info svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #888;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-active {
  color: #1a7336;
  background-color: #e8f5e9;
}

.status-active .status-dot {
  background-color: #1a7336;
}

.status-inactive {
  color: #5f6368;
  background-color: #f1f3f4;
}

.status-inactive .status-dot {
  background-color: #5f6368;
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Action Buttons */
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
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.btn-secondary {
  background-color: #f0f0f0;
  color: #555;
}

.btn-icon.btn-secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon.btn-danger {
  background-color: #fdecea;
  color: #d32f2f;
}

.btn-icon.btn-danger:hover {
  background-color: #f8d7da;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(211, 47, 47, 0.2);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(66, 133, 244, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3367d6 0%, #2851a3 100%);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 800px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24px 30px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-body {
  overflow-y: auto;
  padding: 24px 30px;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e8e8e8;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Form Styles */
.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #444;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}

.form-control::placeholder {
  color: #aaa;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.grid-3-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

hr {
  border: 0;
  border-top: 1px solid #e8e8e8;
  margin: 24px 0;
}

/* Modal Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .branch-management {
    padding: 12px;
  }

  .card-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .grid-2-col,
  .grid-3-col {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 100%;
    max-height: 95vh;
  }

  .table {
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 12px 16px;
  }
}
</style>