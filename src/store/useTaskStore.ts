import { create } from 'zustand';
import type { Task, ViewType, FilterState, SortField, SortOrder } from '../types';
import { generateTasks } from '../utils/mockData';

interface TaskLog {
  id: string;
  taskId: string;
  taskTitle: string;
  action: string;
  timestamp: string;
}

interface TaskStore {
  tasks: Task[];
  view: ViewType;
  filters: FilterState;
  sort: { field: SortField; order: SortOrder };
  searchQuery: string;
  viewingUsersCount: number;
  theme: 'dark' | 'light';
  logs: TaskLog[];
  timelineZoom: 'week' | 'month' | 'three-day';
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setView: (view: ViewType) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setSearchQuery: (query: string) => void;
  setSort: (field: SortField) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setTimelineZoom: (zoom: 'week' | 'month' | 'three-day') => void;
  clearFilters: () => void;
  simulateCollaboration: () => void;
  addLog: (log: Omit<TaskLog, 'id' | 'timestamp'>) => void;
}

const DEFAULT_FILTERS: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  dateRange: { start: '', end: '' },
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: generateTasks(520),
  view: 'kanban',
  filters: DEFAULT_FILTERS,
  sort: { field: 'title', order: 'asc' },
  searchQuery: '',
  viewingUsersCount: 0,
  theme: 'dark',
  logs: [],
  timelineZoom: 'month',

  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) =>
    set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      const newLogs = [...state.logs];
      
      if (task && updates.status && updates.status !== task.status) {
        newLogs.unshift({
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          taskTitle: task.title,
          action: `Changed status to ${updates.status}`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      return {
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        logs: newLogs.slice(0, 50),
      };
    }),

  setView: (view) => set({ view }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSort: (field) =>
    set((state) => {
      const order = state.sort.field === field && state.sort.order === 'asc' ? 'desc' : 'asc';
      return { sort: { field, order } };
    }),

  setTheme: (theme) => set({ theme }),
  
  setTimelineZoom: (timelineZoom) => set({ timelineZoom }),

  clearFilters: () => set({ filters: DEFAULT_FILTERS, searchQuery: '' }),

  addLog: (log) => set(state => ({
    logs: [{ 
      ...log, 
      id: Math.random().toString(36).substr(2, 9), 
      timestamp: new Date().toLocaleTimeString() 
    }, ...state.logs].slice(0, 50)
  })),

  simulateCollaboration: () =>
    set((state) => {
      const userPositions: Record<string, string> = {};
      const activeUserCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < activeUserCount; i++) {
        const userId = `u${i}`;
        const randomTaskId = state.tasks[Math.floor(Math.random() * state.tasks.length)].id;
        userPositions[userId] = randomTaskId;
      }

      const newTasks = state.tasks.map((t) => {
        const ids = Object.keys(userPositions).filter(uid => userPositions[uid] === t.id);
        return { ...t, viewingUserIds: ids.length > 0 ? ids : undefined };
      });

      return { tasks: newTasks, viewingUsersCount: activeUserCount };
    }),
}));
