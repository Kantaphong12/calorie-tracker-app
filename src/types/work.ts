export default interface Task {
  id: number | null;
  userId: number;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  recurring: boolean;
  recurringFrequency: string;
  status: string;
  completed: boolean;
}
