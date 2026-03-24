import type { Task, User, Status, Priority } from '../types';

export const USERS: User[] = [
  { id: 'u0', name: 'Alex Rivera', initials: 'AR', color: 'av0' },
  { id: 'u1', name: 'Sam Chen', initials: 'SC', color: 'av1' },
  { id: 'u2', name: 'Jordan Lee', initials: 'JL', color: 'av2' },
  { id: 'u3', name: 'Taylor Kim', initials: 'TK', color: 'av3' },
  { id: 'u4', name: 'Morgan Wu', initials: 'MW', color: 'av4' },
  { id: 'u5', name: 'Casey Park', initials: 'CP', color: 'av5' },
];

const STATUSES: Status[] = ['todo', 'inprogress', 'inreview', 'done'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

const TASK_NAMES = [
  'Implement authentication flow', 'Design onboarding screens', 'Fix payment gateway bug', 'Optimize database queries',
  'Write API documentation', 'Set up CI/CD pipeline', 'Create user dashboard', 'Refactor legacy codebase',
  'Add dark mode support', 'Implement search functionality', 'Fix mobile responsiveness', 'Update dependencies',
  'Create admin panel', 'Add export feature', 'Implement notifications', 'Write unit tests',
  'Performance audit', 'Accessibility improvements', 'SEO optimization', 'Implement caching layer',
  'Add rate limiting', 'Create email templates', 'Build analytics dashboard', 'Implement OAuth',
  'Add webhook support', 'Create data migration', 'Fix memory leak', 'Implement lazy loading',
  'Add error tracking', 'Create backup system', 'Implement file upload', 'Add audit logging',
  'Build reporting feature', 'Implement versioning', 'Create API gateway', 'Add monitoring',
  'Implement feature flags', 'Build billing system', 'Add multi-tenancy', 'Create SDK',
];

export const generateTasks = (count: number = 520): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const startRange = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const dueRange = startRange + Math.floor(Math.random() * 14) + 1; // 1-14 days after start
    const includeStartDate = Math.random() > 0.2;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + startRange);
    
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + dueRange);

    tasks.push({
      id: `t-${i}`,
      title: `${TASK_NAMES[i % TASK_NAMES.length]}${i >= TASK_NAMES.length ? ` (Phase ${Math.floor(i / TASK_NAMES.length) + 1})` : ''}`,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      assigneeId: USERS[Math.floor(Math.random() * USERS.length)].id,
      startDate: includeStartDate ? startDate.toISOString().split('T')[0] : '',
      dueDate: dueDate.toISOString().split('T')[0],
    });
  }
  
  return tasks;
};
