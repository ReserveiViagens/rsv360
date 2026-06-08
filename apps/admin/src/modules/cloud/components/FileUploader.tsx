import { useCallback, useMemo, type ComponentPropsWithoutRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/src/lib/utils';

export function FileUploader({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => onFiles(acceptedFiles), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const borderClass = useMemo(() => (isDragActive ? 'border-slate-900 bg-slate-50' : 'border-dashed border-slate-300'), [isDragActive]);

  const rootProps = getRootProps() as ComponentPropsWithoutRef<'div'>;

  return (
    <Card>
      <CardContent className="p-0">
        <div
          {...rootProps}
          className={cn('flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl p-6 text-center transition', borderClass, rootProps.className)}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-8 w-8 text-slate-500" />
          <div>
            <p className="font-medium text-slate-900">Arraste e solte arquivos aqui</p>
            <p className="text-sm text-slate-500">Ou clique para selecionar do computador</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
