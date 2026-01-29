type ContentProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const ContentSection = ({ title, description, children }: ContentProps) => (
  <div className="">
    <div className="px-6 pb-2 md:px-8 mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">{description}</p>
      )}
    </div>
    <div className="px-6 md:px-8">
      {children}
    </div>
  </div>
);