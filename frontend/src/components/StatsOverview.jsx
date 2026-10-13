import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Hourglass, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

export default function StatsOverview({ stats, currentStatusFilter, onSelectStatusFilter }) {
  const cards = [
    {
      id: 'all',
      filterValue: '',
      label: 'Total Tasks',
      value: stats.total,
      icon: Layers,
      color: 'blue',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'pending',
      filterValue: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'in_progress',
      filterValue: 'in_progress',
      label: 'In Progress',
      value: stats.in_progress,
      icon: Hourglass,
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      activeRing: 'ring-2 ring-sky-500',
    },
    {
      id: 'completed',
      filterValue: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      activeRing: 'ring-2 ring-emerald-500',
    },
    {
      id: 'high_priority',
      filterValue: '',
      label: 'High Priority',
      value: stats.high_priority,
      icon: AlertCircle,
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      activeRing: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = card.filterValue !== '' && currentStatusFilter === card.filterValue;
        const isAllActive = card.filterValue === '' && card.id === 'all' && currentStatusFilter === '';

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              if (card.id !== 'high_priority') {
                onSelectStatusFilter(card.filterValue);
              }
            }}
            className={`p-4 rounded-xl border glass-panel transition text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] ${
              card.borderColor
            } ${isActive || isAllActive ? card.activeRing : ''}`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white font-mono">
              {card.value ?? 0}
            </div>
          </button>
        );
      })}
    </div>
  );
}
