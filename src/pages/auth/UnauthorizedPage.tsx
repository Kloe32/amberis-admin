import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        gap: "12px",
      }}
    >
      <h1
        className=""
        style={{ color: "var(--color-primary)", fontSize: "48px" }}
      >
        403
      </h1>
      <h2 style={{ color: "var(--color-text-primary)" }}>Access Denied</h2>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Your role <strong>{admin?.admin_role}</strong> does not have permission
        to view this page.
      </p>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};

export default UnauthorizedPage;
