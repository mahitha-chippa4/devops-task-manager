import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import TaskFilter from './components/TaskFilter';
import TaskCard from './components/TaskCard';
import TaskFormModal from './components/TaskFormModal';
import PipelineStatusModal from './components/PipelineStatusModal';
import Toast from './components/Toast';
import { 
  fetchTasks, 
  fetchTaskStats, 
  createTask, 
  updateTask, 
  deleteTask, 
  checkBackendHealth 
} from './api';
import { 
  ClipboardList, 
  PlusCircle, 
  Loader2, 
  ServerCrash,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    high_priority: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendHealth, setBackendHealth] = useState('checking'); // 'healthy' | 'offline' | 'checking'
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals & form state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      // Check health
      try {
        await checkBackendHealth();
        setBackendHealth('healthy');
      } catch {
        setBackendHealth('offline');
      }

      // Fetch tasks & stats
      const [tasksData, statsData] = await Promise.all([
        fetchTasks({
          status: statusFilter,
          priority: priorityFilter,
          search: search,
        }),
        fetchTaskStats(),
      ]);

      setTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      showToast(err.message || 'Failed to load task data', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create / Update
  const handleSaveTask = async (taskPayload) => {
    setIsSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskPayload);
        showToast(`Task #${editingTask.id} successfully updated!`);
      } else {
        await createTask(taskPayload);
        showToast('New task created successfully!');
      }
      setIsFormModalOpen(false);
      setEditingTask(null);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      showToast(`Task #${taskId} deleted successfully.`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Quick Status Advance
  const handleStatusToggle = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      showToast(`Task #${taskId} moved to ${newStatus.replace('_', ' ')}.`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <Header
        onNewTask={handleOpenCreateModal}
        onRefresh={() => loadData(true)}
        onOpenPipeline={() => setIsPipelineModalOpen(true)}
        backendHealth={backendHealth}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* API Offline Warning Banner */}
        {backendHealth === 'offline' && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ServerCrash className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">FastAPI Backend Unavailable</p>
                <p className="text-xs text-rose-300/80">
                  Ensure the FastAPI server is running on port 8000 (<code className="bg-rose-950 px-1 py-0.5 rounded">uvicorn app.main:app --reload</code>).
                </p>
              </div>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard KPIs */}
        <StatsOverview
          stats={stats}
          currentStatusFilter={statusFilter}
          onSelectStatusFilter={(val) => setStatusFilter(val)}
        />

        {/* Search & Filter Bar */}
        <TaskFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onResetFilters={handleResetFilters}
        />

        {/* Task Grid & States */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Fetching tasks from FastAPI backend...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-2xl p-8 border border-dashed border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {search || statusFilter || priorityFilter
                ? 'No tasks match your current filter parameters. Try clearing the filters.'
                : 'Your task list is empty. Create your first task to see the CI/CD workflow in action.'}
            </p>
            {search || statusFilter || priorityFilter ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Task</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>DevOps Course Lab: Continuous Integration and Testing Pipeline Using CircleCI</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-slate-300 transition"
            >
              Swagger API Docs
            </a>
            <span>•</span>
            <span className="font-mono text-slate-400">FastAPI + Vite React + CircleCI</span>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        isSaving={isSaving}
      />

      <PipelineStatusModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
