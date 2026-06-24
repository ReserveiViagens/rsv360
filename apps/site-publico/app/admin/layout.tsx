import { LabLayout } from '@/components/lab/LabLayout';

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LabLayout>{children}</LabLayout>;
}
