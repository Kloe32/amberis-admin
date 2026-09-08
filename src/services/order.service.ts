import axios from "axios";
import axiosInstance from "../config/axiosInstance";
import { API_ROUTES } from "../config/config";
import type {
  GetAllOrdersParams,
  Order,
  OrderSummaryMetrics,
  OrdersPagination,
  ShippingAddress,
  UpdateOrderStatusPayload,
} from "../types/order";

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: OrdersPagination;
}

export interface OrderSummaryResponse {
  success: boolean;
  message: string;
  data: OrderSummaryMetrics;
}

export interface SingleOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const getOrderSummary = async (params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<OrderSummaryMetrics> => {
  try {
    const response = await axiosInstance.get(API_ROUTES.GET_ORDER_SUMMARY, {
      params,
    });
    const raw = response.data?.data || response.data || {};
    return {
      totalOrders: Number(raw.totalOrders) || 0,
      totalRevenue: Number(raw.totalRevenue) || 0,
      pendingOrders: Number(raw.pendingOrders) || 0,
      processingOrders: Number(raw.processingOrders) || 0,
      paidOrders: Number(raw.paidOrders) || 0,
      shippedOrders: Number(raw.shippedOrders) || 0,
      deliveredOrders: Number(raw.deliveredOrders) || 0,
      cancelledOrders: Number(raw.cancelledOrders) || 0,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch order summary"), {
      cause: error,
    });
  }
};

export const getAllOrders = async (
  params?: GetAllOrdersParams,
): Promise<{ orders: Order[]; pagination: OrdersPagination }> => {
  try {
    const response = await axiosInstance.get(API_ROUTES.GET_ALL_ORDERS, {
      params,
    });
    const rawData = response.data;
    const ordersList: Order[] = Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.orders)
      ? rawData.orders
      : Array.isArray(rawData)
      ? rawData
      : [];

    const rawPagination = rawData?.pagination || rawData?.meta || {};
    const totalOrders =
      Number(
        rawPagination.totalOrders ??
          rawPagination.total ??
          rawData?.total ??
          ordersList.length,
      ) || 0;
    const limit = Number(rawPagination.limit ?? params?.limit ?? 10) || 10;
    const currentPage =
      Number(
        rawPagination.currentPage ??
          rawPagination.page ??
          params?.page ??
          1,
      ) || 1;
    const totalPages =
      Number(
        rawPagination.totalPages ??
          rawPagination.pages ??
          Math.max(1, Math.ceil(totalOrders / limit)),
      ) || 1;

    return {
      orders: ordersList,
      pagination: {
        totalOrders,
        totalPages,
        currentPage,
        limit,
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch orders"), {
      cause: error,
    });
  }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const { data } = await axiosInstance.get<SingleOrderResponse>(
      `${API_ROUTES.GET_ORDER_BY_ID}/${orderId}`,
    );
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch order details"), {
      cause: error,
    });
  }
};

export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload,
): Promise<Order> => {
  try {
    const { data } = await axiosInstance.patch<SingleOrderResponse>(
      `${API_ROUTES.UPDATE_ORDER_STATUS}/${orderId}`,
      payload,
    );
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update order status"), {
      cause: error,
    });
  }
};

export const updateShippingAddress = async (
  orderId: string,
  shippingAddress: ShippingAddress,
): Promise<Order> => {
  try {
    const { data } = await axiosInstance.patch<SingleOrderResponse>(
      `${API_ROUTES.UPDATE_SHIPPING_ADDRESS}/${orderId}`,
      { shippingAddress },
    );
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update shipping address"), {
      cause: error,
    });
  }
};

export const cancelOrder = async (
  orderId: string,
  reason: string,
): Promise<Order> => {
  try {
    const { data } = await axiosInstance.post<SingleOrderResponse>(
      `${API_ROUTES.CANCEL_ORDER}/${orderId}`,
      { reason },
    );
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to cancel order"), {
      cause: error,
    });
  }
};
