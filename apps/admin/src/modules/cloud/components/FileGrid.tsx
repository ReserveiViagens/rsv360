import { FileText, Image as ImageIcon, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FileItem } from '../types';
import { formatDate } from '@/src/lib/format';

export function FileGrid({ files }: { files: FileItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => {
        const isImage = file.mime_type?.startsWith('image/');
        return (
          <Card key={file.id} className="overflow-hidden">
            <div className="flex h-40 items-center justify-center bg-slate-100">
              {isImage ? <img src={file.thumbnail_url || file.url || ''} alt={file.name} className="h-full w-full object-cover" /> : <FileText className="h-10 w-10 text-slate-400" />}
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(file.created_at)}</p>
                </div>
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{file.mime_type || 'arquivo'}</Badge>
                <Badge variant="secondary">{Math.round((file.size || 0) / 1024)} KB</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
