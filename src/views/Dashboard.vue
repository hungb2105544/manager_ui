<template>
  <div class="dashboard">
    <div class="header">
      <h1>Bảng điều khiển</h1>
      <div class="date-picker-container">
        <VueDatePicker 
          v-model="dateRange" 
          range 
          :enable-time-picker="false" 
          :max-date="new Date()"
          format="dd/MM/yyyy"
          placeholder="Chọn khoảng thời gian"
          @update:model-value="handleDateUpdate"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu thống kê...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchStats" class="btn btn-primary">Thử lại</button>
    </div>

    <div v-else>
      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="card kpi-card">
          <div class="card-icon revenue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M4 10.781c.524-.67 1.453-1.002 2.523-.962.993.038 1.81.527 2.292 1.256.482.73.402 1.845-.214 2.64-.617.795-1.6 1.242-2.75 1.242-1.29 0-2.355-.69-2.84-1.59-.487-.902-.34-2.14.39-2.985z"/><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/><path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-1z"/></svg>
          </div>
          <div class="card-content">
            <p class="kpi-title">Tổng doanh thu</p>
            <h3 class="kpi-value">{{ formatCurrency(stats.overview?.total_revenue || 0) }}</h3>
          </div>
        </div>
        <div class="card kpi-card">
          <div class="card-icon orders">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/></svg>
          </div>
          <div class="card-content">
            <p class="kpi-title">Tổng đơn hàng</p>
            <h3 class="kpi-value">{{ stats.overview?.total_orders || 0 }}</h3>
          </div>
        </div>
        <div class="card kpi-card">
          <div class="card-icon products">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg>
          </div>
          <div class="card-content">
            <p class="kpi-title">Sản phẩm đã bán</p>
            <h3 class="kpi-value">{{ stats.overview?.total_products_sold || 0 }}</h3>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="card chart-card">
        <h4>Doanh thu & Đơn hàng</h4>
        <Line v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
        <div v-else class="empty-chart">Không có dữ liệu trong khoảng thời gian này.</div>
      </div>

      <!-- Top Products -->
      <div class="card top-products-card">
        <h4>Sản phẩm bán chạy nhất</h4>
        <div v-if="stats.topProducts && stats.topProducts.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th colspan="2">Sản phẩm</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in stats.topProducts" :key="product.product_id">
                <td class="product-image-cell">
                  <img :src="product.product_image || 'https://via.placeholder.com/60'" :alt="product.product_name">
                </td>
                <td>{{ product.product_name }}</td>
                <td>{{ product.total_quantity_sold }}</td>
                <td>{{ formatCurrency(product.total_revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-list">
          <p>Không có sản phẩm nào được bán trong khoảng thời gian này.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import api from '@/services/api';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { subDays, format } from 'date-fns';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const loading = ref(true);
const error = ref(null);
const stats = ref({});

const dateRange = ref();

const chartData = reactive({
  labels: [],
  datasets: [
    {
      label: 'Doanh thu (VND)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      data: [],
      yAxisID: 'y',
      tension: 0.4,
    },
    {
      label: 'Đơn hàng',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      data: [],
      yAxisID: 'y1',
      tension: 0.4,
    }
  ]
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Doanh thu (VND)'
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('vi-VN').format(value);
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Số lượng đơn hàng'
      },
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.dataset.yAxisID === 'y') {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            } else {
              label += context.parsed.y;
            }
          }
          return label;
        }
      }
    }
  }
}));

const fetchStats = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {};
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.startDate = format(dateRange.value[0], 'yyyy-MM-dd');
      params.endDate = format(dateRange.value[1], 'yyyy-MM-dd');
    }

    const response = await api.get('/stats', { params });
    stats.value = response.data.data;
    console.log(stats.value.chartData);

    // Process chart data
    if (stats.value.chartData) {
      chartData.labels = stats.value.chartData.map(d => format(new Date(d.report_date), 'dd/MM'));
      chartData.datasets[0].data = stats.value.chartData.map(d => d.daily_revenue);
      chartData.datasets[1].data = stats.value.chartData.map(d => d.daily_orders);
    }

  } catch (err) {
    console.error("Lỗi khi tải dữ liệu thống kê:", err);
    error.value = "Không thể tải dữ liệu. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};

const handleDateUpdate = (modelData) => {
  dateRange.value = modelData;
  fetchStats();
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = Number(value) || 0;
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(() => {
  const endDate = new Date();
  const startDate = subDays(endDate, 29); // Default to last 30 days
  dateRange.value = [startDate, endDate];
  fetchStats();
});

</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f4f7f9;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.date-picker-container {
  width: 300px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
  background: white;
  border-radius: 12px;
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

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 24px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.card-icon.revenue { background-color: #2ecc71; }
.card-icon.orders { background-color: #3498db; }
.card-icon.products { background-color: #e67e22; }

.kpi-title {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.kpi-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}

.chart-card {
  height: 450px;
}
.chart-card h4, .top-products-card h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #34495e;
}

.empty-chart, .empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #95a5a6;
  font-style: italic;
}

.top-products-card .table {
  width: 100%;
  border-collapse: collapse;
}

.top-products-card th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #ecf0f1;
  color: #7f8c8d;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.top-products-card td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
  vertical-align: middle;
}

.product-image-cell img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4285f4;
  color: white;
}
</style>