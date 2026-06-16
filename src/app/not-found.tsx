import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl font-semibold tracking-tight text-accent">404</p>
      <h1 className="text-2xl font-semibold text-text">Page not found</h1>
      <p className="text-sm text-muted">The page you were looking for does not exist.</p>
      <Link
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-medium text-accent-contrast shadow-soft transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        Back to home
      </Link>
    </div>
  );
}
