import React from 'react';
import { 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  GitBranch, 
  Activity, 
  Server,
  AlertTriangle
} from 'lucide-react';

export default function Header({ 
  onNewTask, 
  onRefresh, 
  onOpenPipeline, 
  backendHealth, 
  isRefreshing 
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">TaskOps</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                  CircleCI CI/CD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous Integration & Automated Testing Pipeline
              </p>
            </div>
          </div>

          {/* Actions & Status indicators */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Backend Health Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              backendHealth === 'healthy' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : backendHealth === 'checking'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {backendHealth === 'healthy' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Server className="w-3.5 h-3.5" />
                  <span>API Online</span>
                </>
              ) : backendHealth === 'checking' ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Checking API...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>API Offline</span>
                </>
              )}
            </div>

            {/* Pipeline Status Trigger */}
            <button
              onClick={onOpenPipeline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition"
              title="Inspect CircleCI Pipeline Status"
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              <span>CI Pipeline</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* New Task Button */}
            <button
              onClick={onNewTask}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
