declare module "toastify-js" {
  interface ToastifyOptions {
    text?: string;
    node?: HTMLElement;
    duration?: number;
    gravity?: "top" | "bottom";
    position?: "left" | "center" | "right";
    close?: boolean;
    stopOnFocus?: boolean;
    className?: string;
    style?: Partial<CSSStyleDeclaration>;
    callback?: () => void;
    onClick?: () => void;
  }

  interface ToastifyInstance {
    showToast: () => ToastifyInstance;
    hideToast: () => void;
  }

  const Toastify: (options: ToastifyOptions) => ToastifyInstance;

  export default Toastify;
}
