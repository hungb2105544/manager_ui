<template>
  <div class="location-picker">
    <h4>Vị trí trên bản đồ</h4>
    <p class="help-text">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: text-bottom;">
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
      </svg>
      Nhấp vào bản đồ hoặc kéo marker để chọn vị trí chi nhánh
    </p>
    
    <div class="map-container">
      <div id="leaflet-map" ref="mapContainer"></div>
    </div>
    
    <div class="coordinates-grid">
      <div class="form-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: baseline;">
            <path d="M8 0a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 8 0z"/>
          </svg>
          Vĩ độ (Latitude)
        </label>
        <input 
          type="number" 
          v-model.number="localLocation.latitude" 
          @change="updateMarkerFromInput"
          class="form-control" 
          step="0.000001"
          placeholder="10.776889"
        >
      </div>
      <div class="form-group">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: baseline;">
            <path d="M0 8a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 8z"/>
          </svg>
          Kinh độ (Longitude)
        </label>
        <input 
          type="number" 
          v-model.number="localLocation.longitude" 
          @change="updateMarkerFromInput"
          class="form-control" 
          step="0.000001"
          placeholder="106.700981"
        >
      </div>
    </div>
    
    <button 
      type="button" 
      @click="getCurrentLocation" 
      class="btn-location"
      :disabled="isGettingLocation"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v.793l.646-.647a.5.5 0 1 1 .708.708L8.707 3.5H9.5a.5.5 0 0 1 0 1h-.793l1.147 1.146a.5.5 0 0 1-.708.708L8.5 5.707V6.5a.5.5 0 0 1-1 0v-.793l-.646.647a.5.5 0 1 1-.708-.708L7.293 4.5H6.5a.5.5 0 0 1 0-1h.793L6.146 2.354a.5.5 0 1 1 .708-.708l.646.647V1.5A.5.5 0 0 1 8 1zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
      </svg>
      {{ isGettingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại của tôi' }}
    </button>
    
    <div class="map-info">
      <small>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
        Dữ liệu bản đồ từ OpenStreetMap - Hoàn toàn miễn phí
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon paths cho Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ latitude: 10.7769, longitude: 106.7009 })
  }
});

const emit = defineEmits(['update:modelValue']);

const mapContainer = ref(null);
const map = ref(null);
const marker = ref(null);
const isGettingLocation = ref(false);
const localLocation = ref({
  latitude: props.modelValue?.latitude || 10.7769,
  longitude: props.modelValue?.longitude || 106.7009
});

const initMap = () => {
  if (!mapContainer.value || map.value) return;

  try {
    // Tạo map với Leaflet
    map.value = L.map(mapContainer.value, {
      center: [localLocation.value.latitude, localLocation.value.longitude],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Thêm tile layer từ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map.value);

    // Tạo custom icon (màu đỏ nổi bật hơn)
    const customIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Thêm marker
    marker.value = L.marker(
      [localLocation.value.latitude, localLocation.value.longitude], 
      {
        draggable: true,
        icon: customIcon,
        title: 'Kéo để di chuyển vị trí'
      }
    ).addTo(map.value);

    // Thêm popup cho marker
    marker.value.bindPopup('Vị trí chi nhánh<br><small>Kéo marker để thay đổi</small>').openPopup();

    // Sự kiện kéo marker
    marker.value.on('dragend', (e) => {
      const position = e.target.getLatLng();
      updateLocation(position.lat, position.lng);
    });

    // Sự kiện click vào map
    map.value.on('click', (e) => {
      updateLocation(e.latlng.lat, e.latlng.lng);
      marker.value.setLatLng(e.latlng);
      marker.value.openPopup();
    });

    // Fix kích thước map sau khi render
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize();
      }
    }, 100);

  } catch (error) {
    console.error('Lỗi khởi tạo bản đồ:', error);
  }
};

const updateLocation = (lat, lng) => {
  localLocation.value = { 
    latitude: parseFloat(lat.toFixed(6)), 
    longitude: parseFloat(lng.toFixed(6)) 
  };
  emit('update:modelValue', localLocation.value);
};

const updateMarkerFromInput = () => {
  if (marker.value && map.value && localLocation.value.latitude && localLocation.value.longitude) {
    const newLatLng = [localLocation.value.latitude, localLocation.value.longitude];
    marker.value.setLatLng(newLatLng);
    map.value.setView(newLatLng, map.value.getZoom());
    marker.value.openPopup();
    emit('update:modelValue', localLocation.value);
  }
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Trình duyệt của bạn không hỗ trợ định vị địa lý.');
    return;
  }

  isGettingLocation.value = true;
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      updateLocation(lat, lng);
      
      if (marker.value && map.value) {
        marker.value.setLatLng([lat, lng]);
        map.value.setView([lat, lng], 15);
        marker.value.openPopup();
      }
      
      isGettingLocation.value = false;
    },
    (error) => {
      console.error('Lỗi khi lấy vị trí:', error);
      let errorMessage = 'Không thể lấy vị trí hiện tại.';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật trong cài đặt trình duyệt.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Thông tin vị trí không khả dụng.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian chờ.';
          break;
      }
      
      alert(errorMessage);
      isGettingLocation.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

// Watch props changes
watch(() => props.modelValue, (newVal) => {
  if (newVal && (
    newVal.latitude !== localLocation.value.latitude || 
    newVal.longitude !== localLocation.value.longitude
  )) {
    localLocation.value = { ...newVal };
    if (marker.value && map.value) {
      marker.value.setLatLng([newVal.latitude, newVal.longitude]);
      map.value.setView([newVal.latitude, newVal.longitude], map.value.getZoom());
    }
  }
}, { deep: true });

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    initMap();
  }, 100);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<style scoped>
.location-picker {
  margin-top: 10px;
}

h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.help-text {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.map-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

#leaflet-map {
  height: 400px;
  width: 100%;
  background: #f8f9fa;
}

.coordinates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
}

.form-control:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-control::placeholder {
  color: #aaa;
  font-family: 'Courier New', monospace;
}

.btn-location {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(66, 133, 244, 0.3);
  width: 100%;
}

.btn-location:hover:not(:disabled) {
  background: linear-gradient(135deg, #3367d6 0%, #2851a3 100%);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
  transform: translateY(-1px);
}

.btn-location:active:not(:disabled) {
  transform: translateY(0);
}

.btn-location:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-location svg {
  flex-shrink: 0;
}

.map-info {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #4285f4;
}

.map-info small {
  color: #666;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Leaflet popup customization */
:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

:global(.leaflet-popup-content) {
  margin: 10px 12px;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .coordinates-grid {
    grid-template-columns: 1fr;
  }
  
  #leaflet-map {
    height: 300px;
  }
}
</style>