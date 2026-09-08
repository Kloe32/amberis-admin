import { useState } from "react";
import type { FormEvent } from "react";
import { FaPlus, FaSave, FaTimes, FaUpload } from "react-icons/fa";

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  parentCategory?: string;
}

interface CategoryForm {
  name: string;
  description: string;
  file: File | null;
  parentCategory: string;
  isSubCategory: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  category?: CategoryItem;
  parentCategories: CategoryItem[];
  initialParentCategory?: string;
  onClose: () => void;
  onSubmit: (payload: FormData) => Promise<void>;
}

const createInitialForm = (
  category?: CategoryItem,
  parentCategory = "",
): CategoryForm => ({
  name: category?.name ?? "",
  description: category?.description ?? "",
  file: null,
  parentCategory: category?.parentCategory ?? parentCategory,
  isSubCategory: Boolean(category?.parentCategory ?? parentCategory),
});

const CategoryFormModal = ({
  isOpen,
  mode,
  category,
  parentCategories,
  initialParentCategory = "",
  onClose,
  onSubmit,
}: CategoryFormModalProps) => {
  const [form, setForm] = useState<CategoryForm>(
    createInitialForm(category, initialParentCategory),
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isEditing = mode === "edit";

  const updateField = <Field extends keyof CategoryForm>(
    field: Field,
    value: CategoryForm[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const toggleSubCategory = (checked: boolean) => {
    if (isEditing) return;

    setForm((current) => ({
      ...current,
      isSubCategory: checked,
      parentCategory: checked
        ? current.parentCategory || parentCategories[0]?.id || ""
        : "",
    }));
    setError("");
  };

  const updateFile = (file: File | null) => {
    setForm((current) => ({ ...current, file }));
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.isSubCategory && !form.parentCategory) {
      setError("Choose a parent category before saving this subcategory.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    if (form.file) payload.append("file", form.file);
    if (form.isSubCategory) payload.append("parentCategory", form.parentCategory);

    setIsSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category.");
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
        aria-label="Close category form"
      />
      <section className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-dark">
              {form.isSubCategory ? "Subcategory" : "Category"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-primary">
              {isEditing
                ? `Edit ${form.isSubCategory ? "Subcategory" : "Category"}`
                : `Add ${form.isSubCategory ? "Subcategory" : "Category"}`}
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
          <div className="rounded-lg border border-border bg-background p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.isSubCategory}
                disabled={isEditing}
                onChange={(event) => toggleSubCategory(event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  Add as subcategory
                </span>
                <span className="mt-1 block text-xs leading-5 text-text-secondary">
                  {isEditing
                    ? "Category type is kept stable while editing."
                    : "Use this for items like cleanser, toner, or serum under a main category."}
                </span>
              </span>
            </label>
          </div>

          {form.isSubCategory ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Parent category
              </span>
              <select
                value={form.parentCategory}
                onChange={(event) =>
                  updateField("parentCategory", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                required
              >
                <option value="" disabled>
                  Choose a parent category
                </option>
                {parentCategories
                  .filter((parent) => parent.id !== category?.id)
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
                placeholder={form.isSubCategory ? "Cleanser" : "Skincare"}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Image
              </span>
              <span className="flex h-30 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-background p-3 transition hover:border-primary hover:bg-primary-light/40">
                {previewUrl || category?.imageUrl ? (
                  <img
                    src={previewUrl || category?.imageUrl}
                    alt=""
                    className="h-full w-24 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                    <FaUpload />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {form.file
                      ? form.file.name
                      : isEditing
                        ? "Replace image"
                        : "Upload image"}
                  </span>
                  <span className="mt-1 block text-xs text-text-secondary">
                    JPG, PNG, or WEBP
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    updateFile(event.target.files?.[0] ?? null)
                  }
                  className="sr-only"
                  required={!isEditing}
                />
              </span>
            </label>
          </div>

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
              placeholder="Briefly describe what products belong here."
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
              {isEditing ? <FaSave className="text-xs" /> : <FaPlus className="text-xs" />}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : form.isSubCategory
                    ? "Add subcategory"
                    : "Add category"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CategoryFormModal;
