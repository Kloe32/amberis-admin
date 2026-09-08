import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/auth/Login";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/User";
import Categories from "./pages/Category";
import Products from "./pages/Products";
import Order from "./pages/Order";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* All roles */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "PRODUCT_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Superadmin + Product Manager */}
            <Route
              element={
                <RoleRoute allowedRoles={["SUPER_ADMIN", "PRODUCT_MANAGER"]} />
              }
            >
              <Route path="/products/categories" element={<Categories />} />
              <Route path="/products/list" element={<Products />} />
            </Route>

            {/* Superadmin + Customer Support */}
            <Route
              element={
                <RoleRoute allowedRoles={["SUPER_ADMIN", "CUSTOMER_SUPPORT"]} />
              }
            >
              <Route path="/orders" element={<Order />} />
            </Route>

            {/* Superadmin only */}
            <Route element={<RoleRoute allowedRoles={["SUPER_ADMIN"]} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
