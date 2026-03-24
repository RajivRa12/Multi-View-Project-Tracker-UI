import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Status } from '../types';
import TaskCard from '../components/TaskCard';
import { useDrag } from '../context/DragContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const COLUMNS: { status: Status; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-blue' },
  { status: 'inprogress', title: 'In Progress', color: 'bg-accent' },
  { status: 'inreview', title: 'In Review', color: 'bg-yellow' },
  { status: 'done', title: 'Done', color: 'bg-green' },
];

const KanbanView: React.FC = () => {
  const { tasks, filters, updateTask, searchQuery } = useTaskStore();
  const { dragState, onDragMove, onDragEnd } = useDrag();
  
  // Filtering tasks
  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.status.length && !filters.status.includes(t.status)) return false;
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    if (filters.assignee.length && !filters.assignee.includes(t.assigneeId)) return false;
    if (filters.dateRange.start && t.dueDate < filters.dateRange.start) return false;
    if (filters.dateRange.end && t.dueDate > filters.dateRange.end) return false;
    return true;
  });

  const handlePointerUp = () => {
    if (dragState.isDragging && dragState.task && !dragState.isSnapping) {
      if (dragState.currentStatus && dragState.currentStatus !== dragState.startStatus) {
        updateTask(dragState.task.id, { status: dragState.currentStatus as Status });
      }
      onDragEnd(dragState.currentStatus as Status);
    }
  };

  return (
    <div 
      className="grid grid-cols-4 gap-4 h-[calc(100vh-160px)] min-h-[500px]"
      onPointerMove={onDragMove}
      onPointerUp={handlePointerUp}
    >
      {COLUMNS.map(col => {
        const colTasks = filteredTasks.filter(t => t.status === col.status);
        const isOver = dragState.currentStatus === col.status && dragState.isDragging;
        
        return (
          <div 
            key={col.status}
            data-status={col.status}
            className={cn(
              "bg-bg2 border border-border rounded-xl flex flex-col overflow-hidden transition-all",
              isOver && "border-accent ring-1 ring-accent bg-accent/5 shadow-[inset_0_0_20px_rgba(108,99,255,0.1)]"
            )}
          >
            <div className="p-4 flex items-center gap-3 border-b border-border shrink-0">
              <div className={cn("w-2 h-2 rounded-full", col.color)} />
              <h3 className="font-syne font-bold text-xs uppercase tracking-wider text-text">
                {col.title}
              </h3>
              <span className="ml-auto bg-bg3 text-text3 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {colTasks.length === 0 && !isOver ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-text3 p-8 border-2 border-dashed border-border/10 rounded-lg">
                  <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="text-xs font-mono uppercase tracking-tight">Empty Column</p>
                </div>
              ) : (
                <>
                  {colTasks.map(task => (
                    // Hide original task if it's being dragged
                    task.id === dragState.task?.id ? (
                      <TaskCard key={task.id} task={task} isPlaceholder />
                    ) : (
                      <TaskCard key={task.id} task={task} />
                    )
                  ))}
                  {/* If dragging and hovering this column but task is not from here, show placeholder */}
                  {isOver && dragState.task?.status !== col.status && (
                    <TaskCard task={dragState.task!} isPlaceholder />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* DRAG PREVIEW */}
      {dragState.isDragging && dragState.task && dragState.dragPos && (
        <div 
          className={cn(
            "fixed z-[9999] pointer-events-none opacity-90 shadow-2xl scale-[1.02] rotate-2",
            dragState.isSnapping ? "transition-all duration-300 ease-out" : "transition-[none]"
          )}
          style={{
            left: dragState.dragPos.x - (dragState.offset?.x || 0),
            top: dragState.dragPos.y - (dragState.offset?.y || 0),
            width: '260px'
          }}
        >
          <div className="bg-bg3 border border-accent rounded-lg p-3 ring-1 ring-accent">
            <div className="bg-text3/10 w-12 h-4 rounded mb-2" />
            <div className="text-sm font-medium text-text mb-3">
              {dragState.task.title}
            </div>
            <div className="flex justify-between items-center">
              <div className="bg-text3/10 w-16 h-3 rounded" />
              <div className="bg-text3/10 w-6 h-6 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanView;
