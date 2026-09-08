import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBan,
  FaBoxOpen,
  FaCheckCircle,
  FaEdit,
  FaEllipsisV,
  FaFileAlt,
  FaImage,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import ProductFormModal from "../components/ProductFormModal";
import type {
  ProductCategoryOption,
  ProductItem,
} from "../components/ProductFormModal";
import {
  addProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
  updateProductStatus,
} from "../services/product.service";
import { showActionToast, showToast } from "../helper/toast";

interface ActionMenuState {
  productId: string;
  top: number;
  left: number;
}

type ProductModalState =
  | { mode: "create" }
  | { mode: "edit"; product: ProductItem }
  | null;

interface RawCategory {
  _id?: string;
  id?: string;
  name?: string;
  parentCategory?: string | { _id?: string; id?: string };
  subCategories?: RawCategory[];
  children?: RawCategory[];
}

interface RawProduct {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string | string[];
  imageUrl?: string | string[];
  file?: string;
  images?: string | string[];
  price?: number | string;
  basePrice?: number | string;
  discountPercentage?: number | string;
  stock?: number | string;
  quantity?: number | string;
  isActive?: boolean;
  status?: string;
  category?: string | RawCategory;
  categoryId?: string;
  subCategory?: string | RawCategory;
  subCategoryId?: string;
  tags?: string[];
}

const productStatusStyles: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  DRAFT: "bg-warning/10 text-warning",
  INACTIVE: "bg-error/10 text-error",
};

const getEntityId = (entity?: string | RawCategory) => {
  if (!entity) return undefined;
  if (typeof entity === "string") return entity;

  return entity._id ?? entity.id;
};

const getCategoryId = (category: RawCategory) =>
  category._id ?? category.id ?? category.name ?? crypto.randomUUID();

const getParentCategoryId = (category: RawCategory) => {
  const parent = category.parentCategory;

  if (!parent) return undefined;
  if (typeof parent === "string") return parent;

  return parent._id ?? parent.id;
};

const normalizeCategoriesResponse = (
  response: unknown,
): ProductCategoryOption[] => {
  const payload = response as {
    data?: unknown;
    categories?: unknown;
    result?: unknown;
  };

  const source =
    (Array.isArray(response) && response) ||
    (Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload.categories) && payload.categories) ||
    (Array.isArray(payload.result) && payload.result) ||
    [];

  return source.flatMap((item) => {
    const category = item as RawCategory;
    const categoryId = getCategoryId(category);
    const children = category.subCategories ?? category.children ?? [];

    return [
      {
        id: categoryId,
        name: category.name?.trim() || "Unnamed category",
        parentCategory: getParentCategoryId(category),
      },
      ...children.map((child) => ({
        id: getCategoryId(child),
        name: child.name?.trim() || "Unnamed category",
        parentCategory: categoryId,
      })),
    ];
  });
};

const parseImageSource = (source?: string | string[]): string[] => {
  if (!source) return [];
  if (Array.isArray(source)) return source.filter(Boolean);

  const value = source.trim();
  if (!value) return [];

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [value];
    } catch {
      return [value];
    }
  }

  return [value];
};

const normalizeProductImages = (product: RawProduct) => {
  const imageSources = [
    ...parseImageSource(product.images),
    ...parseImageSource(product.imageUrl),
    ...parseImageSource(product.image),
    ...parseImageSource(product.file),
  ];

  return Array.from(new Set(imageSources));
};

const normalizeProductsResponse = (response: unknown): ProductItem[] => {
  const payload = response as {
    data?: unknown;
    products?: unknown;
    result?: unknown;
  };

  const source =
    (Array.isArray(response) && response) ||
    (Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload.products) && payload.products) ||
    (Array.isArray(payload.result) && payload.result) ||
    [];

  return source.map((item) => {
    const product = item as RawProduct;
    const images = normalizeProductImages(product);

    return {
      id: product._id ?? product.id ?? product.name ?? crypto.randomUUID(),
      name: product.name?.trim() || product.title?.trim() || "Unnamed product",
      description:
        product.description?.trim() || "No product description available.",
      images,
      basePrice: Number(product.basePrice ?? product.price ?? 0),
      discountPercentage: Number(product.discountPercentage ?? 0),
      stock: Number(product.stock ?? product.quantity ?? 0),
      status:
        product.status?.toUpperCase() ??
        (product.isActive === false ? "INACTIVE" : "ACTIVE"),
      category: product.categoryId ?? getEntityId(product.category),
      tags: product.tags ?? [],
    };
  });
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const DELETE_UNDO_SECONDS = 6;

