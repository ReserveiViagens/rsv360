import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCloudFiles, useDeleteFile, useUploadFile } from '@/src/modules/cloud/hooks';
import { FileUploader } from '@/src/modules/cloud/components/FileUploader';
import { FileGrid } from '@/src/modules/cloud/components/FileGrid';
import { FileList } from '@/src/modules/cloud/components/FileList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FileManagerPage() {
  const { data = [] } = useCloudFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Cloud"
        title="Gerenciador de arquivos"
        description="Upload, filtros e visualização em grid ou lista."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar arquivo..." />
          <Select defaultValue=""><option value="">Todos tipos</option><option value="image">Imagem</option><option value="pdf">PDF</option></Select>
          <Select defaultValue=""><option value="">Ordenar</option><option value="recent">Recentes</option></Select>
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>{view === 'grid' ? 'Lista' : 'Grid'}</Button>
          </div>
        </CardContent>
      </Card>

      <FileUploader
        onFiles={(files) => {
          const formData = new FormData();
          files.forEach((file) => formData.append('files', file));
          uploadFile.mutate(formData);
        }}
      />

      <Tabs>
        <TabsList>
          <TabsTrigger data-active={view === 'grid'} onClick={() => setView('grid')}>Grid</TabsTrigger>
          <TabsTrigger data-active={view === 'list'} onClick={() => setView('list')}>Lista</TabsTrigger>
        </TabsList>
        <TabsContent>
          {view === 'grid' ? (
            <FileGrid files={data} />
          ) : (
            <FileList files={data} onDelete={(id) => deleteFile.mutate(id)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
