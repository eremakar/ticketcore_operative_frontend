import React from 'react';

const Pagination = ({ labelRowsPerPage, labelDisplayedRows, count, currentPage, rowsPerPage, onPageChange, rowsPerPageOptions = [10, 25, 50, 100], onRowsPerPageChange }) => {
    let totalPages = Math.ceil((count || 0) / (rowsPerPage || 1));
    if (totalPages === 0 && count > 0)
        totalPages = 1;

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const getDisplayedPages = (total) => {
        // If few pages, show all
        if (total <= 12) {
            const all = [];
            for (let i = 1; i <= total; i++) all.push(i);
            return all;
        }

        const pages = [];
        const firstBlockEnd = Math.min(10, total);
        for (let i = 1; i <= firstBlockEnd; i++) {
            pages.push(i);
        }

        if (firstBlockEnd < total - 1) {
            pages.push('ellipsis-right');
        }

        pages.push(total);

        return pages;
    };

    const renderPageNumbers = () => {
        const pages = getDisplayedPages(totalPages);
        return pages.map((p, idx) => {
            if (typeof p !== 'number') {
                return <li key={`ellipsis-${idx}`} className="disabled"><span>…</span></li>;
            }
            return (
                <li key={p} className={p === currentPage ? 'active' : ''}>
                    <a href="#" data-page={p} onClick={(e) => { e.preventDefault(); handlePageClick(p); }}>
                        {p}
                    </a>
                </li>
            );
        });
    };

    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', width: '100%'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{marginLeft: '15px'}}>
                    <label>{labelRowsPerPage || "Всего записей: "}&nbsp;{count}</label>
                </div>
                {onRowsPerPageChange && <div className="flex items-center gap-2">
                    <label>{labelDisplayedRows || "На странице:"}</label>
                    <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))} className="form-select form-select-sm w-auto">
                        {rowsPerPageOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>}
            </div>
            <ul style={{display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap'}} className="pagination">
                <li className="pager">
                    <a href="#" data-page={currentPage - 1} onClick={(e) => { e.preventDefault(); handlePageClick(currentPage - 1); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 rtl:rotate-180">
                            <path d="M13 19L7 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </a>
                </li>
                {renderPageNumbers()}
                <li className="pager">
                    <a href="#" data-page={currentPage + 1} onClick={(e) => { e.preventDefault(); handlePageClick(currentPage + 1); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 rtl:rotate-180">
                            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </a>
                </li>
                <li className="pager">
                    <a href="#" data-page={totalPages} onClick={(e) => { e.preventDefault(); handlePageClick(totalPages); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 rtl:rotate-180">
                            <path d="M11 19L17 12L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path opacity="0.5" d="M6.99976 19L12.9998 12L6.99976 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;
