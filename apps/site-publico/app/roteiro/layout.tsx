import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  manifest: '/roteiro/manifest.webmanifest',
  themeColor: '#b45309',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Carteira RSV',
  },
};

export default function RoteiroLayout({ children }: { children: ReactNode }) {
  return children;
}
