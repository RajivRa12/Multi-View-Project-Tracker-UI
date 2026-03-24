import React, { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types';
import { USERS } from '../utils/mockData';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Highlight from '../components/Highlight';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const ROW_HEIGHT = 44;
const LABEL_WIDTH = 200;

const TimelineView: React.FC = () => {
  const { tasks, filters, searchQuery, timelineZoom, setTimelineZoom } = useTaskStore();

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assigneeId)) return false;
      if (filters.dateRange.start && t.dueDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && t.dueDate > filters.dateRange.end) return false;
      return true;
    }).slice(0, 100);
  }, [tasks, filters, searchQuery]);

  const { days, rangeLabel, dayWidth } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    
    let numDays = 30;
    let dWidth = 40;
    
    if (timelineZoom === 'week') {
      numDays = 7;
      dWidth = 160;
    } else if (timelineZoom === 'three-day') {
      numDays = 3;
      dWidth = 320;
    }

    if (timelineZoom !== 'month') {
      start.setDate(now.getDate() - Math.floor(numDays / 2));
    } else {
      start.setDate(1); 
    }
    
    const daysArr = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      daysArr.push({
        num: d.getDate(),
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        iso: d.toISOString().split('T')[0],
        isToday: d.toISOString().split('T')[0] === now.toISOString().split('T')[0]
      });
    }

    return {
      days: daysArr,
      rangeLabel: timelineZoom === 'month' 
        ? now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : `${daysArr[0].iso} - ${daysArr[daysArr.length-1].iso}`,
      dayWidth: dWidth
    };
  }, [timelineZoom]);

  const getDayOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    const firstDateInView = new Date(days[0].iso);
    const diffTime = d.getTime() - firstDateInView.getTime();
    return Math.floor(diffTime / (1000 * 3600 * 24));
  };

  const getTaskWidth = (task: Task) => {
    if (!task.startDate || !task.dueDate) return dayWidth - 8;
    const start = new Date(task.startDate);
    const due = new Date(task.dueDate);
    const diffTime = due.getTime() - start.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 3600 * 24)));
    return (diffDays + 1) * dayWidth - 8;
  };

  const todayOffset = useMemo(() => {
    const now = new Date();
    const startInView = new Date(days[0].iso);
    const diff = Math.floor((now.getTime() - startInView.getTime()) / (1000 * 3600 * 24));
    return diff * dayWidth + (dayWidth / 2);
  }, [days, dayWidth]);

  return (
    <div className="bg-bg2 border border-border rounded-xl flex flex-col h-[calc(100vh-160px)] min-h-[500px] overflow-hidden">
      {/* Timeline Header Controls */}
      <div className="p-3 border-b border-border bg-bg3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-syne font-bold text-sm tracking-widest uppercase text-accent min-w-[150px]">
            {rangeLabel}
          </h3>
          <div className="flex bg-bg4 p-0.5 rounded-lg border border-border">
            {(['three-day', 'week', 'month'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setTimelineZoom(z)}
                className={cn(
                  "px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all",
                  timelineZoom === z 
                    ? "bg-bg2 text-accent shadow-sm border border-border" 
                    : "text-text3 hover:text-text"
                )}
              >
                {z.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-text3">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-red/40" /> Critical</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-green/40" /> Low</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <div 
          className="min-w-max" 
          style={{ width: LABEL_WIDTH + (days.length * dayWidth) }}
        >
          {/* Days Header */}
          <div className="flex border-b border-border z-10 sticky top-0 bg-bg2/90 backdrop-blur-sm">
            <div 
              className="px-4 py-3 flex items-center text-[10px] uppercase font-mono text-text3 border-r border-border shrink-0 z-20 sticky left-0 bg-bg3"
              style={{ width: LABEL_WIDTH }}
            >
              Task Information
            </div>
            {days.map(d => (
              <div 
                key={d.iso} 
                className={cn(
                  "flex flex-col items-center justify-center border-r border-border/40 text-center select-none",
                  d.isToday && "bg-accent/5 text-accent"
                )}
                style={{ width: dayWidth, height: 48 }}
              >
                <span className="text-[10px] opacity-40 font-mono uppercase">{d.name}</span>
                <span className="text-[12px] font-bold font-mono">{d.num}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            {/* Today Indicator Line */}
            <div 
              className="absolute h-full w-[2px] bg-accent/60 z-[5] pointer-events-none"
              style={{ left: LABEL_WIDTH + todayOffset }}
            >
              <div className="absolute top-0 transform -translate-x-1/2 -translate-y-full bg-accent text-white text-[8px] font-mono px-1 rounded uppercase tracking-tighter shadow-lg">
                Today
              </div>
            </div>

            {/* Vertical grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div style={{ width: LABEL_WIDTH }} className="shrink-0" />
              {days.map(d => (
                <div key={d.iso} style={{ width: dayWidth }} className="border-r border-border/20 h-full" />
              ))}
            </div>

            {/* Rows */}
            <div className="relative z-10">
              {filteredTasks.map(task => {
                const effectiveStartDate = task.startDate || task.dueDate;
                const startOffset = getDayOffset(effectiveStartDate);
                const barWidth = getTaskWidth(task);
                const assignee = USERS.find(u => u.id === task.assigneeId);
                const viewingUsers = (task.viewingUserIds || [])
                  .map(uid => USERS.find(u => u.id === uid))
                  .filter(Boolean);

                return (
                  <div 
                    key={task.id} 
                    className="flex border-b border-border/30 hover:bg-bg3/30 transition-colors group"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div 
                      className="px-4 flex items-center gap-2 border-r border-border shrink-0 z-20 sticky left-0 bg-bg2 group-hover:bg-bg3 transition-colors"
                      style={{ width: LABEL_WIDTH }}
                    >
                      <span className="truncate text-[11px] font-medium text-text group-hover:text-accent transition-colors">
                        <Highlight text={task.title} query={searchQuery} />
                      </span>
                      {viewingUsers.map(vUser => vUser && (
                        <div 
                          key={vUser.id}
                          className={cn("w-2 h-2 rounded-full border border-accent animate-pulse", vUser.color)} 
                          title={`${vUser.name} is viewing`}
                        />
                      ))}
                    </div>
                    
                    <div className="relative flex-1">
                      {(startOffset + barWidth / dayWidth >= 0) && (startOffset < days.length) && (
                        <div 
                          className={cn(
                            "absolute top-2.5 rounded-full border px-2 flex items-center overflow-hidden transition-all hover:scale-y-110 hover:brightness-110 cursor-pointer z-[2] group/bar shadow-lg shadow-black/20",
                            task.priority === 'critical' && "bg-red/20 border-red/40 text-red",
                            task.priority === 'high' && "bg-orange/20 border-orange/40 text-orange",
                            task.priority === 'medium' && "bg-yellow/20 border-yellow/40 text-yellow",
                            task.priority === 'low' && "bg-green/20 border-green/40 text-green",
                            !task.startDate && "w-6 ring-2 ring-accent ring-offset-2 ring-offset-bg2" 
                          )}
                          style={{ 
                            left: Math.max(0, startOffset * dayWidth) + 4,
                            width: !task.startDate ? 24 : Math.min(days.length * dayWidth, barWidth),
                            height: 24,
                            fontSize: '9px',
                            fontWeight: 700
                          }}
                        >
                          <span className="truncate opacity-80 uppercase tracking-tighter">
                            {assignee?.initials} {!task.startDate && '• DUE'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center text-text3 opacity-40 sticky left-0" style={{ width: LABEL_WIDTH + 400 }}>
                  <p className="text-sm font-mono uppercase tracking-widest mt-12">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
