'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type ScatterChipsProps = {
    routes: string[];
    avoidSelectors?: string[]; // CSS selectors to avoid (no overlap)
    className?: string;
    margin?: number; // spacing between chips in px
    maxAttempts?: number; // attempts per chip
};

type Placed = { left: number; top: number; width: number; height: number; title: string };

const CHIP_CLASS = 'rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm shadow-sm';

const ScatterChips: React.FC<ScatterChipsProps> = ({ routes, avoidSelectors = [], className, margin = 4, maxAttempts = 1000 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [placed, setPlaced] = useState<Placed[]>([]);

    // Measure chip sizes using hidden measuring container
    const titles = useMemo(() => routes, [routes]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const compute = () => {
            const bounds = container.getBoundingClientRect();
            const avoidRects: DOMRect[] = [];
            avoidSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    const r = (el as HTMLElement).getBoundingClientRect();
                    // convert to container space
                    const cr = new DOMRect(r.left - bounds.left, r.top - bounds.top, r.width, r.height);
                    avoidRects.push(cr);
                });
            });

            // Measure each title size
            const measure = measureRef.current;
            if (!measure) return;
            measure.innerHTML = '';
            const sizes = titles.map(title => {
                const span = document.createElement('div');
                span.className = CHIP_CLASS;
                span.style.position = 'absolute';
                span.style.visibility = 'hidden';
                span.textContent = title;
                measure.appendChild(span);
                const rect = span.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });
            measure.innerHTML = '';

            // Place chips using simple rejection sampling with collision checks
            const placedLocal: Placed[] = [];
            const W = bounds.width;
            const H = bounds.height;

            const intersects = (a: Placed, b: Placed) => {
                return !(a.left + a.width + margin <= b.left ||
                         b.left + b.width + margin <= a.left ||
                         a.top + a.height + margin <= b.top ||
                         b.top + b.height + margin <= a.top);
            };
            const rectIntersects = (a: Placed, r: DOMRect) => {
                return !(a.left + a.width + margin <= r.left ||
                         r.left + r.width + margin <= a.left ||
                         a.top + a.height + margin <= r.top ||
                         r.top + r.height + margin <= a.top);
            };

            // Deterministic order by hash for stability
            const hash = (s: string) => {
                let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h;
            };
            const indexed = titles.map((t, i) => ({ t, i, h: hash(t + ':' + i) }));
            indexed.sort((a, b) => a.h - b.h);

            indexed.forEach((item, idx) => {
                const size = sizes[item.i];
                let ok = false;
                let candidate: Placed | null = null;
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    const randH = (hash(item.t + ':' + item.i + ':' + attempt) >>> 8);
                    const x = (randH % Math.max(1, Math.floor(W - size.width - margin))) + margin / 2;
                    const y = ((randH >>> 8) % Math.max(1, Math.floor(H - size.height - margin))) + margin / 2;
                    candidate = { left: x, top: y, width: size.width, height: size.height, title: item.t };
                    if (avoidRects.some(r => rectIntersects(candidate!, r))) continue;
                    if (placedLocal.some(p => intersects(candidate!, p))) continue;
                    ok = true; break;
                }
                if (ok && candidate) placedLocal.push(candidate);
            });

            setPlaced(placedLocal);
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(container);
        window.addEventListener('resize', compute);
        return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
    }, [titles, avoidSelectors]);

    return (
        <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className || ''}`}>
            <div ref={measureRef} style={{ position: 'absolute', inset: 0, visibility: 'hidden' }} />
            {placed.map((p, idx) => (
                <div key={idx} className={CHIP_CLASS} style={{ position: 'absolute', left: p.left, top: p.top }}>
                    {p.title}
                </div>
            ))}
        </div>
    );
};

export default ScatterChips;


