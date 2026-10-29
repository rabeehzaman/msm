export function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state py-10">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
