
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Building2,
  UserRound,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import useAuthStore from "../store/authStore";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
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

    const result = await register({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      organizationName: formData.organizationName.trim(),
    });

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Unable to create your account.");
    }
  };

  return (
    <main className="auth-page">
      {/* Left branding section */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link to="/register" className="auth-brand-logo">
            <div className="auth-logo-icon">
              <Zap size={23} fill="currentColor" />
            </div>
            <span>FlowBoard</span>
          </Link>

          <div className="auth-brand-message">
            <span className="auth-eyebrow">
              <Sparkles size={14} />
              YOUR TEAM'S WORKSPACE
            </span>

            <h1>
              Great work
              <br />
              starts <span>together.</span>
            </h1>

            <p>
              Create your organization, bring your team together,
              and turn everyday tasks into meaningful progress.
            </p>

            <div className="auth-feature-list">
              <div>
                <CheckCircle2 size={18} />
                <span>Create and organize your workspace</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Manage projects with Kanban boards</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Collaborate with your team in real time</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <ShieldCheck size={16} />
            <span>Start building a more organized workflow</span>
          </div>
        </div>
      </section>

      {/* Registration form */}
      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">
              <Zap size={21} fill="currentColor" />
            </div>
            <span>FlowBoard</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">GET STARTED</span>

            <h2>Create your account</h2>

            <p>
              Set up your account and organization to get started.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="name">Full name</label>

              <div className="auth-input-wrapper">
                <UserRound size={18} />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
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

              <p className="auth-field-hint">
                Use at least 6 characters.
              </p>
            </div>

            {/* Organization */}
            <div className="auth-field">
              <label htmlFor="organizationName">
                Organization name
              </label>

              <div className="auth-input-wrapper">
                <Building2 size={18} />

                <input
                  id="organizationName"
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="Enter your organization name"
                  required
                />
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={16} />
            Your account information is protected.
          </div>

          <div className="auth-divider">
            <span>ALREADY HAVE AN ACCOUNT?</span>
          </div>

          <p className="auth-register-text">
            Welcome back?{" "}
            <Link to="/login">Sign in to your account</Link>
          </p>

          <p className="auth-copyright">
            © {new Date().getFullYear()} FlowBoard. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
