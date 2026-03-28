import React, { useRef, useEffect } from 'react';
import './CloudBackground.css';

/* ───────── CONFIG ───────── */
const CONFIG = {
    nodes:       { small: 15, medium: 6, large: 2 },
    scrollNodes: { small: 15, medium: 4, large: 2 },
    maxConnectionDist: 220,
    maxConnectionsPerNode: 4,
    connectionBaseOpacity: 0.045,
    flowSpawnChance: 0.009,
    flowSpawnScrollMultiplier: 4,
    maxPulses: 18,
    pulseSpeedRange: [0.2, 0.5],
    driftSpeed: 0.1,
    flowSpeedRange: [0.15, 0.4],
    mouseInteractRadius: 220,
    mouseRepelForce: 22,
    mouseBrightnessBoost: 0.6,
    mouseSizeBoost: 0.18,
    mouseAuraRadius: 280,
    mouseAuraOpacity: 0.06,
    mouseLerp: 0.27,
    scrollBrightness: 0.6,
    starCount: 55,
    ambientParticleCount: 10,
    autoscaleChance: 0.0015,
    autoscaleFadeDuration: 3.0,
    maxDPR: 0.75,
    targetFPS: 30,
    fpsWindow: 60,
    fpsLowThreshold: 22,
    fpsHighThreshold: 28,
    starRedrawInterval: 5,
    connectionRebuildInterval: 4,
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

/* ───────── HELPERS ───────── */
function createSprite(size, stops) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const cx = size / 2;
    const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    for (const [pos, color] of stops) g.addColorStop(pos, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
}

/* ───────── CLASSES ───────── */
class ComputeNode {
    constructor(x, y, type, layerIndex, scrollThreshold) {
        this.baseX = x; this.baseY = y;
        this.x = x; this.y = y;
        this.drawX = x; this.drawY = y;
        this.type = type;
        this.layerIndex = layerIndex;
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
        this.fadingIn = false;
        this.fadingOut = false;
        this.fadeTimer = 0;
    }
    update(time, dt, scrollProgress) {
        this.x = this.baseX + Math.cos(this.driftAngle + time * this.driftSpeed) * this.driftRadius;
        this.y = this.baseY + Math.sin(this.driftAngle * 1.3 + time * this.driftSpeed * 0.7) * this.driftRadius * 0.6;
        if (this.hasRing) this.ringAngle += this.ringSpeed * dt;
        if (this.scrollThreshold > 0) {
            this.targetOpacity = scrollProgress >= this.scrollThreshold
                ? Math.min((scrollProgress - this.scrollThreshold) * 5, 1) : 0;
        }
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
        this.opacity += (this.targetOpacity - this.opacity) * 0.10;
    }
    pulse(time) { return 0.5 + 0.5 * Math.sin(this.pulsePhase + time * this.pulseSpeed); }
    startFadeOut() { this.fadingOut = true; this.fadeTimer = 0; }
}

class Star {
    constructor(w, h) {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.size = 0.3 + Math.random() * 1.2;
        this.brightness = 0.15 + Math.random() * 0.35;
        this.pulsePhase = Math.random() * 6.283;
        this.pulseSpeed = 0.3 + Math.random() * 0.8;
    }
}

class AmbientParticle {
    constructor(w, h) {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = -0.05 - Math.random() * 0.15;
        this.size = 0.8 + Math.random() * 2;
        this.opacity = 0.04 + Math.random() * 0.1;
        this.w = w; this.h = h;
    }
    update(dt) {
        this.x += this.vx * dt * 60; this.y += this.vy * dt * 60;
        if (this.y < -10) { this.y = this.h + 10; this.x = Math.random() * this.w; }
        if (this.x < -10) this.x = this.w + 10;
        if (this.x > this.w + 10) this.x = -10;
    }
}

class Connection {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA; this.nodeB = nodeB;
        this.layer = Math.min(nodeA.layerIndex, nodeB.layerIndex);
        this.opacity = CONFIG.connectionBaseOpacity + Math.random() * CONFIG.connectionBaseOpacity * 0.5;
        const dx = nodeB.baseX - nodeA.baseX, dy = nodeB.baseY - nodeA.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const bend = (Math.random() - 0.5) * dist * 0.3;
        this.bendX = (-dy / dist) * bend; this.bendY = (dx / dist) * bend;
        this._drawCPX = 0; this._drawCPY = 0;
    }
}

