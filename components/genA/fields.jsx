export default function Fields({cols = 1, title = null, children, ...props}) {
    if(!children)
        return;

    const xs = 12 / cols;
    let rows = children.length / cols;

    const remainder = children.length % cols;

    if (remainder > 0)
        rows++;

    const buildGrid = () => {
        if (xs == 12)
            return <>{children}</>

        const rowIndices = [];

        for (let i = 0; i < rows; i++) {
            rowIndices.push(i);
        }

        const columnIndices = [];

        for (let i = 0; i < cols; i++) {
            columnIndices.push(i);
        }

        return <div className="space-y-5">
            {rowIndices.map(i => <div key={i} class={`grid grid-cols-${cols} gap-4`} {...props}>
                {columnIndices.map(j =>
                {
                    const index = i * cols + j;

                    return index < children.length ? <div key={index}>
                        {children[index]}
                    </div> : <></>
                })
                }
            </div>)}
        </div>
    }

    const content = buildGrid();

    if (!title)
        return content;

    return <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-100 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-500/20">
            {title}
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1726]">
            {content}
        </div>
    </div>
}
