import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

type ToastVariant = "success" | "warning" | "error";

const variantColor: Record<ToastVariant, string> = {
  success: "#15803d",
  warning: "#b45309",
  error: "#b91c1c",
};

const getToastStyle = (variant: ToastVariant) => ({
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderLeft: `4px solid ${variantColor[variant]}`,
  borderRadius: "8px",
  boxShadow: "0 16px 40px rgba(17,24,39,0.14)",
  color: "var(--color-text-primary)",
  padding: "12px 14px",
});

export const showToast = (
  message: string,
  variant: ToastVariant = "success",
) => {
  Toastify({
    text: message,
    duration: 3200,
    gravity: "top",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: getToastStyle(variant),
  }).showToast();
};

export const showActionToast = ({
  message,
  actionLabel,
  onAction,
  duration = 6000,
  variant = "warning",
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  duration?: number;
  variant?: ToastVariant;
}) => {
  const node = document.createElement("div");
  node.className = "flex items-center gap-4 text-sm font-medium";

  const text = document.createElement("span");
  text.textContent = message;
  text.className = "text-text-primary";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = actionLabel;
  button.className =
    "rounded-lg border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/15";

  node.append(text, button);

  const toast = Toastify({
    node,
    duration,
    gravity: "top",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: getToastStyle(variant),
  }).showToast();

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAction();
    toast.hideToast();
  });
};
