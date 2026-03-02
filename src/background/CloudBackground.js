import React, { useRef, useEffect } from 'react';
import './CloudBackground.css';

// ─────────────────────────────────────────────────────────────
// KONFIGURACJA
// ─────────────────────────────────────────────────────────────

const CONFIG = {
    // Węzły bazowe (widoczne od początku)
    nodes: { small: 25, medium: 10, large: 4 },

    // Węzły dodatkowe (pojawiają się ze scrollem)
    scrollNodes: { small: 25, medium: 8, large: 3 },

    maxConnectionDist: 220,
    maxConnectionsPerNode: 4,
    connectionBaseOpacity: 0.045,

    flowSpawnChance: 0.005,
    flowSpawnScrollMultiplier: 4,
    maxPulses: 40,

    pulseSpeedRange: [0.2, 0.5],
    driftSpeed: 0.1,
    flowSpeedRange: [0.15, 0.4],

    mouseInteractRadius: 220,
    mouseRepelForce: 22,
    mouseBrightnessBoost: 0.6,
    mouseSizeBoost: 0.18,

    // Aura kursora
    mouseAuraRadius: 280,
    mouseAuraOpacity: 0.06,

    scrollBrightness: 0.6,

    starCount: 120,
    ambientParticleCount: 25,

    autoscaleChance: 0.0008,
    autoscaleFadeDuration: 3.0,

    // Rendering
    maxDPR: 0.75,
    targetFPS: 30,

    // Adaptive quality
    fpsWindow: 60,
    fpsLowThreshold: 22,
    fpsHighThreshold: 28,

    layers: [
        { depth: 0.15, brightness: 0.22 },
        { depth: 0.45, brightness: 0.55 },
        { depth: 0.80, brightness: 0.85 },
        { depth: 1.00, brightness: 1.00 },
    ],

    visual: {
        small:  { glow: 16, bloom: 40, sprite: 40, bloomSprite: 96 },
        medium: { glow: 26, bloom: 60, sprite: 56, bloomSprite: 140 },
        large:  { glow: 42, bloom: 90, sprite: 88, bloomSprite: 200 },
    },
};

// ─────────────────────────────────────────────────────────────
// SPRITE FACTORY
// ─────────────────────────────────────────────────────────────

function createSprite(size, stops) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const cx = size / 2;
    const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    for (const [pos, color] of stops) g.addColorStop(pos, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
}

// ─────────────────────────────────────────────────────────────
// COMPUTE NODE
// ─────────────────────────────────────────────────────────────

class ComputeNode {
    constructor(x, y, type, layerIndex, scrollThreshold) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.drawX = x;
        this.drawY = y;
        this.type = type;
        this.layerIndex = layerIndex;

        // Scroll threshold — kiedy ten węzeł się pojawia (0 = zawsze, 0.5 = od połowy)
        this.scrollThreshold = scrollThreshold;

        this.pulsePhase = Math.random() * 6.283;
        this.pulseSpeed = CONFIG.pulseSpeedRange[0]
            + Math.random() * (CONFIG.pulseSpeedRange[1] - CONFIG.pulseSpeedRange[0]);

        this.driftAngle = Math.random() * 6.283;
        this.driftRadius = 5 + Math.random() * 16;
        this.driftSpeed = (0.03 + Math.random() * 0.06) * CONFIG.driftSpeed;

        this.hasRing = type === 'large' || (type === 'medium' && Math.random() > 0.55);
        this.hasDoubleRing = type === 'large' && Math.random() > 0.5;
        this.ringAngle = Math.random() * 6.283;
        this.ringSpeed = 0.12 + Math.random() * 0.25;

        this.connectionCount = 0;
        this.mouseProximity = 0;

        this.opacity = scrollThreshold === 0 ? 1 : 0;
        this.targetOpacity = scrollThreshold === 0 ? 1 : 0;
        this.alive = true;

