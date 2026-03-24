import { createContext, useContext, useState, useCallback } from 'react';
import type { Task, Status } from '../types';

interface DragState {
  task: Task | null;
  startStatus: Status | null;
  currentStatus: Status | null;
  dragPos: { x: number; y: number } | null;
  startPos: { x: number; y: number } | null;
  offset: { x: number; y: number } | null;
  isDragging: boolean;
  isSnapping: boolean;
}

interface DragContextType {
  dragState: DragState;
  startDrag: (task: Task, event: React.PointerEvent) => void;
  onDragMove: (event: React.PointerEvent) => void;
  onDragEnd: (dropStatus: Status | null) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dragState, setDragState] = useState<DragState>({
    task: null,
    startStatus: null,
    currentStatus: null,
    dragPos: null,
    startPos: null,
    offset: null,
    isDragging: false,
    isSnapping: false,
  });

  const startDrag = useCallback((task: Task, event: React.PointerEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    setDragState({
      task,
      startStatus: task.status,
      currentStatus: task.status,
      dragPos: { x: event.clientX, y: event.clientY },
      startPos: { x: event.clientX, y: event.clientY },
      offset,
      isDragging: true,
      isSnapping: false,
    });
    
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }, []);

  const onDragMove = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || dragState.isSnapping) return;
    
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const dropZone = element?.closest('[data-status]') as HTMLElement;
    const newStatus = dropZone?.dataset.status as Status | undefined;

    setDragState((prev) => ({
      ...prev,
      dragPos: { x: event.clientX, y: event.clientY },
      currentStatus: newStatus || null,
    }));
  }, [dragState.isDragging, dragState.isSnapping]);

  const onDragEnd = useCallback((dropStatus: Status | null) => {
    if (!dragState.isDragging) return;
    
    if (!dropStatus) {
      // SNAP BACK
      setDragState(prev => ({ ...prev, isSnapping: true, dragPos: prev.startPos }));
      
      setTimeout(() => {
        setDragState({
          task: null, startStatus: null, currentStatus: null, dragPos: null, startPos: null, offset: null, isDragging: false, isSnapping: false,
        });
      }, 300);
    } else {
      setDragState({
        task: null, startStatus: null, currentStatus: null, dragPos: null, startPos: null, offset: null, isDragging: false, isSnapping: false,
      });
    }
  }, [dragState.isDragging]);

  return (
    <DragContext.Provider value={{ dragState, startDrag, onDragMove, onDragEnd }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = () => {
  const context = useContext(DragContext);
  if (!context) throw new Error('useDrag must be used within a DragProvider');
  return context;
};
