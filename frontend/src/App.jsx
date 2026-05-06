import { useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import ProjectsPage from './pages/Projects'
import TasksPage from './pages/Tasks'
import EmployeesPage from './pages/Employees'

function App() {
  const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
      <div className="mx-auto flex h-screen w-full max-w-[1700px] overflow-hidden bg-slate-100">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Team Task Manager</p>
              <h1 className="text-xl font-semibold text-slate-900">Workspace</h1>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
              aria-label="Open sidebar"
            >
              <span className="block h-0.5 w-6 rounded-full bg-slate-900"></span>
              <span className="mt-1 block h-0.5 w-6 rounded-full bg-slate-900"></span>
              <span className="mt-1 block h-0.5 w-6 rounded-full bg-slate-900"></span>
            </button>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-100 text-slate-900">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<Layout />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
