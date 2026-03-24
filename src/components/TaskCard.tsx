import React from 'react';
import type { Task, Priority } from '../types';
import { USERS } from '../utils/mockData';
import { useDrag } from '../context/DragContext';
import { useTaskStore } from '../store/useTaskStore';
import Highlight from './Highlight';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: Task;
  isPlaceholder?: boolean;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-red/10 text-red border-red/20',
  high: 'bg-orange/10 text-orange border-orange/20',
  medium: 'bg-yellow/10 text-yellow border-yellow/20',
  low: 'bg-green/10 text-green border-green/20',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, isPlaceholder }) => {
  const { startDrag } = useDrag();
  const assignee = USERS.find((u) => u.id === task.assigneeId);
  const viewingUsers = (task.viewingUserIds || [])
    .map(uid => USERS.find(u => u.id === uid))
    .filter(Boolean);

  const { searchQuery } = useTaskStore();
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPlaceholder) return;
    startDrag(task, e);
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate < today && task.status !== 'done';
  const isDueToday = task.dueDate === today && task.status !== 'done';

  const diffDays = (d1: string, d2: string) => {
    const dt1 = new Date(d1);
    const dt2 = new Date(d2);
    return Math.floor((dt2.getTime() - dt1.getTime()) / (1000 * 3600 * 24));
  };

  const overdueDays = diffDays(task.dueDate, today);
  const overdueLabel = isDueToday 
    ? 'DUE TODAY' 
    : isOverdue 
      ? (overdueDays > 7 ? `${overdueDays} days overdue` : `${overdueDays}d ago`) 
      : task.dueDate;

  if (isPlaceholder) {
    return (
      <div className="h-20 border-2 border-dashed border-border2 rounded-lg bg-accent-glow" />
    );
  }

  return (
    <div
      className={cn(
        "bg-bg3 border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all select-none hover:border-border2 hover:-translate-y-0.5 hover:shadow-xl",
        viewingUsers.length > 0 && "ring-1 ring-accent shadow-[0_0_8px_rgba(108,99,255,0.4)]"
      )}
      onPointerDown={handlePointerDown}
    >
      <div className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono border mb-2",
        PRIORITY_STYLES[task.priority]
      )}>
        {task.priority}
      </div>
      
      <h3 className="text-sm font-medium leading-relaxed mb-3 text-text">
        <Highlight text={task.title} query={searchQuery} />
      </h3>
      
      <div className="flex items-center justify-between gap-2">
        <div className={cn(
          "text-[10px] font-mono",
          isOverdue ? "text-red" : isDueToday ? "text-yellow" : "text-text3"
        )}>
          {overdueLabel}
        </div>
        
        <div className="flex -space-x-1.5 overflow-hidden">
          {assignee && (
            <div 
              className={cn(
                "w-5 h-5 rounded-full border border-bg3 flex items-center justify-center text-[9px] font-bold text-white z-[1]",
                assignee.color
              )}
              title={assignee.name}
            >
              {assignee.initials}
            </div>
          )}
          {viewingUsers.slice(0, 2).map((user, idx) => user && (
            <div 
              key={user.id}
              className={cn(
                "w-5 h-5 rounded-full border border-accent animate-pulse-slow flex items-center justify-center text-[9px] font-bold text-white transition-all duration-500",
                user.color
              )}
              style={{ zIndex: 10 - idx }}
              title={`${user.name} is viewing`}
            >
              {user.initials}
            </div>
          ))}
          {viewingUsers.length > 2 && (
            <div className="w-5 h-5 rounded-full border border-accent bg-bg4 flex items-center justify-center text-[8px] font-bold text-text3 z-[5] transition-all duration-500">
              +{viewingUsers.length - 2}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
