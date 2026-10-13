import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Hourglass, 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusToggle }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      nextStatus: 'in_progress',
      nextLabel: 'Start Task',
    },
    in_progress: {
      label: 'In Progress',
      icon: Hourglass,
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      nextStatus: 'completed',
      nextLabel: 'Complete',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      nextStatus: 'pending',
      nextLabel: 'Reopen',
    },
  };

  const priorityConfig = {
    high: {
      label: 'High',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotClass: 'bg-rose-500',
    },
    medium: {
      label: 'Medium',
      badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      dotClass: 'bg-yellow-500',
    },
    low: {
      label: 'Low',
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dotClass: 'bg-slate-500',
    },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.pending;
  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = currentStatus.icon;

  const formattedDate = new Date(task.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-xl flex flex-col justify-between transition relative group">
      <div>
        {/* Header with Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.className}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </span>

          {/* Priority Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${currentPriority.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dotClass}`}></span>
            <span>{currentPriority.label}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-blue-400 transition">
          {task.title}
        </h3>

        {/* Description */}
        {task.description ? (
          <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
            {task.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic mb-4">No description provided</p>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Status Advance */}
          <button
            onClick={() => onStatusToggle(task.id, currentStatus.nextStatus)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={`Advance status to ${currentStatus.nextStatus}`}
          >
            {currentStatus.nextLabel}
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          {isDeleting ? (
            <div className="flex items-center gap-1 bg-rose-500/20 p-0.5 rounded">
              <button
                onClick={() => onDelete(task.id)}
                className="px-1.5 py-0.5 text-[11px] font-bold text-rose-300 hover:text-rose-100 bg-rose-600 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="px-1 py-0.5 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDeleting(true)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
