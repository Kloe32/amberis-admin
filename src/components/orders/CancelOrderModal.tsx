import React, { useState } from "react";
import { FaTimes, FaBan, FaExclamationTriangle } from "react-icons/fa";
import { cancelOrder } from "../../services/order.service";
import { showToast } from "../../helper/toast";

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for cancelling this order.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await cancelOrder(orderId, reason.trim());
      showToast(`Order ${orderNumber} has been cancelled`, "warning");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <FaBan className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Cancel Order</h3>
              <p className="text-xs text-text-secondary">{orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary transition"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            <FaExclamationTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs text-rose-800 space-y-1">
            <p className="font-semibold">⚠️ Important Inventory Notice:</p>
            <p>
              Cancelling this order will automatically restore reserved stock for all
              items in this order back into inventory.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Cancellation Reason <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Customer requested cancellation, Fraud check failed, Out of stock..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background transition"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