class DataPulse {
    constructor() { this.conn = null; this.progress = 0; this.speed = 0; this.alive = false; this.size = 0; }
    init(conn) {
        this.conn = conn; this.progress = 0;
        this.speed = CONFIG.flowSpeedRange[0] + Math.random() * (CONFIG.flowSpeedRange[1] - CONFIG.flowSpeedRange[0]);
        this.alive = true; this.size = 3 + Math.random() * 4;
    }
    update(dt) { this.progress += this.speed * dt; if (this.progress > 1) this.alive = false; }
    getPosition() {
        const t = this.progress, omt = 1 - t, a = this.conn.nodeA, b = this.conn.nodeB;
        return {
            x: omt * omt * a.drawX + 2 * omt * t * this.conn._drawCPX + t * t * b.drawX,
            y: omt * omt * a.drawY + 2 * omt * t * this.conn._drawCPY + t * t * b.drawY,
        };
    }
}

class QualityManager {
    constructor() {
        this.frameTimes = []; this.quality = 'high'; this.starsVisible = true;
        this.maxActivePulses = CONFIG.maxPulses; this.dprMultiplier = 1.0; this.checkInterval = 0;
    }
    recordFrame(dt) {
        this.frameTimes.push(dt);
        if (this.frameTimes.length > CONFIG.fpsWindow) this.frameTimes.shift();
        this.checkInterval++;
        if (this.checkInterval >= 30) { this.checkInterval = 0; this._evaluate(); }
    }
    _evaluate() {
        if (this.frameTimes.length < 20) return;
        const fps = this.frameTimes.length / this.frameTimes.reduce((a, b) => a + b, 0);
        if (fps < CONFIG.fpsLowThreshold) this._downgrade();
        else if (fps > CONFIG.fpsHighThreshold && this.quality !== 'high') this._upgrade();
    }
    _downgrade() {
        if (this.quality === 'high') {
            this.quality = 'medium'; this.starsVisible = true;
            this.maxActivePulses = 12; this.dprMultiplier = 0.8;
        } else if (this.quality === 'medium') {
            this.quality = 'low'; this.starsVisible = false;
            this.maxActivePulses = 6; this.dprMultiplier = 0.6;
        }
    }
    _upgrade() {
        if (this.quality === 'low') {
            this.quality = 'medium'; this.starsVisible = true;
            this.maxActivePulses = 12; this.dprMultiplier = 0.8;
        } else if (this.quality === 'medium') {
            this.quality = 'high'; this.starsVisible = true;
            this.maxActivePulses = CONFIG.maxPulses; this.dprMultiplier = 1.0;
        }
    }
}

