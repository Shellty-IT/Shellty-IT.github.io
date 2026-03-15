import React, { useState, useRef, useEffect } from 'react';
import './GlowIcon.css';

const GlowIcon = ({ src, srcGlow, alt = '', size, floating = false, className = '' }) => {
    const style = size ? { width: size, height: size } : undefined;
    const [glowReady, setGlowReady] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!srcGlow || !containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const img = new Image();
                    img.src = srcGlow;
                    img.onload = () => setGlowReady(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [srcGlow]);

    return (
        <div
            ref={containerRef}
            className={`glow-icon${floating ? ' glow-icon-float' : ''}${className ? ` ${className}` : ''}`}
            style={style}
        >
            <img src={src} alt={alt} className="glow-icon-base" draggable="false" loading="lazy" decoding="async" />
            {glowReady && (
                <img src={srcGlow} alt="" className="glow-icon-lit" draggable="false" aria-hidden="true" />
            )}
        </div>
    );
};

export default GlowIcon;