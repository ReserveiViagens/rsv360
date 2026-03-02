import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard RSV - Sistema de Gerenciamento",
  description: "Dashboard principal do sistema RSV 360",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
