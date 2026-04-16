import { Cloud, HardDrive } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { useCloudFiles, useCloudUsage } from '@/src/modules/cloud/hooks';
import { StorageUsageBar } from '@/src/modules/cloud/components/StorageUsageBar';
import { FileGrid } from '@/src/modules/cloud/components/FileGrid';

export default function CloudDashboardPage() {
  const { data: files = [] } = useCloudFiles();
  const { data: usage } = useCloudUsage();

  return (
    <div className="space-y-6">
      <PageHeader badge="Cloud" title="Cloud & Storage" description="Uso do storage, arquivos recentes e mídia." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Arquivos" value={files.length} icon={<Cloud className="h-4 w-4" />} />
        <StatCard label="Uso (%)" value={usage?.percent ?? 0} icon={<HardDrive className="h-4 w-4" />} tone="warning" />
        <StatCard label="Cota usada" value={usage?.usedBytes ?? 0} icon={<HardDrive className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <StorageUsageBar usage={usage} />
        <Card>
          <CardContent className="p-5">
            <FileGrid files={files.slice(0, 6)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
