export const NodeHeader = ({ title, icon, iconColor }: { title: string; icon?: React.ReactNode, iconColor?: string }) => {
  return (
    <div className="node-header flex items-center gap-1 px-1 py-1.5">
      {icon && (
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconColor} [&>svg]:h-5 [&>svg]:w-5`}>
          {icon}
        </span>
      )}
      <span className="truncate text-sm font-medium tracking-[0.01em] text-[var(--color-text-primary)]">
        {title}
      </span>
    </div>
  );
}

export const BranchItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div
      key={id}
      className="relative flex min-h-11 p-2 items-center rounded-lg border border-[var(--border)] bg-muted/20"
    >
      {children}
    </div>
  );
}