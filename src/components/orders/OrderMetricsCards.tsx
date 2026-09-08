import React from "react";
import {
  FaDollarSign,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaShippingFast,
  FaBan,
  FaSpinner,
} from "react-icons/fa";
import type { OrderSummaryMetrics } from "../../types/order";

interface OrderMetricsCardsProps {
  metrics: OrderSummaryMetrics | null;
  loading?: boolean;
}

const safeNumber = (val: unknown): number => {
  const num = typeof val === "number" ? val : Number(val);
  return isNaN(num) ? 0 : num;
};

export const OrderMetricsCards: React.FC<OrderMetricsCardsProps> = ({
  metrics,
  loading = false,
}) => {
  const formatCurrency = (val?: unknown) => {
    const num = safeNumber(val);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalRevenue),
      icon: FaDollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      subtitle: "Gross order sales",
    },
    {
      title: "Total Orders",
      value: safeNumber(metrics?.totalOrders),
      icon: FaShoppingBag,
      color: "text-primary",
      bg: "bg-primary-light border-primary/20",
      subtitle: "Lifetime placed orders",
    },
    {
      title: "Paid & Ready",
      value: safeNumber(metrics?.paidOrders),
      icon: FaCheckCircle,
      color: "text-emerald-700",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      subtitle: "Awaiting fulfillment",
    },
    {
      title: "In Transit / Shipped",
      value: safeNumber(metrics?.shippedOrders),
      icon: FaShippingFast,
      color: "text-purple-600",
      bg: "bg-purple-500/10 border-purple-500/20",
      subtitle: "Active dispatches",
    },
    {
      title: "Pending Payment",
      value: safeNumber(metrics?.pendingOrders),
      icon: FaClock,
      color: "text-amber-600",
      bg: "bg-amber-500/10 border-amber-500/20",
      subtitle: "Unpaid / checkout draft",
    },
    {
      title: "Cancelled",
      value: safeNumber(metrics?.cancelledOrders),
      icon: FaBan,
      color: "text-rose-600",
      bg: "bg-rose-500/10 border-rose-500/20",
      subtitle: "Refunded & voided",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {card.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.bg}`}
              >
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold tracking-tight text-text-primary">
                {loading ? (
                  <FaSpinner className="inline h-5 w-5 animate-spin text-text-secondary" />
                ) : (
                  card.value
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderMetricsCards;
