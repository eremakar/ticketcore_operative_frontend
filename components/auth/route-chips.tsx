'use client';

import React, { useState } from 'react';

type RouteChipsProps = {
    routes: string[];
    initialCount?: number; // used in grid mode
    className?: string;
    scatter?: boolean; // if true, render scattered overlay
    topMin?: number; // percent 0..100
    topMax?: number; // percent 0..100
    leftMin?: number; // percent 0..100
    leftMax?: number; // percent 0..100
    overlay?: boolean; // render container as absolute overlay
};

const RouteChips: React.FC<RouteChipsProps> = ({ routes, initialCount = 6, className, scatter = false, topMin = 10, topMax = 80, leftMin = 5, leftMax = 90, overlay = false }) => {
    const [showAll] = useState(true);

    // Deterministic pseudo-random helpers
    const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };

    if (scatter) {
        // Absolute scatter (may overlap). Use only when artistic overlap acceptable
        const positions = routes.map((r, i) => {
            const h = hash(r + i);
            const topRange = Math.max(0, Math.min(100, topMax)) - Math.max(0, Math.min(100, topMin));
            const leftRange = Math.max(0, Math.min(100, leftMax)) - Math.max(0, Math.min(100, leftMin));
            const top = Math.min(100, Math.max(0, topMin)) + (h % Math.max(1, topRange));
            const left = Math.min(100, Math.max(0, leftMin)) + ((h >>> 8) % Math.max(1, leftRange));
            const rotate = ((h >>> 16) % 7) - 3; // -3..+3 deg
            const opacity = 0.85 - (((h >>> 24) % 20) / 200); // 0.75..0.85
            return { top: `${top}%`, left: `${left}%`, rotate, opacity };
        });

        return (
            <div className={`absolute inset-0 pointer-events-none ${className || ''}`}>
                {routes.map((title, idx) => (
                    <div
                        key={idx}
                        className="absolute rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm shadow-sm"
                        style={{ top: positions[idx].top, left: positions[idx].left, transform: `rotate(${positions[idx].rotate}deg)`, opacity: positions[idx].opacity }}
                    >
                        {title}
                    </div>
                ))}
            </div>
        );
    }

    // Non-overlapping grid layout (optionally as overlay)
    const visibleRoutes = showAll ? routes : routes.slice(0, initialCount);
    const shuffled = [...visibleRoutes].sort((a, b) => (hash(a) % 997) - (hash(b) % 997));
    const containerBase = `grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 text-white ${className || ''}`;
    const container = overlay ? `absolute inset-0 p-4 pointer-events-none ${containerBase}` : `mt-6 w-full max-w-[520px] ${containerBase}`;
    return (
        <div className={container}>
            {shuffled.map((title, idx) => (
                <div key={idx} className="rounded-md border border-white/30 bg-white/10 px-3 py-1 text-center text-xs backdrop-blur-sm">
                    {title}
                </div>
            ))}
        </div>
    );
};

export default RouteChips;


