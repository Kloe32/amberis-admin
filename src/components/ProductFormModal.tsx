import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { FaPlus, FaSave, FaTimes, FaTrash, FaUpload } from "react-icons/fa";

export interface ProductCategoryOption {
  id: string;
  name: string;
  parentCategory?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  discountPercentage: number;
  stock: number;
  status: string;
  category?: string;
  tags: string[];
}

interface ProductForm {
  name: string;
  description: string;
  basePrice: string;
  discountPercentage: string;
  stock: string;
  files: File[];
  existingImages: string[];
  category: string;
  status: string;
  tags: string;
}

const appendImagePayload = (
  payload: FormData,
  existingImages: string[],
  removedImages: string[],
  files: File[],
) => {
  payload.append("retainedImageUrls", JSON.stringify(existingImages));
  payload.append("removedImageUrls", JSON.stringify(removedImages));
  console.log(payload.getAll("removedImageUrls"));
  files.forEach((file) => {
    payload.append("files", file);
  });
};

interface ProductFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  product?: ProductItem;
  categories: ProductCategoryOption[];
  onClose: () => void;
  onSubmit: (payload: FormData) => Promise<void>;
}

const createInitialForm = (product?: ProductItem): ProductForm => ({
  name: product?.name ?? "",
  description: product?.description ?? "",
  basePrice: product?.basePrice ? String(product.basePrice) : "",
  discountPercentage: Number.isFinite(product?.discountPercentage)
    ? String(product?.discountPercentage)
    : "0",
  stock: Number.isFinite(product?.stock) ? String(product?.stock) : "",
  files: [],
  existingImages: product?.images ?? [],
  category: product?.category ?? "",
  status: product?.status ?? "DRAFT",
  tags: product?.tags?.join(", ") ?? "",
});

const ProductFormModal = ({
  isOpen,
  mode,
  product,
  categories,
  onClose,
  onSubmit,
}: ProductFormModalProps) => {
  const [form, setForm] = useState<ProductForm>(createInitialForm(product));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingExistingImageRemoval, setPendingExistingImageRemoval] =
    useState("");

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentCategory),
    [categories],
  );

  if (!isOpen) return null;

  const isEditing = mode === "edit";
  const imagePreviewUrls = form.files.map((file) => URL.createObjectURL(file));

  const updateField = <Field extends keyof ProductForm>(
    field: Field,
    value: ProductForm[Field],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const addFiles = (files: File[]) => {
    setForm((current) => ({ ...current, files: [...current.files, ...files] }));
    setPendingExistingImageRemoval("");
    setError("");
  };

  const removeExistingImage = (imageUrl: string) => {
    if (pendingExistingImageRemoval !== imageUrl) {
      setPendingExistingImageRemoval(imageUrl);
      return;
    }

    setForm((current) => ({
      ...current,
      existingImages: current.existingImages.filter(
        (image) => image !== imageUrl,
      ),
    }));
    setPendingExistingImageRemoval("");
    setError("");
  };

  const removeNewImage = (index: number) => {
    setForm((current) => ({
      ...current,
      files: current.files.filter((_, fileIndex) => fileIndex !== index),
    }));
    setPendingExistingImageRemoval("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.category) {
      setError("Choose a category before saving this product.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    payload.append("basePrice", form.basePrice);
    payload.append("discountPercentage", form.discountPercentage);
    payload.append("stock", form.stock);
    payload.append("category", form.category);
    payload.append("status", form.status);
    payload.append("tags", form.tags);

    const originalImages = product?.images ?? [];
    const removedImages = originalImages.filter(
      (image) => !form.existingImages.includes(image),
    );

    appendImagePayload(payload, form.existingImages, removedImages, form.files);
    console.log(payload);
    setIsSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar/45 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close product form"
      />
      <section className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-dark">
              Product
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-primary">
              {isEditing ? "Edit Product" : "Add Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border text-text-secondary transition hover:bg-background hover:text-text-primary"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Product name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                placeholder="Hydrating Cleanser"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Images
              </span>
              <span className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-background p-3 transition hover:border-primary hover:bg-primary-light/40">
                <span className="flex min-h-20 flex-1 items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                    <FaUpload />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      Add product images
                    </span>
                    <span className="mt-1 block text-xs text-text-secondary">
                      Existing images stay until removed. JPG, PNG, or WEBP.
                    </span>
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    addFiles(Array.from(event.target.files ?? []))
                  }
                  className="sr-only"
                  required={!isEditing && form.existingImages.length === 0}
                />
              </span>
              {form.existingImages.length || form.files.length ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {form.existingImages.map((image) => (
                    <div key={image} className="relative">
                      <img
                        src={image}
                        alt=""
                        className={[
                          "h-16 w-full rounded-lg object-cover",
                          pendingExistingImageRemoval === image
                            ? "ring-2 ring-error"
                            : "",
                        ].join(" ")}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className={[
                          "absolute right-1 top-1 grid h-6 place-items-center rounded-md bg-error text-[10px] font-bold text-white transition-all",
                          pendingExistingImageRemoval === image
                            ? "w-16"
                            : "w-6",
                        ].join(" ")}
                        aria-label={
                          pendingExistingImageRemoval === image
                            ? "Confirm remove existing image"
                            : "Remove existing image"
                        }
                      >
                        {pendingExistingImageRemoval === image ? (
                          "Confirm"
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                      {pendingExistingImageRemoval === image ? (
                        <button
                          type="button"
                          onClick={() => setPendingExistingImageRemoval("")}
                          className="absolute bottom-1 right-1 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-text-secondary shadow-sm"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {form.files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="relative">
                      <img
                        src={imagePreviewUrls[index]}
                        alt=""
                        className="h-16 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-error text-[10px] text-white"
                        aria-label="Remove new image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Category
              </span>
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {parentCategories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    <option value={category.id}>{category.name}</option>
                    {categories
                      .filter((item) => item.parentCategory === category.id)
                      .map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Base price
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(event) =>
                  updateField("basePrice", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                placeholder="29.00"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Discount %
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.discountPercentage}
                onChange={(event) =>
                  updateField("discountPercentage", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                placeholder="0"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Stock
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => updateField("stock", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                placeholder="120"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              Tags
            </span>
            <input
              type="text"
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
              placeholder="hydrating, gentle"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium leading-6 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
              placeholder="Describe product benefits, size, and use case."
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-sm font-medium text-warning">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isEditing ? (
                <FaSave className="text-xs" />
              ) : (
                <FaPlus className="text-xs" />
              )}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProductFormModal;
