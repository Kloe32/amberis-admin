import type { AdminRole } from "../types/auth.type";

export const rolePermissions: Record<string, AdminRole[]> = {
  "/dashboard": ["SUPER_ADMIN", "PRODUCT_MANAGER", "CUSTOMER_SUPPORT"],
  "/products": ["SUPER_ADMIN", "PRODUCT_MANAGER"],
  "/categories": ["SUPER_ADMIN", "PRODUCT_MANAGER"],
  "/products/list": ["SUPER_ADMIN", "PRODUCT_MANAGER"],
  "/orders": ["SUPER_ADMIN", "CUSTOMER_SUPPORT"],
  "/users": ["SUPER_ADMIN"],
  "/settings": ["SUPER_ADMIN"],
  "/profile": ["SUPER_ADMIN", "PRODUCT_MANAGER", "CUSTOMER_SUPPORT"],
};
