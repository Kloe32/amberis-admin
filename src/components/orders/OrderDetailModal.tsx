import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaReceipt,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaExternalLinkAlt,
  FaBoxOpen,
  FaHistory,
  FaEdit,
  FaBan,
  FaSpinner,
} from "react-icons/fa";
import { getOrderById } from "../../services/order.service";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import type { Order } from "../../types/order";

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateStatus: (order: Order) => void;
  onOpenEditAddress: (order: Order) => void;
  onOpenCancelOrder: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onOpenUpdateStatus,
  onOpenEditAddress,
  onOpenCancelOrder,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetails(orderId);
    } else {
      setOrder(null);
      setError(null);
    }
  }, [isOpen, orderId]);

  const fetchDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val || 0);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <FaReceipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-text-primary">
                  {order?.orderNumber || "Order Details"}
                </h3>
                {order && <OrderStatusBadge status={order.status} />}
                {order?.paymentInfo?.status && (
                  <PaymentStatusBadge status={order.paymentInfo.status} />
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Placed on {formatDate(order?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenUpdateStatus(order)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-background transition shadow-sm"
                >
                  <FaTruck className="h-3 w-3 text-primary" />
                  <span>Update Status</span>
                </button>
                {["PENDING", "PROCESSING", "PAID"].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => onOpenEditAddress(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-background transition shadow-sm"
                  >
                    <FaEdit className="h-3 w-3 text-blue-600" />
                    <span>Edit Address</span>
                  </button>
                )}
                {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                  <button
                    type="button"
                    onClick={() => onOpenCancelOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm"
                  >
                    <FaBan className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary transition ml-1"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
              <FaSpinner className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm">Loading order details...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
              {error}
            </div>
          )}

          {!loading && order && (
            <>
              {/* Top Customer & Shipping & Payment Info Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Customer Info */}
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <FaUser className="h-3.5 w-3.5 text-primary" />
                    <span>Customer Details</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    {order.user?.profile?.firstName
                      ? `${order.user.profile.firstName} ${order.user.profile.lastName || ""}`
                      : order.shippingAddress?.fullName || "Guest Customer"}
                  </div>
                  <div className="text-xs text-text-secondary space-y-0.5">
                    <p>{order.user?.email || "No email available"}</p>
                    <p>{order.user?.phone || order.shippingAddress?.phone || "No phone"}</p>
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-primary" />
                    <span>Shipping Destination</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    {order.shippingAddress?.fullName}
                  </div>
                  <div className="text-xs text-text-secondary space-y-0.5">
                    <p>{order.shippingAddress?.street}</p>
                    <p>
                      {order.shippingAddress?.city}
                      {order.shippingAddress?.zipCode
                        ? ` ${order.shippingAddress.zipCode}`
                        : ""}
                      {order.shippingAddress?.state
                        ? `, ${order.shippingAddress.state}`
                        : ""}
                    </p>
                    <p className="font-medium text-text-primary">
                      {order.shippingAddress?.country}
                    </p>
                  </div>
                </div>

                {/* Payment & Carrier Status */}
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <FaCreditCard className="h-3.5 w-3.5 text-primary" />
                    <span>Payment & Tracking</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Method:</span>
                    <span className="font-semibold text-text-primary">
                      {order.paymentInfo?.method || "STRIPE"}
                    </span>
                  </div>
                  {order.paymentInfo?.transactionId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Transaction:</span>
                      <span className="font-mono text-[11px] text-text-primary truncate max-w-[120px]">
                        {order.paymentInfo.transactionId}
                      </span>
                    </div>
                  )}
                  {order.paymentInfo?.receiptUrl && (
                    <div className="pt-1">
                      <a
                        href={order.paymentInfo.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>View Stripe Receipt</span>
                        <FaExternalLinkAlt className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {(order.carrier || order.trackingNumber) && (
                    <div className="pt-1 border-t border-border mt-1">
                      <p className="text-xs font-semibold text-purple-700">
                        {order.carrier || "Courier"}:{" "}
                        <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-background/60 px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider">
                    <FaBoxOpen className="h-4 w-4 text-primary" />
                    <span>Items Ordered ({order.items?.length || 0})</span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {order.items?.map((item, idx) => {
                    const productObj =
                      typeof item.product === "object" ? item.product : null;
                    const imageSrc =
                      item.image ||
                      productObj?.images?.[0] ||
                      productObj?.imageUrl ||
                      "";

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-surface hover:bg-background/20 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center shrink-0">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FaBoxOpen className="h-5 w-5 text-text-secondary/40" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                              <span>Unit Price: {formatCurrency(item.price)}</span>
                              {item.selectedColor && (
                                <span>• Color: {item.selectedColor}</span>
                              )}
                              {item.selectedSize && (
                                <span>• Size: {item.selectedSize}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-text-secondary">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown Footer */}
                <div className="bg-background/40 p-4 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>Shipping Fee</span>
                      <span>{formatCurrency(order.shippingCost)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>Tax / GST</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
                    <span>Total Amount</span>
                    <span className="text-primary text-base">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Notes / Cancellation Reason */}
              {(order.notes || order.cancelReason) && (
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Remarks & Notes
                  </h4>
                  {order.notes && (
                    <p className="text-xs text-text-primary">
                      <span className="font-semibold">Admin Note:</span> {order.notes}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p className="text-xs text-rose-700">
                      <span className="font-semibold">Cancellation Reason:</span>{" "}
                      {order.cancelReason}
                    </p>
                  )}
                </div>
              )}

              {/* Order Lifecycle Timeline */}
              {order.timeline && order.timeline.length > 0 && (
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <FaHistory className="h-3.5 w-3.5 text-primary" />
                    <span>Order History & Timeline</span>
                  </div>
                  <div className="space-y-3 pl-2">
                    {order.timeline.map((evt, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-start gap-3 border-l-2 border-primary/30 pl-4 pb-2"
                      >
                        <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary">
                              {evt.status}
                            </span>
                            <span className="text-[11px] text-text-secondary">
                              {formatDate(evt.timestamp)}
                            </span>
                          </div>
                          {evt.note && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              {evt.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3.5 bg-background/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface border border-border px-5 py-2 text-sm font-semibold text-text-primary hover:bg-background transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
