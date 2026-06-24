type MarketingPageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function MarketingPageHeader({
  title,
  description,
  action,
}: MarketingPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">
          Marketing Lab
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
