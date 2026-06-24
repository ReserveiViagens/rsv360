import { LabLayout } from '@/components/lab/LabLayout';

export default function CrmSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LabLayout>{children}</LabLayout>;
}
