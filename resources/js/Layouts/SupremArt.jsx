import { useEffect, useRef } from 'react';

/**
 * Living Suprematist composition: shapes are born, drift, rotate, and dissolve.
 * Respects prefers-reduced-motion by drawing one static arrangement.
 */
const PALETTE = ['#cf3f2e', '#e0b83a', '#3f7a4e', '#141413'];
const KINDS = ['square', 'bar', 'circle', 'ring', 'triangle', 'line', 'arc'];

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function spawn(w, h) {
    const kind = pick(KINDS);
    return {
        kind,
        color: pick(PALETTE),
        x: rnd(0.05, 0.95) * w,
        y: rnd(0.05, 0.95) * h,
        size: kind === 'bar' || kind === 'line' ? rnd(60, 170) : rnd(16, 74),
        thick: rnd(4, 16),
        rot: rnd(0, Math.PI * 2),
        vr: rnd(-0.004, 0.004),
        vx: rnd(-0.14, 0.14),
        vy: rnd(-0.1, 0.1),
        age: 0,
        life: rnd(340, 700), // frames
    };
}

function draw(ctx, s) {
    const t = s.age / s.life;
    // ease in for 15%, ease out for the last 25%
    const alpha = Math.min(1, t / 0.15) * Math.min(1, (1 - t) / 0.25);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha) * 0.9;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.fillStyle = s.color;
    ctx.strokeStyle = s.color;
    switch (s.kind) {
        case 'square': ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size); break;
        case 'bar': ctx.fillRect(-s.size / 2, -s.thick / 2, s.size, s.thick); break;
        case 'circle': ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2); ctx.fill(); break;
        case 'ring': ctx.lineWidth = s.thick / 2; ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2); ctx.stroke(); break;
        case 'triangle':
            ctx.beginPath(); ctx.moveTo(0, -s.size / 2);
            ctx.lineTo(s.size / 2, s.size / 2); ctx.lineTo(-s.size / 2, s.size / 2);
            ctx.closePath(); ctx.fill(); break;
        case 'line': ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-s.size / 2, 0); ctx.lineTo(s.size / 2, 0); ctx.stroke(); break;
        case 'arc': ctx.lineWidth = s.thick / 2; ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * rnd(0.9, 1.4)); ctx.stroke(); break;
    }
    ctx.restore();
}

export default function SupremArt({ className }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let shapes = [];
        let raf = 0;
        let lastSpawn = 0;

        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const w = () => canvas.width / dpr;
        const h = () => canvas.height / dpr;

        if (reduced) {
            // One considered, still composition.
            for (let i = 0; i < 9; i++) {
                const s = spawn(w(), h());
                s.age = s.life * 0.4;
                draw(ctx, s);
            }
            return () => ro.disconnect();
        }

        for (let i = 0; i < 7; i++) {
            const s = spawn(w(), h());
            s.age = rnd(0, s.life * 0.5);
            shapes.push(s);
        }

        const tick = (ts) => {
            ctx.clearRect(0, 0, w(), h());
            if (ts - lastSpawn > rnd(500, 1100) && shapes.length < 22) {
                shapes.push(spawn(w(), h()));
                lastSpawn = ts;
            }
            for (const s of shapes) {
                s.age += 1; s.x += s.vx; s.y += s.vy; s.rot += s.vr;
                draw(ctx, s);
            }
            shapes = shapes.filter((s) => s.age < s.life);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, []);

    return <canvas ref={ref} className={className} aria-hidden="true" />;
}
