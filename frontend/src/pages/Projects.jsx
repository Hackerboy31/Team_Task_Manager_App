import { useEffect, useState } from "react";
import axiosInstance from "../api/api";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  // NEW: State to track which project's members are expanded in Member view
  const [expandedProjects, setExpandedProjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [projRes, empRes] = await Promise.all([
        axiosInstance.get("/projects"),
        user.role === "Admin"
          ? axiosInstance.get("/users")
          : Promise.resolve({ data: [] }),
      ]);
      setProjects(projRes.data);
      setAllEmployees(empRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/projects", formData);
      toast.success("Project created!");
      setProjects([...projects, data]);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating project");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.put(
        `/projects/${editingId}`,
        formData,
      );
      toast.success("Project updated!");
      setProjects(projects.map((p) => (p._id === editingId ? data : p)));
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating project");
    }
  };

  const openModalForEdit = (proj) => {
    setEditingId(proj._id);
    setFormData({
      title: proj.title,
      description: proj.description,
      members: proj.members.map((m) => m._id),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", members: [] });
  };

  const handleMemberChange = (empId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(empId)
        ? prev.members.filter((id) => id !== empId)
        : [...prev.members, empId],
    }));
  };

  // Logic to toggle member list visibility
  const toggleMembers = (projectId) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const filteredProjects = projects.filter((proj) => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      proj.title.toLowerCase().includes(lowerCaseQuery) ||
      (proj.description || "").toLowerCase().includes(lowerCaseQuery)
    );
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-sm font-semibold text-slate-500 animate-pulse">
        Loading workspace projects...
      </div>
    );

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in transition-all">
      <Topbar title="Project Workspace" />

      {/* Admin Action Section */}
      {user?.role === "Admin" && (
        <section className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Project Management Portal
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-2">
              Overview, creating, and editing of team initiatives
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md shadow-slate-950/10 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="text-xl">+</span> New Project
          </button>
        </section>
      )}

      {/* Search Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <input
          type="text"
          placeholder="Search projects by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 outline-none"
        />
      </section>

      {/* Main Content */}
      {user?.role === "Admin" ? (
        <section className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="border-b border-slate-200 bg-slate-100/80">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Project Title
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Members
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj._id}
                    className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {proj.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-sm">
                      {proj.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-indigo-700 bg-indigo-50/50 rounded-full inline-block mt-2">
                      {proj.members.length} Assigned
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModalForEdit(proj)}
                        className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => (
            <div
              key={proj._id}
              className="group rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <h4 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">
                {proj.title}
              </h4>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3 min-h-[4.5rem]">
                {proj.description}
              </p>

              {/* Member Logic Update: Count + Toggle Button */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Team ({proj.members.length} Employees)
                  </p>
                  <button
                    onClick={() => toggleMembers(proj._id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full shadow-inner"
                  >
                    {expandedProjects.includes(proj._id)
                      ? "Hide"
                      : "View Names"}
                  </button>
                </div>

                {expandedProjects.includes(proj._id) && (
                  <div className="flex flex-wrap gap-2 animate-fade-in transition-all duration-300">
                    {proj.members.map((m) => (
                      <span
                        key={m._id}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modal remains the same */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
              aria-hidden="true"
              onClick={closeModal}
            ></div>
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle animate-modal-slide-in">
              <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="p-8"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {editingId
                      ? "Edit Project Details"
                      : "Initialize New Project"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Provide the project workflow details below.
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700 ml-1"
                      htmlFor="title"
                    >
                      Project Title
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
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-slate-700 ml-1"
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
                      className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 min-h-32"
                      required
                    />
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-sm font-semibold text-slate-700 ml-1 mb-3">
                      Assign Members
                    </p>
                    <div className="max-h-56 overflow-y-auto space-y-1 rounded-2xl border border-slate-100 p-2 bg-slate-50/50">
                      {allEmployees.map((emp) => (
                        <label
                          key={emp._id}
                          className="group flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white border border-transparent hover:border-slate-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.members.includes(emp._id)}
                            onChange={() => handleMemberChange(emp._id)}
                            className="h-5 w-5 rounded border-slate-300 text-indigo-600 transition focus:ring-indigo-500/50"
                          />
                          <div className="flex-1">
                            <span className="block text-sm font-semibold text-slate-800 transition group-hover:text-slate-950">
                              {emp.name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {emp.email}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md shadow-slate-950/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {editingId ? "Save Changes" : "Launch Project"}
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
