'use client';

import React, { useEffect, useRef } from 'react';

type AnimeImageProps = {
    src: string;
    alt?: string;
    className?: string;
};

// Simple anime-style effect: posterization + edge outlines (Sobel)
const AnimeImage: React.FC<AnimeImageProps> = ({ src, alt, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;

        const render = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container || !img.complete) return;

            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const width = container.clientWidth || img.naturalWidth;
            const height = container.clientHeight || Math.round((img.naturalHeight / img.naturalWidth) * width);
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.imageSmoothingEnabled = true;
            // object-cover like scaling
            const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
            const dw = Math.round(img.naturalWidth * scale);
            const dh = Math.round(img.naturalHeight * scale);
            const dx = Math.round((canvas.width - dw) / 2);
            const dy = Math.round((canvas.height - dh) / 2);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, dx, dy, dw, dh);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Posterize colors to N levels per channel
            const levels = 5;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.round((Math.floor((data[i] / 255) * (levels - 1)) * (255 / (levels - 1))));
                data[i + 1] = Math.round((Math.floor((data[i + 1] / 255) * (levels - 1)) * (255 / (levels - 1))));
                data[i + 2] = Math.round((Math.floor((data[i + 2] / 255) * (levels - 1)) * (255 / (levels - 1))));
                // Slight saturation boost
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const avg = (r + g + b) / 3;
                data[i] = Math.min(255, Math.round(avg + (r - avg) * 1.3));
                data[i + 1] = Math.min(255, Math.round(avg + (g - avg) * 1.3));
                data[i + 2] = Math.min(255, Math.round(avg + (b - avg) * 1.3));
            }
            ctx.putImageData(imgData, 0, 0);

            // Edge detection (Sobel) -> draw thin black outlines
            const sobel = () => {
                const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const out = ctx.createImageData(canvas.width, canvas.height);
                const s = srcData.data;
                const o = out.data;
                const w = canvas.width, h = canvas.height;
                const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
                const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        let sx = 0, sy = 0;
                        let k = 0;
                        for (let j = -1; j <= 1; j++) {
                            for (let i = -1; i <= 1; i++) {
                                const idx = ((y + j) * w + (x + i)) * 4;
                                const gray = (s[idx] + s[idx + 1] + s[idx + 2]) / 3;
                                sx += gray * gx[k];
                                sy += gray * gy[k];
                                k++;
                            }
                        }
                        const mag = Math.sqrt(sx * sx + sy * sy);
                        const oIdx = (y * w + x) * 4;
                        const v = mag > 120 ? 0 : 255; // threshold -> black edges
                        o[oIdx] = v;
                        o[oIdx + 1] = v;
                        o[oIdx + 2] = v;
                        o[oIdx + 3] = 255;
                    }
                }
                return out;
            };

            const out = sobel();
            // Draw edges with multiply to darken edges only
            const tmp = document.createElement('canvas');
            tmp.width = canvas.width; tmp.height = canvas.height;
            const tctx = tmp.getContext('2d');
            if (tctx) tctx.putImageData(out, 0, 0);
            ctx.globalCompositeOperation = 'multiply';
            if (tctx) ctx.drawImage(tmp, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        };

        const onLoad = () => { if (!cancelled) render(); };
        img.onload = onLoad;
        if (img.complete) onLoad();

        const ro = new ResizeObserver(() => render());
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener('resize', render);
        return () => { cancelled = true; ro.disconnect(); window.removeEventListener('resize', render); };
    }, [src]);

    return (
        <div ref={containerRef} className={className} aria-label={alt}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '0.75rem' }} />
        </div>
    );
};

export default AnimeImage;


