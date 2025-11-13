<template>
  <form @submit.prevent="handleSubmit">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Tạo sản phẩm mới' }}</h2>
        <router-link to="/admin/products" class="btn btn-secondary">Quay lại</router-link>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Thông tin cơ bản</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Tên sản phẩm*</label>
          <input type="text" v-model="productData.name" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Mô tả</label>
          <textarea v-model="productData.description" class="form-control" rows="5"></textarea>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Thương hiệu*</label>
            <select v-model="productData.brand_id" class="form-control" required>
              <option disabled :value="null">-- Chọn thương hiệu --</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.brand_name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Loại sản phẩm*</label>
            <select v-model="productData.type_id" class="form-control" required>
              <option disabled :value="null">-- Chọn loại sản phẩm --</option>
              <option v-for="type in productTypes" :key="type.id" :value="type.id">{{ type.type_name }}</option>
            </select>
          </div>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>SKU (Mã sản phẩm)</label>
            <input type="text" v-model="productData.sku" class="form-control" placeholder="Tự động tạo nếu để trống">
          </div>
          <div class="form-group">
            <label>Giá gốc (VNĐ)*</label>
            <input type="number" v-model.number="productData.price" class="form-control" min="0" required>
          </div>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Chất liệu</label>
            <input type="text" v-model="productData.material" class="form-control">
          </div>
          <div class="form-group">
            <label>Xuất xứ</label>
            <input type="text" v-model="productData.origin_country" class="form-control">
          </div>
        </div>
        <div class="grid-2-col">
          <div class="form-group">
            <label>Trọng lượng (kg)</label>
            <input type="number" v-model.number="productData.weight" class="form-control" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Thời gian bảo hành (tháng)</label>
            <input type="number" v-model.number="productData.warranty_months" class="form-control" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Kích thước (cm)</label>
          <div class="grid-3-col">
            <input type="number" v-model.number="productData.dimensions.width_cm" class="form-control" placeholder="Chiều rộng" min="0">
            <input type="number" v-model.number="productData.dimensions.height_cm" class="form-control" placeholder="Chiều cao" min="0">
            <input type="number" v-model.number="productData.dimensions.length_cm" class="form-control" placeholder="Chiều dài" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Hướng dẫn bảo quản</label>
          <textarea v-model="productData.care_instructions" class="form-control" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Đặc điểm</label>
          <div class="grid-2-col">
            <input type="text" v-model="productData.features.style" class="form-control" placeholder="Phong cách">
            <input type="text" v-model="productData.features.pocket" class="form-control" placeholder="Đặc điểm túi">
          </div>
        </div>
        <div class="form-group">
          <label>Tags (phân cách bằng dấu phẩy)</label>
          <input type="text" v-model="tagsInput" class="form-control" placeholder="ví dụ: áo polo, thời trang nam">
        </div>
        <div class="form-group">
          <label>Kích thước có sẵn*</label>
          <div class="size-selection">
            <div
              v-for="size in sizes"
              :key="size.id"
              class="size-card"
              :class="{ 'selected': selectedSizes.includes(size.id) }"
              @click="toggleSize(size.id)"
            >
              {{ size.size_name }}
            </div>
          </div>
          <small class="form-text text-muted">
            Các kích thước được chọn ở đây sẽ áp dụng cho biến thể mới khi thêm màu
          </small>
        </div>
        <div class="form-group">
          <label>Hình ảnh sản phẩm</label>
          <ImageUploader 
            :max-files="5" 
            :existing-images="existingImages"
            @update:files="updateImageFiles"
            @update:removedImages="updateRemovedImageIds"
          />
        </div>
      </div>
    </div>

    <!-- Biến thể sản phẩm - TỐI ƯU HÓA -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Quản lý biến thể theo màu sắc</h3>
        <div class="variant-controls">
          <div class="new-color-input">
            <input 
              type="text" 
              v-model="newColorName" 
              class="form-control" 
              placeholder="Nhập tên màu mới"
              @keyup.enter="addColorVariant"
            >
            <button @click="addColorVariant" type="button" class="btn btn-primary">
              Thêm màu mới
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <p v-if="colorVariants.length === 0" style="text-align: center; color: #6c757d;">
          Chưa có biến thể nào. Nhập tên màu và nhấn "Thêm màu mới" để bắt đầu.
        </p>
        
        <!-- Hiển thị theo nhóm màu -->
        <div v-for="(colorGroup, colorIndex) in colorVariants" :key="colorIndex" class="color-variant-group">
          <div class="color-group-header">
            <button 
              @click="removeColorGroup(colorIndex)" 
              type="button" 
              class="btn btn-danger btn-sm"
              v-if="!colorGroup.isExisting"
            >
              Xóa màu
            </button>
          </div>

          <!-- Biến thể cho từng size trong màu này -->
          <div v-for="(variant, variantIndex) in colorGroup.variants" :key="variantIndex" 
               class="variant-form">
            <div class="variant-header">
              <h6>Size: {{ getSizeName(variant.size_id) }}</h6>
              <button 
                @click="removeVariantFromColor(colorIndex, variantIndex)" 
                type="button" 
                class="btn btn-outline-danger btn-sm"
                v-if="!variant.id && colorGroup.variants.length > 1"
              >
                Xóa size
              </button>
            </div>
            
            <div class="grid-2-col">
              <div class="form-group">
                <label>SKU biến thể</label>
                <input
                  type="text"
                  v-model="variant.sku"
                  class="form-control"
                  :placeholder="generateVariantSKU(colorGroup.color, variant.size_id)"
                >
                <small class="form-text text-muted">
                  Tự động: {{ generateVariantSKU(colorGroup.color, variant.size_id) }}
                </small>
              </div>
              <div class="form-group">
                <label>Giá chênh lệch (VNĐ)</label>
                <input type="number" v-model.number="variant.additional_price" class="form-control" min="0">
                <small class="form-text text-muted">
                  Giá cuối: {{ formatCurrency((productData.price || 0) + (variant.additional_price || 0)) }}
                </small>
              </div>
            </div>
            
            <!-- Chỉ hiển thị image uploader cho biến thể đầu tiên của màu (dùng chung ảnh) -->
            <div class="form-group" v-if="variantIndex === 0">
              <label>Hình ảnh cho màu {{ colorGroup.color }} (dùng chung cho tất cả size)</label>
              <ImageUploader 
                :max-files="5"
                :existing-images="colorGroup.existingImages || []"
                @update:files="files => updateColorGroupFiles(colorIndex, files)"
                @update:removedImages="ids => updateColorGroupRemovedImages(colorIndex, ids)"
              />
            </div>
          </div>

          <!-- Thêm size mới vào màu hiện có -->
          <div class="add-size-to-color" v-if="colorGroup.isExisting">
            <div class="form-group">
              <label>Thêm size mới cho màu {{ colorGroup.color }}</label>
              <div class="add-size-controls">
                <select v-model="colorGroup.newSizeId" class="form-control">
                  <option disabled :value="null">-- Chọn size thêm --</option>
                  <option 
                    v-for="size in getAvailableSizesForColor(colorGroup)" 
                    :key="size.id" 
                    :value="size.id"
                  >
                    {{ size.size_name }}
                  </option>
                </select>
                <button 
                  @click="addSizeToColor(colorIndex)" 
                  type="button" 
                  class="btn btn-outline-primary btn-sm"
                  :disabled="!colorGroup.newSizeId"
                >
                  Thêm Size
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary btn-lg" :disabled="isSaving">
        {{ isSaving ? 'Đang lưu...' : 'Lưu sản phẩm' }}
      </button>
    </div>
  </form>
