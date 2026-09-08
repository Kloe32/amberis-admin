import { useState } from "react";
import type { ComponentProps } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import type { LoginPayload } from "../../types/auth.type";
import { authenticateAdmin } from "../../services/auth.service";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field: keyof LoginPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    event,
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await authenticateAdmin(form);
      login(response.token, response.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-sidebar px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-xl font-bold">
              A
            </div>
            <div>
              <p className="text-lg font-bold tracking-[0.18em]">AMBERIS</p>
              <p className="text-sm text-white/55">Admin Portal</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-8 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-secondary-light">
              Operations Command
            </div>
            <h1 className="mb-5 max-w-lg text-5xl font-semibold leading-tight tracking-normal text-white">
              Manage products, users, and orders with clarity.
            </h1>
            <p className="max-w-md text-base leading-7 text-white/65">
              A focused workspace for Amberis administrators to keep daily
              operations organized, accountable, and moving.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["Secure", "Role based access"],
              ["Fast", "Operational workflows"],
              ["Clear", "Admin visibility"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-lg font-bold text-white">
                A
              </div>
              <div>
                <p className="text-base font-bold tracking-[0.18em] text-text-primary">
                  AMBERIS
                </p>
                <p className="text-xs font-medium text-text-secondary">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-dark">
                  Welcome Back
                </p>
                <h2 className="text-3xl font-semibold tracking-normal text-text-primary">
                  Sign in to your account
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Enter your administrator credentials to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text-primary">
                    Email address
                  </span>
                  <span className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light">
                    <FaEnvelope className="text-text-secondary" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                      placeholder="admin@amberis.com"
                      autoComplete="email"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text-primary">
                    Password
                  </span>
                  <span className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary-light">
                    <FaLock className="text-text-secondary" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        handleChange("password", event.target.value)
                      }
                      className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                      placeholder="Enter password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="rounded-md p-1 text-text-secondary transition hover:bg-primary-light hover:text-primary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </span>
                </label>

                {error ? (
                  <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm font-medium text-error">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <FaArrowRight className="text-xs" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
