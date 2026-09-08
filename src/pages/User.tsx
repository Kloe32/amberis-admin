import { useEffect, useMemo, useState } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaEdit,
  FaEllipsisV,
  FaEnvelope,
  FaPaperPlane,
  FaPlus,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUserTie,
} from "react-icons/fa";
import AddEmployeeForm from "../components/AddEmployeeForm";
import type { AddAdminEmployeePayload } from "../components/AddEmployeeForm";
import { getUsers } from "../services/user.service";
import type { AdminRole } from "../types/auth.type";
import { showToast } from "../helper/toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  admin_role: AdminRole;
  joinedAt: string;
}

interface RawEmployee {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
  role?: "ADMIN" | string;
  status?: Employee["status"] | string;
  admin_role?: AdminRole;
  createdAt?: string;
  updatedAt?: string;
}

const roleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PRODUCT_MANAGER: "Product Manager",
  CUSTOMER_SUPPORT: "Customer Support",
};

const statusStyles: Record<Employee["status"], string> = {
  ACTIVE: "bg-success/10 text-success",
  INACTIVE: "bg-warning/10 text-warning",
  BANNED: "bg-error/10 text-error",
};

const normalizeDate = (value?: string) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
};

const getEmployeeName = (employee: RawEmployee) => {
  const firstName = employee.profile?.firstName ?? employee.firstName ?? "";
  const lastName = employee.profile?.lastName ?? employee.lastName ?? "";
  const profileName = `${firstName} ${lastName}`.trim();

  return profileName || employee.name?.trim() || "Unnamed employee";
};

const normalizeEmployeesResponse = (response: unknown): Employee[] => {
  const payload = response as {
    data?: unknown;
    users?: unknown;
    admins?: unknown;
  };

  const users =
    (Array.isArray(response) && response) ||
    (Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload.users) && payload.users) ||
    (Array.isArray(payload.admins) && payload.admins) ||
    [];

  return users.map((user, index) => {
    const employee = user as RawEmployee;

    return {
      id: `EMP-${String(index + 1).padStart(3, "0")}`,
      name: getEmployeeName(employee),
      email: employee.email ?? "No email available",
      role: "ADMIN",
      status:
        employee.status === "INACTIVE" || employee.status === "BANNED"
          ? employee.status
          : "ACTIVE",
      admin_role: employee.admin_role ?? "CUSTOMER_SUPPORT",
      joinedAt: normalizeDate(employee.createdAt ?? employee.updatedAt),
    };
  });
};

