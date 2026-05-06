import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md transition-all">
      <div className="flex flex-col justify-center transform transition-transform hover:translate-x-1 duration-300">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Welcome back,
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 leading-none">
            {user?.name}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
