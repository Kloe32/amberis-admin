import { useEffect, useMemo, useState } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaChevronRight,
  FaEdit,
  FaEllipsisV,
  FaImage,
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import CategoryFormModal from "../components/CategoryFormModal";
import type { CategoryItem } from "../components/CategoryFormModal";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory as deleteCategoryRequest,
} from "../services/product.service";
import { showToast } from "../helper/toast";

interface ActionMenuState {
  categoryId: string;
  top: number;
  left: number;
}

type CategoryModalState =
  | { mode: "create"; parentCategory: string }
  | { mode: "edit"; category: CategoryItem }
  | null;

interface RawCategory {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  file?: string;
  isActive?: boolean;
  status?: string;
  parentCategory?: string | { _id?: string; id?: string };
  subCategories?: RawCategory[];
  children?: RawCategory[];
}

const getCategoryId = (category: RawCategory) =>
  category._id ?? category.id ?? category.name ?? crypto.randomUUID();

const getParentCategoryId = (category: RawCategory) => {
  const parent = category.parentCategory;

  if (!parent) return undefined;
  if (typeof parent === "string") return parent;

  return parent._id ?? parent.id;
};

const normalizeCategory = (
  category: RawCategory,
  parentCategory?: string,
): CategoryItem => ({
  id: getCategoryId(category),
  name: category.name?.trim() || "Unnamed category",
  description: category.description?.trim() || "No description available.",
  imageUrl: category.imageUrl ?? category.image ?? category.file ?? "",
  isActive:
    typeof category.isActive === "boolean"
      ? category.isActive
      : category.status?.toLowerCase() !== "inactive",
  parentCategory: parentCategory ?? getParentCategoryId(category),
});

const normalizeCategoriesResponse = (response: unknown): CategoryItem[] => {
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
      normalizeCategory(category),
      ...children.map((child) => normalizeCategory(child, categoryId)),
    ];
  });
};

