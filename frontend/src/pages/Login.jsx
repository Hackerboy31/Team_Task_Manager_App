import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });
  const { login, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ ...formData, email: formData.email.trim() });
      } else {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      }
    } catch (error) {
      // Error is gracefully handled by toast inside AuthContext
      console.error("Authentication attempt failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Subtle animated background shapes */}
      <div className="absolute top-1/4 -left-16 h-64 w-64 rounded-full bg-indigo-100 opacity-70 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-16 h-64 w-64 rounded-full bg-sky-100 opacity-70 blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-white/90 backdrop-blur-sm shadow-2xl shadow-indigo-950/5 rounded-3xl border border-white relative z-10 transition-all">
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-3xl font-extrabold text-white shadow-lg shadow-slate-950/20">
            <span className="transform transition-transform hover:-rotate-12">
              T
            </span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Team Task Manager
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Animated Name Field for Registration */}
          {isRegister && (
            <div className="animate-fade-in transition-all duration-300">
              <label
                className="block text-sm font-semibold text-slate-700 ml-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label
              className="block text-sm font-semibold text-slate-700 ml-1"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-700 ml-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
              required
            />
          </div>

          {/* Animated Role Field for Registration */}
          {isRegister && (
            <div className="animate-fade-in transition-all duration-300">
              <label
                className="block text-sm font-semibold text-slate-700 ml-1"
                htmlFor="role"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 mt-4 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-950/20 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Processing..."
              : isRegister
                ? "Create Account"
                : "Sign In Securely"}
          </button>
        </form>

        {/* Toggle Button Container */}
        <div className="mt-8 border-t border-slate-100 pt-6 flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">
            {isRegister ? "Already have an account?" : "First time here?"}
          </span>
          <button
            type="button"
            onClick={() => setIsRegister((prev) => !prev)}
            className="font-bold text-indigo-600 transition-colors hover:text-indigo-800"
          >
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
