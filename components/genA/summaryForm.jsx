export default function SummaryForm({ children, summaryItems, className = "" }) {
    return (
        <section className={`space-y-6 ${className}`}>
            {children}
            {summaryItems && summaryItems.length > 0 && (
                <SummaryRow items={summaryItems} />
            )}
        </section>
    );
}

function SummaryRow({ items }) {
    return (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <div
                    key={item.title}
                    className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-4"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.title}</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{item.value}</p>
                </div>
            ))}
        </div>
    );
}

