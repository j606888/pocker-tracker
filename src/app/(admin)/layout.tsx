export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full bg-bg text-fg">{children}</div>;
}
