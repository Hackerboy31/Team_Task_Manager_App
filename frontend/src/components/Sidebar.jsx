import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Projects", path: "/projects" },
  { label: "Tasks", path: "/tasks" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col gap-8 border-r border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out lg:static lg:translate-x-0 lg:flex lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
              Team Task Manager
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Workspace
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <span className="transition-transform group-hover:rotate-90 group-active:scale-90">
              ✕
            </span>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 transition-colors hover:text-sky-500">
            Team Task Manager
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Workspace
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 translate-x-1"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "Admin" && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavLink
                to="/employees"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 translate-x-1"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
                  }`
                }
              >
                Employees
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100/50 p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Signed in as
          </p>
          <p className="mt-2 text-base font-bold text-slate-900 truncate">
            {user?.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs font-medium text-slate-500">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:bg-slate-900 hover:text-white hover:ring-slate-900 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