</template>


<style scoped>
.card { margin-bottom: 25px; }
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

.color-variant-group {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  background-color: #f8f9fa;
}

.color-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.color-group-header h5 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.color-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #dee2e6;
}

.variant-form {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.variant-header h6 {
  margin: 0;
  color: #495057;
}

.variant-controls {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.new-color-input {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.new-color-input .form-control {
  width: 200px;
}

.add-size-to-color {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
}

.add-size-controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.add-size-controls .form-control {
  width: 150px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.btn-lg { padding: 12px 25px; font-size: 1.1rem; }
.btn-sm { padding: 5px 10px; font-size: 0.8rem; }

.size-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.size-card {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.size-card:hover {
  background-color: #f0f0f0;
}

.size-card.selected {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import ImageUploader from '@/components/ImageUploader.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const route = useRoute();
const router = useRouter();
const productId = ref(route.params.id);
const isEditMode = computed(() => !!productId.value);

// Data refs
const productData = ref({
  name: '',
  description: '',
  brand_id: null,
  type_id: null,
  sku: '',
  price: 0,
  material: '',
  weight: 0,
  dimensions: { width_cm: 0, height_cm: 0, length_cm: 0 },
  origin_country: '',
  warranty_months: 0,
  care_instructions: '',
  features: { style: '', pocket: '' },
});
const imageFiles = ref([]);
const removedImageIds = ref([]);
const existingImages = ref([]);
const isSaving = ref(false);
const selectedSizes = ref([]);
const tagsInput = ref('');
const newColorName = ref('');

// Dropdown options
const brands = ref([]);
const productTypes = ref([]);
const sizes = ref([]);

// Color variants - nhóm theo màu
const colorVariants = ref([]);
const variantsToDelete = ref([]);

// --- Helpers ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách ký tự có dấu thành ký tự gốc và dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu đã tách
    .replace(/đ/g, 'd') // Xử lý riêng chữ đ
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
    .replace(/[^\w\-]+/g, '') // Xóa các ký tự không phải chữ, số, gạch ngang
    .replace(/\-\-+/g, '-') // Xóa các gạch ngang liền kề
    .replace(/^-+|-+$/g, ''); // Xóa gạch ngang ở đầu/cuối
};

const generateVariantSKU = (color, sizeId) => {
  const baseSKU = productData.value.sku || 'PRODUCT'+ Math.random().toString(36).substring(2, 8).toUpperCase();
  const colorSlug = slugify(color);
  const colorCode = colorSlug.length > 10 
    ? colorSlug.substring(0, 4).toUpperCase() 
    : colorSlug.toUpperCase();
  
  const sizeName = getSizeName(sizeId);
  const result = `${baseSKU}-${colorCode}-${sizeName}`.toUpperCase();
  
  console.log(`🏷️ Generated SKU: ${result} (color: ${color}, size: ${sizeName})`);
  return result;
};

const getSizeName = (sizeId) => {
  const size = sizes.value.find(s => s.id === sizeId);
  return size ? size.size_name : 'Unknown';
};

const getColorHex = (colorName) => {
  const colorMap = {
    'đỏ': '#ff0000', 'xanh': '#0000ff', 'xanh dương': '#0000ff',
    'xanh lá': '#00ff00', 'vàng': '#ffff00', 'cam': '#ffa500',
    'tím': '#800080', 'hồng': '#ffc0cb', 'đen': '#000000',
    'trắng': '#ffffff', 'xám': '#808080', 'nâu': '#a52a2a'
  };
  return colorMap[colorName.toLowerCase()] || '#cccccc';
};

const toggleSize = (sizeId) => {
  if (selectedSizes.value.includes(sizeId)) {
    selectedSizes.value = selectedSizes.value.filter(id => id !== sizeId);
  } else {
    selectedSizes.value.push(sizeId);
  }
};

const getAvailableSizesForColor = (colorGroup) => {
  const usedSizeIds = colorGroup.variants.map(v => v.size_id);
  return sizes.value.filter(size => 
    !usedSizeIds.includes(size.id) && selectedSizes.value.includes(size.id)
  );
};

// --- Image Handling ---
const updateImageFiles = (files) => {
  imageFiles.value = files;
};

const updateRemovedImageIds = (ids) => {
  removedImageIds.value = ids;
};

const updateColorGroupFiles = (colorIndex, files) => {
  if (colorVariants.value[colorIndex]) {
    colorVariants.value[colorIndex].files = files;
  }
};

const updateColorGroupRemovedImages = (colorIndex, ids) => {
  if (colorVariants.value[colorIndex]) {
    colorVariants.value[colorIndex].removedImageIds = ids;
  }
};

// --- Data Fetching ---
const fetchDropdownData = async () => {
  try {
    const [brandsRes, typesRes, sizesRes] = await Promise.all([
      api.get('/brands'),
      api.get('/product-types'),
      api.get('/sizes'),
    ]);
    brands.value = brandsRes.data.data;
    productTypes.value = typesRes.data.data;
    sizes.value = sizesRes.data.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu dropdown:", error);
    showToast('Lỗi khi tải dữ liệu dropdown. Vui lòng thử lại.', 'error');
  }
};

const fetchProductData = async () => {
  if (!isEditMode.value) return;
  try {
    const response = await api.get(`/products/${productId.value}`);
    const data = response.data.data;
    console.log("Dữ liệu chi tiết của sản phẩm:", data);
    
    const { product_variants, product_sizes, tags, image_urls, ...baseProductData } = data;
    
    // Set product data
    productData.value = {
      ...baseProductData,
      dimensions: baseProductData.dimensions || { width_cm: 0, height_cm: 0, length_cm: 0 },
      features: baseProductData.features || { style: '', pocket: '' },
    };
    
    // Set selected sizes
    selectedSizes.value = Array.isArray(product_sizes) ? product_sizes.map(s => s.size_id) : [];
    tagsInput.value = Array.isArray(tags) ? tags.join(', ') : '';
    
    // Set existing images
    existingImages.value = Array.isArray(image_urls) ? image_urls.map((url, index) => ({
      id: index + 1,
      url
    })) : [];
    
    // Nhóm biến thể theo màu
    if (product_variants && product_variants.length > 0) {
      const variantsByColor = {};
      
      product_variants.forEach(v => {
        const color = v.color || 'default';
        if (!variantsByColor[color]) {
          variantsByColor[color] = {
            color: color,
            isExisting: true,
            files: [],
            removedImageIds: [],
            existingImages: Array.isArray(v.product_variant_images) ? v.product_variant_images.map(img => ({
              id: img.id,
              url: img.image_url
            })) : [],
            variants: [],
            newSizeId: null
          };
        }
        
        // Thêm variant vào nhóm màu
        variantsByColor[color].variants.push({
          id: v.id,
          size_id: v.size_id,
          sku: v.sku || '',
          additional_price: v.additional_price || 0
        });
      });
      
      colorVariants.value = Object.values(variantsByColor);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
    showToast('Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại.', 'error');
    router.push('/admin/products');
  }
};

onMounted(async () => {
  await fetchDropdownData();
  await fetchProductData();
});

// --- Color Variant Management ---
const addColorVariant = () => {
  if (!newColorName.value.trim()) {
    showToast('Vui lòng nhập tên màu', 'error');
    return;
  }

  if (selectedSizes.value.length === 0) {
    showToast('Vui lòng chọn ít nhất một kích thước cho sản phẩm trước', 'error');
    return;
  }

  // Kiểm tra màu đã tồn tại
  if (colorVariants.value.some(group => group.color.toLowerCase() === newColorName.value.toLowerCase())) {
    showToast('Màu này đã tồn tại', 'error');
    return;
  }

  // Tạo biến thể cho tất cả các size đã chọn
  const variants = selectedSizes.value.map(sizeId => ({
    size_id: sizeId,
    sku: '',
    additional_price: 0
  }));

  colorVariants.value.push({
    color: newColorName.value.trim(),
    isExisting: false,
    files: [],
    removedImageIds: [],
    existingImages: [],
    variants: variants,
    newSizeId: null
  });

  newColorName.value = '';
};

const removeColorGroup = (colorIndex) => {
  const colorGroup = colorVariants.value[colorIndex];
  
  // Đánh dấu các variant có ID để xóa
  if (colorGroup.isExisting) {
    colorGroup.variants.forEach(variant => {
      if (variant.id) {
        variantsToDelete.value.push(variant.id);
      }
    });
  }
  
  colorVariants.value.splice(colorIndex, 1);
};

const addSizeToColor = (colorIndex) => {
  const colorGroup = colorVariants.value[colorIndex];
  if (!colorGroup.newSizeId) return;

  // Kiểm tra size đã tồn tại trong màu này chưa
  if (colorGroup.variants.some(v => v.size_id === colorGroup.newSizeId)) {
    showToast('Size này đã tồn tại trong màu này', 'error');
    return;
  }

  colorGroup.variants.push({
    size_id: colorGroup.newSizeId,
    sku: '',
    additional_price: 0,
    isNew: true, // Đánh dấu đây là biến thể mới được thêm trên UI
  });

  colorGroup.newSizeId = null;
};

const removeVariantFromColor = (colorIndex, variantIndex) => {
  const variant = colorVariants.value[colorIndex].variants[variantIndex];
  
  // Nếu variant có ID (đã tồn tại trong DB), đánh dấu để xóa
  if (variant.id) {
    variantsToDelete.value.push(variant.id);
  }
  
  colorVariants.value[colorIndex].variants.splice(variantIndex, 1);
};

const handleSubmit = async () => {
  // Validate required fields
  if (!productData.value.name || !productData.value.brand_id || !productData.value.type_id || !productData.value.price) {
    showToast('Vui lòng điền đầy đủ thông tin bắt buộc (tên, thương hiệu, loại sản phẩm, giá)', 'error');
    return;
  }

  if (selectedSizes.value.length === 0) {
    showToast('Vui lòng chọn ít nhất một kích thước cho sản phẩm', 'error');
    return;
  }

  // Validate variants
  for (const colorGroup of colorVariants.value) {
    if (!colorGroup.color.trim()) {
      showToast('Vui lòng nhập tên màu sắc cho tất cả biến thể', 'error');
      return;
    }
    if (colorGroup.variants.length === 0) {
      showToast(`Màu "${colorGroup.color}" phải có ít nhất 1 kích thước`, 'error');
      return;
    }
    for (const variant of colorGroup.variants) {
      if (!variant.size_id) {
        showToast(`Vui lòng chọn kích thước cho tất cả biến thể của màu "${colorGroup.color}"`, 'error');
        return;
      }
    }
  }

  isSaving.value = true;
  try {
    // Step 1: Prepare main product data
    const productFormData = new FormData();
    
    // Append basic fields
    const fields = ['name', 'description', 'brand_id', 'type_id', 'sku', 'price', 
                   'material', 'weight', 'origin_country', 'warranty_months', 'care_instructions'];
    
    fields.forEach(field => {
      if (productData.value[field] !== null && productData.value[field] !== undefined) {
        productFormData.append(field, productData.value[field]);
      }
    });
    
    // Append JSON fields
    productFormData.append('dimensions', JSON.stringify(productData.value.dimensions || {}));
    productFormData.append('features', JSON.stringify(productData.value.features || {}));
    
    // Append arrays
    selectedSizes.value.forEach(sizeId => {
      productFormData.append('sizes[]', sizeId);
    });
    
    if (tagsInput.value) {
      const tagsArray = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagsArray.forEach(tag => productFormData.append('tags[]', tag));
    }
    
    // Append images
    imageFiles.value.forEach(file => {
      productFormData.append('images', file);
    });
    
    if (removedImageIds.value.length > 0) {
      productFormData.append('removed_image_ids', JSON.stringify(removedImageIds.value));
    }

    // Debug log
    console.log('🔄 Bắt đầu lưu sản phẩm...');

    // Step 2: Save main product
    let savedProduct;
    if (isEditMode.value) {
      console.log('📝 Đang cập nhật sản phẩm...');
      const response = await api.put(`/products/${productId.value}`, productFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      savedProduct = response.data.data;
      console.log('✅ Đã cập nhật sản phẩm:', savedProduct);
    } else {
      console.log('🆕 Đang tạo sản phẩm mới...');
      const response = await api.post('/products', productFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      savedProduct = response.data.data;
      console.log('✅ Đã tạo sản phẩm:', savedProduct);
    }

    // Step 3: Delete old variants if needed
    if (isEditMode.value && variantsToDelete.value.length > 0) {
      console.log('🗑️ Đang xóa các biến thể cũ:', variantsToDelete.value);
      const deletePromises = variantsToDelete.value.map(variantId => 
        api.delete(`/variants/${variantId}`).catch(err => {
          console.error(`❌ Lỗi khi xóa variant ${variantId}:`, err);
          return null;
        })
      );
      await Promise.all(deletePromises);
      console.log('✅ Đã xóa các biến thể cũ');
    }

    // Step 4: Process color variants with shared images
    console.log('🎨 Đang xử lý các biến thể màu sắc...');
    
    for (const [colorIndex, colorGroup] of colorVariants.value.entries()) {
      if (colorGroup.variants.length === 0) continue;

      console.log(`🔄 Xử lý màu: ${colorGroup.color} với ${colorGroup.variants.length} size`);

      // Prepare variants data for this color group
      const variantsData = colorGroup.variants.map(variant => {
        const generatedSKU = variant.sku || generateVariantSKU(colorGroup.color, variant.size_id);
        return {
          product_id: savedProduct.id,
          color: colorGroup.color,
          size_id: variant.size_id,
          sku: generatedSKU,
          additional_price: variant.additional_price || 0
        };
      });

      // Kiểm tra SKU trùng lặp
      const skus = variantsData.map(v => v.sku);
      const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index);
      if (duplicateSKUs.length > 0) {
        console.error('❌ SKU bị trùng lặp:', duplicateSKUs);
        throw new Error(`SKU bị trùng lặp: ${duplicateSKUs.join(', ')}`);
      }

      console.log(`📦 Dữ liệu variants cho màu ${colorGroup.color}:`, variantsData);
      console.log(`🏷️ SKUs: ${skus.join(', ')}`);
      console.log(`🖼️ Files cho màu ${colorGroup.color}:`, colorGroup.files?.length || 0);

      // Xử lý dựa trên việc color group đã tồn tại hay chưa
      if (!colorGroup.isExisting) {
        // TẤT CẢ biến thể mới - dùng bulk API
        console.log(`🆕 Tạo mới biến thể cho màu ${colorGroup.color}`);
        await createNewColorVariants(variantsData, colorGroup);
      } else {
        // Color group đã tồn tại - cập nhật/tạo từng biến thể
        console.log(`✏️ Cập nhật biến thể cho màu ${colorGroup.color}`);
        await updateExistingColorVariants(variantsData, colorGroup);
      }
    }

    console.log('✅ Hoàn thành xử lý tất cả biến thể');
    showToast('Lưu sản phẩm và các biến thể thành công!', 'success');
    
    // Chuyển hướng sau 1.5 giây
    setTimeout(() => {
      router.push('/admin/products');
    }, 1500);

  } catch (error) {
    console.error('❌ Lỗi toàn bộ quá trình lưu:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi không xác định.';
    console.error("Chi tiết lỗi:", error.response?.data);
    showToast(`Lưu thất bại: ${errorMessage}`, 'error');
  } finally {
    isSaving.value = false;
  }
};

// Helper function để tạo biến thể mới cho màu
const createNewColorVariants = async (variantsData, colorGroup) => {
  try {
    // Thử dùng bulk API trước
    const variantFormData = new FormData();
    variantFormData.append('variantsData', JSON.stringify(variantsData));
    
    // Thêm ảnh vào FormData - chỉ một lần cho cả nhóm màu
    if (colorGroup.files && colorGroup.files.length > 0) {
      colorGroup.files.forEach(file => {
        variantFormData.append('images', file);
      });
    }

    console.log('🚀 Thử dùng bulk API...');
    await api.post('/variants/bulk-with-shared-images', variantFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log(`✅ Đã tạo ${variantsData.length} biến thể cho màu ${colorGroup.color} bằng bulk API`);
    
  } catch (bulkError) {
    console.warn('⚠️ Bulk API thất bại:', bulkError.response?.data || bulkError.message);
    
    // Kiểm tra nếu lỗi là do SKU trùng
    if (bulkError.response?.data?.message?.includes('SKU')) {
      console.log('🔄 Thử tạo lại với SKU tự động...');
      
      // Tạo lại SKU với timestamp để đảm bảo unique
      const timestamp = Date.now().toString().slice(-6);
      const newVariantsData = variantsData.map(v => ({
        ...v,
        sku: `${v.sku}-${timestamp}`
      }));
      
      const retryFormData = new FormData();
      retryFormData.append('variantsData', JSON.stringify(newVariantsData));
      
      if (colorGroup.files && colorGroup.files.length > 0) {
        colorGroup.files.forEach(file => {
          retryFormData.append('images', file);
        });
      }
      
      await api.post('/variants/bulk-with-shared-images', retryFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log(`✅ Đã tạo với SKU mới: ${newVariantsData.map(v => v.sku).join(', ')}`);
      return;
    }
    
    // Fallback: tạo từng biến thể riêng lẻ
    if (!colorGroup.isExisting) {
      await createVariantsIndividually(variantsData, colorGroup.files);
    }
  }
};

// Helper function để tạo từng biến thể riêng lẻ
const createVariantsIndividually = async (variantsData, files) => {
  console.log(`🔄 Tạo ${variantsData.length} biến thể riêng lẻ...`);
  
  for (const [index, variantData] of variantsData.entries()) {
    try {
      const formData = new FormData();
      
      // Thêm các trường dữ liệu
      Object.keys(variantData).forEach(key => {
        formData.append(key, variantData[key]);
      });
      
      // Chỉ thêm ảnh cho biến thể đầu tiên (dùng chung)
      if (index === 0 && files && files.length > 0) {
        files.forEach(file => {
          formData.append('images', file);
        });
        console.log(`🖼️ Đã thêm ${files.length} ảnh cho biến thể đầu tiên`);
      }
      
      console.log(`📝 Đang tạo biến thể ${index + 1}/${variantsData.length}:`, variantData);
      await api.post('/variants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log(`✅ Đã tạo biến thể ${index + 1}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi tạo biến thể ${index + 1}:`, error);
      throw new Error(`Không thể tạo biến thể cho size ${variantData.size_id}: ${error.message}`);
    }
  }
};

// Helper function để cập nhật/tạo biến thể cho color group đã tồn tại
const updateExistingColorVariants = async (variantsData, colorGroup) => {
  console.log(`✏️ Cập nhật ${variantsData.length} biến thể cho màu đã tồn tại`);
  
  for (const [index, variantData] of variantsData.entries()) {
    try {
      const formData = new FormData();
      
      formData.append('product_id', variantData.product_id);
      formData.append('color', variantData.color);
      formData.append('size_id', variantData.size_id);
      formData.append('additional_price', variantData.additional_price);
      formData.append('sku', variantData.sku);

      // Chỉ xử lý ảnh cho biến thể đầu tiên của nhóm màu
      if (index === 0) {
        console.log(`🖼️ Xử lý ảnh cho biến thể đầu tiên của màu ${colorGroup.color}`);
        
        // Thêm ảnh mới
        if (colorGroup.files && colorGroup.files.length > 0) {
          colorGroup.files.forEach(file => {
            formData.append('images', file);
          });
          console.log(`➕ Đã thêm ${colorGroup.files.length} ảnh mới`);
        }
        
        // Xóa ảnh cũ nếu có
        if (colorGroup.removedImageIds && colorGroup.removedImageIds.length > 0) {
          formData.append('removeImageIds', JSON.stringify(colorGroup.removedImageIds));
          console.log(`🗑️ Đã đánh dấu xóa ${colorGroup.removedImageIds.length} ảnh cũ`);
        }
      }

      // Tìm variant tương ứng trong colorGroup để xem có id và có phải là mới không
      const variantInUI = colorGroup.variants.find(v => 
        v.size_id === variantData.size_id
      );

      if (variantInUI && variantInUI.id) {
        // Update existing variant
        console.log(`📝 Cập nhật biến thể tồn tại ID: ${variantInUI.id}`);
        await api.put(`/variants/${variantInUI.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(`✅ Đã cập nhật biến thể ${variantInUI.id}`);
      } else if (variantInUI && variantInUI.isNew) {
        // Create new variant
        console.log(`🆕 Tạo biến thể mới cho size ${variantData.size_id}`);
        await api.post('/variants', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(`✅ Đã tạo biến thể mới cho size ${variantData.size_id}`);
      }
      
    } catch (error) {
      console.error(`❌ Lỗi khi xử lý biến thể ${index + 1}:`, error);
      throw new Error(`Không thể xử lý biến thể cho size ${variantData.size_id}: ${error.message}`);
    }
  }
};
</script>