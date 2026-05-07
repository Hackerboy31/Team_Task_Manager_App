import { useEffect, useState } from "react";
import axiosInstance from "../api/api";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    project: "",
    assignedTo: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  // FIXED: Backend compatibility ke liye options
  const statusOptions = ["Pending", "In-Progress", "Completed"];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [taskRes, projRes, empRes] = await Promise.all([
        axiosInstance.get("/tasks"),
        user.role === "Admin"
          ? axiosInstance.get("/projects")
          : Promise.resolve({ data: [] }),
        user.role === "Admin"
          ? axiosInstance.get("/users")
          : Promise.resolve({ data: [] }),
      ]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load task data");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/tasks", formData);
      toast.success("Task created and assigned!");
      setTasks([...tasks, data]);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating task");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.put(`/tasks/${editingId}`, formData);
      toast.success("Task updated!");
      setTasks(tasks.map((t) => (t._id === editingId ? data : t)));
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating task");
    }
  };

  // FIXED: Dropdown Status Change (Admin aur Member dono ke liye)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await axiosInstance.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      toast.success(`Status updated to ${newStatus}`);
      setTasks(tasks.map((t) => (t._id === taskId ? data : t)));
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const openModalForEdit = (task) => {
    setEditingId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      project: task.project._id,
      assignedTo: task.assignedTo._id,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      status: "Pending",
      project: "",
      assignedTo: "",
    });
  };

  const filteredTasks = tasks.filter(
    (t) => filterStatus === "All" || t.status === filterStatus,
  );

  const selectedProjectObj = projects.find((p) => p._id === formData.project);
  const availableAssignees = employees.filter((emp) => {
    if (!selectedProjectObj || !selectedProjectObj.members) return false;
    return selectedProjectObj.members.some((m) => (m._id || m) === emp._id);
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-sm font-semibold text-slate-500 animate-pulse">
        Syncing task workflow...
      </div>
    );

  const statusColors = {
    Pending: "text-rose-700 bg-rose-100",
    "In Progress": "text-amber-800 bg-amber-100",
    Completed: "text-emerald-800 bg-emerald-100",
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in transition-all">
      <Topbar title="Task Control" />

      <section className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Task Overview Portal
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Filter and update tasks.
            </p>
          </div>
          {user?.role === "Admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:-translate-y-0.5"
            >
              <span className="text-xl">+</span> New Task Assignment
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {["All", ...statusOptions].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                filterStatus === status
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 bg-white hover:bg-slate-100 ring-1 ring-slate-100"
              }`}
            >
              {status}{" "}
              {status !== "All" &&
                `(${tasks.filter((t) => t.status === status).length})`}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 border-2 border-dashed border-slate-100 rounded-3xl py-16 text-center text-slate-400">
            No tasks found.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="group flex flex-col rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner ${statusColors[task.status]}`}
                >
                  {task.status}
                </div>
                {user?.role === "Admin" && (
                  <button
                    onClick={() => openModalForEdit(task)}
                    className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-900 hover:text-white"
                  >
                    Edit
                  </button>
                )}
              </div>

              <h4 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors flex-grow">
                {task.title}
              </h4>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3 min-h-[4.5rem]">
                {task.description}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Project
                  </span>
                  <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg shadow-inner">
                    {task.project.title}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Assigned To
                  </span>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg shadow-inner">
                    {task.assignedTo.name}
                  </span>
                </div>
              </div>

              {/* FIXED: Member View mein bhi Dropdown dikhega ab */}
              <div className="mt-auto pt-4 border-t border-slate-50">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">
                  Update Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 cursor-pointer transition-all"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal remains same as your original code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>
            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle animate-modal-slide-in">
              <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="p-8"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {editingId ? "Modify Task Details" : "Initialize New Task"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Define the task context for the assignee.
                  </p>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[60vh] px-1 pb-4">
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700"
                      htmlFor="project"
                    >
                      Parent Project
                    </label>
                    <select
                      id="project"
                      value={formData.project}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          project: e.target.value,
                          assignedTo: "",
                        }))
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-400/20"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700"
                      htmlFor="title"
                    >
                      Task Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-400/20 min-h-32"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700"
                      htmlFor="assignedTo"
                    >
                      Team Assignee
                    </label>
                    <select
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignedTo: e.target.value,
                        }))
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-400/20"
                      required
                      disabled={!formData.project}
                    >
                      <option value="">
                        {formData.project
                          ? "Assign To..."
                          : "Select Project First"}
                      </option>
                      {availableAssignees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-12 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5"
                  >
                    {editingId ? "Update Task Details" : "Launch Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
