import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Status, Priority, SortField } from '../types';
import { USERS } from '../utils/mockData';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Highlight from '../components/Highlight';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const ROW_HEIGHT = 48;
const BUFFER_SIZE = 5;

const ListView: React.FC = () => {
  const { tasks, filters, sort, setSort, updateTask, searchQuery } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // 1. Filtering & Sorting
  const sortedTasks = useMemo(() => {
    let result = tasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assigneeId)) return false;
      if (filters.dateRange.start && t.dueDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && t.dueDate > filters.dateRange.end) return false;
      return true;
    });

    result.sort((a, b) => {
      let valA: any = a[sort.field];
      let valB: any = b[sort.field];
      
      // Special sorting for priority
      if (sort.field === 'priority') {
        const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        valA = priorityOrder[a.priority as Priority];
        valB = priorityOrder[b.priority as Priority];
      }

      if (valA < valB) return sort.order === 'asc' ? -1 : 1;
      if (valA > valB) return sort.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters, sort]);

  // 2. Virtual Scrolling logic
  const totalCount = sortedTasks.length;
  const totalHeight = totalCount * ROW_HEIGHT;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(totalCount - 1, Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_SIZE);
  
  const visibleTasks = sortedTasks.slice(startIndex, endIndex + 1);
  const paddingTop = startIndex * ROW_HEIGHT;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
      
      const handleResize = () => {
        if (containerRef.current) setContainerHeight(containerRef.current.offsetHeight);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleHeaderClick = (field: SortField) => {
    setSort(field);
  };

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus });
  };

  const renderSortArrow = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-bg2 border border-border rounded-xl flex flex-col h-[calc(100vh-160px)] min-h-[500px] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_120px_100px_100px_140px_140px] bg-bg3 border-b border-border z-10 sticky top-0 font-mono text-[10px] uppercase tracking-wider text-text3 select-none">
        <div className={cn("px-4 py-3 flex items-center gap-2 cursor-pointer hover:text-text", sort.field === 'title' && "text-accent")} onClick={() => handleHeaderClick('title')}>
          Title {renderSortArrow('title')}
        </div>
        <div className="px-4 py-3 cursor-default">Status</div>
        <div className={cn("px-4 py-3 flex items-center gap-2 cursor-pointer hover:text-text", sort.field === 'priority' && "text-accent")} onClick={() => handleHeaderClick('priority')}>
          Priority {renderSortArrow('priority')}
        </div>
        <div className="px-4 py-3 cursor-default">Assignee</div>
        <div className={cn("px-4 py-3 flex items-center gap-2 cursor-pointer hover:text-text", sort.field === 'dueDate' && "text-accent")} onClick={() => handleHeaderClick('dueDate')}>
          Due Date {renderSortArrow('dueDate')}
        </div>
        <div className="px-4 py-3 cursor-default">Start Date</div>
      </div>

      {/* Scrollable Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div 
            style={{ 
              transform: `translateY(${paddingTop}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleTasks.map(task => {
              const assignee = USERS.find(u => u.id === task.assigneeId);
              
              return (
                <div 
                  key={task.id} 
                  className="grid grid-cols-[2fr_120px_100px_100px_140px_140px] items-center border-b border-border/50 hover:bg-bg3/50 transition-colors h-[48px] group"
                >
                  <div className="px-4 flex items-center gap-2 truncate text-sm font-medium text-text">
                    <Highlight text={task.title} query={searchQuery} />
                    {(task.viewingUserIds || []).map(uid => {
                      const vUser = USERS.find(u => u.id === uid);
                      return vUser && (
                        <div 
                          key={uid}
                          className={cn("w-2.5 h-2.5 rounded-full border border-accent animate-pulse-slow", vUser.color)}
                          title={`${vUser.name} is viewing`}
                        />
                      );
                    })}
                  </div>
                  <div className="px-4">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                      className="bg-bg4 border border-border2 text-text2 text-[11px] rounded px-1.5 py-0.5 outline-none focus:border-accent hover:text-text active:text-text"
                    >
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="inreview">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="px-4">
                    <span className={cn(
                      "text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-transparent",
                      task.priority === 'critical' && "text-red border-red/20 bg-red/5",
                      task.priority === 'high' && "text-orange border-orange/20 bg-orange/5",
                      task.priority === 'medium' && "text-yellow border-yellow/20 bg-yellow/5",
                      task.priority === 'low' && "text-green border-green/20 bg-green/5"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="px-4 flex items-center">
                    {assignee && (
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-bg2", assignee.color)}>
                        {assignee.initials}
                      </div>
                    )}
                  </div>
                  <div className="px-4 text-[12px] font-mono text-text3">{task.dueDate}</div>
                  <div className="px-4 text-[12px] font-mono text-text3">{task.startDate}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        {totalCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 mb-4 text-text3 opacity-20">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-mono uppercase tracking-widest text-text3 mb-4">No tasks match your filters</p>
            <button 
              onClick={() => useTaskStore.getState().setFilters({ status: [], priority: [], assignee: [], dateRange: { start: '', end: '' } })}
              className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider rounded-lg border border-accent/30 transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
