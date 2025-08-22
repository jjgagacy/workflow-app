export const PageContainer = ({ children, scrollable }: { children: React.ReactNode, scrollable?: boolean }) => {
    return (
        <div className={`flex flex-1 max-w-6xl mx-auto ${scrollable ? 'overflow-y-auto' : ''}`}>
            {children}
        </div>
    );
}