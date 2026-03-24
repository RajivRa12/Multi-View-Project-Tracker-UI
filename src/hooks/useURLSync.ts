import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { ViewType, Status, Priority } from '../types';

export const useURLSync = () => {
  const { filters, view, setFilters, setView } = useTaskStore();
  const isInitialLoad = useRef(true);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const status = params.get('status')?.split(',') as Status[] | undefined;
    const priority = params.get('priority')?.split(',') as Priority[] | undefined;
    const assignee = params.get('assignee')?.split(',');
    const start = params.get('start') || '';
    const end = params.get('end') || '';
    const viewParam = params.get('view') as ViewType | null;

    if (status || priority || assignee || start || end) {
      setFilters({
        status: status || [],
        priority: priority || [],
        assignee: assignee || [],
        dateRange: { start, end },
      });
    }

    if (viewParam) {
      setView(viewParam);
    }

    isInitialLoad.current = false;
  }, [setFilters, setView]);

  // Sync to URL on changes
  useEffect(() => {
    if (isInitialLoad.current) return;

    const params = new URLSearchParams();
    
    if (filters.status.length) params.set('status', filters.status.join(','));
    if (filters.priority.length) params.set('priority', filters.priority.join(','));
    if (filters.assignee.length) params.set('assignee', filters.assignee.join(','));
    if (filters.dateRange.start) params.set('start', filters.dateRange.start);
    if (filters.dateRange.end) params.set('end', filters.dateRange.end);
    if (view !== 'kanban') params.set('view', view);

    const qs = params.toString();
    const newURL = qs ? `?${qs}` : window.location.pathname;
    
    if (window.location.search !== `?${qs}` && !(window.location.search === '' && qs === '')) {
      window.history.pushState({}, '', newURL);
    }
  }, [filters, view]);
};
