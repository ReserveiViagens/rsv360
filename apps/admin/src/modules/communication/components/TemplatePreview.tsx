import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeArray } from '@/src/lib/format';

export function TemplatePreview({ template, sample }: { template: string; sample?: Record<string, string> }) {
  const rendered = Object.entries(sample || { first_name: 'Ana', booking_id: '1234', property_name: 'RSV360' }).reduce(
    (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
    template,
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Pré-visualização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          {rendered || 'Template vazio.'}
        </div>
        <p className="mt-3 text-xs text-slate-500">Variáveis sugeridas: {safeArray<string>(['first_name', 'booking_id', 'property_name']).join(', ')}</p>
      </CardContent>
    </Card>
  );
}
