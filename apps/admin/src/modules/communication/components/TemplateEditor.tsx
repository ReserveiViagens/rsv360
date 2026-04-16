import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function TemplateEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [focus, setFocus] = useState(false);

  return (
    <Card className={focus ? 'border-slate-400' : ''}>
      <CardContent className="space-y-3 p-4">
        <Label>Conteúdo do template</Label>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          rows={14}
          placeholder="Olá {{first_name}}, sua reserva ..."
          className="font-mono text-sm"
        />
        <p className="text-xs text-slate-500">Use placeholders como <code>{'{{first_name}}'}</code>, <code>{'{{booking_id}}'}</code> e <code>{'{{property_name}}'}</code>.</p>
      </CardContent>
    </Card>
  );
}