/* ───────── ENGINE ───────── */
class CloudEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 0; this.height = 0;
        this.nodes = []; this.connections = [];
        this.connectionsByLayer = [[], [], [], []];
        this.nodesByLayer = [[], [], [], []];
        this.stars = []; this.ambientParticles = [];
        this.scrollProgress = 0;
        this.mouse = { x: 0, y: 0, sx: 0, sy: 0 };
        this.mouseActive = false;
        this._mSX = 0; this._mSY = 0;
        this.isRunning = false; this.frameId = null;
        this.lastTime = 0;
        this.frameInterval = 1000 / CONFIG.targetFPS;
        this.starCanvas = document.createElement('canvas');
        this.starCtx = this.starCanvas.getContext('2d');
        this.starFrameCounter = 0;
        this.pulsePool = [];
        for (let i = 0; i < CONFIG.maxPulses; i++) this.pulsePool.push(new DataPulse());
        this.activePulses = [];
        this.quality = new QualityManager();
        this.lastConnectionRebuild = 0;
        this._buildSprites();
    }

    _buildSprites() {
        const v = CONFIG.visual;
        this.sprites = {
            small: createSprite(v.small.sprite, [
                [0.0,'rgba(180,225,255,0.95)'],[0.08,'rgba(140,210,255,0.8)'],
                [0.25,'rgba(12,192,255,0.25)'],[0.5,'rgba(0,120,200,0.08)'],
                [1.0,'rgba(0,50,120,0)'],
            ]),
            medium: createSprite(v.medium.sprite, [
                [0.0,'rgba(210,240,255,1)'],[0.06,'rgba(170,230,255,0.85)'],
                [0.2,'rgba(12,192,255,0.3)'],[0.45,'rgba(0,130,210,0.1)'],
                [1.0,'rgba(0,50,120,0)'],
            ]),
            large: createSprite(v.large.sprite, [
                [0.0,'rgba(235,248,255,1)'],[0.05,'rgba(200,238,255,0.9)'],
                [0.15,'rgba(12,192,255,0.35)'],[0.4,'rgba(0,140,220,0.12)'],
                [1.0,'rgba(0,50,120,0)'],
            ]),
        };
        this.bloomSprites = {
            small: createSprite(v.small.bloomSprite, [
                [0.0,'rgba(12,192,255,0.08)'],[0.3,'rgba(0,120,200,0.03)'],
                [0.7,'rgba(0,60,130,0.01)'],[1.0,'rgba(0,20,60,0)'],
            ]),
            medium: createSprite(v.medium.bloomSprite, [
                [0.0,'rgba(12,192,255,0.12)'],[0.25,'rgba(0,130,210,0.05)'],
                [0.6,'rgba(0,60,130,0.015)'],[1.0,'rgba(0,20,60,0)'],
            ]),
            large: createSprite(v.large.bloomSprite, [
                [0.0,'rgba(12,192,255,0.18)'],[0.2,'rgba(0,140,220,0.07)'],
                [0.5,'rgba(0,70,140,0.02)'],[1.0,'rgba(0,20,60,0)'],
            ]),
        };
        this.pulseSprite = createSprite(24, [
            [0.0,'rgba(220,245,255,1)'],[0.15,'rgba(12,192,255,0.6)'],
            [0.4,'rgba(0,130,210,0.15)'],[1.0,'rgba(0,50,120,0)'],
        ]);
        const auraSize = CONFIG.mouseAuraRadius * 2;
        this.auraSprite = createSprite(auraSize, [
            [0.0,'rgba(12,192,255,0.18)'],[0.15,'rgba(12,192,255,0.10)'],
            [0.35,'rgba(0,120,200,0.04)'],[0.6,'rgba(0,60,130,0.015)'],
            [1.0,'rgba(0,20,60,0)'],
        ]);
    }

    _renderStarLayer(time) {
        const ctx = this.starCtx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = 'rgba(140,200,255,1)';
        for (const s of this.stars) {
            const p = s.brightness * (0.6 + 0.4 * Math.sin(s.pulsePhase + time * s.pulseSpeed));
            ctx.globalAlpha = p * 0.4;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    resize(w, h) {
        this.width = w; this.height = h;
        const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR) * this.quality.dprMultiplier;
        this.canvas.width = w * dpr; this.canvas.height = h * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.starCanvas.width = w; this.starCanvas.height = h;
        this._generate();
    }

    _generate() {
        this.nodes = []; this.connections = [];
        this.connectionsByLayer = [[], [], [], []];
        this.nodesByLayer = [[], [], [], []];
        this.activePulses = [];
        const m = 80, w = this.width, h = this.height;
        this.stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) this.stars.push(new Star(w, h));
        this.ambientParticles = [];
        for (let i = 0; i < CONFIG.ambientParticleCount; i++) this.ambientParticles.push(new AmbientParticle(w, h));
        const spawn = (count, type, layers, scrollThreshold) => {
            for (let i = 0; i < count; i++) {
                const li = layers[Math.floor(Math.random() * layers.length)];
                this.nodes.push(new ComputeNode(m + Math.random() * (w - m * 2), m + Math.random() * (h - m * 2), type, li, scrollThreshold));
            }
        };
        spawn(CONFIG.nodes.small, 'small', [0,0,1,1,2,2,3], 0);
        spawn(CONFIG.nodes.medium, 'medium', [0,1,1,2,2,3], 0);
        spawn(CONFIG.nodes.large, 'large', [1,2,2,3,3], 0);
        const sn = CONFIG.scrollNodes;
        const smW = Math.ceil(sn.small / 5), mdW = Math.ceil(sn.medium / 4), lgW = Math.ceil(sn.large / 3);
        for (let w2 = 0; w2 < 5; w2++) spawn(smW, 'small', [0,1,1,2,2,3], 0.15 + w2 * 0.17);
        for (let w2 = 0; w2 < 4; w2++) spawn(mdW, 'medium', [1,1,2,2,3], 0.2 + w2 * 0.2);
        for (let w2 = 0; w2 < 3; w2++) spawn(lgW, 'large', [2,2,3,3], 0.3 + w2 * 0.25);
        this._rebuildLookups();
    }

    _rebuildLookups() {
        this._buildConnections();
        this.nodesByLayer = [[], [], [], []];
        for (const n of this.nodes) {
            if (n.layerIndex >= 0 && n.layerIndex < 4) this.nodesByLayer[n.layerIndex].push(n);
        }
    }

    _buildConnections() {
        this.connections = [];
        this.connectionsByLayer = [[], [], [], []];
        const maxD = CONFIG.maxConnectionDist, maxC = CONFIG.maxConnectionsPerNode;
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
                const conn = new Connection(a, b);
                this.connections.push(conn);
                if (conn.layer >= 0 && conn.layer < 4) this.connectionsByLayer[conn.layer].push(conn);
                a.connectionCount++; b.connectionCount++;
            }
        }
    }

    _getPulse() {
        for (const p of this.pulsePool) { if (!p.alive) return p; }
        return null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this._loop();
    }

    stop() {
        this.isRunning = false;
        if (this.frameId) { cancelAnimationFrame(this.frameId); this.frameId = null; }
    }

    /* ── GŁÓWNA PĘTLA: update + draw razem @ targetFPS ── */
    _loop() {
        if (!this.isRunning) return;
        this.frameId = requestAnimationFrame(() => this._loop());

        const now = performance.now();
        const elapsed = now - this.lastTime;
        if (elapsed < this.frameInterval) return;

        this.lastTime = now - (elapsed % this.frameInterval);
        const dt = Math.min(elapsed / 1000, 0.05);
        const time = now / 1000;

        this.quality.recordFrame(dt);
        this._update(time, dt);
        this._draw(time);
    }

    _update(time, dt) {
        /* mouse lerp */
        const lerp = CONFIG.mouseLerp;
        this.mouse.sx += (this.mouse.x - this.mouse.sx) * lerp;
        this.mouse.sy += (this.mouse.y - this.mouse.sy) * lerp;

        /* nodes */
        for (const n of this.nodes) n.update(time, dt, this.scrollProgress);

        /* autoscale */
        if (Math.random() < CONFIG.autoscaleChance && this.nodes.length > 20) {
            const base = this.nodes.filter(n => n.scrollThreshold === 0 && !n.fadingOut && !n.fadingIn && n.type === 'small');
            if (base.length > 0) base[Math.floor(Math.random() * base.length)].startFadeOut();
        }
        if (Math.random() < CONFIG.autoscaleChance) {
            const m = 80;
            const n = new ComputeNode(
                m + Math.random() * (this.width - m * 2),
                m + Math.random() * (this.height - m * 2),
                'small', [0,1,1,2][Math.floor(Math.random() * 4)], 0
            );
            n.fadingIn = true; n.opacity = 0; n.fadeTimer = 0;
            this.nodes.push(n);
            if (n.layerIndex >= 0 && n.layerIndex < 4) this.nodesByLayer[n.layerIndex].push(n);
        }

        /* dead-node removal (in-place) */
        let writeIdx = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].alive) this.nodes[writeIdx++] = this.nodes[i];
        }
        if (writeIdx < this.nodes.length) {
            this.nodes.length = writeIdx;
            this.nodesByLayer = [[], [], [], []];
            for (const n of this.nodes) {
                if (n.layerIndex >= 0 && n.layerIndex < 4) this.nodesByLayer[n.layerIndex].push(n);
            }
        }

        /* ambient particles */
        for (const p of this.ambientParticles) p.update(dt);

        /* ── mouse proximity + drawX/drawY (przeniesione z _draw) ── */
        if (this.mouseActive) {
            this._mSX = (this.mouse.sx + 1) * 0.5 * this.width;
            this._mSY = (-this.mouse.sy + 1) * 0.5 * this.height;
            const radius = CONFIG.mouseInteractRadius;
            const radiusSq = radius * radius;
            const force = CONFIG.mouseRepelForce;
            for (const node of this.nodes) {
                const dx = node.x - this._mSX, dy = node.y - this._mSY;
                const distSq = dx * dx + dy * dy;
                if (distSq < radiusSq && distSq > 1) {
                    const dist = Math.sqrt(distSq);
                    const t = 1 - dist / radius;
                    const tt = t * t;
                    node.drawX = node.x + (dx / dist) * tt * force;
                    node.drawY = node.y + (dy / dist) * tt * force;
                    node.mouseProximity = tt;
                } else {
                    node.drawX = node.x; node.drawY = node.y; node.mouseProximity = 0;
                }
            }
        } else {
            for (const node of this.nodes) {
                node.drawX = node.x; node.drawY = node.y; node.mouseProximity = 0;
            }
        }

        /* ── connection control points (przeniesione z _draw) ── */
        for (const c of this.connections) {
            if (!c.nodeA.alive || !c.nodeB.alive) continue;
            c._drawCPX = (c.nodeA.drawX + c.nodeB.drawX) * 0.5 + c.bendX;
            c._drawCPY = (c.nodeA.drawY + c.nodeB.drawY) * 0.5 + c.bendY;
        }

        /* pulses */
        const rate = CONFIG.flowSpawnChance * (1 + this.scrollProgress * CONFIG.flowSpawnScrollMultiplier);
        const maxP = this.quality.maxActivePulses;
        for (const conn of this.connections) {
            if (!conn.nodeA.alive || !conn.nodeB.alive) continue;
            if (conn.nodeA.opacity < 0.1 || conn.nodeB.opacity < 0.1) continue;
            if (Math.random() < rate && this.activePulses.length < maxP) {
                const p = this._getPulse();
                if (p) { p.init(conn); if (!this.activePulses.includes(p)) this.activePulses.push(p); }
            }
        }
        for (const p of this.activePulses) p.update(dt);

        /* dead-pulse removal (in-place) */
        writeIdx = 0;
        for (let i = 0; i < this.activePulses.length; i++) {
            if (this.activePulses[i].alive) this.activePulses[writeIdx++] = this.activePulses[i];
        }
        this.activePulses.length = writeIdx;

        /* connection rebuild */
        this.lastConnectionRebuild += dt;
        if (this.lastConnectionRebuild > CONFIG.connectionRebuildInterval) {
            this.lastConnectionRebuild = 0; this._rebuildLookups();
        }
    }

    /* ── DRAW: tylko renderowanie, bez obliczeń ── */
    _draw(time) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        const scrollBoost = 1 + this.scrollProgress * CONFIG.scrollBrightness;

        /* stars */
        if (this.quality.starsVisible) {
            this.starFrameCounter++;
            if (this.starFrameCounter >= CONFIG.starRedrawInterval) {
                this.starFrameCounter = 0; this._renderStarLayer(time);
            }
            ctx.globalAlpha = scrollBoost;
            ctx.drawImage(this.starCanvas, 0, 0);
        }

        /* mouse aura */
        if (this.mouseActive) {
            const auraSize = CONFIG.mouseAuraRadius * 2;
            ctx.globalAlpha = CONFIG.mouseAuraOpacity * (1 + this.scrollProgress * 0.5);
            ctx.drawImage(this.auraSprite, this._mSX - auraSize * 0.5, this._mSY - auraSize * 0.5, auraSize, auraSize);
        }

        /* ambient particles */
        ctx.fillStyle = 'rgba(12,192,255,1)';
        for (const p of this.ambientParticles) {
            ctx.globalAlpha = p.opacity * scrollBoost;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
        }

        /* layers */
        for (let L = 0; L < 4; L++) {
            const br = CONFIG.layers[L].brightness * scrollBoost;
            const layerConns = this.connectionsByLayer[L];
            const layerNodes = this.nodesByLayer[L];

            ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(12,176,240,1)';
            for (const c of layerConns) {
                const a = c.nodeA, b = c.nodeB;
                const nA = Math.min(a.opacity, b.opacity);
                if (nA < 0.01) continue;
                const pB = 1 + Math.max(a.mouseProximity, b.mouseProximity) * CONFIG.mouseBrightnessBoost;
                ctx.globalAlpha = c.opacity * br * 0.7 * nA * pB;
                ctx.beginPath(); ctx.moveTo(a.drawX, a.drawY);
                ctx.quadraticCurveTo(c._drawCPX, c._drawCPY, b.drawX, b.drawY);
                ctx.stroke();
            }

            for (const p of this.activePulses) {
                if (p.conn.layer !== L) continue;
                const pos = p.getPosition();
                const fI = Math.min(p.progress * 4, 1), fO = Math.min((1 - p.progress) * 4, 1);
                ctx.globalAlpha = fI * fO * br;
                const s = p.size;
                ctx.drawImage(this.pulseSprite, pos.x - s * 1.5, pos.y - s * 1.5, s * 3, s * 3);
            }

            for (const node of layerNodes) {
                if (node.opacity < 0.01) continue;
                const int = node.pulse(time), vis = CONFIG.visual[node.type];
                const nA = node.opacity;
                const pBr = 1 + node.mouseProximity * CONFIG.mouseBrightnessBoost;
                const pSz = 1 + node.mouseProximity * CONFIG.mouseSizeBoost;

                const bS = vis.bloom * 2 * (0.85 + 0.15 * int) * pSz;
                ctx.globalAlpha = br * 0.5 * int * nA * pBr;
                ctx.drawImage(this.bloomSprites[node.type], node.drawX - bS * 0.5, node.drawY - bS * 0.5, bS, bS);

                const gS = vis.glow * 2 * (0.8 + 0.2 * int) * pSz;
                ctx.globalAlpha = br * (0.65 + 0.35 * int) * nA * pBr;
                ctx.drawImage(this.sprites[node.type], node.drawX - gS * 0.5, node.drawY - gS * 0.5, gS, gS);

                if (node.hasRing) {
                    ctx.globalAlpha = br * 0.2 * int * nA * pBr;
                    ctx.strokeStyle = 'rgba(12,192,255,1)'; ctx.lineWidth = 0.6;
                    ctx.save(); ctx.translate(node.drawX, node.drawY);
                    ctx.rotate(node.ringAngle); ctx.scale(1, 0.32);
                    ctx.beginPath(); ctx.arc(0, 0, vis.glow * 0.7 * pSz, 0, 6.283); ctx.stroke();
                    ctx.restore();
                    if (node.hasDoubleRing) {
                        ctx.globalAlpha = br * 0.12 * int * nA * pBr;
                        ctx.save(); ctx.translate(node.drawX, node.drawY);
                        ctx.rotate(-node.ringAngle * 0.6); ctx.scale(1, 0.28);
                        ctx.beginPath(); ctx.arc(0, 0, vis.glow * 1.05 * pSz, 0, 6.283); ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    setScroll(v) { this.scrollProgress = Math.max(0, Math.min(1, v)); }
    setMouse(x, y) { this.mouse.x = x; this.mouse.y = y; this.mouseActive = true; }
    dispose() {
        this.stop();
        this.nodes = []; this.connections = [];
        this.connectionsByLayer = [[], [], [], []]; this.nodesByLayer = [[], [], [], []];
        this.activePulses = []; this.stars = []; this.ambientParticles = [];
    }
}

/* ───────── REACT COMPONENT ───────── */
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
            resizeTimer = setTimeout(() => engine.resize(window.innerWidth, window.innerHeight), 200);
        };
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            engine.setScroll(max > 0 ? window.scrollY / max : 0);
        };

        /* ── mousemove z throttle 32ms ── */
        let lastMouseTime = 0;
        const onMouse = (e) => {
            const now = performance.now();
            if (now - lastMouseTime < 32) return;
            lastMouseTime = now;
            engine.setMouse(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
        };

        const onVisibility = () => { document.hidden ? engine.stop() : engine.start(); };

        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousemove', onMouse, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        onScroll();

        return () => {
            clearTimeout(resizeTimer);
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