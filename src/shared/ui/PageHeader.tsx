interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6 animate-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>
    </header>
  );
}
