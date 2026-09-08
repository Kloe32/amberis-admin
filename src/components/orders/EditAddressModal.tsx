import React, { useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa";
import { updateShippingAddress } from "../../services/order.service";
import { showToast } from "../../helper/toast";
import type { ShippingAddress } from "../../types/order";

interface EditAddressModalProps {
  orderId: string;
  orderNumber: string;
  currentAddress: ShippingAddress;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAddressModal: React.FC<EditAddressModalProps> = ({
  orderId,
  orderNumber,
  currentAddress,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: currentAddress?.fullName || "",
    phone: currentAddress?.phone || "",
    street: currentAddress?.street || "",
    city: currentAddress?.city || "",
    zipCode: currentAddress?.zipCode || currentAddress?.postalCode || "",
    state: currentAddress?.state || "",
    country: currentAddress?.country || "Singapore",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateShippingAddress(orderId, formData);
      showToast(`Shipping address updated for ${orderNumber}`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update shipping address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
              <FaMapMarkerAlt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Edit Shipping Address</h3>
              <p className="text-xs text-text-secondary">
                Order: <span className="font-semibold text-text-primary">{orderNumber}</span>
              </p>
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

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            <FaExclamationTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Recipient Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Contact Phone <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Street Address <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 10 Orchard Road, #04-12"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                City <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Postal / Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Country <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
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
              {isSubmitting ? "Saving..." : "Update Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAddressModal;
