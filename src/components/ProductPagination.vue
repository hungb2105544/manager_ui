<template>
  <div class="pagination-container" v-if="totalPages > 1" >    
    <nav class="pagination-nav">
      <ul class="pagination">
        <!-- Nút đầu trang -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button 
            class="page-link" 
            @click="goToPage(1)"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
        </li>

        <!-- Nút trang trước -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-left"></i>
          </button>
        </li>

        <!-- Các trang số -->
        <li 
          v-for="page in visiblePages" 
          :key="page"
          class="page-item" 
          :class="{ 
            active: page === currentPage,
            disabled: page === '...'
          }"
        >
          <button 
            v-if="page !== '...'"
            class="page-link" 
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link">...</span>
        </li>

        <!-- Nút trang sau -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-right"></i>
          </button>
        </li>

        <!-- Nút cuối trang -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button 
            class="page-link" 
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Chọn số lượng items per page -->
    <div class="page-size-selector">
      <label>Hiển thị:</label>
      <select 
        v-model="localItemsPerPage" 
        @change="updateItemsPerPage"
        class="form-select"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  itemsPerPage: {
    type: Number,
    required: true,
    default: 10
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['page-change', 'items-per-page-change'])

const localItemsPerPage = ref(props.itemsPerPage)

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return end > props.totalItems ? props.totalItems : end
})

const visiblePages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxVisiblePages / 2)
  
  let start = props.currentPage - half
  let end = props.currentPage + half

  if (start < 1) {
    start = 1
    end = Math.min(props.maxVisiblePages, totalPages.value)
  }

  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }

  // Thêm dấu ... nếu cần
  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages.value) {
    if (end < totalPages.value - 1) {
      pages.push('...')
    }
    pages.push(totalPages.value)
  }

  return pages
})

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const updateItemsPerPage = () => {
  emit('items-per-page-change', parseInt(localItemsPerPage.value))
}

// Watch for prop changes
watch(() => props.itemsPerPage, (newValue) => {
  localItemsPerPage.value = newValue
})
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-nav {
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 5px;
}

.page-item {
  margin: 0;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.page-link:hover:not(.disabled) {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #0056b3;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6c757d;
  font-size: 0.9rem;
}

.page-size-selector .form-select {
  width: auto;
  display: inline-block;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-info {
    order: 1;
  }
  
  .pagination-nav {
    order: 2;
  }
  
  .page-size-selector {
    order: 3;
  }
  
  .page-link {
    min-width: 35px;
    height: 35px;
    padding: 0 8px;
    font-size: 0.8rem;
  }
}
</style>