import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AdminRole } from "../types/auth.type";
import { BiSolidDashboard } from "react-icons/bi";
import {
  FaUsers,
  FaBoxes,
  FaUser,
  FaBoxOpen,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { TbReceipt } from "react-icons/tb";
import { IoMdSettings } from "react-icons/io";
import type { FC } from "react";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  allowedRoles: AdminRole[];
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["SUPER_ADMIN", "PRODUCT_MANAGER", "CUSTOMER_SUPPORT"],
    icon: <BiSolidDashboard />,
  },
  {
    label: "Manage Users",
    path: "/users",
    allowedRoles: ["SUPER_ADMIN"],
    icon: <FaUsers />,
  },
  {
    label: "Products",
    path: "",
    allowedRoles: ["SUPER_ADMIN", "PRODUCT_MANAGER"],
    icon: <FaBoxes />,
    children: [
      {
        label: "Product List",
        path: "/products/list",
        allowedRoles: ["SUPER_ADMIN", "PRODUCT_MANAGER"],
        icon: <FaBoxOpen />,
      },
      {
        label: "Categories",
        path: "/products/categories",
        allowedRoles: ["SUPER_ADMIN", "PRODUCT_MANAGER"],
        icon: <MdCategory />,
      },
    ],
  },
  {
    label: "Orders",
    path: "/orders",
    allowedRoles: ["SUPER_ADMIN", "CUSTOMER_SUPPORT"],
    icon: <TbReceipt />,
  },
  {
    label: "Settings",
    path: "/settings",
    allowedRoles: ["SUPER_ADMIN"],
    icon: <IoMdSettings />,
  },
  {
    label: "Profile",
    path: "/profile",
    allowedRoles: ["SUPER_ADMIN", "PRODUCT_MANAGER", "CUSTOMER_SUPPORT"],
    icon: <FaUser />,
  },
];

const Sidebar: FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const canAccess = (roles: AdminRole[]) =>
    admin ? roles.includes(admin.admin_role) : false;

  const filteredNav = navItems
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => canAccess(child.allowedRoles)),
    }))
    .filter((item) => canAccess(item.allowedRoles));

  const formatRole = (role?: AdminRole) =>
    role ? role.replace("_", " ") : "Guest";

  return (
    <aside
      className={[
        "flex min-h-screen shrink-0 flex-col border-r border-white/10 bg-sidebar text-white shadow-[8px_0_30px_rgba(15,23,42,0.12)] transition-[width] duration-200",
        isCollapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div
          className={[
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between gap-3",
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-lg font-bold text-white">
            A
          </div>
          {!isCollapsed ? (
          <div className="min-w-0">
            <p className="text-base font-bold tracking-[0.18em] text-white">
              AMBERIS
            </p>
            <p className="text-xs font-medium text-white/55">Admin Portal</p>
          </div>
          ) : null}
          </div>
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <FaChevronLeft />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-3 py-4">
        <div
          className={[
            "rounded-lg border border-white/10 bg-white/5",
            isCollapsed ? "p-2" : "p-3",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary-light text-sm font-bold uppercase text-secondary-dark">
              {admin?.name?.charAt(0) ?? "A"}
            </div>
            {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {admin?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-white/55">
                {admin?.email ?? "Signed in"}
              </p>
            </div>
            ) : null}
          </div>
          {!isCollapsed ? (
          <span className="mt-3 inline-flex rounded-full bg-badge px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-dark">
            {formatRole(admin?.admin_role)}
          </span>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
        {!isCollapsed ? (
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          Navigation
        </p>
        ) : null}

        {filteredNav.map((item) => (
          <div key={item.label} className="space-y-1">
            {item.children?.length ? (
              <div className={isCollapsed ? "space-y-1" : "rounded-lg bg-white/5 p-1"}>
                {!isCollapsed ? (
                <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-white">
                  <span className="flex items-center gap-3">
                    <span className="text-lg text-secondary">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                </div>
                ) : null}

                <div className="space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      title={isCollapsed ? child.label : undefined}
                      className={({ isActive }) =>
                        [
                          "flex items-center rounded-md text-sm font-medium transition",
                          isCollapsed
                            ? "h-11 justify-center px-0"
                            : "gap-3 px-3 py-2",
                          isActive
                            ? "bg-sidebar-active text-white shadow-sm"
                            : "text-white/60 hover:bg-white/10 hover:text-white",
                        ].join(" ")
                      }
                    >
                      <span className={isCollapsed ? "text-lg" : "ml-6 text-base"}>
                        {child.icon}
                      </span>
                      {!isCollapsed ? child.label : null}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    "group flex items-center rounded-lg text-sm font-semibold transition",
                    isCollapsed
                      ? "h-11 justify-center px-0"
                      : "gap-3 px-4 py-3",
                    isActive || location.pathname === item.path
                      ? "bg-sidebar-active text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                {!isCollapsed ? <span>{item.label}</span> : null}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="grid h-11 w-full place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Expand sidebar"
          >
            <FaChevronRight />
          </button>
        ) : null}
        <button
          type="button"
          onClick={logout}
          title={isCollapsed ? "Sign out" : undefined}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white/80 transition hover:border-primary-light/30 hover:bg-primary hover:text-white"
        >
          <FaSignOutAlt className="text-base" />
          {!isCollapsed ? "Sign out" : null}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
