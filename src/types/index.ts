export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'inprogress' | 'inreview' | 'done';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  startDate: string;
  dueDate: string;
  viewingUserIds?: string[]; // Multiple users can view a task
}

export interface FilterState {
  status: Status[];
  priority: Priority[];
  assignee: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export type ViewType = 'kanban' | 'list' | 'timeline';

export type SortField = 'title' | 'priority' | 'dueDate';
export type SortOrder = 'asc' | 'desc';