        // Autoscaling (losowe pojawianie/znikanie)
        this.fadingIn = false;
        this.fadingOut = false;
        this.fadeTimer = 0;
    }

    update(time, dt, scrollProgress) {
        this.x = this.baseX
            + Math.cos(this.driftAngle + time * this.driftSpeed) * this.driftRadius;
        this.y = this.baseY
            + Math.sin(this.driftAngle * 1.3 + time * this.driftSpeed * 0.7)
            * this.driftRadius * 0.6;

        if (this.hasRing) this.ringAngle += this.ringSpeed * dt;

        // Scroll-based visibility
        if (this.scrollThreshold > 0) {
            this.targetOpacity = scrollProgress >= this.scrollThreshold
                ? Math.min((scrollProgress - this.scrollThreshold) * 5, 1)
                : 0;
        }

        // Autoscaling fade
        if (this.fadingIn) {
            this.fadeTimer += dt;
            this.targetOpacity = Math.min(this.fadeTimer / CONFIG.autoscaleFadeDuration, 1);
            if (this.targetOpacity >= 1) this.fadingIn = false;
        }
        if (this.fadingOut) {
            this.fadeTimer += dt;
            this.targetOpacity = Math.max(1 - this.fadeTimer / CONFIG.autoscaleFadeDuration, 0);
            if (this.targetOpacity <= 0) this.alive = false;
        }

        // Smooth opacity
        this.opacity += (this.targetOpacity - this.opacity) * 0.05;
    }

    pulse(time) {
        return 0.5 + 0.5 * Math.sin(this.pulsePhase + time * this.pulseSpeed);
    }

    startFadeOut() {
        this.fadingOut = true;
        this.fadeTimer = 0;
    }
}

// ─────────────────────────────────────────────────────────────
// STAR
// ─────────────────────────────────────────────────────────────

class Star {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = 0.3 + Math.random() * 1.2;
        this.brightness = 0.15 + Math.random() * 0.35;
        this.pulsePhase = Math.random() * 6.283;
        this.pulseSpeed = 0.3 + Math.random() * 0.8;
    }
}

// ─────────────────────────────────────────────────────────────
// AMBIENT PARTICLE
// ─────────────────────────────────────────────────────────────

class AmbientParticle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = -0.05 - Math.random() * 0.15;
        this.size = 0.8 + Math.random() * 2;
        this.opacity = 0.04 + Math.random() * 0.1;
        this.w = w;
        this.h = h;
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        if (this.y < -10) { this.y = this.h + 10; this.x = Math.random() * this.w; }
        if (this.x < -10) this.x = this.w + 10;
        if (this.x > this.w + 10) this.x = -10;
    }
}

// ─────────────────────────────────────────────────────────────
// CONNECTION
// ─────────────────────────────────────────────────────────────

class Connection {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.layer = Math.min(nodeA.layerIndex, nodeB.layerIndex);
        this.opacity = CONFIG.connectionBaseOpacity
            + Math.random() * CONFIG.connectionBaseOpacity * 0.5;

        const dx = nodeB.baseX - nodeA.baseX;
        const dy = nodeB.baseY - nodeA.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const bend = (Math.random() - 0.5) * dist * 0.3;
        this.bendX = (-dy / dist) * bend;
        this.bendY = (dx / dist) * bend;
        this._drawCPX = 0;
        this._drawCPY = 0;
    }
}

// ─────────────────────────────────────────────────────────────
// DATA PULSE (pooled)
// ─────────────────────────────────────────────────────────────

class DataPulse {
    constructor() {
        this.conn = null;
        this.progress = 0;
        this.speed = 0;
        this.alive = false;
        this.size = 0;
    }

    init(connection) {
        this.conn = connection;
        this.progress = 0;
        this.speed = CONFIG.flowSpeedRange[0]
            + Math.random() * (CONFIG.flowSpeedRange[1] - CONFIG.flowSpeedRange[0]);
        this.alive = true;
        this.size = 3 + Math.random() * 4;
    }

    update(dt) {
        this.progress += this.speed * dt;
        if (this.progress > 1) this.alive = false;
    }

    getPosition() {
        const t = this.progress;
        const omt = 1 - t;
        const a = this.conn.nodeA;
        const b = this.conn.nodeB;
        return {
            x: omt * omt * a.drawX + 2 * omt * t * this.conn._drawCPX + t * t * b.drawX,
            y: omt * omt * a.drawY + 2 * omt * t * this.conn._drawCPY + t * t * b.drawY,
        };
    }
}

// ─────────────────────────────────────────────────────────────
// ADAPTIVE QUALITY MANAGER
// ─────────────────────────────────────────────────────────────

