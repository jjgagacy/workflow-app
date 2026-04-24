export const SearchNavigate = () => {
  return (
    <div className="px-4 py-2.5 bg-background border-t border-[var(--border)] flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span>↑</span>
          <span>↓</span>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-card border border-[var(--border-card)] rounded">↵</kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-card border border-[var(--border-card)] rounded">esc</kbd>
          <span>Close</span>
        </div>
      </div>
    </div>
  );
}