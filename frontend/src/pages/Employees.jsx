import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/api";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Search and Filter States
  const [userSearch, setUserSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data } = await axiosInstance.get("/users");
      setEmployees(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee list");
    } finally {
      setLoading(false);
    }
  }

  // EXACT FIX: Restore clicking on employee to fetch their tasks
  const handleUserClick = async (emp) => {
    setSelectedUser(emp);
    setLoadingTasks(true);
    setTaskSearch("");
    setTaskStatusFilter("All");
    try {
      const { data } = await axiosInstance.get("/tasks");
      // Filter tasks for the selected employee safely
      const userTasks = data.filter(
        (t) => (t.assignedTo?._id || t.assignedTo) === emp._id,
      );
      setTasks(userTasks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks for this employee");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/employees", formData);
      toast.success("Employee account created!");
      setEmployees([...employees, data]);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating account");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click when deleting
    if (
      !window.confirm("This action cannot be undone. Confirm account deletion?")
    )
      return;
    try {
      await axiosInstance.delete(`/employees/${id}`);
      toast.success("Account deleted successfully!");
      setEmployees(employees.filter((emp) => emp._id !== id));
      if (selectedUser?._id === id) {
        setSelectedUser(null);
        setTasks([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", password: "", role: "Member" });
  };

  // EXACT FIX: Restore Employee Search Logic
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return employees;
    const query = userSearch.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query),
    );
  }, [employees, userSearch]);

  // EXACT FIX: Restore Task Search and Status Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (task.project?.title || "")
          .toLowerCase()
          .includes(taskSearch.toLowerCase()) ||
        (task.description || "")
          .toLowerCase()
          .includes(taskSearch.toLowerCase());

      const matchStatus =
        taskStatusFilter === "All" || task.status === taskStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [tasks, taskSearch, taskStatusFilter]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-sm font-semibold text-slate-500 animate-pulse">
        Syncing employee registry...
      </div>
    );

  const statusColors = {
    Pending: "text-rose-700 bg-rose-100",
    "In Progress": "text-amber-800 bg-amber-100",
    Completed: "text-emerald-800 bg-emerald-100",
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in transition-all">
      <Topbar title="Organization Registry" />

      {/* Header & Add Button */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Access Control & Team Tasks
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage employees and click on them to view their assigned tasks.
          </p>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md shadow-slate-950/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="text-xl">+</span> Add Staff Member
          </button>
        )}
      </section>

      {/* Split View for Desktop: Employees on Left, Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
        {/* LEFT COLUMN: Employee List & Search */}
        <section className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
            />
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">
                No employees found matching your search.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => handleUserClick(emp)}
                    className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent ${
                      selectedUser?._id === emp._id
                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div>
                      <h4
                        className={`text-sm font-bold ${selectedUser?._id === emp._id ? "text-indigo-900" : "text-slate-800"}`}
                      >
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {emp.email}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${emp.role === "Admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700"}`}
                      >
                        {emp.role}
                      </span>
                    </div>
                    {user?.role === "Admin" && (
                      <button
                        onClick={(e) => handleDelete(emp._id, e)}
                        className="opacity-0 group-hover:opacity-100 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm ring-1 ring-rose-200 transition-all hover:bg-rose-600 hover:text-white"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Selected Employee's Tasks & Search */}
        <section className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
          {selectedUser ? (
            <>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Tasks for{" "}
                  <span className="text-indigo-600">{selectedUser.name}</span>
                </h3>

                {/* Task Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                  />
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-400"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-5 bg-slate-50/30">
                {loadingTasks ? (
                  <div className="py-12 text-center text-sm font-medium text-slate-400 animate-pulse">
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">
                    No tasks found for this employee based on current filters.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <h4 className="text-base font-bold text-slate-900">
                            {task.title}
                          </h4>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[task.status] || "bg-slate-100 text-slate-700"}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                            Project: {task.project?.title || "N/A"}
                          </span>
                          {task.dueDate && (
                            <span
                              className={
                                new Date(task.dueDate) < new Date() &&
                                task.status !== "Completed"
                                  ? "text-rose-500"
                                  : ""
                              }
                            >
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <p className="text-slate-500 font-medium">
                  Select an employee from the list
                  <br />
                  to view and search their assigned tasks.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal for Admin to Register Employees */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>
            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle animate-modal-slide-in">
              <form onSubmit={handleCreate} className="p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    Register Staff Member
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Create a new workspace account.
                  </p>
                </div>

                <div className="space-y-6 px-1">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
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
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Generate Credentials
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
