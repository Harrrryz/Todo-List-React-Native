export interface Todo {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  detail?: string; // Optional field for additional details
} 