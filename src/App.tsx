import React, { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { useURLSync } from './hooks/useURLSync';
import { DragProvider } from './context/DragContext';
import KanbanView from './views/KanbanView';
import ListView from './views/ListView';
import TimelineView from './views/TimelineView';
import FiltersBar from './components/FiltersBar';
import { USERS } from './utils/mockData';
import { LayoutGrid, List, BarChart2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import ActivityLog from './components/ActivityLog';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const { view, setView, viewingUsersCount, simulateCollaboration, theme } = useTaskStore();
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  // Sync state with URL
  useURLSync();

  // Simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      simulateCollaboration();
    }, 4500);
    return () => clearInterval(interval);
  }, [simulateCollaboration]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  }, [theme]);

  // Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 1, 2, 3 for views
    if (e.key === '1') setView('kanban');
    if (e.key === '2') setView('list');
    if (e.key === '3') setView('timeline');
    
    // Cmd+K for Search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('global-search')?.focus();
    }

    // Cmd+H for History
    if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
      e.preventDefault();
      setIsLogsOpen(prev => !prev);
    }
  }, [setView]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const viewIcons = {
    kanban: <LayoutGrid className="w-3.5 h-3.5" />,
    list: <List className="w-3.5 h-3.5" />,
    timeline: <BarChart2 className="w-3.5 h-3.5" />,
  };

  const renderView = () => {
    switch (view) {
      case 'kanban': return <KanbanView />;
      case 'list': return <ListView />;
      case 'timeline': return <TimelineView />;
      default: return <KanbanView />;
    }
  };

  return (
    <DragProvider>
      <div className={cn(
        "min-h-screen transition-colors duration-500",
        theme === 'dark' ? "bg-bg text-text" : "bg-white text-gray-900"
      )}>
        <ActivityLog isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />

        {/* NAV BAR */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-bg/85 backdrop-blur-md border-b border-border flex items-center px-4 gap-8 z-[100] transition-all text-text">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center font-syne font-black text-white text-xs group-hover:rotate-12 transition-transform">PF</div>
            <h1 className="font-syne font-extrabold text-lg tracking-tight select-none">
              Project<span className="text-accent underline decoration-accent/30 underline-offset-4">Flow</span>
            </h1>
          </div>

          <nav className="flex items-center gap-1 bg-bg3/50 p-1 rounded-lg border border-border mt-0.5">
            {(['kanban', 'list', 'timeline'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  view === v 
                    ? "bg-bg4 text-text shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-border" 
                    : "text-text3 hover:text-text hover:bg-bg3"
                )}
              >
                {viewIcons[v]}
                {v}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green/5 border border-green/10 rounded-full select-none hover:bg-green/10 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-green uppercase tracking-wider">
                {viewingUsersCount} Agents viewing
              </span>
            </div>

            <div className="flex -space-x-2">
              {USERS.slice(0, viewingUsersCount).map((u) => (
                <div 
                  key={u.id}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 border-bg flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:-translate-y-1 hover:z-10 animate-fade-in",
                    u.color
                  )}
                  title={u.name}
                >
                  {u.initials}
                </div>
              ))}
            </div>
            
            <button className="flex items-center gap-2 h-8 px-4 bg-accent text-white font-bold text-[11px] uppercase tracking-widest rounded-md hover:bg-accent2 hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-all active:scale-95 group cursor-pointer">
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              New Task
            </button>
          </div>
        </header>

        {/* FILTERS */}
        <FiltersBar onToggleLogs={() => setIsLogsOpen(!isLogsOpen)} />

        {/* MAIN CONTENT */}
        <main className="pt-2 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {renderView()}
        </main>
      </div>
    </DragProvider>
  );
}

export default App;
