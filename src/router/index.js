// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
const routes = [
  {
    path: "/",
    redirect: "/admin/dashboard",
  },
  {
    path: "/login",
    component: AuthLayout,
    children: [
      { path: "", name: "Login", component: () => import("@/views/Login.vue") },
    ],
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard.vue"),
      },
      {
        path: "notifications/send",
        name: "SendNotification",
        component: () => import("@/views/notifications/SendNotification.vue"),
        meta: { requiresAuth: true, title: "Gửi thông báo" },
      },
      {
        path: "inventory/import",
        name: "InventoryImport",
        component: () => import("@/views/inventory/InventoryImport.vue"),
      },
      {
        path: "product-discounts",
        name: "ProductDiscounts",
        component: () => import("@/views/products/ProductDiscounts.vue"),
      },
      {
        path: "products",
        name: "ProductList",
        component: () => import("@/views/products/ProductList.vue"),
      },
      {
        path: "branches",
        name: "Branches",
        component: () => import("@/views/Branches.vue"),
      },
      {
        path: "products/new",
        name: "ProductCreate",
        component: () => import("@/views/products/ProductEdit.vue"),
      },
      {
        path: "products/:id",
        name: "ProductEdit",
        component: () => import("@/views/products/ProductEdit.vue"),
      },
      {
        path: "orders",
        name: "OrderList",
        component: () => import("@/views/orders/OrderList.vue"),
      },
      {
        path: "orders/:id",
        name: "OrderDetail",
        component: () => import("@/views/orders/OrderDetail.vue"),
      },
      {
        path: "inventory",
        name: "Inventory",
        component: () => import("@/views/Inventory.vue"),
      },
      {
        path: "vouchers",
        name: "Vouchers",
        component: () => import("@/views/Vouchers.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  console.log("🛣️ Route guard:", {
    from: from.path,
    to: to.path,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
  });

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log("🚫 Access denied, redirecting to login");
    next({ name: "Login" });
  } else if (to.name === "Login" && isAuthenticated) {
    console.log("✅ Already logged in, redirecting to dashboard");
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
