// src/components/CustomCursor/CustomCursor.js
import React, { useEffect, useRef, useCallback, useState } from 'react';
import './CustomCursor.css';

const TRAIL_COUNT = 24;
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], label, [data-cursor]';
const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

const getTrailStyle = (i) => {
    const progress = i / (TRAIL_COUNT - 1);
    const size = 8 - progress * 6;
    const alpha = 0.7 - progress * 0.65;
    const glowAlpha = alpha * 0.5;
    const glowSize = Math.max(1, 6 - progress * 5);

    return {
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `rgba(0, 229, 255, ${alpha})`,
        boxShadow: `0 0 ${glowSize}px ${Math.max(1, glowSize / 2)}px rgba(0, 229, 255, ${glowAlpha})`,
    };
};

// Helper funkcja do bezpiecznego sprawdzania closest
const safeClosest = (target, selector) => {
    if (
        !target ||
        typeof target.closest !== 'function' ||
        target === document ||
        target === window
    ) {
        return null;
    }
    try {
        return target.closest(selector);
    } catch (e) {
        return null;
    }
};

const CustomCursor = () => {
    const [hasPointer, setHasPointer] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(POINTER_QUERY).matches;
    });

    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const trailRefs = useRef([]);

    const mouse = useRef({ x: -100, y: -100 });
    const dotPos = useRef({ x: -100, y: -100 });
    const ringPos = useRef({ x: -100, y: -100 });
    const trails = useRef(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
    );

    const ringScale = useRef({ current: 1, target: 1 });
    const isVisible = useRef(false);
    const isHovering = useRef(false);
    const raf = useRef(null);

    useEffect(() => {
        const mql = window.matchMedia(POINTER_QUERY);
        const onChange = (e) => setHasPointer(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (hasPointer) {
            document.documentElement.classList.add('has-custom-cursor');
        } else {
            document.documentElement.classList.remove('has-custom-cursor');
        }
        return () => document.documentElement.classList.remove('has-custom-cursor');
    }, [hasPointer]);

    const animate = useCallback(() => {
        const mx = mouse.current.x;
        const my = mouse.current.y;

        dotPos.current.x += (mx - dotPos.current.x) * 0.8;
        dotPos.current.y += (my - dotPos.current.y) * 0.8;

        if (dotRef.current) {
            dotRef.current.style.transform =
                `translate3d(${dotPos.current.x}px,${dotPos.current.y}px,0)`;
        }

        ringPos.current.x += (mx - ringPos.current.x) * 0.2;
        ringPos.current.y += (my - ringPos.current.y) * 0.2;
        ringScale.current.current += (ringScale.current.target - ringScale.current.current) * 0.12;

        if (ringRef.current) {
            ringRef.current.style.transform =
                `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) scale(${ringScale.current.current})`;
        }

        for (let i = 0; i < TRAIL_COUNT; i++) {
            const prev = i === 0 ? ringPos.current : trails.current[i - 1];
            const trail = trails.current[i];
            const speed = 0.45 - (i / (TRAIL_COUNT - 1)) * 0.35;
            const nx = trail.x + (prev.x - trail.x) * speed;
            const ny = trail.y + (prev.y - trail.y) * speed;
            const dx = nx - trail.x;
            const dy = ny - trail.y;
            trail.x = nx;
            trail.y = ny;

            if (trailRefs.current[i] && (dx * dx + dy * dy) > 0.09) {
                trailRefs.current[i].style.transform =
                    `translate3d(${nx}px,${ny}px,0)`;
            }
        }

        raf.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (!hasPointer) return;

        const show = () => {
            if (dotRef.current) dotRef.current.style.opacity = '1';
            if (ringRef.current) ringRef.current.style.opacity = '1';
            trailRefs.current.forEach((t) => {
                if (t) t.style.opacity = '1';
            });
        };

        const hide = () => {
            [dotRef.current, ringRef.current, ...trailRefs.current].forEach((el) => {
                if (el) el.style.opacity = '0';
            });
        };

        const resetPositions = (x, y) => {
            dotPos.current = { x, y };
            ringPos.current = { x, y };
            trails.current = trails.current.map(() => ({ x, y }));
        };

        const onMouseMove = (e) => {
            // Ignoruj zdarzenia dotykowe które mogą wyciekać
            if (e.sourceCapabilities?.firesTouchEvents) {
                return;
            }

            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            if (!isVisible.current) {
                isVisible.current = true;
                resetPositions(e.clientX, e.clientY);
                show();
            }

            // Użyj bezpiecznej funkcji do sprawdzania closest
            const hovering = !!safeClosest(e.target, INTERACTIVE);

            if (hovering !== isHovering.current) {
                isHovering.current = hovering;
                ringScale.current.target = hovering ? 1.15 : 1;
                const method = hovering ? 'add' : 'remove';
                ringRef.current?.classList[method]('hovering');
                dotRef.current?.classList[method]('hovering');
            }
        };

        const onMouseLeave = () => {
            isVisible.current = false;
            isHovering.current = false;
            hide();
        };

        const onMouseEnter = (e) => {
            resetPositions(e.clientX, e.clientY);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        raf.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
            cancelAnimationFrame(raf.current);
        };
    }, [hasPointer, animate]);

    if (!hasPointer) return null;

    return (
        <div className="cursor-container">
            {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
                const s = getTrailStyle(i);
                return (
                    <div
                        key={i}
                        ref={(el) => (trailRefs.current[i] = el)}
                        className="cursor-trail-dot"
                        style={{
                            width: s.width,
                            height: s.height,
                            marginLeft: s.marginLeft,
                            marginTop: s.marginTop,
                            background: s.background,
                            boxShadow: s.boxShadow,
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