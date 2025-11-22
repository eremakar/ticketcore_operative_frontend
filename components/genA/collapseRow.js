import React, { useState } from 'react';

const CollapseRow = ({ colSpan, renderRow, renderCollapse }) => {
    const [expanded, setExpanded] = useState(true);
    return (
        <>
            <tr onClick={() => setExpanded(!expanded)}>
                {renderRow ? renderRow() : <td colSpan={colSpan} />}
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={colSpan}>
                        {renderCollapse && renderCollapse()}
                    </td>
                </tr>
            )}
        </>
    );
};

export default CollapseRow;


