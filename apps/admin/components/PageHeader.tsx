import type { ReactNode } from 'react';
import { Badge } from './ui/badge';
import { Card, CardDescription, CardTitle } from './ui/card';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <Card className="mb-6 border-slate-200 bg-gradient-to-r from-white to-slate-50">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description ? <CardDescription className="max-w-3xl text-sm leading-6">{description}</CardDescription> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </Card>
  );
}
