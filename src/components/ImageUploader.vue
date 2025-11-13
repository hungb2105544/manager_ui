<!-- <template>
  <div class="image-uploader">
    <div class="preview-area">
      <div v-for="(image, index) in previews" :key="image.id || image.name" class="image-preview">
        <img :src="image.url" alt="preview" />
        <button type="button" @click="removeImage(index)" class="remove-btn">&times;</button>
      </div>
      <label class="upload-box" v-show="previews.length < maxFiles">
        +
        <input 
          type="file" 
          multiple 
          @change="handleFileChange" 
          accept="image/*" 
          style="display: none;"
          ref="fileInput"
        >
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';

const props = defineProps({
  maxFiles: { type: Number, default: 5 },
  // [THÊM MỚI] Prop để nhận vào mảng ảnh đã có
  // Mảng này nên có dạng [{ id: 1, url: 'http://...' }, { id: 2, url: 'http://...' }]
  existingImages: { type: Array, default: () => [] }
});

const emit = defineEmits([
    'update:files', // Event cho các file mới
    'update:removedImages' // [THÊM MỚI] Event cho các ID ảnh cũ bị xóa
]);

const previews = ref([]);
const newFiles = ref([]);
const removedImageIds = ref([]);
const fileInput = ref(null); // Ref cho input file

// [THÊM MỚI] Theo dõi prop `existingImages` để khởi tạo previews
watch(() => props.existingImages, (newImages) => {
  if (newImages && newImages.length > 0) {
    // Chỉ khởi tạo một lần đầu tiên
    if (previews.value.length === 0) {
      previews.value = newImages.map(img => ({ ...img, type: 'existing' }));
    }
  }
}, { immediate: true });


const handleFileChange = (event) => {
  const addedFiles = Array.from(event.target.files);
  for (const file of addedFiles) {
    if (previews.value.length < props.maxFiles) {
      newFiles.value.push(file);
      previews.value.push({ url: URL.createObjectURL(file), name: file.name, type: 'new' });
    }
  }
  emit('update:files', newFiles.value);
  // Reset input để có thể chọn lại cùng một file
  if(fileInput.value) fileInput.value.value = '';
};

// [THAY ĐỔI] Logic xóa ảnh phức tạp hơn
const removeImage = (index) => {
  const imageToRemove = previews.value[index];

  if (imageToRemove.type === 'existing') {
    // Nếu là ảnh đã có, thêm ID của nó vào danh sách cần xóa
    removedImageIds.value.push(imageToRemove.id);
    emit('update:removedImages', removedImageIds.value);
  } else {
    // Nếu là ảnh mới, tìm và xóa nó khỏi mảng newFiles
    const fileIndex = newFiles.value.findIndex(file => file.name === imageToRemove.name);
    if (fileIndex > -1) {
      newFiles.value.splice(fileIndex, 1);
    }
    emit('update:files', newFiles.value);
  }

  // Xóa khỏi danh sách xem trước
  previews.value.splice(index, 1);
};
</script>

<style scoped>
/* Style không thay đổi */
.preview-area { display: flex; flex-wrap: wrap; gap: 15px; }
.image-preview, .upload-box { width: 120px; height: 120px; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; justify-content: center; align-items: center; position: relative; }
.upload-box { font-size: 3rem; color: #ccc; cursor: pointer; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.remove-btn { position: absolute; top: -10px; right: -10px; background-color: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; }
</style> -->


<template>
  <div class="image-uploader">
    <div class="preview-area">
      <div v-for="(image, index) in previews" :key="image.id || image.name" class="image-preview">
        <img :src="image.url" alt="preview" />
        <button type="button" @click="removeImage(index)" class="remove-btn">&times;</button>
      </div>
      <label class="upload-box" v-show="previews.length < maxFiles">
        +
        <input 
          type="file" 
          multiple 
          @change="handleFileChange" 
          accept="image/*" 
          style="display: none;"
          ref="fileInput"
        >
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';

const props = defineProps({
  maxFiles: { type: Number, default: 5 },
  existingImages: { type: Array, default: () => [] }
});

const emit = defineEmits([
  'update:files',
  'update:removedImages'
]);

const previews = ref([]);
const newFiles = ref([]);
const removedImageIds = ref([]);
const fileInput = ref(null);

watch(() => props.existingImages, (newImages) => {
  if (newImages && newImages.length > 0) {
    if (previews.value.length === 0) {
      previews.value = newImages.map(img => ({ ...img, type: 'existing' }));
    }
  }
}, { immediate: true });

const handleFileChange = (event) => {
  const addedFiles = Array.from(event.target.files);
  for (const file of addedFiles) {
    if (previews.value.length < props.maxFiles) {
      newFiles.value.push(file);
      previews.value.push({ url: URL.createObjectURL(file), name: file.name, type: 'new' });
    }
  }
  emit('update:files', newFiles.value);
  if (fileInput.value) fileInput.value.value = '';
};

const removeImage = (index) => {
  const imageToRemove = previews.value[index];

  if (imageToRemove.type === 'existing') {
    removedImageIds.value.push(imageToRemove.id);
    emit('update:removedImages', removedImageIds.value);
  } else {
    const fileIndex = newFiles.value.findIndex(file => file.name === imageToRemove.name);
    if (fileIndex > -1) {
      newFiles.value.splice(fileIndex, 1);
    }
    emit('update:files', newFiles.value);
  }

  previews.value.splice(index, 1);
};
</script>

<style scoped>
.preview-area { display: flex; flex-wrap: wrap; gap: 15px; }
.image-preview, .upload-box { width: 120px; height: 120px; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; justify-content: center; align-items: center; position: relative; }
.upload-box { font-size: 3rem; color: #ccc; cursor: pointer; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.remove-btn { position: absolute; top: -10px; right: -10px; background-color: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; }
</style>