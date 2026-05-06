import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
        <div className="inline-flex items-center gap-4 rounded-2xl bg-white/80 px-6 py-4 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-md animate-pulse">
          <div className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-sky-500"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-700">
            Loading workspace...
          </span>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
