import { Progress } from '@/components/ui/progress';

export function ChecklistProgress({ done, total }: { done: number; total: number }) {
  const value = total ? (done / total) * 100 : 0;
  return <Progress value={value} />;
}
