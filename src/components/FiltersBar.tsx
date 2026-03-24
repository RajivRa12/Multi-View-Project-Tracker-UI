import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Status, Priority } from '../types';
import { X, Calendar, Filter, History as ActivityHistory } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'inreview', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const FiltersBar: React.FC<{ onToggleLogs: () => void }> = ({ onToggleLogs }) => {
  const { filters, setFilters, clearFilters, searchQuery, setSearchQuery, theme, setTheme } = useTaskStore();

  const handleToggleFilter = (field: keyof typeof filters, value: string) => {
    const current = filters[field] as string[];
    const isAlreadySelected = current.includes(value);
    const updated = isAlreadySelected 
      ? current.filter(v => v !== value) 
      : [...current, value];
    
    setFilters({ [field]: updated });
  };

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.assignee.length > 0 || 
    filters.dateRange.start || 
    filters.dateRange.end ||
    searchQuery.length > 0;

  return (
    <div className="bg-bg2 border-b border-border px-4 py-2 flex items-center gap-4 flex-wrap z-[50] sticky top-14 transition-colors">
      {/* SEARCH */}
      <div className="relative group min-w-[200px] flex-1 max-w-sm">
        <Filter className="w-3.5 h-3.5 text-text3 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
        <input 
          id="global-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH TASKS..."
          className="w-full bg-bg3 border border-border2 rounded-lg pl-9 pr-14 py-1.5 text-[11px] font-mono text-text outline-none focus:border-accent hover:border-border transition-all shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-40">
          <kbd className="bg-bg4 border border-border px-1.5 rounded text-[9px] font-sans font-bold">⌘</kbd>
          <kbd className="bg-bg4 border border-border px-1.5 rounded text-[9px] font-sans font-bold">K</kbd>
        </div>
      </div>

      <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 border-r lg:border-r-0 border-border pr-4 lg:pr-0 h-6">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleToggleFilter('status', opt.value)}
            className={cn(
              "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
              filters.status.includes(opt.value) 
                ? "bg-accent/10 text-accent border border-accent/20 shadow-sm" 
                : "text-text3 border border-transparent hover:bg-bg3 hover:text-text"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1.5 border-r lg:border-r-0 border-border pr-4 lg:pr-0 h-6">
        {PRIORITY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleToggleFilter('priority', opt.value)}
            className={cn(
              "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
              filters.priority.includes(opt.value) 
                ? "bg-accent/10 text-accent border border-accent/20 shadow-sm" 
                : "text-text3 border border-transparent hover:bg-bg3 hover:text-text"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 border-l border-border pl-4">
        <div className="relative group">
          <Calendar className="w-3 h-3 text-text3 absolute left-2 top-1/2 -translate-y-1/2" />
          <input 
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })}
            className="bg-bg3 border border-border2 rounded-md pl-6 pr-2 py-1 text-[10px] font-mono text-text2 outline-none focus:border-accent w-28 transition-all cursor-pointer"
          />
        </div>
        <span className="text-text3 text-[10px]">TO</span>
        <div className="relative group">
          <input 
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })}
            className="bg-bg3 border border-border2 rounded-md px-2 py-1 text-[10px] font-mono text-text2 outline-none focus:border-accent w-28 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="ml-auto flex items-center gap-2">
        <button 
          onClick={onToggleLogs}
          className="p-1.5 rounded-lg border border-border bg-bg3 text-text3 hover:text-accent hover:border-accent/40 transition-all group cursor-pointer"
          title="Activity Log (⌘+H)"
        >
          <ActivityHistory className="w-4 h-4 group-hover:scale-110" />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg border border-border bg-bg3 text-text3 hover:text-yellow hover:border-yellow/40 transition-all font-bold cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☽' : '☼'}
        </button>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red/30 bg-red/5 text-red text-[10px] font-bold uppercase tracking-widest hover:bg-red/10 transition-all animate-in fade-in zoom-in duration-300 shadow-lg shadow-red/5 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
