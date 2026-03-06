// src/components/GlowIcon.js
import React from 'react';
import './GlowIcon.css';

const GlowIcon = ({ src, srcGlow, alt = '', size, floating = false, className = '' }) => {
    const style = size ? { width: size, height: size } : undefined;

    return (
        <div
            className={`glow-icon${floating ? ' glow-icon-float' : ''}${className ? ` ${className}` : ''}`}
            style={style}
        >
            <img src={src} alt={alt} className="glow-icon-base" draggable="false" />
            <img src={srcGlow} alt="" className="glow-icon-lit" draggable="false" aria-hidden="true" />
        </div>
    );
};

export default GlowIcon;