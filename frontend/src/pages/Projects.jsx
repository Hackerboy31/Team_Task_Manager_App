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
  const [expandedProjects, setExpandedProjects] = useState([]);

  const statusOptions = ["Pending", "In-Progress", "Completed"];

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

  // --- STATUS UPDATE LOGIC (ADMIN & MEMBER BOTH) ---
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const { data } = await axiosInstance.patch(
        `/projects/${projectId}/status`,
        {
          status: newStatus,
        },
      );
      setProjects(projects.map((p) => (p._id === projectId ? data : p)));
      toast.success(`Status: ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

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
      toast.error("Error updating project");
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

  const toggleMembers = (projectId) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const filteredProjects = projects.filter((proj) =>
    proj.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-bold">
        Loading...
      </div>
    );

  return (
    <main className="p-4 md:p-8 space-y-8">
      <Topbar title="Project Workspace" />

      {/* SEARCH & CREATE SECTION */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {user.role === "Admin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            + New Project
          </button>
        )}
      </section>

      {/* VIEW LOGIC */}
      {user.role === "Admin" ? (
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Title
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => (
                <tr
                  key={proj._id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {proj.title}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={proj.status || "Pending"}
                      onChange={(e) =>
                        handleStatusUpdate(proj._id, e.target.value)
                      }
                      className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModalForEdit(proj)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-slate-900">
                  {proj.title}
                </h4>
                {/* MEMBER DROPDOWN UPDATE */}
                <select
                  value={proj.status || "Pending"}
                  onChange={(e) => handleStatusUpdate(proj._id, e.target.value)}
                  className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-1 rounded-md border-none outline-none cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                {proj.description}
              </p>

              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => toggleMembers(proj._id)}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600"
                >
                  {expandedProjects.includes(proj._id)
                    ? "Hide Team"
                    : `View Team (${proj.members.length})`}
                </button>
                {expandedProjects.includes(proj._id) && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {proj.members.map((m) => (
                      <span
                        key={m._id}
                        className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold"
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

      {/* MODAL SECTION (Same as before) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <form
              onSubmit={editingId ? handleUpdate : handleCreate}
              className="p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-slate-900">
                {editingId ? "Update Project" : "New Project"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                  required
                />

                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Select Members
                  </p>
                  {allEmployees.map((emp) => (
                    <label
                      key={emp._id}
                      className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.members.includes(emp._id)}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            members: formData.members.includes(emp._id)
                              ? formData.members.filter((id) => id !== emp._id)
                              : [...formData.members, emp._id],
                          })
                        }
                      />
                      <span className="text-sm font-medium">{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold"
                >
                  {editingId ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