const Products = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [productModal, setProductModal] = useState<ProductModalState>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTimerRef = useRef<number | null>(null);

  const fetchProductData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(normalizeProductsResponse(productsResponse));
      setCategories(normalizeCategoriesResponse(categoriesResponse));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchProductData(), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(
    () => () => {
      if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    },
    [],
  );

  const categoryNameById = useMemo(
    () =>
      categories.reduce<Record<string, string>>((lookup, category) => {
        lookup[category.id] = category.name;
        return lookup;
      }, {}),
    [categories],
  );

  const getCategoryLabel = useCallback(
    (categoryId?: string) => {
      if (!categoryId) return "No category";

      const category = categories.find((item) => item.id === categoryId);
      if (!category) return "Unknown category";

      const parentName = category.parentCategory
        ? categoryNameById[category.parentCategory]
        : "";

      return parentName ? `${parentName} / ${category.name}` : category.name;
    },
    [categories, categoryNameById],
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => showInactive || product.status !== "INACTIVE")
      .filter((product) =>
        statusFilter === "ALL" ? true : product.status === statusFilter,
      )
      .filter((product) =>
        categoryFilter === "ALL" ? true : product.category === categoryFilter,
      )
      .filter((product) => {
        if (!query) return true;

        return [
          product.name,
          product.description,
          getCategoryLabel(product.category),
          product.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [
    categoryFilter,
    products,
    search,
    showInactive,
    statusFilter,
    getCategoryLabel,
  ]);

  const productCounts = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === "ACTIVE").length,
      draft: products.filter((product) => product.status === "DRAFT").length,
      inactive: products.filter((product) => product.status === "INACTIVE")
        .length,
    }),
    [products],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = visibleProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const selectedActionProduct = actionMenu
    ? products.find((product) => product.id === actionMenu.productId)
    : null;

  const openProductModal = () => setProductModal({ mode: "create" });
  const openEditModal = (product: ProductItem) => {
    setActionMenu(null);
    setProductModal({ mode: "edit", product });
  };
  const closeModal = () => setProductModal(null);

  const toggleActionMenu = (productId: string, button: HTMLButtonElement) => {
    if (actionMenu?.productId === productId) {
      setActionMenu(null);
      return;
    }

    const menuWidth = 224;
    const menuHeight = 264;
    const gap = 8;
    const rect = button.getBoundingClientRect();
    const opensUp = rect.bottom + menuHeight + gap > window.innerHeight;

    setActionMenu({
      productId,
      left: Math.max(12, rect.right - menuWidth),
      top: opensUp
        ? Math.max(12, rect.top - menuHeight - gap)
        : rect.bottom + gap,
    });
  };

  const handleProductCreated = async (payload: FormData) => {
    await addProduct(payload);
    await fetchProductData();
    showToast("Product added.", "success");
    closeModal();
  };

  const handleProductUpdated = async (payload: FormData) => {
    if (productModal?.mode !== "edit") return;

    await updateProduct(productModal.product.id, payload);
    await fetchProductData();
    showToast(`${productModal.product.name} updated.`, "success");
    closeModal();
  };

  const setProductStatus = async (product: ProductItem, nextStatus: string) => {
    try {
      await updateProductStatus(product.id, nextStatus);
      await fetchProductData();
      showToast(`${product.name} marked ${nextStatus.toLowerCase()}.`, "success");
      setActionMenu(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product.",
      );
      setActionMenu(null);
    }
  };

  const clearDeleteTimers = () => {
    if (deleteTimerRef.current) {
      window.clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

  };

  const runDeleteProduct = async (target: ProductItem) => {
    try {
      await deleteProduct(target.id);
      await fetchProductData();
      showToast(`${target.name} deleted.`, "success");
    } catch (err) {
      setProducts((current) =>
        current.some((product) => product.id === target.id)
          ? current
          : [target, ...current],
      );
      setError(
        err instanceof Error ? err.message : "Failed to delete product.",
      );
    } finally {
      clearDeleteTimers();
    }
  };

  const restoreDeletedProduct = (restoredProduct: ProductItem) => {
    clearDeleteTimers();
    setProducts((current) =>
      current.some((product) => product.id === restoredProduct.id)
        ? current
        : [restoredProduct, ...current],
    );
    showToast(`${restoredProduct.name} restored.`, "success");
  };

  const confirmDeleteProduct = () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    clearDeleteTimers();

    const target = deleteTarget;
    setProducts((current) =>
      current.filter((product) => product.id !== target.id),
    );
    showActionToast({
      message: `${target.name} will be deleted in ${DELETE_UNDO_SECONDS}s.`,
      actionLabel: "Undo",
      duration: DELETE_UNDO_SECONDS * 1000,
      variant: "warning",
      onAction: () => restoreDeletedProduct(target),
    });
    setDeleteTarget(null);
    setIsDeleting(false);

    deleteTimerRef.current = window.setTimeout(() => {
      void runDeleteProduct(target);
    }, DELETE_UNDO_SECONDS * 1000);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg bg-primary px-5 py-5 shadow-lg lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-light">
            Products
          </p>
          <h1 className="m-0 text-3xl font-semibold tracking-normal text-white">
            Product List
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-light">
            Manage catalog items, category assignment, pricing, and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={openProductModal}
          className="inline-flex w-fit items-center justify-center gap-3 rounded-lg bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary-light"
        >
          <FaPlus className="text-xs" />
          Add product
        </button>
      </header>

      <section className="flex flex-wrap gap-2">
        {[
          ["Products", productCounts.total],
          ["Active", productCounts.active],
          ["Draft", productCounts.draft],
          ["Inactive", productCounts.inactive],
        ].map(([label, value]) => (
          <div
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary"
          >
            <span className="text-text-secondary">
              {label}
            </span>
            <span className="text-sm font-bold text-text-primary">
              {value}
            </span>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-4 py-3 xl:flex-row xl:items-center">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-lg font-semibold tracking-normal text-text-primary">
              <FaBoxOpen className="text-primary" />
              Products
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Products are fetched from your catalog endpoint.
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => {
                  setShowInactive(event.target.checked);
                  setCurrentPage(1);
                }}
                className="h-3.5 w-3.5 accent-primary"
              />
              Show inactive
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-text-secondary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
            >
              <option value="ALL">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryLabel(category.id)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-text-secondary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light sm:w-64">
              <FaSearch className="text-xs text-text-secondary" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-xs font-medium text-text-primary outline-none placeholder:text-text-secondary"
                placeholder="Search products"
              />
            </label>
          </div>
        </div>

        {error ? (
          <div className="border-b border-error/20 bg-error/5 px-5 py-4 text-sm font-medium text-error">
            {error}
          </div>
        ) : null}

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-10 text-center text-sm font-medium text-text-secondary">
              Loading products...
            </div>
          ) : null}

          {!isLoading && visibleProducts.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-primary-light text-primary">
                <FaBoxOpen />
              </div>
              <p className="mt-4 font-semibold text-text-primary">
                No products found
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Add your first product to start building the product catalog.
              </p>
            </div>
          ) : null}

          {!isLoading &&
            paginatedProducts.map((product) => (
              <article key={product.id} className="p-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                  <div className="flex min-w-0 gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-primary-light">
                        {product.images[0] ? (
                          <img
                            src={
                              product.images[0]
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-primary">
                            <FaImage />
                          </div>
                        )}
                      </div>
                      {product.images.length > 1 ? (
                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] font-bold text-text-primary shadow-sm">
                          +{product.images.length - 1}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-lg font-semibold tracking-normal text-text-primary">
                          {product.name}
                        </h3>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                            productStatusStyles[product.status] ??
                              "bg-background text-text-secondary",
                          ].join(" ")}
                        >
                          <FaCheckCircle />
                          {product.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold text-text-secondary">
                        <span className="rounded-full bg-background px-2.5 py-0.5">
                          {getCategoryLabel(product.category)}
                        </span>
                        <span className="rounded-full bg-badge px-2.5 py-0.5 text-secondary-dark">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.discountPercentage > 0 ? (
                          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-success">
                            {product.discountPercentage}% off
                          </span>
                        ) : null}
                        <span className="rounded-full bg-background px-2.5 py-0.5">
                          Stock: {product.stock}
                        </span>
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-background px-2.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) =>
                      toggleActionMenu(product.id, event.currentTarget)
                    }
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-background hover:text-text-primary"
                    aria-label={`Open actions for ${product.name}`}
                  >
                    <FaEllipsisV className="text-sm" />
                  </button>
                </div>
              </article>
            ))}
        </div>

        {!isLoading && visibleProducts.length > 0 ? (
          <div className="flex flex-col justify-between gap-3 border-t border-border px-5 py-4 text-sm text-text-secondary sm:flex-row sm:items-center">
            <p className="font-medium">
              Showing {(safeCurrentPage - 1) * pageSize + 1}-
              {Math.min(safeCurrentPage * pageSize, visibleProducts.length)} of{" "}
              {visibleProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="rounded-lg border border-border bg-surface px-4 py-2.5 font-bold text-text-secondary transition hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded-lg bg-background px-4 py-2.5 font-bold text-text-primary">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="rounded-lg border border-border bg-surface px-4 py-2.5 font-bold text-text-secondary transition hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {actionMenu && selectedActionProduct ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            onClick={() => setActionMenu(null)}
            aria-label="Close product actions"
          />
          <div
            className="fixed z-40 w-56 overflow-hidden rounded-lg border border-border bg-surface py-2 text-sm shadow-xl"
            style={{ top: actionMenu.top, left: actionMenu.left }}
          >
            <button
              type="button"
              onClick={() => openEditModal(selectedActionProduct)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaEdit className="text-secondary" />
              Edit details
            </button>
            <button
              type="button"
              onClick={() =>
                void setProductStatus(selectedActionProduct, "ACTIVE")
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaCheckCircle className="text-success" />
              Activate
            </button>
            <button
              type="button"
              onClick={() =>
                void setProductStatus(selectedActionProduct, "INACTIVE")
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaBan className="text-warning" />
              Deactivate
            </button>
            <button
              type="button"
              onClick={() =>
                void setProductStatus(selectedActionProduct, "DRAFT")
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaFileAlt className="text-secondary" />
              Make draft
            </button>

            <div className="my-2 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setDeleteTarget(selectedActionProduct);
                setActionMenu(null);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-error transition hover:bg-error/5"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar/45 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setDeleteTarget(null)}
            aria-label="Cancel delete"
          />
          <section className="relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-error/10 text-error">
              <FaTrash />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-normal text-text-primary">
              Delete Product
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This will remove{" "}
              <span className="font-semibold text-text-primary">
                {deleteTarget.name}
              </span>
              . You will have {DELETE_UNDO_SECONDS} seconds to undo before it is
              permanently deleted.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-error px-5 py-3 text-sm font-bold text-white transition hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-65"
              >
                <FaTrash className="text-xs" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <ProductFormModal
        key={
          productModal?.mode === "edit"
            ? `edit-${productModal.product.id}`
            : `create-${productModal ? "open" : "closed"}`
        }
        isOpen={productModal !== null}
        mode={productModal?.mode ?? "create"}
        product={
          productModal?.mode === "edit" ? productModal.product : undefined
        }
        categories={categories}
        onClose={closeModal}
        onSubmit={
          productModal?.mode === "edit"
            ? handleProductUpdated
            : handleProductCreated
        }
      />
    </div>
  );
};

export default Products;
