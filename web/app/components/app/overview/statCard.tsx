export const StatCard = ({ icon: Icon, title, value, color }: { icon: any; title: string; value: string; color: string }) => {
  return (
    <div className="bg-card-light rounded-xl border border-[var(--border-light)] p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-card`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-gray-200`} />
        </div>
      </div>
    </div>
  );
};
