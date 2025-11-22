'use client';

import { useState, useEffect, useRef } from 'react';

const ResourceGrid = ({
    cells = [],
    defaultCellWidths = [],
    minCellWidth = 20,
    maxCellWidth = 80,
    className = "",
    ...props
}) => {
    const [cellWidths, setCellWidths] = useState(defaultCellWidths);
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const containerRef = useRef(null);

    // Initialize cell widths if not provided
    useEffect(() => {
        if (cellWidths.length === 0 && cells.length > 0) {
            const equalWidth = 100 / cells.length;
            setCellWidths(cells.map(() => equalWidth));
        }
    }, [cells.length, cellWidths.length]);

    const handleMouseDown = (index) => (e) => {
        setIsDragging(true);
        setDragIndex(index);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging || dragIndex === null || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const newLeftWidth = (relativeX / containerWidth) * 100;

        // Calculate which cells to resize
        const leftCellIndex = dragIndex - 1;
        const rightCellIndex = dragIndex;

        if (leftCellIndex < 0 || rightCellIndex >= cellWidths.length) return;

        // Calculate current cumulative width up to the splitter
        let cumulativeWidth = 0;
        for (let i = 0; i < leftCellIndex; i++) {
            cumulativeWidth += cellWidths[i];
        }

        // Calculate new widths
        const currentLeftWidth = cellWidths[leftCellIndex];
        const currentRightWidth = cellWidths[rightCellIndex];
        const totalCurrentWidth = currentLeftWidth + currentRightWidth;

        const newLeftCellWidth = ((relativeX - (cumulativeWidth / 100) * containerWidth) / containerWidth) * 100;
        const newRightCellWidth = totalCurrentWidth - newLeftCellWidth;

        // Constrain cell widths
        const constrainedLeftWidth = Math.min(Math.max(newLeftCellWidth, minCellWidth), maxCellWidth);
        const constrainedRightWidth = Math.min(Math.max(newRightCellWidth, minCellWidth), maxCellWidth);

        // Update cell widths
        const newCellWidths = [...cellWidths];
        newCellWidths[leftCellIndex] = constrainedLeftWidth;
        newCellWidths[rightCellIndex] = constrainedRightWidth;

        setCellWidths(newCellWidths);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragIndex(null);
    };

    // Add global mouse events for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, dragIndex, cellWidths, minCellWidth, maxCellWidth]);

    if (cells.length === 0) return null;

    return (
        <div ref={containerRef} className={`flex ${className}`} {...props}>
            {cells.map((cell, index) => (
                <div key={index} className="flex" style={{ width: `${cellWidths[index] || 100 / cells.length}%` }}>
                    {/* Cell Content */}
                    <div
                        className="flex-1 overflow-hidden w-full"
                        style={{ width: `${cellWidths[index] || 100 / cells.length}%`, paddingBottom: '15px' }}
                    >
                        {cell.content}
                    </div>

                    {/* Splitter (except for last cell) */}
                    {index < cells.length - 1 && (
                        <div
                            className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 relative group"
                            onMouseDown={handleMouseDown(index + 1)}
                        >
                            <div className="absolute inset-0 w-2 -ml-1 cursor-col-resize"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ResourceGrid;
