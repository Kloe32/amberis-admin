import React, { useState } from "react";
import { FaTimes, FaShippingFast, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { updateOrderStatus } from "../../services/order.service";
import { showToast } from "../../helper/toast";
import type { OrderStatus, UpdateOrderStatusPayload } from "../../types/order";

interface UpdateStatusModalProps {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  currentCarrier?: string;
  currentTrackingNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; desc: string }[] = [
  { value: "PROCESSING", label: "Processing", desc: "Order is being prepared and packed" },
  { value: "PAID", label: "Paid & Ready", desc: "Payment received, ready for dispatch" },
  { value: "SHIPPED", label: "Shipped (In Transit)", desc: "Handed over to carrier with tracking" },
  { value: "DELIVERED", label: "Delivered", desc: "Customer received the package" },
  { value: "CANCELLED", label: "Cancelled", desc: "Void order and restore product inventory" },
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  orderId,
  orderNumber,
  currentStatus,
  currentCarrier = "",
  currentTrackingNumber = "",
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus);
  const [carrier, setCarrier] = useState(currentCarrier);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);
  const [notes, setNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (newStatus === "SHIPPED" && (!carrier.trim() || !trackingNumber.trim())) {
      setError("Carrier name and tracking number are required when marking as Shipped.");
      setIsSubmitting(false);
      return;
    }

    if (newStatus === "CANCELLED" && !cancelReason.trim()) {
      setError("Please provide a reason for cancelling this order.");
      setIsSubmitting(false);
      return;
    }

    const payload: UpdateOrderStatusPayload = {
      status: newStatus,
      notes: notes.trim() || undefined,
      carrier: newStatus === "SHIPPED" ? carrier.trim() : undefined,
      trackingNumber: newStatus === "SHIPPED" ? trackingNumber.trim() : undefined,
      cancelReason: newStatus === "CANCELLED" ? cancelReason.trim() : undefined,
    };

    try {
      await updateOrderStatus(orderId, payload);
      showToast(`Order ${orderNumber} updated to ${newStatus}`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Update Order Status</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Order: <span className="font-semibold text-text-primary">{orderNumber}</span> (Current:{" "}
              <span className="font-semibold text-primary">{currentStatus}</span>)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary transition"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            <FaExclamationTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Select New Fulfillment Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = newStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewStatus(opt.value)}
                    className={`flex items-start justify-between rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary-light/50 ring-1 ring-primary"
                        : "border-border hover:border-gray-300 bg-surface"
                    }`}
                  >
                    <div>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected ? "text-primary" : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <FaCheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shipped Tracking Fields */}
          {newStatus === "SHIPPED" && (
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                <FaShippingFast className="h-4 w-4 text-purple-700" />
                <span>Carrier & Tracking Details</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Courier / Carrier <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHL Express, NinjaVan"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Tracking Number <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHL-9848123992"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full font-mono rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cancel Reason */}
          {newStatus === "CANCELLED" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
              <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
                Reason for Cancellation <span className="text-error">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Explain why this order is being cancelled (e.g. Customer requested refund, Out of stock)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-rose-700">
                ⚠️ Marking as cancelled will automatically restore reserved product stock in inventory.
              </p>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Internal Admin Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add fulfillment notes, dispatcher comments, or customer remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 transition"
            >
              {isSubmitting ? "Updating..." : "Save Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
