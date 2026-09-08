import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AdminRole } from "../types/auth.type";
import type { FC } from "react";

interface RoleRouteProps {
  allowedRoles: AdminRole[];
}

const RoleRoute: FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { admin, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but no permission
  if (!admin || !allowedRoles.includes(admin.admin_role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