const Category = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getCategories();
      setCategories(normalizeCategoriesResponse(response));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchCategories(), 0);

    return () => window.clearTimeout(timer);
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentCategory),
    [categories],
  );

  const visibleParentCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return parentCategories
      .filter((category) => showInactive || category.isActive)
      .filter((category) => {
        if (!query) return true;

        const subCategories = categories.filter(
          (subCategory) => subCategory.parentCategory === category.id,
        );

        return [category, ...subCategories].some((item) =>
          [item.name, item.description].join(" ").toLowerCase().includes(query),
        );
      });
  }, [categories, parentCategories, search, showInactive]);

  const categoryCounts = useMemo(
    () => ({
      categories: parentCategories.length,
      subCategories: categories.filter((category) => category.parentCategory)
        .length,
      active: categories.filter((category) => category.isActive).length,
      inactive: categories.filter((category) => !category.isActive).length,
    }),
    [categories, parentCategories.length],
  );

  const getSubCategories = (parentId: string) =>
    categories.filter((category) => category.parentCategory === parentId);

  const openCategoryModal = () =>
    setCategoryModal({ mode: "create", parentCategory: "" });
  const openSubCategoryModal = (parentId: string) =>
    setCategoryModal({ mode: "create", parentCategory: parentId });
  const openEditModal = (category: CategoryItem) => {
    setActionMenu(null);
    setCategoryModal({ mode: "edit", category });
  };
  const closeModal = () => setCategoryModal(null);

  const selectedActionCategory = actionMenu
    ? categories.find((category) => category.id === actionMenu.categoryId)
    : null;

  const toggleActionMenu = (categoryId: string, button: HTMLButtonElement) => {
    if (actionMenu?.categoryId === categoryId) {
      setActionMenu(null);
      return;
    }

    const menuWidth = 224;
    const menuHeight = 232;
    const gap = 8;
    const rect = button.getBoundingClientRect();
    const opensUp = rect.bottom + menuHeight + gap > window.innerHeight;

    setActionMenu({
      categoryId,
      left: Math.max(12, rect.right - menuWidth),
      top: opensUp
        ? Math.max(12, rect.top - menuHeight - gap)
        : rect.bottom + gap,
    });
  };

  const toggleCategoryStatus = async (target: CategoryItem) => {
    const nextStatus = target.isActive ? "inactive" : "active";
    const affectedCategories = target.parentCategory
      ? [target]
      : [
          target,
          ...categories.filter(
            (category) => category.parentCategory === target.id,
          ),
        ];

    try {
      await Promise.all(
        affectedCategories.map((category) => {
          const payload = new FormData();
          payload.append("status", nextStatus);
          return updateCategory(category.id, payload);
        }),
      );

      await fetchCategories();
      showToast(
        target.parentCategory
          ? `Subcategory marked ${nextStatus}.`
          : `Category and its subcategories marked ${nextStatus}.`,
        "success",
      );
      setActionMenu(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category.",
      );
      setActionMenu(null);
    }
  };

  const requestDeleteCategory = (category: CategoryItem) => {
    const hasSubCategories = categories.some(
      (item) => item.parentCategory === category.id,
    );

    if (!category.parentCategory && hasSubCategories) {
      setError(
        "Delete the subcategories under this category before deleting the category.",
      );
      setActionMenu(null);
      return;
    }

    setDeleteTarget(category);
    setActionMenu(null);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await deleteCategoryRequest(deleteTarget.id);
      await fetchCategories();
      showToast(`${deleteTarget.name} deleted.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryCreated = async (payload: FormData) => {
    const isSubCategory = payload.has("parentCategory");

    await addCategory(payload);
    await fetchCategories();
    showToast(
      isSubCategory
        ? "Subcategory added to the selected category."
        : "Category added. You can now add subcategories under it.",
      "success",
    );
    closeModal();
  };

  const handleCategoryUpdated = async (payload: FormData) => {
    if (categoryModal?.mode !== "edit") return;

    await updateCategory(categoryModal.category.id, payload);
    await fetchCategories();
    showToast(`${categoryModal.category.name} updated.`, "success");
    closeModal();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg bg-primary px-5 py-5 shadow-lg lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-light">
            Products
          </p>
          <h1 className="m-0 text-3xl font-semibold tracking-normal text-white">
            Category Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-light">
            Organize product categories and subcategories for catalog browsing.
          </p>
        </div>

        <button
          type="button"
          onClick={openCategoryModal}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary-light"
        >
          <FaPlus className="text-xs" />
          Add category
        </button>
      </header>

      <section className="flex flex-wrap gap-2">
        {[
          ["Categories", categoryCounts.categories],
          ["Subcategories", categoryCounts.subCategories],
          ["Active", categoryCounts.active],
          ["Inactive", categoryCounts.inactive],
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
              <FaLayerGroup className="text-primary" />
              Categories
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Main categories are grouped with their subcategories.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-text-secondary">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              Show inactive
            </label>
            <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light sm:w-64">
              <FaSearch className="text-xs text-text-secondary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-xs font-medium text-text-primary outline-none placeholder:text-text-secondary"
                placeholder="Search categories"
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
              Loading categories...
            </div>
          ) : null}

          {!isLoading && visibleParentCategories.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-primary-light text-primary">
                <MdCategory />
              </div>
              <p className="mt-4 font-semibold text-text-primary">
                No categories found
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Add your first category to start organizing the product catalog.
              </p>
            </div>
          ) : null}

          {!isLoading &&
            visibleParentCategories.map((category) => {
              const subCategories = getSubCategories(category.id).filter(
                (subCategory) => showInactive || subCategory.isActive,
              );

              return (
                <article key={category.id} className="p-5">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div className="flex min-w-0 gap-4">
                      <div className="h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-primary-light">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-primary">
                            <FaImage />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="m-0 text-lg font-semibold tracking-normal text-text-primary">
                            {category.name}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                            <MdCategory />
                            Category
                          </span>
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                              category.isActive
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning",
                            ].join(" ")}
                          >
                            <FaCheckCircle />
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-fit items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSubCategoryModal(category.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary"
                      >
                        <FaPlus className="text-xs" />
                        Subcategory
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          toggleActionMenu(category.id, event.currentTarget)
                        }
                        className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-background hover:text-text-primary"
                        aria-label={`Open actions for ${category.name}`}
                      >
                        <FaEllipsisV className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {subCategories.length > 0 ? (
                      subCategories.map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className={[
                            "flex min-w-0 gap-3 rounded-lg border border-border bg-background p-3",
                            subCategory.isActive ? "" : "opacity-70",
                          ].join(" ")}
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                            {subCategory.imageUrl ? (
                              <img
                                src={subCategory.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-text-secondary">
                                <FaImage />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="flex min-w-0 items-center gap-2 truncate font-semibold text-text-primary">
                                <FaChevronRight className="shrink-0 text-xs text-secondary" />
                                {subCategory.name}
                              </p>
                              <button
                                type="button"
                                onClick={(event) =>
                                  toggleActionMenu(
                                    subCategory.id,
                                    event.currentTarget,
                                  )
                                }
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-secondary transition hover:bg-surface hover:text-text-primary"
                                aria-label={`Open actions for ${subCategory.name}`}
                              >
                                <FaEllipsisV className="text-xs" />
                              </button>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">
                              {subCategory.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm font-medium text-text-secondary">
                        No subcategories yet.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      {actionMenu && selectedActionCategory ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            onClick={() => setActionMenu(null)}
            aria-label="Close category actions"
          />
          <div
            className="fixed z-40 w-56 overflow-hidden rounded-lg border border-border bg-surface py-2 text-sm shadow-xl"
            style={{ top: actionMenu.top, left: actionMenu.left }}
          >
            <button
              type="button"
              onClick={() => openEditModal(selectedActionCategory)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaEdit className="text-secondary" />
              Edit details
            </button>
            <button
              type="button"
              onClick={() => void toggleCategoryStatus(selectedActionCategory)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              <FaBan className="text-warning" />
              {selectedActionCategory.isActive
                ? "Make inactive"
                : "Make active"}
            </button>

            {!selectedActionCategory.parentCategory ? (
              <button
                type="button"
                onClick={() => {
                  openSubCategoryModal(selectedActionCategory.id);
                  setActionMenu(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <FaPlus className="text-secondary" />
                Add subcategory
              </button>
            ) : null}

            <div className="my-2 border-t border-border" />

            <button
              type="button"
              onClick={() => requestDeleteCategory(selectedActionCategory)}
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
              Delete {deleteTarget.parentCategory ? "Subcategory" : "Category"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This will permanently delete{" "}
              <span className="font-semibold text-text-primary">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
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
                onClick={() => void confirmDeleteCategory()}
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

      <CategoryFormModal
        key={
          categoryModal?.mode === "edit"
            ? `edit-${categoryModal.category.id}`
            : `create-${categoryModal?.parentCategory ?? "closed"}`
        }
        isOpen={categoryModal !== null}
        mode={categoryModal?.mode ?? "create"}
        category={
          categoryModal?.mode === "edit" ? categoryModal.category : undefined
        }
        parentCategories={parentCategories}
        initialParentCategory={
          categoryModal?.mode === "create" ? categoryModal.parentCategory : ""
        }
        onClose={closeModal}
        onSubmit={
          categoryModal?.mode === "edit"
            ? handleCategoryUpdated
            : handleCategoryCreated
        }
      />
    </div>
  );
};

export default Category;
