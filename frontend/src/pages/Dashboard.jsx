import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import Topbar from "../components/Topbar";

const stats = [
  {
    key: "totalTasks",
    title: "Total Tasks",
    label: "All tasks",
    color: "text-slate-900",
    bgColor: "bg-slate-300",
  },
  {
    key: "completedTasks",
    title: "Completed",
    label: "Completed tasks",
    color: "text-emerald-700",
    bgColor: "bg-emerald-400",
  },
  {
    key: "activeTasks",
    title: "Open",
    label: "Pending / In-Progress",
    color: "text-amber-700",
    bgColor: "bg-amber-400",
  },
  {
    key: "overdueTasks",
    title: "Overdue",
    label: "Overdue tasks",
    color: "text-rose-700",
    bgColor: "bg-rose-400",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await api.get("/dashboard/metrics");
        setMetrics(response.data);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-sm font-semibold text-slate-500 animate-pulse">
        Crunching workspace metrics...
      </div>
    );

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in transition-all">
      <Topbar title="Dashboard" />

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => {
          // EXACT FIX: Restore original logic for calculating open/active tasks
          const value =
            card.key === "activeTasks"
              ? (metrics?.pendingTasks ?? 0) + (metrics?.inProgressTasks ?? 0)
              : (metrics?.[card.key] ?? 0);

          return (
            <div
              key={card.key}
              className="group rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>
                <div
                  className={`h-2.5 w-2.5 rounded-full ${card.bgColor} shadow-sm`}
                ></div>
              </div>
              <p
                className={`mt-4 text-4xl font-extrabold tracking-tight ${card.color}`}
              >
                {value.toString().padStart(2, "0")}
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-500 transition-colors group-hover:text-indigo-600">
                {card.label}
              </p>
            </div>
          );
        })}
      </section>

      {/* Insights & Quick Actions */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        {/* Insights Panel */}
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                Insights
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Progress Overview
              </h3>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50/80 p-5 border border-slate-100 hover:bg-slate-50 transition-colors">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Completion Rate
              </p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">
                {/* EXACT FIX: Restore math for completion percentage */}
                {metrics
                  ? Math.round(
                      (metrics.completedTasks /
                        Math.max(metrics.totalTasks, 1)) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50/80 p-5 border border-slate-100 hover:bg-slate-50 transition-colors">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Overdue Impact
              </p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">
                {metrics?.overdueTasks ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50/30 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Next Step
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
              Use project summaries to assign resources and keep task updates
              current. Members can update their status directly in the Tasks
              view.
            </p>
          </div>
        </div>

        {/* Navigation / Quick Actions Panel */}
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Quick Actions
          </p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 mb-6">
            Navigation
          </h3>

          <div className="mt-auto space-y-3">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-all shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Review Projects
            </button>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Open Task Board
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
