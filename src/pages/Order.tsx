import React, { useCallback, useEffect, useState } from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaTruck,
  FaMapMarkerAlt,
  FaBan,
  FaEllipsisV,
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  getAllOrders,
  getOrderSummary,
} from "../services/order.service";
import OrderMetricsCards from "../components/orders/OrderMetricsCards";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../components/orders/OrderStatusBadge";
import UpdateStatusModal from "../components/orders/UpdateStatusModal";
import EditAddressModal from "../components/orders/EditAddressModal";
import CancelOrderModal from "../components/orders/CancelOrderModal";
import OrderDetailModal from "../components/orders/OrderDetailModal";
import type {
  Order,
  OrderSummaryMetrics,
  OrdersPagination,
} from "../types/order";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Paid & Ready", value: "PAID" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const safeNumber = (val: unknown): number => {
  const num = typeof val === "number" ? val : Number(val);
  return isNaN(num) ? 0 : num;
};

export const OrderPage: React.FC = () => {
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<OrderSummaryMetrics | null>(null);
  const [pagination, setPagination] = useState<OrdersPagination>({
    totalOrders: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Loading & Filter States
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Action Menu State
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(
    null,
  );

  // Modal States
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedOrderForStatus, setSelectedOrderForStatus] =
    useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedOrderForAddress, setSelectedOrderForAddress] =
    useState<Order | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch summary KPIs
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const data = await getOrderSummary({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [fromDate, toDate]);

  // Fetch orders list
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await getAllOrders({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: activeTab || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        search: debouncedSearch.trim() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy,
        sortOrder,
      });
      setOrders(res.orders);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    activeTab,
    paymentStatusFilter,
    debouncedSearch,
    fromDate,
    toDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Close active row menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".action-menu-container")) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRefreshAll = () => {
    fetchMetrics();
    fetchOrders();
  };

  const resetFilters = () => {
    setActiveTab("");
    setPaymentStatusFilter("");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const formatCurrency = (val?: unknown) => {
    const num = safeNumber(val);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Order Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Monitor incoming customer purchases, manage fulfillment, track couriers,
            and review transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshAll}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-primary shadow-sm hover:bg-background transition"
          >
            <FaSyncAlt
              className={`h-3.5 w-3.5 ${
                loadingOrders || loadingMetrics ? "animate-spin text-primary" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <OrderMetricsCards metrics={metrics} loading={loadingMetrics} />

      {/* Filters & Orders Table Card */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        {/* Status Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-border bg-background/40 px-4 pt-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const pendingCount = safeNumber(metrics?.pendingOrders);
            const paidCount = safeNumber(metrics?.paidOrders);
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>{tab.label}</span>
                {tab.value === "PENDING" && pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-800">
                    {pendingCount}
                  </span>
                ) : null}
                {tab.value === "PAID" && paidCount > 0 ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-800">
                    {paidCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters Bar */}
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5 border-b border-border bg-surface">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search by Order #, Customer name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* From Date Filter */}
          <div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* To Date Filter & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {(searchQuery || fromDate || toDate || paymentStatusFilter || activeTab) && (
              <button
                type="button"
                onClick={resetFilters}
                className="shrink-0 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/60 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <th className="px-5 py-3.5">Order Details</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Items Summary</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5">Carrier / Tracking</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loadingOrders ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-secondary">
                    <FaSyncAlt className="inline h-6 w-6 animate-spin text-primary mb-2" />
                    <p className="font-medium text-xs">Loading orders data...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border text-text-secondary/60 mb-3">
                        <FaBoxOpen className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        No orders found
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Try adjusting your search query, status filters, or date range.
                      </p>
                      {(searchQuery || fromDate || toDate || paymentStatusFilter || activeTab) && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-3 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const itemsCount =
                    order.items?.reduce(
                      (acc, curr) => acc + safeNumber(curr.quantity),
                      0,
                    ) || 0;
                  const firstItem = order.items?.[0];
                  const customerName =
                    order.user?.profile?.firstName
                      ? `${order.user.profile.firstName} ${order.user.profile.lastName || ""}`
                      : order.shippingAddress?.fullName || "Guest Customer";

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-background/40 transition group"
                    >
                      {/* Order Details */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary">
                          {customerName}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">
                          {order.user?.email || order.shippingAddress?.phone || "—"}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="text-text-primary font-medium">
                          {firstItem?.name || "Product Item"}{" "}
                          {order.items?.length > 1 && (
                            <span className="text-xs text-text-secondary font-normal">
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">
                          {itemsCount} {itemsCount === 1 ? "unit" : "units"} total
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-text-primary">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-[10px] text-text-secondary">
                          Subtotal: {formatCurrency(order.subtotal)}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <PaymentStatusBadge
                            status={order.paymentInfo?.status || "PENDING"}
                            size="sm"
                          />
                          <div className="text-[11px] text-text-secondary flex items-center gap-1">
                            <span>{order.paymentInfo?.method || "STRIPE"}</span>
                            {order.paymentInfo?.receiptUrl && (
                              <a
                                href={order.paymentInfo.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="View Receipt"
                                className="text-primary hover:text-primary-hover"
                              >
                                <FaExternalLinkAlt className="h-2.5 w-2.5 inline" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>

                      {/* Courier / Tracking */}
                      <td className="px-5 py-4">
                        {order.carrier || order.trackingNumber ? (
                          <div>
                            <span className="font-semibold text-purple-700">
                              {order.carrier || "Courier"}
                            </span>
                            <div className="font-mono text-[11px] text-text-secondary truncate max-w-[130px]">
                              {order.trackingNumber || "—"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-secondary/60 text-[11px]">
                            Not dispatched
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right relative action-menu-container">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailOrderId(order._id);
                              setIsDetailOpen(true);
                            }}
                            title="View Full Details"
                            className="rounded-lg border border-border bg-surface p-2 text-text-secondary hover:bg-background hover:text-text-primary transition shadow-sm"
                          >
                            <FaEye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForStatus(order);
                              setIsStatusModalOpen(true);
                            }}
                            title="Update Fulfillment Status"
                            className="rounded-lg border border-border bg-surface p-2 text-text-secondary hover:bg-background hover:text-primary transition shadow-sm"
                          >
                            <FaTruck className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Dropdown Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(
                                  activeActionMenuId === order._id ? null : order._id,
                                );
                              }}
                              className="rounded-lg border border-border bg-surface p-2 text-text-secondary hover:bg-background hover:text-text-primary transition shadow-sm"
                            >
                              <FaEllipsisV className="h-3.5 w-3.5" />
                            </button>

                            {activeActionMenuId === order._id && (
                              <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-border bg-surface py-1 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setDetailOrderId(order._id);
                                    setIsDetailOpen(true);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-text-primary hover:bg-background transition"
                                >
                                  <FaEye className="h-3.5 w-3.5 text-text-secondary" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setSelectedOrderForStatus(order);
                                    setIsStatusModalOpen(true);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-text-primary hover:bg-background transition"
                                >
                                  <FaTruck className="h-3.5 w-3.5 text-primary" />
                                  <span>Update Status</span>
                                </button>

                                {["PENDING", "PROCESSING", "PAID"].includes(
                                  order.status,
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setSelectedOrderForAddress(order);
                                      setIsAddressModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-text-primary hover:bg-background transition"
                                  >
                                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Edit Address</span>
                                  </button>
                                )}

                                {order.status !== "CANCELLED" &&
                                  order.status !== "DELIVERED" && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        setSelectedOrderForCancel(order);
                                        setIsCancelModalOpen(true);
                                      }}
                                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 transition"
                                    >
                                      <FaBan className="h-3.5 w-3.5 text-rose-600" />
                                      <span>Cancel Order</span>
                                    </button>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {(() => {
          const currentPage = safeNumber(pagination?.currentPage) || 1;
          const limit = safeNumber(pagination?.limit) || 10;
          const totalOrders = safeNumber(pagination?.totalOrders);
          const totalPages = safeNumber(pagination?.totalPages) || 1;
          const fromCount = orders.length > 0 ? (currentPage - 1) * limit + 1 : 0;
          const toCount = Math.min(currentPage * limit, totalOrders);

          return (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border px-6 py-4 bg-background/30 text-xs">
              <div className="text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text-primary">
                  {fromCount}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-text-primary">
                  {toCount}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-text-primary">
                  {totalOrders}
                </span>{" "}
                orders
              </div>

              <div className="flex items-center gap-3">
                {/* Limit Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-text-secondary">Rows:</span>
                  <select
                    value={limit}
                    onChange={(e) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        currentPage: 1,
                      }))
                    }
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: Math.max(1, currentPage - 1),
                      }))
                    }
                    className="rounded-lg border border-border bg-surface p-1.5 text-text-secondary hover:bg-background hover:text-text-primary disabled:opacity-40 transition shadow-sm"
                  >
                    <FaChevronLeft className="h-3 w-3" />
                  </button>

                  <span className="px-2 font-medium text-text-primary">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: Math.min(
                          totalPages,
                          currentPage + 1,
                        ),
                      }))
                    }
                    className="rounded-lg border border-border bg-surface p-1.5 text-text-secondary hover:bg-background hover:text-text-primary disabled:opacity-40 transition shadow-sm"
                  >
                    <FaChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modals Integration */}
      {/* 1. Detail Slide-over / Modal */}
      <OrderDetailModal
        orderId={detailOrderId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailOrderId(null);
        }}
        onOpenUpdateStatus={(order) => {
          setIsDetailOpen(false);
          setSelectedOrderForStatus(order);
          setIsStatusModalOpen(true);
        }}
        onOpenEditAddress={(order) => {
          setIsDetailOpen(false);
          setSelectedOrderForAddress(order);
          setIsAddressModalOpen(true);
        }}
        onOpenCancelOrder={(order) => {
          setIsDetailOpen(false);
          setSelectedOrderForCancel(order);
          setIsCancelModalOpen(true);
        }}
      />

      {/* 2. Update Status Modal */}
      {selectedOrderForStatus && (
        <UpdateStatusModal
          orderId={selectedOrderForStatus._id}
          orderNumber={selectedOrderForStatus.orderNumber}
          currentStatus={selectedOrderForStatus.status}
          currentCarrier={selectedOrderForStatus.carrier}
          currentTrackingNumber={selectedOrderForStatus.trackingNumber}
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedOrderForStatus(null);
          }}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* 3. Edit Address Modal */}
      {selectedOrderForAddress && (
        <EditAddressModal
          orderId={selectedOrderForAddress._id}
          orderNumber={selectedOrderForAddress.orderNumber}
          currentAddress={selectedOrderForAddress.shippingAddress}
          isOpen={isAddressModalOpen}
          onClose={() => {
            setIsAddressModalOpen(false);
            setSelectedOrderForAddress(null);
          }}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* 4. Cancel Order Modal */}
      {selectedOrderForCancel && (
        <CancelOrderModal
          orderId={selectedOrderForCancel._id}
          orderNumber={selectedOrderForCancel.orderNumber}
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedOrderForCancel(null);
          }}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  );
};

export default OrderPage;
