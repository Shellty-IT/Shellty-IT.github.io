import React, { useEffect, useRef, useCallback, useState } from 'react';
import './CustomCursor.css';

const TRAIL_COUNT = 8;
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], label, [data-cursor]';
const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

const getTrailStyle = (i) => {
    const progress = i / (TRAIL_COUNT - 1);
    const size = 7.5 - progress * 5.5;
    const alpha = 0.55 - progress * 0.5;

    const style = {
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `rgba(0, 229, 255, ${alpha})`,
    };

    /* glow tylko na pierwszych 3 – reszta czyste kółka */
    if (i < 3) {
        const glowAlpha = alpha * 0.4;
        const glowSize = 5 - i * 1.5;
        style.boxShadow =
            `0 0 ${glowSize}px ${Math.max(1, glowSize * 0.5)}px rgba(0,229,255,${glowAlpha})`;
    }

    return style;
};

const safeClosest = (target, selector) => {
    if (!target || typeof target.closest !== 'function' || target === document || target === window) return null;
    try { return target.closest(selector); } catch { return null; }
};

const CustomCursor = () => {
    const [hasPointer, setHasPointer] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(POINTER_QUERY).matches
    );

    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const trailRefs = useRef([]);

    const mouse = useRef({ x: -100, y: -100 });
    const dotPos = useRef({ x: -100, y: -100 });
    const ringPos = useRef({ x: -100, y: -100 });
    const trails = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 })));
    const ringScale = useRef({ current: 1, target: 1 });
    const isVisible = useRef(false);
    const isHovering = useRef(false);
    const raf = useRef(null);

    const animating = useRef(false);
    const isMoving = useRef(false);
    const moveTimer = useRef(null);

    useEffect(() => {
        const mql = window.matchMedia(POINTER_QUERY);
        const onChange = (e) => setHasPointer(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (hasPointer) document.documentElement.classList.add('has-custom-cursor');
        else document.documentElement.classList.remove('has-custom-cursor');
        return () => document.documentElement.classList.remove('has-custom-cursor');
    }, [hasPointer]);

    const startLoop = useCallback(() => {
        if (animating.current) return;
        animating.current = true;
        raf.current = requestAnimationFrame(tick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tick = useCallback(() => {
        const mx = mouse.current.x, my = mouse.current.y;

        dotPos.current.x += (mx - dotPos.current.x) * 0.75;
        dotPos.current.y += (my - dotPos.current.y) * 0.75;
        if (dotRef.current)
            dotRef.current.style.transform = `translate3d(${dotPos.current.x}px,${dotPos.current.y}px,0)`;

        ringPos.current.x += (mx - ringPos.current.x) * 0.18;
        ringPos.current.y += (my - ringPos.current.y) * 0.18;
        ringScale.current.current += (ringScale.current.target - ringScale.current.current) * 0.12;
        if (ringRef.current)
            ringRef.current.style.transform = `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) scale(${ringScale.current.current})`;

        for (let i = 0; i < TRAIL_COUNT; i++) {
            const prev = i === 0 ? ringPos.current : trails.current[i - 1];
            const trail = trails.current[i];
            const speed = 0.42 - (i / (TRAIL_COUNT - 1)) * 0.32;
            trail.x += (prev.x - trail.x) * speed;
            trail.y += (prev.y - trail.y) * speed;
            if (trailRefs.current[i])
                trailRefs.current[i].style.transform = `translate3d(${trail.x}px,${trail.y}px,0)`;
        }

        if (!isMoving.current) {
            const last = trails.current[TRAIL_COUNT - 1];
            if (Math.abs(last.x - mx) < 0.5 && Math.abs(last.y - my) < 0.5) {
                animating.current = false;
                return;
            }
        }

        raf.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (!hasPointer) return;

        const show = () => {
            if (dotRef.current) dotRef.current.style.opacity = '1';
            if (ringRef.current) ringRef.current.style.opacity = '1';
            trailRefs.current.forEach(t => { if (t) t.style.opacity = '1'; });
        };
        const hide = () => {
            [dotRef.current, ringRef.current, ...trailRefs.current].forEach(el => {
                if (el) el.style.opacity = '0';
            });
        };
        const resetPositions = (x, y) => {
            dotPos.current = { x, y }; ringPos.current = { x, y };
            trails.current = trails.current.map(() => ({ x, y }));
            trailRefs.current.forEach(t => {
                if (t) t.style.transform = `translate3d(${x}px,${y}px,0)`;
            });
        };

        const onMouseMove = (e) => {
            if (e.pointerType === 'touch') return;
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            if (!isVisible.current) {
                isVisible.current = true;
                resetPositions(e.clientX, e.clientY);
                show();
            }

            const hovering = !!safeClosest(e.target, INTERACTIVE);
            if (hovering !== isHovering.current) {
                isHovering.current = hovering;
                ringScale.current.target = hovering ? 1.15 : 1;
                const method = hovering ? 'add' : 'remove';
                ringRef.current?.classList[method]('hovering');
                dotRef.current?.classList[method]('hovering');
            }

            isMoving.current = true;
            clearTimeout(moveTimer.current);
            moveTimer.current = setTimeout(() => { isMoving.current = false; }, 150);
            startLoop();
        };

        const onMouseLeave = () => {
            isVisible.current = false;
            isHovering.current = false;
            hide();
        };
        const onMouseEnter = (e) => {
            resetPositions(e.clientX, e.clientY);
            startLoop();
        };
        const onVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(raf.current);
                animating.current = false;
            } else if (isVisible.current) {
                startLoop();
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);
        document.addEventListener('visibilitychange', onVisibilityChange);

        startLoop();

        return () => {
            clearTimeout(moveTimer.current);
            cancelAnimationFrame(raf.current);
            animating.current = false;
            window.removeEventListener('mousemove', onMouseMove);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [hasPointer, tick, startLoop]);

    if (!hasPointer) return null;

    return (
        <div className="cursor-container">
            {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
                const s = getTrailStyle(i);
                return (
                    <div
                        key={i}
                        ref={el => (trailRefs.current[i] = el)}
                        className="cursor-trail-dot"
                        style={{
                            width: s.width,
                            height: s.height,
                            marginLeft: s.marginLeft,
                            marginTop: s.marginTop,
                            background: s.background,
                            boxShadow: s.boxShadow || 'none',
                        }}
                    />
                );
            })}
            <div ref={ringRef} className="cursor-ring" />
            <div ref={dotRef} className="cursor-dot" />
        </div>
    );
};

export default CustomCursor;