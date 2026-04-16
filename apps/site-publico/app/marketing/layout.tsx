export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      {children}
    </main>
  );
}
