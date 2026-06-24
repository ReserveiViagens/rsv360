import type { Metadata } from 'next';
import { LabLayout } from '@/components/lab/LabLayout';

export const metadata: Metadata = {
  title: 'Marketing Lab — RSV360',
  description: 'Hub interno de marketing, analytics e campanhas',
};

export default function LabSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LabLayout>{children}</LabLayout>;
}
