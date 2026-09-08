export const STORAGE_KEY = {
  ADMIN_AUTH: "admin_auth",
  ADMIN_TOKEN: "admin_token",
};

export const API_ROUTES = {
  LOCAL_URL: "http://localhost:8080/api/v1",

  LOGIN_URL: "/user/login",
  //User management
  ADD_USER: "/user/create",
  GET_USERS: "/user/get-admins",

  //Product management
  GET_CATEGORIES: "/category/get-all",
  ADD_CATEGORY: "/category/add",
  UPDATE_CATEGORY: "/category/update",
  DELETE_CATEGORY: "/category/delete",

  GET_PRODUCTS: "/product/get-all",
  ADD_PRODUCT: "/product/add",
  UPDATE_PRODUCT: "/product/update",
  DELETE_PRODUCT: "/product/delete",
  UPDATE_PRODUCT_STATUS: "/product/update-status",

  // Order management
  GET_ORDER_SUMMARY: "/order/summary",
  GET_ALL_ORDERS: "/order/get-all",
  GET_ORDER_BY_ID: "/order",
  UPDATE_ORDER_STATUS: "/order/update-status",
  UPDATE_SHIPPING_ADDRESS: "/order/shipping-address",
  CANCEL_ORDER: "/order/cancel",
};
