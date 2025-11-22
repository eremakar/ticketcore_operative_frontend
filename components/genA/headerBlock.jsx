export default function HeaderBlock({ title, description, badge, accent }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/75 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
            {(badge || accent) && (
                <div className="flex flex-col items-start gap-2 sm:items-end">
                    {badge && (
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                            {badge}
                        </span>
                    )}
                    {accent && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                            {accent}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

