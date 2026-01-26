export default interface Task {
  id: number | null;
  userId: number;
  // date_created: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  recurring: boolean;
  recurringFrequency: string;
  status: string;
  completed: boolean;
  date_completed: string;
}
