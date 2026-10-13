import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function TaskFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onResetFilters,
}) {
  const hasActiveFilters = search || statusFilter || priorityFilter;

  return (
    <div className="glass-panel p-4 rounded-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title or details..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All</option>
              <option value="pending" className="bg-slate-900 text-slate-200">Pending</option>
              <option value="in_progress" className="bg-slate-900 text-slate-200">In Progress</option>
              <option value="completed" className="bg-slate-900 text-slate-200">Completed</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All</option>
              <option value="high" className="bg-slate-900 text-slate-200">High</option>
              <option value="medium" className="bg-slate-900 text-slate-200">Medium</option>
              <option value="low" className="bg-slate-900 text-slate-200">Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              title="Reset all search filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
