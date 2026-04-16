import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ImagePreview({ src, alt, onClose }: { src?: string; alt?: string; onClose: () => void }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <Card className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden">
        <Button variant="ghost" size="icon" className="absolute right-3 top-3 z-10 bg-white/90" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardContent className="p-0">
          <img src={src} alt={alt || 'preview'} className="max-h-[90vh] w-full object-contain" />
        </CardContent>
      </Card>
    </div>
  );
}
