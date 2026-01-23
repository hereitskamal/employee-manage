export default function ChartCard({
    title,
    children,
    className = "",
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            {title && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}