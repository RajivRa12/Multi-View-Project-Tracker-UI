import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { X, History, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ isOpen, onClose }) => {
  const { logs } = useTaskStore();

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-80 bg-bg2 border-l border-border z-[201] shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-bg3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-accent" />
            <h2 className="font-syne font-bold text-sm uppercase tracking-widest text-text">Activity Log</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-bg4 rounded-md text-text3 hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text3 opacity-30 gap-2">
              <Clock className="w-8 h-8" />
              <p className="text-[10px] font-mono uppercase">No recent activity</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative pl-4 border-l border-border/50 py-1 mb-6">
                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-accent ring-4 ring-bg2" />
                <p className="text-[10px] font-mono text-text3 mb-1 uppercase opacity-60">
                  {log.timestamp}
                </p>
                <p className="text-[11px] font-bold text-text mb-1 leading-tight">
                  <span className="text-accent">Task:</span> {log.taskTitle}
                </p>
                <p className="text-[11px] text-text2 italic">
                  {log.action}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-bg3 text-center">
          <p className="text-[9px] font-mono text-text3 uppercase tracking-tighter">
            Showing last {logs.length} events
          </p>
        </div>
      </div>
    </>
  );
};

export default ActivityLog;
