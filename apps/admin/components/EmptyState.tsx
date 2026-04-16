import type { ReactNode } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="max-w-lg space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action ?? <Button variant="outline">Atualizar</Button>}
      </CardContent>
    </Card>
  );
}
