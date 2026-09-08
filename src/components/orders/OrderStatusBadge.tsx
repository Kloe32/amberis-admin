import React from "react";
import type { OrderStatus, PaymentStatus } from "../../types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Pending",
  },
  PROCESSING: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Processing",
  },
  PAID: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Paid & Ready",
  },
  SHIPPED: {
    bg: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "In Transit / Shipped",
  },
  DELIVERED: {
    bg: "bg-gray-500/10 border-gray-500/20",
    text: "text-gray-800",
    dot: "bg-gray-600",
    label: "Delivered",
  },
  CANCELLED: {
    bg: "bg-rose-500/10 border-rose-500/20",
    text: "text-rose-700",
    dot: "bg-rose-500",
    label: "Cancelled",
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const normalized = status?.toUpperCase() || "PENDING";
  const config = STATUS_CONFIG[normalized] || {
    bg: "bg-gray-500/10 border-gray-500/20",
    text: "text-gray-700",
    dot: "bg-gray-500",
    label: status,
  };

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const PaymentStatusBadge: React.FC<{
  status: PaymentStatus | string;
  size?: "sm" | "md";
}> = ({ status, size = "md" }) => {
  const normalized = status?.toUpperCase() || "PENDING";
  const map: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    PAID: {
      bg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      text: "text-emerald-700",
      label: "PAID",
    },
    PENDING: {
      bg: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      text: "text-amber-700",
      label: "PENDING",
    },
    FAILED: {
      bg: "bg-rose-500/10 text-rose-700 border-rose-500/20",
      text: "text-rose-700",
      label: "FAILED",
    },
    REFUNDED: {
      bg: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      text: "text-purple-700",
      label: "REFUNDED",
    },
  };

  const config = map[normalized] || {
    bg: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    text: "text-gray-700",
    label: status,
  };

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded border ${config.bg} ${sizeClasses} uppercase tracking-wider`}
    >
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