class QualityManager {
    constructor() {
        this.frameTimes = [];
        this.quality = 'high'; // 'high', 'medium', 'low'
        this.starsVisible = true;
        this.maxActivePulses = CONFIG.maxPulses;
        this.dprMultiplier = 1.0;
        this.checkInterval = 0;
    }

    recordFrame(dt) {
        this.frameTimes.push(dt);
        if (this.frameTimes.length > CONFIG.fpsWindow) {
            this.frameTimes.shift();
        }

        this.checkInterval++;
        if (this.checkInterval >= 30) {
            this.checkInterval = 0;
            this._evaluate();
        }
    }

    _evaluate() {
        if (this.frameTimes.length < 20) return;

        const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        const fps = 1 / avg;

        if (fps < CONFIG.fpsLowThreshold) {
            this._downgrade();
        } else if (fps > CONFIG.fpsHighThreshold && this.quality !== 'high') {
            this._upgrade();
        }
    }

    _downgrade() {
        if (this.quality === 'high') {
            this.quality = 'medium';
            this.starsVisible = true;
            this.maxActivePulses = 25;
            this.dprMultiplier = 0.8;
        } else if (this.quality === 'medium') {
            this.quality = 'low';
            this.starsVisible = false;
            this.maxActivePulses = 15;
            this.dprMultiplier = 0.6;
        }
    }

    _upgrade() {
        if (this.quality === 'low') {
            this.quality = 'medium';
            this.starsVisible = true;
            this.maxActivePulses = 25;
            this.dprMultiplier = 0.8;
        } else if (this.quality === 'medium') {
            this.quality = 'high';
            this.starsVisible = true;
            this.maxActivePulses = CONFIG.maxPulses;
            this.dprMultiplier = 1.0;
        }
    }
}

// ─────────────────────────────────────────────────────────────
// ENGINE
// ─────────────────────────────────────────────────────────────

class CloudEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.nodes = [];
        this.connections = [];
        this.stars = [];
        this.ambientParticles = [];
        this.scrollProgress = 0;
        this.mouse = { x: 0, y: 0, sx: 0, sy: 0 };
        this.mouseActive = false;
        this.isRunning = false;
        this.frameId = null;
        this.lastTime = 0;
        this.frameInterval = 1000 / CONFIG.targetFPS;
        this.timeSinceLastFrame = 0;

        // Offscreen canvas — gwiazdy
        this.starCanvas = document.createElement('canvas');
        this.starCtx = this.starCanvas.getContext('2d');

        // Pulse pool
        this.pulsePool = [];
        for (let i = 0; i < CONFIG.maxPulses; i++) {
            this.pulsePool.push(new DataPulse());
        }
        this.activePulses = [];

        // Quality manager
        this.quality = new QualityManager();

        // Ostatni rebuild connections
        this.lastConnectionRebuild = 0;

        this._buildSprites();
    }

    _buildSprites() {
        const v = CONFIG.visual;

        this.sprites = {
            small: createSprite(v.small.sprite, [
                [0.0, 'rgba(180,225,255,0.95)'], [0.08, 'rgba(140,210,255,0.8)'],
                [0.25, 'rgba(12,192,255,0.25)'], [0.5, 'rgba(0,120,200,0.08)'],
                [1.0, 'rgba(0,50,120,0)'],
            ]),
            medium: createSprite(v.medium.sprite, [
                [0.0, 'rgba(210,240,255,1)'], [0.06, 'rgba(170,230,255,0.85)'],
                [0.2, 'rgba(12,192,255,0.3)'], [0.45, 'rgba(0,130,210,0.1)'],
                [1.0, 'rgba(0,50,120,0)'],
            ]),
            large: createSprite(v.large.sprite, [
                [0.0, 'rgba(235,248,255,1)'], [0.05, 'rgba(200,238,255,0.9)'],
                [0.15, 'rgba(12,192,255,0.35)'], [0.4, 'rgba(0,140,220,0.12)'],
                [1.0, 'rgba(0,50,120,0)'],
            ]),
        };

        this.bloomSprites = {
            small: createSprite(v.small.bloomSprite, [
                [0.0, 'rgba(12,192,255,0.08)'], [0.3, 'rgba(0,120,200,0.03)'],
                [0.7, 'rgba(0,60,130,0.01)'], [1.0, 'rgba(0,20,60,0)'],
            ]),
            medium: createSprite(v.medium.bloomSprite, [
                [0.0, 'rgba(12,192,255,0.12)'], [0.25, 'rgba(0,130,210,0.05)'],
                [0.6, 'rgba(0,60,130,0.015)'], [1.0, 'rgba(0,20,60,0)'],
            ]),
            large: createSprite(v.large.bloomSprite, [
                [0.0, 'rgba(12,192,255,0.18)'], [0.2, 'rgba(0,140,220,0.07)'],
                [0.5, 'rgba(0,70,140,0.02)'], [1.0, 'rgba(0,20,60,0)'],
            ]),
        };

        this.pulseSprite = createSprite(24, [
            [0.0, 'rgba(220,245,255,1)'], [0.15, 'rgba(12,192,255,0.6)'],
            [0.4, 'rgba(0,130,210,0.15)'], [1.0, 'rgba(0,50,120,0)'],
        ]);

        // Aura kursora — duży miękki glow
        const auraSize = CONFIG.mouseAuraRadius * 2;
        this.auraSprite = createSprite(auraSize, [
            [0.0,  'rgba(12,192,255,0.18)'],
            [0.15, 'rgba(12,192,255,0.10)'],
            [0.35, 'rgba(0,120,200,0.04)'],
            [0.6,  'rgba(0,60,130,0.015)'],
            [1.0,  'rgba(0,20,60,0)'],
        ]);
    }

    // ── Stars offscreen ──────────────────────────────────────

    _renderStarLayer(time) {
        const ctx = this.starCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = 'rgba(140,200,255,1)';

        for (const s of this.stars) {
            const p = s.brightness * (0.6 + 0.4 * Math.sin(s.pulsePhase + time * s.pulseSpeed));
            ctx.globalAlpha = p * 0.4;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, 6.283);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ── Resize & topology ────────────────────────────────────

    resize(w, h) {
        this.width = w;
        this.height = h;
        const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR)
            * this.quality.dprMultiplier;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.starCanvas.width = w;
        this.starCanvas.height = h;

        this._generate();
    }

    _generate() {
        this.nodes = [];
        this.connections = [];
        this.activePulses = [];

        const m = 80, w = this.width, h = this.height;

        // Gwiazdy
        this.stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
            this.stars.push(new Star(w, h));
        }

        // Ambient particles
        this.ambientParticles = [];
        for (let i = 0; i < CONFIG.ambientParticleCount; i++) {
            this.ambientParticles.push(new AmbientParticle(w, h));
        }

        // ── Węzły bazowe (scrollThreshold = 0, zawsze widoczne) ──
        const spawn = (count, type, layers, scrollThreshold) => {
            for (let i = 0; i < count; i++) {
                const li = layers[Math.floor(Math.random() * layers.length)];
                this.nodes.push(new ComputeNode(
                    m + Math.random() * (w - m * 2),
                    m + Math.random() * (h - m * 2),
                    type, li, scrollThreshold
                ));
            }
        };

        // Bazowe — zawsze widoczne
        spawn(CONFIG.nodes.small,  'small',  [0, 0, 1, 1, 2, 2, 3], 0);
        spawn(CONFIG.nodes.medium, 'medium', [0, 1, 1, 2, 2, 3],    0);
        spawn(CONFIG.nodes.large,  'large',  [1, 2, 2, 3, 3],       0);

        // Scroll nodes — pojawiają się przy scrollowaniu
        const sn = CONFIG.scrollNodes;
        const smallPerWave = Math.ceil(sn.small / 5);
        const medPerWave   = Math.ceil(sn.medium / 4);
        const lgPerWave    = Math.ceil(sn.large / 3);

        for (let w2 = 0; w2 < 5; w2++) {
            const threshold = 0.15 + w2 * 0.17; // 0.15, 0.32, 0.49, 0.66, 0.83
            spawn(smallPerWave, 'small', [0, 1, 1, 2, 2, 3], threshold);
        }
        for (let w2 = 0; w2 < 4; w2++) {
            const threshold = 0.2 + w2 * 0.2;
            spawn(medPerWave, 'medium', [1, 1, 2, 2, 3], threshold);
        }
        for (let w2 = 0; w2 < 3; w2++) {
            const threshold = 0.3 + w2 * 0.25;
            spawn(lgPerWave, 'large', [2, 2, 3, 3], threshold);
        }

        this._buildConnections();
    }

    _buildConnections() {
        this.connections = [];
        const maxD = CONFIG.maxConnectionDist;
        const maxC = CONFIG.maxConnectionsPerNode;

        // Reset connection counts
        for (const n of this.nodes) n.connectionCount = 0;

        for (let i = 0; i < this.nodes.length; i++) {
            const a = this.nodes[i];
            if (a.connectionCount >= maxC) continue;

            const cands = [];
            for (let j = i + 1; j < this.nodes.length; j++) {
                const b = this.nodes[j];
                if (b.connectionCount >= maxC) continue;
                if (Math.abs(a.layerIndex - b.layerIndex) > 1) continue;

                const dx = a.baseX - b.baseX, dy = a.baseY - b.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxD) cands.push({ node: b, dist });
            }

            cands.sort((x, y) => x.dist - y.dist);
            const take = Math.min(cands.length, maxC - a.connectionCount);
            for (let k = 0; k < take; k++) {
                const b = cands[k].node;
                this.connections.push(new Connection(a, b));
                a.connectionCount++;
                b.connectionCount++;
            }
        }
    }

    _getPulse() {
        for (const p of this.pulsePool) {
            if (!p.alive) return p;
        }
        return null;
    }

    // ── Animation loop ───────────────────────────────────────

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.timeSinceLastFrame = 0;
        this._loop();
    }

    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    _loop() {
        if (!this.isRunning) return;
        this.frameId = requestAnimationFrame(() => this._loop());

        const now = performance.now();
        const rawDt = now - this.lastTime;
        this.lastTime = now;

        const dt = Math.min(rawDt / 1000, 0.05);

        // Adaptive quality — monitoruj FPS
        this.quality.recordFrame(dt);

        this._update(now / 1000, dt);

        this.timeSinceLastFrame += rawDt;
        if (this.timeSinceLastFrame >= this.frameInterval) {
            this.timeSinceLastFrame = 0;
            this._draw(now / 1000);
        }
    }

    // ── Update ───────────────────────────────────────────────

    _update(time, dt) {
        this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.035;
        this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.035;

        // Update nodes
        for (const n of this.nodes) {
            n.update(time, dt, this.scrollProgress);
        }

        // Autoscaling (losowe)
        if (Math.random() < CONFIG.autoscaleChance && this.nodes.length > 20) {
            const baseNodes = this.nodes.filter(
                n => n.scrollThreshold === 0 && !n.fadingOut && !n.fadingIn && n.type === 'small'
            );
            if (baseNodes.length > 0) {
                const n = baseNodes[Math.floor(Math.random() * baseNodes.length)];
                n.startFadeOut();
            }
        }
        if (Math.random() < CONFIG.autoscaleChance) {
            const m = 80;
            const n = new ComputeNode(
                m + Math.random() * (this.width - m * 2),
                m + Math.random() * (this.height - m * 2),
                'small',
                [0, 1, 1, 2][Math.floor(Math.random() * 4)],
                0
            );
            n.fadingIn = true;
            n.opacity = 0;
            n.fadeTimer = 0;
            this.nodes.push(n);
        }

        this.nodes = this.nodes.filter(n => n.alive);

        // Ambient particles
        for (const p of this.ambientParticles) p.update(dt);

        // Impulsy — szybkość rośnie ze scrollem
        const rate = CONFIG.flowSpawnChance
            * (1 + this.scrollProgress * CONFIG.flowSpawnScrollMultiplier);
        const maxPulses = this.quality.maxActivePulses;

        for (const conn of this.connections) {
            if (!conn.nodeA.alive || !conn.nodeB.alive) continue;
            // Nie twórz impulsów dla niewidocznych węzłów
            if (conn.nodeA.opacity < 0.1 || conn.nodeB.opacity < 0.1) continue;

            if (Math.random() < rate && this.activePulses.length < maxPulses) {
                const p = this._getPulse();
                if (p) {
                    p.init(conn);
                    if (!this.activePulses.includes(p)) this.activePulses.push(p);
                }
            }
        }

        for (const p of this.activePulses) p.update(dt);
        this.activePulses = this.activePulses.filter(p => p.alive);

        // Odświeżaj connections co 2 sekundy (scroll dodaje węzły)
        this.lastConnectionRebuild += dt;
        if (this.lastConnectionRebuild > 2) {
            this.lastConnectionRebuild = 0;
            this._buildConnections();
        }
    }

    // ── Draw ─────────────────────────────────────────────────

    _draw(time) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const scrollBoost = 1 + this.scrollProgress * CONFIG.scrollBrightness;
        const mSX = (this.mouse.sx + 1) * 0.5 * this.width;
        const mSY = (-this.mouse.sy + 1) * 0.5 * this.height;
        const radius = CONFIG.mouseInteractRadius;
        const force = CONFIG.mouseRepelForce;

        // ── Pozycje węzłów + kursor ──────────────────────────
        for (const node of this.nodes) {
            node.drawX = node.x;
            node.drawY = node.y;
            node.mouseProximity = 0;

            if (this.mouseActive) {
                const dx = node.x - mSX, dy = node.y - mSY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius && dist > 1) {
                    const t = 1 - dist / radius;
                    const tt = t * t;
                    node.drawX += (dx / dist) * tt * force;
                    node.drawY += (dy / dist) * tt * force;
                    node.mouseProximity = tt;
                }
            }
        }

        // ── Control points ───────────────────────────────────
        for (const c of this.connections) {
            const mx = (c.nodeA.drawX + c.nodeB.drawX) * 0.5;
            const my = (c.nodeA.drawY + c.nodeB.drawY) * 0.5;
            c._drawCPX = mx + c.bendX;
            c._drawCPY = my + c.bendY;
        }

        // ═══════ GWIAZDY ═════════════════════════════════════
        if (this.quality.starsVisible) {
            this._renderStarLayer(time);
            ctx.globalAlpha = scrollBoost;
            ctx.drawImage(this.starCanvas, 0, 0);
        }

        // ═══════ AURA KURSORA ════════════════════════════════
        if (this.mouseActive) {
            const auraSize = CONFIG.mouseAuraRadius * 2;
            ctx.globalAlpha = CONFIG.mouseAuraOpacity * (1 + this.scrollProgress * 0.5);
            ctx.drawImage(
                this.auraSprite,
                mSX - auraSize * 0.5,
                mSY - auraSize * 0.5,
                auraSize, auraSize
            );
        }

        // ═══════ AMBIENT PARTICLES ═══════════════════════════
        ctx.fillStyle = 'rgba(12,192,255,1)';
        for (const p of this.ambientParticles) {
            ctx.globalAlpha = p.opacity * scrollBoost;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 6.283);
            ctx.fill();
        }

        // ═══════ WARSTWY ═════════════════════════════════════
        for (let L = 0; L < 4; L++) {
            const br = CONFIG.layers[L].brightness * scrollBoost;

            // ── Połączenia glow ──────────────────────────────
            ctx.strokeStyle = 'rgba(12,160,220,1)';
            ctx.lineWidth = 3;
            for (const c of this.connections) {
                if (c.layer !== L) continue;
                const a = c.nodeA, b = c.nodeB;
                const nA = Math.min(a.opacity, b.opacity);
                if (nA < 0.01) continue;
                const pB = 1 + Math.max(a.mouseProximity, b.mouseProximity)
                    * CONFIG.mouseBrightnessBoost;
                ctx.globalAlpha = c.opacity * br * 0.35 * nA * pB;
                ctx.beginPath();
                ctx.moveTo(a.drawX, a.drawY);
                ctx.quadraticCurveTo(c._drawCPX, c._drawCPY, b.drawX, b.drawY);
                ctx.stroke();
            }

            // ── Połączenia core ──────────────────────────────
            ctx.strokeStyle = 'rgba(12,192,255,1)';
            ctx.lineWidth = 0.5;
            for (const c of this.connections) {
                if (c.layer !== L) continue;
                const a = c.nodeA, b = c.nodeB;
                const nA = Math.min(a.opacity, b.opacity);
                if (nA < 0.01) continue;
                const pB = 1 + Math.max(a.mouseProximity, b.mouseProximity)
                    * CONFIG.mouseBrightnessBoost;
                ctx.globalAlpha = c.opacity * br * nA * pB;
                ctx.beginPath();
                ctx.moveTo(a.drawX, a.drawY);
                ctx.quadraticCurveTo(c._drawCPX, c._drawCPY, b.drawX, b.drawY);
                ctx.stroke();
            }

            // ── Impulsy ──────────────────────────────────────
            for (const p of this.activePulses) {
                if (p.conn.layer !== L) continue;
                const pos = p.getPosition();
                const fI = Math.min(p.progress * 4, 1);
                const fO = Math.min((1 - p.progress) * 4, 1);
                ctx.globalAlpha = fI * fO * br;
                const s = p.size;
                ctx.drawImage(
                    this.pulseSprite,
                    pos.x - s * 1.5, pos.y - s * 1.5,
                    s * 3, s * 3
                );
            }

            // ── Węzły ────────────────────────────────────────
            for (const node of this.nodes) {
                if (node.layerIndex !== L) continue;
                if (node.opacity < 0.01) continue;

                const int = node.pulse(time);
                const vis = CONFIG.visual[node.type];
                const nA = node.opacity;
                const pBr = 1 + node.mouseProximity * CONFIG.mouseBrightnessBoost;
                const pSz = 1 + node.mouseProximity * CONFIG.mouseSizeBoost;

                // Bloom
                const bS = vis.bloom * 2 * (0.85 + 0.15 * int) * pSz;
                ctx.globalAlpha = br * 0.5 * int * nA * pBr;
                ctx.drawImage(
                    this.bloomSprites[node.type],
                    node.drawX - bS * 0.5, node.drawY - bS * 0.5,
                    bS, bS
                );

                // Glow
                const gS = vis.glow * 2 * (0.8 + 0.2 * int) * pSz;
                ctx.globalAlpha = br * (0.65 + 0.35 * int) * nA * pBr;
                ctx.drawImage(
                    this.sprites[node.type],
                    node.drawX - gS * 0.5, node.drawY - gS * 0.5,
                    gS, gS
                );

                // Ring
                if (node.hasRing) {
                    ctx.globalAlpha = br * 0.2 * int * nA * pBr;
                    ctx.strokeStyle = 'rgba(12,192,255,1)';
                    ctx.lineWidth = 0.6;
                    ctx.save();
                    ctx.translate(node.drawX, node.drawY);
                    ctx.rotate(node.ringAngle);
                    ctx.scale(1, 0.32);
                    ctx.beginPath();
                    ctx.arc(0, 0, vis.glow * 0.7 * pSz, 0, 6.283);
                    ctx.stroke();
                    ctx.restore();

                    if (node.hasDoubleRing) {
                        ctx.globalAlpha = br * 0.12 * int * nA * pBr;
                        ctx.save();
                        ctx.translate(node.drawX, node.drawY);
                        ctx.rotate(-node.ringAngle * 0.6);
                        ctx.scale(1, 0.28);
                        ctx.beginPath();
                        ctx.arc(0, 0, vis.glow * 1.05 * pSz, 0, 6.283);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }

        ctx.globalAlpha = 1;
    }

    // ── Events ───────────────────────────────────────────────

    setScroll(v) {
        this.scrollProgress = Math.max(0, Math.min(1, v));
    }

    setMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.mouseActive = true;
    }

    dispose() {
        this.stop();
        this.nodes = [];
        this.connections = [];
        this.activePulses = [];
        this.stars = [];
        this.ambientParticles = [];
    }
}

// ─────────────────────────────────────────────────────────────
// REACT COMPONENT
// ─────────────────────────────────────────────────────────────

const CloudBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new CloudEngine(canvas);
        engine.resize(window.innerWidth, window.innerHeight);
        engine.start();

        let resizeTimer;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(
                () => engine.resize(window.innerWidth, window.innerHeight),
                200
            );
        };

        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            engine.setScroll(max > 0 ? window.scrollY / max : 0);
        };

        let mouseRAF = null;
        const onMouse = (e) => {
            if (mouseRAF) return;
            mouseRAF = requestAnimationFrame(() => {
                engine.setMouse(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                );
                mouseRAF = null;
            });
        };

        const onVisibility = () => {
            document.hidden ? engine.stop() : engine.start();
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        onScroll();

        return () => {
            clearTimeout(resizeTimer);
            if (mouseRAF) cancelAnimationFrame(mouseRAF);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('mousemove', onMouse);
            document.removeEventListener('visibilitychange', onVisibility);
            engine.dispose();
        };
    }, []);

    return (
        <div className="cloud-bg-wrapper" aria-hidden="true">
            <canvas ref={canvasRef} className="cloud-bg-canvas" />
        </div>
    );
};

export default React.memo(CloudBackground);