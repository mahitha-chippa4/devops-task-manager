import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm ${
        isError 
          ? 'bg-rose-900/90 text-rose-100 border-rose-700/80 shadow-rose-950/50' 
          : 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80 shadow-emerald-950/50'
      }`}>
        {isError ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="font-medium">{toast.message}</span>
        <button
          onClick={onDismiss}
          className="ml-2 p-1 rounded-md hover:bg-black/20 text-white/70 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