const User = () => {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMenu, setActionMenu] = useState<{
    employeeId: string;
    top: number;
    left: number;
  } | null>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getUsers();
      setEmployees(normalizeEmployeesResponse(response));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch employees.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchEmployees(), 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.email,
        roleLabels[employee.admin_role],
        employee.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [employees, search]);

  const employeeCounts = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((employee) => employee.status === "ACTIVE")
        .length,
      inactive: employees.filter((employee) => employee.status === "INACTIVE")
        .length,
      banned: employees.filter((employee) => employee.status === "BANNED")
        .length,
    }),
    [employees],
  );

  const handleEmployeeCreated = (employee: AddAdminEmployeePayload) => {
    const employeeName =
      `${employee.firstName} ${employee.lastName}`.trim() ||
      "Unnamed employee";

    setEmployees((current) => [
      {
        id: `LOCAL-${String(current.length + 1).padStart(3, "0")}`,
        name: employeeName,
        email: employee.email,
        role: employee.role,
        admin_role: employee.admin_role,
        status: "INACTIVE",
        joinedAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    setIsAddingEmployee(false);
  };

  const updateEmployeeStatus = (
    employeeId: string,
    status: Employee["status"],
  ) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId ? { ...employee, status } : employee,
      ),
    );
    setActionMenu(null);
    showToast(`Employee status changed to ${status.toLowerCase()}.`, "success");
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees((current) =>
      current.filter((employee) => employee.id !== employeeId),
    );
    setActionMenu(null);
    showToast("Employee removed from the current list.", "error");
  };

  const copyEmployeeEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      showToast("Employee email copied.", "success");
    } catch {
      showToast("Copy failed. Select the email manually.", "warning");
    } finally {
      setActionMenu(null);
    }
  };

  const markActionPending = (action: string) => {
    setActionMenu(null);
    showToast(
      `${action} is ready in the menu. Connect the API action next.`,
      "warning",
    );
  };

  const selectedEmployee = actionMenu
    ? employees.find((employee) => employee.id === actionMenu.employeeId)
    : null;

  const toggleActionMenu = (employeeId: string, button: HTMLButtonElement) => {
    if (actionMenu?.employeeId === employeeId) {
      setActionMenu(null);
      return;
    }

    const menuWidth = 224;
    const menuHeight = 336;
    const gap = 8;
    const rect = button.getBoundingClientRect();
    const opensUp = rect.bottom + menuHeight + gap > window.innerHeight;

    setActionMenu({
      employeeId,
      left: Math.max(12, rect.right - menuWidth),
      top: opensUp
        ? Math.max(12, rect.top - menuHeight - gap)
        : rect.bottom + gap,
    });
  };

  if (isAddingEmployee) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col justify-between gap-4 rounded-lg bg-primary px-5 py-5 shadow-lg lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-light">
              Employees
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-normal text-white">
              Add Admin User
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-light">
              Create an employee admin account and send a one-time password by
              email so they can set their own password securely.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-primary">
            <FaShieldAlt className="text-secondary" />
            Admin accounts only
          </div>
        </header>

        <AddEmployeeForm
          onCancel={() => setIsAddingEmployee(false)}
          onCreated={handleEmployeeCreated}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 rounded-lg bg-primary px-5 py-5 shadow-lg lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-light">
            Employees
          </p>
          <h1 className="m-0 text-3xl font-semibold tracking-normal text-white">
            Employee Directory
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-light">
            View admin employees, review their access level, and invite new
            admins when your team grows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingEmployee(true)}
          className="inline-flex w-fit items-center justify-center gap-3 rounded-lg bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary-light"
        >
          <FaPlus className="text-xs" />
          Add employee
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total employees", employeeCounts.total],
          ["Active admins", employeeCounts.active],
          ["Inactive invites", employeeCounts.inactive],
          ["Banned users", employeeCounts.banned],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-surface px-5 py-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="m-0 flex items-center gap-3 text-xl font-semibold tracking-normal text-text-primary">
              <FaUserTie className="text-primary" />
              Admin Employees
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Fetched from your admin employee endpoint.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void fetchEmployees()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-bold text-text-secondary transition hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-65"
            >
              <FaRedo className="text-xs" />
              Refresh
            </button>
            <label className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light lg:w-80">
              <FaSearch className="text-text-secondary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                placeholder="Search employees"
              />
            </label>
          </div>
        </div>

        {error ? (
          <div className="border-b border-error/20 bg-error/5 px-5 py-4 text-sm font-medium text-error">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Access</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm font-medium text-text-secondary"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border last:border-b-0 hover:bg-background"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-light text-sm font-bold uppercase text-primary">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {employee.name}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm text-text-secondary">
                            <FaEnvelope className="text-xs" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-badge px-3 py-1 text-sm font-semibold text-secondary-dark">
                        <FaUserTie className="text-xs" />
                        {roleLabels[employee.admin_role]}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                          statusStyles[employee.status],
                        ].join(" ")}
                      >
                        {employee.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-text-secondary">
                      {employee.joinedAt}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-text-primary">
                      {employee.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={(event) =>
                            toggleActionMenu(employee.id, event.currentTarget)
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-background hover:text-text-primary"
                          aria-label={`Open actions for ${employee.name}`}
                        >
                          <FaEllipsisV className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {actionMenu && selectedEmployee ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 cursor-default bg-transparent"
              onClick={() => setActionMenu(null)}
              aria-label="Close employee actions"
            />
            <div
              className="fixed z-40 w-56 overflow-hidden rounded-lg border border-border bg-surface py-2 text-sm shadow-xl"
              style={{ top: actionMenu.top, left: actionMenu.left }}
            >
              <button
                type="button"
                onClick={() => markActionPending("Edit employee")}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <FaEdit className="text-secondary" />
                Edit details
              </button>
              <button
                type="button"
                onClick={() => markActionPending("Resend OTP email")}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <FaPaperPlane className="text-secondary" />
                Resend OTP email
              </button>
              <button
                type="button"
                onClick={() => void copyEmployeeEmail(selectedEmployee.email)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <FaEnvelope className="text-secondary" />
                Copy email
              </button>

              <div className="my-2 border-t border-border" />

              <button
                type="button"
                onClick={() =>
                  updateEmployeeStatus(selectedEmployee.id, "ACTIVE")
                }
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-success transition hover:bg-success/5"
              >
                <FaCheckCircle />
                Mark active
              </button>
              <button
                type="button"
                onClick={() =>
                  updateEmployeeStatus(selectedEmployee.id, "INACTIVE")
                }
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-warning transition hover:bg-warning/5"
              >
                <FaShieldAlt />
                Mark inactive
              </button>
              <button
                type="button"
                onClick={() =>
                  updateEmployeeStatus(selectedEmployee.id, "BANNED")
                }
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-error transition hover:bg-error/5"
              >
                <FaBan />
                Ban user
              </button>

              <div className="my-2 border-t border-border" />

              <button
                type="button"
                onClick={() => deleteEmployee(selectedEmployee.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-error transition hover:bg-error/5"
              >
                <FaTrash />
                Delete user
              </button>
            </div>
          </>
        ) : null}

        {!isLoading && filteredEmployees.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-text-primary">
              No employees found
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Try a different search term or add a new admin employee.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default User;
