<!-- <template>
  <div class="sidebar">
    <div class="sidebar-header">
      Admin Panel
    </div>
    <nav class="sidebar-nav">
      <router-link to="/admin/dashboard">Tổng quan</router-link>
      <router-link to="/admin/orders">Quản lý Đơn hàng</router-link>
      <router-link to="/admin/products">Quản lý Sản phẩm</router-link>
      <router-link to="/admin/product-discounts">Quản lý Giảm giá</router-link>
      <router-link to="/admin/inventory">Quản lý Kho hàng</router-link>
      <router-link to="/admin/branches">Quản lý Chi nhánh</router-link>
      <router-link to="/admin/vouchers">Quản lý Vouchers</router-link>
      <router-link to="/admin/inventory/import" class="nav-link">
          <router-link to="/admin/notifications/send" class="nav-link">
    <span class="nav-link-title">
      Gửi thông báo
    </span>
  </router-link>
    <i class="nav-icon fas fa-dolly-flatbed"></i>
    <p>Nhập hàng</p>
    <li class="nav-item">

</li>
  </router-link>
      </nav>
  </div>
</template> -->

<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      🧭 Admin Panel
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul>
        <li>
          <router-link to="/admin/dashboard" class="nav-link" active-class="active">
            <i class="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/orders" class="nav-link" active-class="active">
            <i class="fas fa-shopping-cart"></i>
            <span>Quản lý Đơn hàng</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/products" class="nav-link" active-class="active">
            <i class="fas fa-box-open"></i>
            <span>Quản lý Sản phẩm</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/product-discounts" class="nav-link" active-class="active">
            <i class="fas fa-tags"></i>
            <span>Quản lý Giảm giá</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/inventory" class="nav-link" active-class="active">
            <i class="fas fa-warehouse"></i>
            <span>Quản lý Kho hàng</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/branches" class="nav-link" active-class="active">
            <i class="fas fa-code-branch"></i>
            <span>Quản lý Chi nhánh</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/vouchers" class="nav-link" active-class="active">
            <i class="fas fa-ticket-alt"></i>
            <span>Quản lý Vouchers</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/inventory/import" class="nav-link" active-class="active">
            <i class="fas fa-dolly-flatbed"></i>
            <span>Nhập hàng</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/notifications/send" class="nav-link" active-class="active">
            <i class="fas fa-bell"></i>
            <span>Gửi thông báo</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;

  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  padding: 20px 0;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
}

.sidebar-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #334155;
  color: #fff;
}

.nav-link i {
  width: 18px;
  text-align: center;
}

.nav-link.active {
  color: #fff;
  border-left: 3px solid #93c5fd;
  font-weight: 600;
}
</style>
