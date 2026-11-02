
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import useAuthStore from "../store/authStore";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(
      formData.email.trim(),
      formData.password
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <main className="auth-page">
      {/* Left branding section */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link to="/login" className="auth-brand-logo">
            <div className="auth-logo-icon">
              <Zap size={23} fill="currentColor" />
            </div>
            <span>FlowBoard</span>
          </Link>

          <div className="auth-brand-message">
            <span className="auth-eyebrow">
              <Sparkles size={14} />
              WORK BETTER TOGETHER
            </span>

            <h1>
              Turn teamwork
              <br />
              into <span>progress.</span>
            </h1>

            <p>
              Organize projects, manage tasks, and collaborate
              with your team in one connected workspace.
            </p>

            <div className="auth-feature-list">
              <div>
                <CheckCircle2 size={18} />
                <span>Manage projects with visual boards</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Collaborate with your team in real time</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Keep every task and update organized</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <ShieldCheck size={16} />
            <span>Secure workspace for your team</span>
          </div>
        </div>
      </section>

      {/* Right login section */}
      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">
              <Zap size={21} fill="currentColor" />
            </div>
            <span>FlowBoard</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">WELCOME BACK</span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details below to access your workspace.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <div className="auth-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="auth-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-button"
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to FlowBoard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={16} />
            Your workspace and account are protected.
          </div>

          <div className="auth-divider">
            <span>NEW TO FLOWBOARD?</span>
          </div>

          <p className="auth-register-text">
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>

          <p className="auth-copyright">
            © {new Date().getFullYear()} FlowBoard. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
