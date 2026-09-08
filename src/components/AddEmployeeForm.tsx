import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import {
  FaEnvelope,
  FaKey,
  FaPaperPlane,
  FaRedo,
  FaUserPlus,
} from "react-icons/fa";
import { addUser } from "../services/user.service";
import type { AdminRole } from "../types/auth.type";

type EmployeeRole = "ADMIN";

export interface AddAdminEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: EmployeeRole;
  admin_role: AdminRole;
}

interface AddEmployeeFormProps {
  onCancel: () => void;
  onCreated: (employee: AddAdminEmployeePayload) => void;
}

const adminRoleOptions: Array<{
  value: AdminRole;
  label: string;
  description: string;
}> = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full access to users, settings, products, and orders.",
  },
  {
    value: "PRODUCT_MANAGER",
    label: "Product Manager",
    description: "Manage product catalog, categories, and product operations.",
  },
  {
    value: "CUSTOMER_SUPPORT",
    label: "Customer Support",
    description: "Handle customer orders and support workflows.",
  },
];

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const AddEmployeeForm = ({ onCancel, onCreated }: AddEmployeeFormProps) => {
  const initialOtp = useMemo(() => createOtp(), []);
  const [form, setForm] = useState<AddAdminEmployeePayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: initialOtp,
    role: "ADMIN",
    admin_role: "PRODUCT_MANAGER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const updateField = <Field extends keyof AddAdminEmployeePayload>(
    field: Field,
    value: AddAdminEmployeePayload[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus(null);
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: createOtp(),
      role: "ADMIN",
      admin_role: "PRODUCT_MANAGER",
    });
    setStatus(null);
  };

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    event,
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await addUser(form);
      onCreated(form);
      setStatus({
        type: "success",
        message:
          "Admin employee created. The OTP email will be sent by the backend.",
      });
      resetForm();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to add employee.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
            <FaUserPlus />
          </div>
          <div>
            <h2 className="m-0 text-xl font-semibold tracking-normal text-text-primary">
              Employee Details
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Create an admin employee and send a one-time password by email.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              First name
            </span>
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
              placeholder="Jane"
              autoComplete="given-name"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              Last name
            </span>
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              Email address
            </span>
            <span className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light">
              <FaEnvelope className="text-text-secondary" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                placeholder="employee@amberis.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              Role
            </span>
            <select
              value={form.role}
              onChange={(event) =>
                updateField("role", event.target.value as EmployeeRole)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-light"
            >
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text-primary">
              One-time password
            </span>
            <span className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light">
              <FaKey className="text-text-secondary" />
              <input
                type="text"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className="w-full bg-transparent text-sm font-semibold tracking-[0.18em] text-text-primary outline-none placeholder:text-text-secondary"
                placeholder="000000"
                inputMode="numeric"
                required
              />
              <button
                type="button"
                onClick={() => updateField("password", createOtp())}
                className="rounded-md p-1 text-text-secondary transition hover:bg-primary-light hover:text-primary"
                aria-label="Generate new OTP"
              >
                <FaRedo />
              </button>
            </span>
          </label>
        </div>

        <div className="mt-7">
          <span className="mb-3 block text-sm font-semibold text-text-primary">
            Admin role
          </span>
          <div className="grid gap-3 lg:grid-cols-3">
            {adminRoleOptions.map((option) => {
              const isSelected = form.admin_role === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "cursor-pointer rounded-lg border p-4 transition",
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-background hover:border-secondary hover:bg-secondary-light",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="admin_role"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => updateField("admin_role", option.value)}
                    className="sr-only"
                  />
                  <span
                    className={[
                      "block text-sm font-semibold",
                      isSelected ? "text-primary" : "text-text-primary",
                    ].join(" ")}
                  >
                    {option.label}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-text-secondary">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {status ? (
          <div
            className={[
              "mt-6 rounded-lg border px-4 py-3 text-sm font-medium",
              status.type === "success"
                ? "border-success/20 bg-success/5 text-success"
                : "border-error/20 bg-error/5 text-error",
            ].join(" ")}
          >
            {status.message}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-65"
          >
            <FaPaperPlane className="text-xs" />
            {isSubmitting ? "Preparing invite..." : "Add admin and send OTP"}
          </button>
        </div>
      </form>

      <aside className="rounded-lg border border-border bg-surface p-6 shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-dark">
          Payload
        </p>
        <h2 className="m-0 text-xl font-semibold tracking-normal text-text-primary">
          Data model
        </h2>
        <div className="mt-5 space-y-4 text-sm">
          {[
            ["firstName", form.firstName || "Jane"],
            ["lastName", form.lastName || "Doe"],
            ["email", form.email || "employee@amberis.com"],
            ["password", form.password],
            ["role", form.role],
            ["admin_role", form.admin_role],
          ].map(([key, value]) => (
            <div key={key} className="border-b border-border pb-3">
              <p className="font-semibold text-text-primary">{key}</p>
              <p className="mt-1 wrap-break-words text-text-secondary">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-badge p-4 text-sm leading-6 text-secondary-dark">
          The OTP is treated as the temporary password. Once the backend is
          connected, the invite email should send the employee to set a new
          password.
        </div>
      </aside>
    </div>
  );
};

export default AddEmployeeForm;
