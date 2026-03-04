/* ============================================
   INTELLIGENCE WAREHOUSE — Interactions & Canvas
   Full-screen Knowledge Graph with Click Panels
   ============================================ */

(function () {
    'use strict';

    // === NAV SCROLL EFFECT ===
    const nav = document.getElementById('nav');
    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // === MOBILE MENU ===
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }

    // === SMOOTH SCROLL ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

    // === SCROLL ANIMATIONS ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '50px 0px -20px 0px', threshold: 0.05 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // === TERMINAL CURSOR BLINK ===
    (function () {
        const cursor = document.querySelector('.t-cursor');
        if (!cursor) return;
        let v = true;
        setInterval(() => { v = !v; cursor.style.opacity = v ? '1' : '0'; }, 600);
    })();

    // === PROCESS FLOW STAGGER ===
    (function () {
        const flow = document.querySelector('.process-flow');
        if (!flow) return;
        const steps = flow.querySelectorAll('.process-step');
        const connectors = flow.querySelectorAll('.process-connector');
        steps.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateY(24px)'; s.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; });
        connectors.forEach(c => { c.style.opacity = '0'; c.style.transition = 'opacity 0.4s ease'; });
        const flowObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let delay = 0;
                    for (let i = 0; i < flow.children.length; i++) {
                        const child = flow.children[i];
                        const d = delay;
                        setTimeout(() => { child.style.opacity = '1'; child.style.transform = 'translateY(0)'; }, d);
                        delay += child.classList.contains('process-step') ? 200 : 120;
                    }
                    flowObs.unobserve(flow);
                }
            });
        }, { threshold: 0.15 });
        flowObs.observe(flow);
    })();

    // === COUNTER ANIMATION ===
    document.querySelectorAll('[data-target]').forEach(counter => {
        const cObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(counter.getAttribute('data-target'));
                    const startTime = performance.now();
                    function update(t) {
                        const p = Math.min((t - startTime) / 2000, 1);
                        counter.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
                        if (p < 1) requestAnimationFrame(update); else counter.textContent = target;
                    }
                    requestAnimationFrame(update);
                    cObs.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        cObs.observe(counter);
    });


    // =====================================================
    //  HERO PARTICLE CANVAS — Ambient background
    // =====================================================
    (function heroParticles() {
        const hCanvas = document.getElementById('heroCanvas');
        if (!hCanvas) return;
        const ctx = hCanvas.getContext('2d');
        const hero = document.querySelector('.hero');
        let W = 0, H = 0, dpr = 1;
        let particles = [];
        let animId = null;

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.r = Math.random() * 1.5 + 0.3;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.alpha = Math.random() * 0.25 + 0.08;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(99,102,241,' + this.alpha + ')';
                ctx.fill();
            }
        }

        function resize() {
            dpr = window.devicePixelRatio || 1;
            W = hero.clientWidth;
            H = hero.clientHeight;
            hCanvas.width = W * dpr;
            hCanvas.height = H * dpr;
            hCanvas.style.width = W + 'px';
            hCanvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles();
        }

        function initParticles() {
            const count = Math.min(Math.floor((W * H) / 8000), 120);
            particles = [];
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(99,102,241,' + (0.06 * (1 - dist / 120)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            animId = requestAnimationFrame(animate);
        }

        resize();
        animate();
        window.addEventListener('resize', resize);

        // Pause when not visible
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animId) animate();
                } else {
                    if (animId) { cancelAnimationFrame(animId); animId = null; }
                }
            });
        }, { threshold: 0 });
        obs.observe(hero);
    })();


    // =====================================================
    //  HERO GRAPH VISUAL — Before/After transformation
    // =====================================================
    (function heroGraphVisual() {
        const canvas = document.getElementById('heroGraphCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('heroVisual');
        const label = document.getElementById('heroVisualLabel');
        const labelText = label ? label.querySelector('.hvl-text') : null;
        let W = 0, H = 0, dpr = 1;
        let animId = null;

        // Theme-matched colors (teal/copper/warm palette)
        const COLORS = ['#1B6B5A','#24846F','#B8734A','#2D9B80','#D4956A','#3BAA8A','#A09D98'];
        const LABELS_SCATTERED = [
            'ERP','CRM','POS','Warehouse','API','Forecast','Inventory',
            'Pipeline','Campaign','Pricing','Orders','Supply','Revenue',
            'Customer','Product','Region'
        ];

        // Node definitions — 16 nodes
        const NODES = [];
        for (let i = 0; i < 16; i++) {
            NODES.push({
                label: LABELS_SCATTERED[i],
                color: COLORS[i % COLORS.length],
                // scattered positions (random)
                sx: 0, sy: 0,
                // connected positions (structured graph)
                cx: 0, cy: 0,
                // current animated position
                x: 0, y: 0,
                r: i < 5 ? 22 : (i < 10 ? 18 : 14),
                type: i < 3 ? 'decision' : (i < 7 ? 'kpi' : 'ontology')
            });
        }

        // Edges for connected state (pairs of node indices)
        const EDGES = [
            [0,7],[0,3],[1,4],[1,13],[2,5],[2,9],[3,6],[3,10],
            [4,8],[4,11],[5,12],[5,14],[6,10],[7,13],[7,15],
            [8,9],[9,15],[10,11],[11,14],[12,13],[12,15],[13,14],
            [0,1],[1,2],[6,14],[8,15]
        ];

        let phase = 0; // 0 = scattered, 1 = transitioning to connected, 2 = connected, 3 = transitioning to scattered
        let phaseTime = 0;
        const SCATTER_DURATION = 2000;
        const TRANSITION_DURATION = 1000;
        const CONNECTED_DURATION = 3000;
        let edgeAlpha = 0;
        let globalTime = 0;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            W = container.clientWidth;
            H = container.clientHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            layoutPositions();
        }

        function layoutPositions() {
            const cx = W / 2, cy = H / 2;
            const spread = Math.min(W, H) * 0.42;

            // Scattered: random clustered groups (silo-like)
            const siloOffsets = [
                {x: -0.42, y: -0.40}, {x: 0.42, y: -0.35}, {x: -0.38, y: 0.40},
                {x: 0.40, y: 0.38}, {x: 0, y: 0}
            ];
            for (let i = 0; i < NODES.length; i++) {
                const silo = siloOffsets[i % siloOffsets.length];
                NODES[i].sx = cx + silo.x * spread + (Math.random() - 0.5) * spread * 0.22;
                NODES[i].sy = cy + silo.y * spread + (Math.random() - 0.5) * spread * 0.22;
            }

            // Connected: arranged in a nice graph layout (circular with some central)
            const ring1 = 8; // outer ring
            const ring2 = 5; // inner ring
            const center = 3; // center cluster
            for (let i = 0; i < NODES.length; i++) {
                if (i < center) {
                    // Center nodes
                    const angle = (i / center) * Math.PI * 2 - Math.PI / 2;
                    NODES[i].cx = cx + Math.cos(angle) * spread * 0.12;
                    NODES[i].cy = cy + Math.sin(angle) * spread * 0.12;
                } else if (i < center + ring2) {
                    // Inner ring
                    const idx = i - center;
                    const angle = (idx / ring2) * Math.PI * 2 - Math.PI / 2;
                    NODES[i].cx = cx + Math.cos(angle) * spread * 0.45;
                    NODES[i].cy = cy + Math.sin(angle) * spread * 0.45;
                } else {
                    // Outer ring
                    const idx = i - center - ring2;
                    const total = NODES.length - center - ring2;
                    const angle = (idx / total) * Math.PI * 2 - Math.PI / 3;
                    NODES[i].cx = cx + Math.cos(angle) * spread * 0.82;
                    NODES[i].cy = cy + Math.sin(angle) * spread * 0.82;
                }
            }

            // Init positions to scattered
            NODES.forEach(n => { n.x = n.sx; n.y = n.sy; });
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function lerp(a, b, t) { return a + (b - a) * t; }

        function update(dt) {
            globalTime += dt;
            phaseTime += dt;

            if (phase === 0 && phaseTime > SCATTER_DURATION) {
                phase = 1; phaseTime = 0;
            } else if (phase === 1 && phaseTime > TRANSITION_DURATION) {
                phase = 2; phaseTime = 0;
                if (label) { label.classList.add('connected'); }
                if (labelText) { labelText.textContent = 'Intelligence Graph'; }
            } else if (phase === 2 && phaseTime > CONNECTED_DURATION) {
                phase = 3; phaseTime = 0;
            } else if (phase === 3 && phaseTime > TRANSITION_DURATION) {
                phase = 0; phaseTime = 0;
                if (label) { label.classList.remove('connected'); }
                if (labelText) { labelText.textContent = 'Fragmented Data'; }
            }

            // Animate node positions
            if (phase === 1) {
                const t = easeInOutCubic(Math.min(phaseTime / TRANSITION_DURATION, 1));
                edgeAlpha = t;
                NODES.forEach(n => {
                    n.x = lerp(n.sx, n.cx, t);
                    n.y = lerp(n.sy, n.cy, t);
                });
            } else if (phase === 3) {
                const t = easeInOutCubic(Math.min(phaseTime / TRANSITION_DURATION, 1));
                edgeAlpha = 1 - t;
                NODES.forEach(n => {
                    n.x = lerp(n.cx, n.sx, t);
                    n.y = lerp(n.cy, n.sy, t);
                });
            } else if (phase === 0) {
                edgeAlpha = 0;
                // Gentle floating in scattered state
                NODES.forEach((n, i) => {
                    n.x = n.sx + Math.sin(globalTime * 0.0008 + i * 0.7) * 4;
                    n.y = n.sy + Math.cos(globalTime * 0.0006 + i * 1.1) * 4;
                });
            } else if (phase === 2) {
                edgeAlpha = 1;
                // Gentle breathing in connected state
                NODES.forEach((n, i) => {
                    n.x = n.cx + Math.sin(globalTime * 0.001 + i * 0.5) * 2;
                    n.y = n.cy + Math.cos(globalTime * 0.0008 + i * 0.8) * 2;
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Draw edges
            if (edgeAlpha > 0.01) {
                EDGES.forEach(([a, b]) => {
                    const na = NODES[a], nb = NODES[b];
                    ctx.beginPath();
                    ctx.moveTo(na.x, na.y);
                    ctx.lineTo(nb.x, nb.y);
                    ctx.strokeStyle = 'rgba(79,70,229,' + (0.18 * edgeAlpha) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });

                // Pulse traveling along edges in connected state
                if (phase === 2) {
                    const pulseEdgeIdx = Math.floor((globalTime * 0.002) % EDGES.length);
                    const pulseT = ((globalTime * 0.002) % 1);
                    const [pa, pb] = EDGES[pulseEdgeIdx];
                    const na = NODES[pa], nb = NODES[pb];
                    const px = lerp(na.x, nb.x, pulseT);
                    const py = lerp(na.y, nb.y, pulseT);
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(79,70,229,0.6)';
                    ctx.fill();
                }
            }

            // Draw nodes
            NODES.forEach((n, i) => {
                // Outer glow
                if (edgeAlpha > 0.5) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
                    ctx.fillStyle = n.color.replace(')', ',0.06)').replace('rgb', 'rgba');
                    ctx.fill();
                }

                // Node body
                ctx.beginPath();
                if (n.type === 'decision') {
                    // Triangle for decision nodes
                    const s = n.r * 0.9;
                    ctx.moveTo(n.x, n.y - s);
                    ctx.lineTo(n.x + s * 0.87, n.y + s * 0.5);
                    ctx.lineTo(n.x - s * 0.87, n.y + s * 0.5);
                    ctx.closePath();
                    ctx.fillStyle = n.color + '18';
                    ctx.fill();
                    ctx.strokeStyle = n.color;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else if (n.type === 'kpi') {
                    // Ringed circle for KPI
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = n.color + '10';
                    ctx.fill();
                    ctx.strokeStyle = n.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Inner dot
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = n.color;
                    ctx.fill();
                } else {
                    // Filled circle for ontology
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = n.color;
                    ctx.globalAlpha = 0.85;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }

                // Labels (only in connected state)
                if (edgeAlpha > 0.3 && n.r >= 18) {
                    ctx.font = '500 ' + (n.r > 20 ? '9' : '8') + 'px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(74,80,104,' + (edgeAlpha * 0.8) + ')';
                    ctx.textAlign = 'center';
                    ctx.fillText(n.label, n.x, n.y + n.r + 14);
                }
            });
        }

        let lastTime = 0;
        let running = false;

        function tick() {
            const now = performance.now();
            const dt = lastTime ? now - lastTime : 16;
            lastTime = now;
            update(dt);
            draw();
            if (running) scheduleNext();
        }

        function scheduleNext() {
            if (document.hidden) {
                animId = setTimeout(tick, 32);
            } else {
                animId = requestAnimationFrame(function() { tick(); });
            }
        }

        function start() {
            if (running) return;
            running = true;
            lastTime = 0;
            scheduleNext();
        }

        function stop() {
            running = false;
            if (animId) {
                cancelAnimationFrame(animId);
                clearTimeout(animId);
                animId = null;
            }
        }

        resize();
        start();
        window.addEventListener('resize', resize);

        // Pause when scrolled out of view
        const hvo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { start(); }
                else { stop(); }
            });
        }, { threshold: 0 });
        hvo.observe(container);
    })();


    // =====================================================
    //  FULL-SCREEN INTERACTIVE KNOWLEDGE GRAPH
    //  Three node types: Ontology, KPI (Metrics), Decision
    // =====================================================
    (function ontologyGraph() {
        const canvas = document.getElementById('ontologyCanvas');
        if (!canvas) return;

        const c = canvas.getContext('2d');
        const tooltip = document.getElementById('ontologyTooltip');
        const heroSection = document.querySelector('.graph-container');

        let W = 0, H = 0, dpr = 1;
        let animId = null, time = 0;
        let activeLayer = 'all';
        let hoveredNode = null;
        let selectedNode = null;
        let mouseX = -9999, mouseY = -9999;

        // ---- Color map ----
        const COLORS = {
            'supply-chain': '#3b82f6',
            'sales':        '#1B854A',
            'pricing':      '#B8734A',
            'marketing':    '#D4956A',
            'assortment':   '#C4453C',
            'core':         '#1B6B5A',
            'metrics':      '#14b8a6',
            'decisions':    '#C4453C'
        };

        // ---- NODE DATA ----
        // type: 'ontology' (circle), 'kpi' (ringed circle), 'decision' (triangle)
        const NODE_DATA = [
            // === CORE ONTOLOGY NODES ===
            { id: 'Product',        label: 'Product',          group: 'core', type: 'ontology', fx: 0.42, fy: 0.40, radius: 18 },
            { id: 'Customer',       label: 'Customer',         group: 'core', type: 'ontology', fx: 0.56, fy: 0.52, radius: 16 },
            { id: 'CalendarDate',   label: 'Calendar Date',    group: 'core', type: 'ontology', fx: 0.48, fy: 0.26, radius: 12 },
            { id: 'Channel',        label: 'Channel',          group: 'core', type: 'ontology', fx: 0.38, fy: 0.56, radius: 12 },
            { id: 'Region',         label: 'Region',           group: 'core', type: 'ontology', fx: 0.58, fy: 0.35, radius: 12 },
            { id: 'Brand',          label: 'Brand',            group: 'core', type: 'ontology', fx: 0.46, fy: 0.49, radius: 11 },
            { id: 'Category',       label: 'Category',         group: 'core', type: 'ontology', fx: 0.52, fy: 0.44, radius: 11 },
            { id: 'SKU',            label: 'SKU',              group: 'core', type: 'ontology', fx: 0.44, fy: 0.34, radius: 14 },
            { id: 'Variant',        label: 'Variant',          group: 'core', type: 'ontology', fx: 0.39, fy: 0.30, radius: 10 },
            { id: 'UoM',            label: 'UoM',              group: 'core', type: 'ontology', fx: 0.36, fy: 0.44, radius: 9 },

            // === SUPPLY CHAIN ONTOLOGY ===
            { id: 'Forecast',           label: 'Forecast',              group: 'supply-chain', type: 'ontology', fx: 0.14, fy: 0.18, radius: 14 },
            { id: 'SafetyStock',        label: 'Safety Stock',          group: 'supply-chain', type: 'ontology', fx: 0.07, fy: 0.30, radius: 12 },
            { id: 'InventoryBatch',     label: 'Inventory Batch',       group: 'supply-chain', type: 'ontology', fx: 0.19, fy: 0.32, radius: 11 },
            { id: 'ReorderPoint',       label: 'Reorder Point',         group: 'supply-chain', type: 'ontology', fx: 0.11, fy: 0.42, radius: 10 },
            { id: 'LeadTime',           label: 'Lead Time',             group: 'supply-chain', type: 'ontology', fx: 0.05, fy: 0.16, radius: 9 },
            { id: 'Supplier',           label: 'Supplier',              group: 'supply-chain', type: 'ontology', fx: 0.21, fy: 0.10, radius: 13 },
            { id: 'PurchaseOrder',      label: 'Purchase Order',        group: 'supply-chain', type: 'ontology', fx: 0.09, fy: 0.08, radius: 11 },
            { id: 'DistributionCenter', label: 'Distribution Center',   group: 'supply-chain', type: 'ontology', fx: 0.24, fy: 0.22, radius: 12 },

            // === SALES ONTOLOGY ===
            { id: 'Territory',   label: 'Territory',     group: 'sales', type: 'ontology', fx: 0.80, fy: 0.14, radius: 12 },
            { id: 'SalesRep',    label: 'Sales Rep',     group: 'sales', type: 'ontology', fx: 0.88, fy: 0.22, radius: 13 },
            { id: 'Pipeline',    label: 'Pipeline',      group: 'sales', type: 'ontology', fx: 0.76, fy: 0.26, radius: 11 },
            { id: 'Quota',       label: 'Quota',         group: 'sales', type: 'ontology', fx: 0.86, fy: 0.12, radius: 10 },
            { id: 'Account',     label: 'Account',       group: 'sales', type: 'ontology', fx: 0.73, fy: 0.18, radius: 12 },
            { id: 'SalesTarget', label: 'Sales Target',  group: 'sales', type: 'ontology', fx: 0.91, fy: 0.08, radius: 10 },

            // === PRICING ONTOLOGY ===
            { id: 'PriceList',       label: 'Price List',        group: 'pricing', type: 'ontology', fx: 0.78, fy: 0.60, radius: 13 },
            { id: 'Markdown',        label: 'Markdown',          group: 'pricing', type: 'ontology', fx: 0.86, fy: 0.68, radius: 11 },
            { id: 'Promotion',       label: 'Promotion',         group: 'pricing', type: 'ontology', fx: 0.73, fy: 0.72, radius: 12 },
            { id: 'Elasticity',      label: 'Elasticity',        group: 'pricing', type: 'ontology', fx: 0.90, fy: 0.58, radius: 10 },
            { id: 'CompetitorPrice', label: 'Competitor Price',   group: 'pricing', type: 'ontology', fx: 0.83, fy: 0.78, radius: 10 },

            // === MARKETING ONTOLOGY ===
            { id: 'Campaign',          label: 'Campaign',            group: 'marketing', type: 'ontology', fx: 0.16, fy: 0.70, radius: 14 },
            { id: 'AudienceSegment',   label: 'Audience Segment',    group: 'marketing', type: 'ontology', fx: 0.09, fy: 0.80, radius: 12 },
            { id: 'Attribution',       label: 'Attribution',         group: 'marketing', type: 'ontology', fx: 0.23, fy: 0.82, radius: 10 },
            { id: 'BudgetAllocation',  label: 'Budget Allocation',   group: 'marketing', type: 'ontology', fx: 0.07, fy: 0.63, radius: 11 },
            { id: 'CreativeAsset',     label: 'Creative Asset',      group: 'marketing', type: 'ontology', fx: 0.20, fy: 0.60, radius: 10 },

            // === ASSORTMENT ONTOLOGY ===
            { id: 'Planogram',      label: 'Planogram',           group: 'assortment', type: 'ontology', fx: 0.40, fy: 0.80, radius: 12 },
            { id: 'RangePlan',      label: 'Range Plan',          group: 'assortment', type: 'ontology', fx: 0.53, fy: 0.82, radius: 12 },
            { id: 'NewProductIntro',label: 'New Product Intro',   group: 'assortment', type: 'ontology', fx: 0.36, fy: 0.90, radius: 10 },
            { id: 'Localization',   label: 'Localization',        group: 'assortment', type: 'ontology', fx: 0.58, fy: 0.90, radius: 10 },
            { id: 'ShelfSpace',     label: 'Shelf Space',         group: 'assortment', type: 'ontology', fx: 0.48, fy: 0.76, radius: 11 },

            // === KPI NODES (Metrics — from BI tools) ===
            { id: 'FillRate',       label: 'Fill Rate',           group: 'metrics', type: 'kpi', fx: 0.64, fy: 0.48, radius: 15,
              meta: { code: 'M104', badge: 'Service Metric', intent: 'Primary order service metric — measures percentage of customer orders fulfilled completely from available stock.',
                      formula: 'SUM(fulfilled_cases) /\nSUM(requested_cases)', unit: '%', inputNodes: 2,
                      grain: 'Ship-from Node × Customer × SKU × Month',
                      components: [{ id: 'SalesOrderLine', group: 'sales', label: 'SalesOrderLine' }, { id: 'FulfillmentLine', group: 'sales', label: 'FulfillmentLine' }],
                      dimensions: [{ label: 'SupplyNode', color: '#f59e0b' }, { label: 'Customer', color: '#10b981' }, { label: 'SKU', color: '#3b82f6' }] }},

            { id: 'RevenueGrowth',  label: 'Revenue Growth',      group: 'metrics', type: 'kpi', fx: 0.82, fy: 0.42, radius: 14,
              meta: { code: 'M201', badge: 'Growth Metric', intent: 'Year-over-year revenue growth rate by product category and region.',
                      formula: '(Revenue_Current - Revenue_Prior) /\nRevenue_Prior × 100', unit: '%', inputNodes: 3,
                      grain: 'Category × Region × Quarter',
                      components: [{ id: 'Revenue', group: 'sales', label: 'Revenue' }, { id: 'CalendarDate', group: 'core', label: 'CalendarDate' }],
                      dimensions: [{ label: 'Category', color: '#1B6B5A' }, { label: 'Region', color: '#1B6B5A' }, { label: 'Quarter', color: '#14b8a6' }] }},

            { id: 'OTIF',           label: 'OTIF %',              group: 'metrics', type: 'kpi', fx: 0.65, fy: 0.64, radius: 13,
              meta: { code: 'M108', badge: 'Service Metric', intent: 'On-Time In-Full delivery performance. Combined measure of delivery timeliness and order completeness.',
                      formula: 'COUNT(on_time AND in_full) /\nCOUNT(total_deliveries)', unit: '%', inputNodes: 4,
                      grain: 'Ship-from Node × Customer × SKU × Week',
                      components: [{ id: 'FillRate', group: 'metrics', label: 'Fill Rate' }, { id: 'LeadTime', group: 'supply-chain', label: 'LeadTime' }],
                      dimensions: [{ label: 'SupplyNode', color: '#f59e0b' }, { label: 'Customer', color: '#10b981' }] }},

            { id: 'GrossMargin',    label: 'Gross Margin',        group: 'metrics', type: 'kpi', fx: 0.74, fy: 0.50, radius: 14,
              meta: { code: 'M305', badge: 'Financial Metric', intent: 'Gross profit margin after cost of goods sold. Key profitability indicator by product and channel.',
                      formula: '(Revenue - COGS) / Revenue × 100', unit: '%', inputNodes: 2,
                      grain: 'SKU × Channel × Month',
                      components: [{ id: 'Revenue', group: 'sales', label: 'Revenue' }, { id: 'PriceList', group: 'pricing', label: 'PriceList' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'Channel', color: '#1B6B5A' }, { label: 'Month', color: '#14b8a6' }] }},

            { id: 'ForecastAccuracy', label: 'Forecast Accuracy', group: 'metrics', type: 'kpi', fx: 0.28, fy: 0.46, radius: 12,
              meta: { code: 'M112', badge: 'Planning Metric', intent: 'Measures how closely demand forecasts match actual sales. Critical for inventory planning.',
                      formula: '1 - ABS(Forecast - Actual) /\nActual', unit: '%', inputNodes: 2,
                      grain: 'SKU × Region × Month',
                      components: [{ id: 'Forecast', group: 'supply-chain', label: 'Forecast' }, { id: 'Revenue', group: 'sales', label: 'Revenue (Actual)' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'Region', color: '#1B6B5A' }] }},

            { id: 'SalesVolume',    label: 'Sales Volume',        group: 'metrics', type: 'kpi', fx: 0.68, fy: 0.22, radius: 12,
              meta: { code: 'M055', badge: 'Volume Metric', intent: 'Total cases sold across channels. Primary volume indicator for demand planning.',
                      formula: 'SUM(cases_sold)', unit: 'Cases', inputNodes: 1,
                      grain: 'SKU × Customer × Channel × Week',
                      components: [{ id: 'Product', group: 'core', label: 'Product' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'Customer', color: '#10b981' }, { label: 'Channel', color: '#1B6B5A' }] }},

            // === DECISION NODES (Triangles) ===
            { id: 'ReorderDecision',    label: 'Reorder Decision',     group: 'decisions', type: 'decision', fx: 0.16, fy: 0.52, radius: 16,
              meta: { code: 'D001', badge: 'Supply Decision', intent: 'Determines when and how much to reorder based on inventory position, safety stock levels, and lead time constraints.',
                      rule: 'IF inventory_position < reorder_point\n  AND lead_time <= supplier_lead_time\nTHEN generate_PO(\n  qty = EOQ,\n  supplier = preferred_supplier\n)', unit: 'PO', inputNodes: 4,
                      grain: 'SKU × Distribution Center × Day',
                      components: [{ id: 'SafetyStock', group: 'supply-chain', label: 'Safety Stock' }, { id: 'ReorderPoint', group: 'supply-chain', label: 'Reorder Point' }, { id: 'LeadTime', group: 'supply-chain', label: 'Lead Time' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'DC', color: '#3b82f6' }],
                      traversal: {
                          title: 'Reorder Trigger Analysis',
                          question: 'Should we place a reorder for Lay\'s 48g Spanish Tomato at Delhi DC based on current stock levels?',
                          steps: [
                              { num: '#1', title: 'Resolve SKU and Location', reasoning: '"SKU ambiguity is the most common failure. I\'ll resolve the SKU using brand + flavour + pack size and confirm the DC."',
                                nodes: ['SKU', 'Brand', 'Variant', 'UoM', 'DistributionCenter'], fetchNodes: 'SKU, Brand, Variant, UoM, DistributionCenter',
                                fetchResult: '{\n  "sku_id": "SKU_104812",\n  "sku_name": "Lay\'s Spanish Tomato 48g",\n  "uom": "CASE",\n  "dc": "DC_DEL_01"\n}' },
                              { num: '#1.1', title: 'Check Current Inventory Position', reasoning: '"Now I need the on-hand stock vs. the reorder point. Let me pull from InventoryBatch."',
                                nodes: ['InventoryBatch', 'SafetyStock', 'ReorderPoint'], fetchNodes: 'InventoryBatch, SafetyStock, ReorderPoint',
                                fetchResult: '{\n  "on_hand": 145,\n  "safety_stock": 200,\n  "reorder_point": 280,\n  "status": "BELOW_ROP"\n}' },
                              { num: '#2', title: 'Evaluate Lead Time & Supplier', reasoning: '"Stock is below ROP. Now check if lead time allows a standard order or if we need expedite."',
                                nodes: ['LeadTime', 'Supplier', 'PurchaseOrder'], fetchNodes: 'LeadTime, Supplier',
                                fetchResult: '{\n  "supplier": "PepsiCo Delhi Hub",\n  "lead_time_days": 3,\n  "expedite_available": true\n}' },
                              { num: '#3', title: 'Generate Purchase Order', reasoning: '"Inventory below ROP, lead time acceptable. Generating PO with EOQ quantity."',
                                nodes: ['PurchaseOrder', 'ReorderPoint'], fetchNodes: 'PurchaseOrder',
                                fetchResult: '{\n  "po_id": "PO_2026_08812",\n  "qty": 500,\n  "delivery_date": "2026-02-10",\n  "status": "AUTO_APPROVED"\n}' }
                          ]
                      } }},

            { id: 'MarkdownDecision',   label: 'Markdown Decision',    group: 'decisions', type: 'decision', fx: 0.80, fy: 0.86, radius: 15,
              meta: { code: 'D012', badge: 'Pricing Decision', intent: 'Determines optimal markdown timing and depth based on inventory aging, margin thresholds, and competitive landscape.',
                      rule: 'IF days_of_stock > 45\n  AND margin > min_margin_threshold\n  AND competitor_price < current_price\nTHEN apply_markdown(\n  depth = elasticity_model.optimal,\n  floor = min_margin\n)', unit: 'Action', inputNodes: 5,
                      grain: 'SKU × Store Cluster × Week',
                      components: [{ id: 'Markdown', group: 'pricing', label: 'Markdown' }, { id: 'Elasticity', group: 'pricing', label: 'Elasticity' }, { id: 'CompetitorPrice', group: 'pricing', label: 'Competitor Price' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'Store Cluster', color: '#B8734A' }],
                      traversal: {
                          title: 'Markdown Optimization',
                          question: 'Should we markdown slow-moving winter snacks in Mumbai stores based on current inventory aging?',
                          steps: [
                              { num: '#1', title: 'Identify Slow Movers', reasoning: '"First identify SKUs with days_of_stock > 45 in Mumbai cluster."',
                                nodes: ['Product', 'InventoryBatch', 'Region'], fetchNodes: 'Product, InventoryBatch',
                                fetchResult: '{\n  "slow_movers": 12,\n  "avg_days_of_stock": 62,\n  "total_value_at_risk": "$48,200"\n}' },
                              { num: '#2', title: 'Check Margin Floor', reasoning: '"Verify we have margin headroom to absorb markdown depth."',
                                nodes: ['GrossMargin', 'PriceList', 'Markdown'], fetchNodes: 'GrossMargin, PriceList',
                                fetchResult: '{\n  "current_margin": "32%",\n  "min_margin_threshold": "18%",\n  "headroom": "14pp"\n}' },
                              { num: '#3', title: 'Run Elasticity Model', reasoning: '"Good margin headroom. Now compute optimal markdown depth using price elasticity."',
                                nodes: ['Elasticity', 'CompetitorPrice'], fetchNodes: 'Elasticity, CompetitorPrice',
                                fetchResult: '{\n  "optimal_discount": "15%",\n  "expected_lift": "2.3x",\n  "competitor_gap": "-8%"\n}' }
                          ]
                      } }},

            { id: 'TerritoryAssignment', label: 'Territory Assignment', group: 'decisions', type: 'decision', fx: 0.92, fy: 0.34, radius: 14,
              meta: { code: 'D034', badge: 'Sales Decision', intent: 'Optimally assigns sales representatives to territories based on account potential, rep capacity, and historical performance.',
                      rule: 'IF territory.potential > threshold\n  AND rep.capacity_available\nTHEN assign_rep(\n  rep = best_fit_score,\n  accounts = territory.accounts\n)', unit: 'Assignment', inputNodes: 3,
                      grain: 'Territory × Quarter',
                      components: [{ id: 'Territory', group: 'sales', label: 'Territory' }, { id: 'SalesRep', group: 'sales', label: 'SalesRep' }, { id: 'Account', group: 'sales', label: 'Account' }],
                      dimensions: [{ label: 'Territory', color: '#10b981' }, { label: 'Quarter', color: '#14b8a6' }] }},

            { id: 'AllocationPriority',  label: 'Allocation Priority', group: 'decisions', type: 'decision', fx: 0.63, fy: 0.76, radius: 13,
              meta: { code: 'D007', badge: 'Service Decision', intent: 'Prioritizes order allocation when inventory is constrained. Balances customer tier, order value, and contractual commitments.',
                      rule: 'IF available_stock < total_demand\nTHEN allocate_by(\n  priority = customer_tier,\n  secondary = order_value,\n  reserve = contractual_min\n)', unit: 'Allocation', inputNodes: 3,
                      grain: 'SKU × Customer × Day',
                      components: [{ id: 'Customer', group: 'core', label: 'Customer' }, { id: 'FillRate', group: 'metrics', label: 'Fill Rate' }],
                      dimensions: [{ label: 'SKU', color: '#3b82f6' }, { label: 'Customer', color: '#10b981' }] }},

            { id: 'CampaignBudget',  label: 'Budget Allocation',  group: 'decisions', type: 'decision', fx: 0.13, fy: 0.88, radius: 13,
              meta: { code: 'D045', badge: 'Marketing Decision', intent: 'Distributes marketing budget across channels based on attribution performance, audience reach, and diminishing returns.',
                      rule: 'ALLOCATE budget ACROSS channels\n  WHERE marginal_ROAS > min_ROAS\n  WEIGHTED BY attribution_score\n  SUBJECT TO channel_min, channel_max', unit: 'Budget $', inputNodes: 4,
                      grain: 'Campaign × Channel × Month',
                      components: [{ id: 'BudgetAllocation', group: 'marketing', label: 'Budget Allocation' }, { id: 'Attribution', group: 'marketing', label: 'Attribution' }, { id: 'Campaign', group: 'marketing', label: 'Campaign' }],
                      dimensions: [{ label: 'Campaign', color: '#f59e0b' }, { label: 'Channel', color: '#1B6B5A' }] }}
        ];

        // ---- EDGE DATA ----
        const EDGE_DATA = [
            // Core interconnections
            { from: 'Product', to: 'Category', label: 'belongs_to' },
            { from: 'Product', to: 'Brand', label: 'branded_as' },
            { from: 'Customer', to: 'Region', label: 'located_in' },
            { from: 'Customer', to: 'Channel', label: 'buys_via' },
            { from: 'Product', to: 'CalendarDate', label: 'tracked_by' },
            { from: 'Brand', to: 'Category', label: 'within' },
            { from: 'SKU', to: 'Product', label: 'variant_of' },
            { from: 'SKU', to: 'Brand', label: 'has_brand' },
            { from: 'Variant', to: 'SKU', label: 'variant_of' },
            { from: 'UoM', to: 'SKU', label: 'measured_in' },

            // Supply Chain <-> Core
            { from: 'Product', to: 'Forecast', label: 'has_forecast' },
            { from: 'Forecast', to: 'SafetyStock', label: 'determines' },
            { from: 'Forecast', to: 'CalendarDate', label: 'time_bound' },
            { from: 'SafetyStock', to: 'ReorderPoint', label: 'triggers' },
            { from: 'ReorderPoint', to: 'PurchaseOrder', label: 'generates' },
            { from: 'PurchaseOrder', to: 'Supplier', label: 'sent_to' },
            { from: 'Supplier', to: 'LeadTime', label: 'has_lead_time' },
            { from: 'InventoryBatch', to: 'Product', label: 'stores' },
            { from: 'InventoryBatch', to: 'DistributionCenter', label: 'held_at' },
            { from: 'DistributionCenter', to: 'Region', label: 'serves' },
            { from: 'Forecast', to: 'InventoryBatch', label: 'informs' },
            { from: 'LeadTime', to: 'SafetyStock', label: 'impacts' },

            // Sales <-> Core
            { from: 'SalesRep', to: 'Territory', label: 'manages' },
            { from: 'Territory', to: 'Region', label: 'covers' },
            { from: 'Account', to: 'Customer', label: 'represents' },
            { from: 'SalesRep', to: 'Pipeline', label: 'owns' },
            { from: 'Pipeline', to: 'RevenueGrowth', label: 'drives' },
            { from: 'Quota', to: 'SalesRep', label: 'assigned_to' },
            { from: 'SalesTarget', to: 'Quota', label: 'sets' },
            { from: 'Account', to: 'Territory', label: 'in_territory' },

            // Pricing <-> Core
            { from: 'Product', to: 'PriceList', label: 'priced_by' },
            { from: 'PriceList', to: 'GrossMargin', label: 'yields' },
            { from: 'Markdown', to: 'PriceList', label: 'discounts' },
            { from: 'Promotion', to: 'Product', label: 'promotes' },
            { from: 'Elasticity', to: 'PriceList', label: 'models' },
            { from: 'CompetitorPrice', to: 'PriceList', label: 'benchmarks' },
            { from: 'Promotion', to: 'CalendarDate', label: 'scheduled_on' },
            { from: 'Promotion', to: 'Markdown', label: 'may_trigger' },
            { from: 'CompetitorPrice', to: 'Elasticity', label: 'feeds' },

            // Marketing <-> Core
            { from: 'Campaign', to: 'AudienceSegment', label: 'targets' },
            { from: 'Campaign', to: 'Product', label: 'features' },
            { from: 'AudienceSegment', to: 'Customer', label: 'segments' },
            { from: 'Campaign', to: 'BudgetAllocation', label: 'funded_by' },
            { from: 'BudgetAllocation', to: 'Channel', label: 'allocates_to' },
            { from: 'Attribution', to: 'Campaign', label: 'measures' },
            { from: 'CreativeAsset', to: 'Campaign', label: 'used_in' },
            { from: 'Campaign', to: 'CalendarDate', label: 'runs_on' },

            // Assortment <-> Core
            { from: 'Planogram', to: 'Product', label: 'places' },
            { from: 'Planogram', to: 'ShelfSpace', label: 'defines' },
            { from: 'RangePlan', to: 'Category', label: 'curates' },
            { from: 'RangePlan', to: 'Channel', label: 'tailored_to' },
            { from: 'NewProductIntro', to: 'Product', label: 'introduces' },
            { from: 'Localization', to: 'Region', label: 'adapts_for' },
            { from: 'Localization', to: 'RangePlan', label: 'localizes' },
            { from: 'ShelfSpace', to: 'Category', label: 'allocated_to' },
            { from: 'NewProductIntro', to: 'RangePlan', label: 'added_to' },

            // KPI Edges — connecting metrics to ontology
            { from: 'FillRate', to: 'Customer', label: 'measured_for' },
            { from: 'FillRate', to: 'SKU', label: 'per_sku' },
            { from: 'FillRate', to: 'OTIF', label: 'component_of' },
            { from: 'RevenueGrowth', to: 'Category', label: 'by_category' },
            { from: 'RevenueGrowth', to: 'Region', label: 'by_region' },
            { from: 'OTIF', to: 'Customer', label: 'tracked_for' },
            { from: 'GrossMargin', to: 'PriceList', label: 'derived_from' },
            { from: 'GrossMargin', to: 'Channel', label: 'by_channel' },
            { from: 'ForecastAccuracy', to: 'Forecast', label: 'validates' },
            { from: 'ForecastAccuracy', to: 'SKU', label: 'per_sku' },
            { from: 'SalesVolume', to: 'Product', label: 'counts' },
            { from: 'SalesVolume', to: 'Channel', label: 'by_channel' },
            { from: 'Attribution', to: 'RevenueGrowth', label: 'links_to' },

            // Decision Edges — connecting decisions to ontology/KPI
            { from: 'ReorderDecision', to: 'SafetyStock', label: 'checks' },
            { from: 'ReorderDecision', to: 'ReorderPoint', label: 'evaluates' },
            { from: 'ReorderDecision', to: 'LeadTime', label: 'considers' },
            { from: 'ReorderDecision', to: 'PurchaseOrder', label: 'generates' },
            { from: 'ReorderDecision', to: 'ForecastAccuracy', label: 'informed_by' },
            { from: 'MarkdownDecision', to: 'Markdown', label: 'triggers' },
            { from: 'MarkdownDecision', to: 'Elasticity', label: 'uses' },
            { from: 'MarkdownDecision', to: 'CompetitorPrice', label: 'monitors' },
            { from: 'MarkdownDecision', to: 'GrossMargin', label: 'protects' },
            { from: 'TerritoryAssignment', to: 'Territory', label: 'assigns' },
            { from: 'TerritoryAssignment', to: 'SalesRep', label: 'to_rep' },
            { from: 'TerritoryAssignment', to: 'Account', label: 'covers' },
            { from: 'TerritoryAssignment', to: 'RevenueGrowth', label: 'optimizes' },
            { from: 'AllocationPriority', to: 'Customer', label: 'prioritizes' },
            { from: 'AllocationPriority', to: 'FillRate', label: 'maximizes' },
            { from: 'AllocationPriority', to: 'OTIF', label: 'targets' },
            { from: 'CampaignBudget', to: 'BudgetAllocation', label: 'distributes' },
            { from: 'CampaignBudget', to: 'Attribution', label: 'based_on' },
            { from: 'CampaignBudget', to: 'Campaign', label: 'funds' }
        ];

        // Build lookups
        const nodeMap = {};
        NODE_DATA.forEach(n => { nodeMap[n.id] = n; });

        const adjacency = {};
        NODE_DATA.forEach(n => { adjacency[n.id] = []; });
        EDGE_DATA.forEach(e => {
            if (adjacency[e.from]) adjacency[e.from].push({ target: e.to, label: e.label });
            if (adjacency[e.to]) adjacency[e.to].push({ target: e.from, label: e.label });
        });

        // Breathing offset seeds
        NODE_DATA.forEach(n => {
            n.seed = Math.random() * Math.PI * 2;
            n.speedX = 0.3 + Math.random() * 0.4;
            n.speedY = 0.3 + Math.random() * 0.4;
            n.ampX = 2 + Math.random() * 3;
            n.ampY = 2 + Math.random() * 3;
        });

        // ---- Resize ----
        function resize() {
            dpr = window.devicePixelRatio || 1;
            W = heroSection.clientWidth;
            H = heroSection.clientHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            c.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function getPos(n) {
            const bx = n.fx * W;
            const by = n.fy * H;
            const ox = Math.sin(time * n.speedX + n.seed) * n.ampX;
            const oy = Math.cos(time * n.speedY + n.seed + 1.0) * n.ampY;
            return { x: bx + ox, y: by + oy };
        }

        // ---- Determine if node matches active layer ----
        function nodeMatchesLayer(n) {
            if (activeLayer === 'all') return true;
            if (activeLayer === 'metrics') return n.type === 'kpi';
            if (activeLayer === 'decisions') return n.type === 'decision';
            return n.group === activeLayer || n.group === 'core';
        }

        // ---- Draw edges ----
        function drawEdges() {
            c.setLineDash([4, 4]);
            EDGE_DATA.forEach(e => {
                const from = nodeMap[e.from];
                const to = nodeMap[e.to];
                if (!from || !to) return;
                const p1 = getPos(from);
                const p2 = getPos(to);

                let alpha = 0.15;
                if (activeLayer !== 'all') {
                    const fromMatch = nodeMatchesLayer(from);
                    const toMatch = nodeMatchesLayer(to);
                    alpha = (fromMatch && toMatch) ? 0.30 : 0.04;
                }
                if (selectedNode && (e.from === selectedNode.id || e.to === selectedNode.id)) {
                    alpha = 0.50;
                } else if (hoveredNode && (e.from === hoveredNode.id || e.to === hoveredNode.id)) {
                    alpha = 0.45;
                }

                c.beginPath();
                c.moveTo(p1.x, p1.y);
                c.lineTo(p2.x, p2.y);
                c.strokeStyle = 'rgba(0,0,0,' + alpha + ')';
                c.lineWidth = 1;
                c.stroke();

                // Edge label
                const mx = (p1.x + p2.x) / 2;
                const my = (p1.y + p2.y) / 2;
                let la = activeLayer === 'all' ? 0.18 : alpha * 0.6;
                if ((hoveredNode || selectedNode) && (e.from === (hoveredNode || selectedNode).id || e.to === (hoveredNode || selectedNode).id)) la = 0.7;
                if (la > 0.04) {
                    c.font = '8px Inter, sans-serif';
                    c.fillStyle = 'rgba(0,0,0,' + la + ')';
                    c.textAlign = 'center';
                    c.textBaseline = 'middle';
                    c.fillText(e.label, mx, my - 5);
                }
            });
            c.setLineDash([]);
        }

        // ---- Draw triangle (Decision nodes — bold & distinct) ----
        function drawTriangle(x, y, r, color, alpha, isHighlight) {
            const scale = 1.35; // Make decision nodes bigger
            const sr = r * scale;
            const h = sr * 1.8;
            c.save();
            c.globalAlpha = alpha;

            // Larger glow for decisions
            const grad = c.createRadialGradient(x, y, sr * 0.3, x, y, sr * 3.5);
            grad.addColorStop(0, color + '30');
            grad.addColorStop(0.5, color + '15');
            grad.addColorStop(1, color + '00');
            c.beginPath();
            c.arc(x, y, sr * 3.5, 0, Math.PI * 2);
            c.fillStyle = grad;
            c.fill();

            // White background diamond/triangle for pop on light bg
            c.beginPath();
            c.moveTo(x, y - h / 2 - 2);
            c.lineTo(x - sr - 2, y + h / 2 + 1);
            c.lineTo(x + sr + 2, y + h / 2 + 1);
            c.closePath();
            c.fillStyle = '#ffffff';
            c.shadowColor = 'rgba(0,0,0,0.15)';
            c.shadowBlur = 12;
            c.fill();
            c.shadowBlur = 0;

            // Triangle shape — filled solid
            c.beginPath();
            c.moveTo(x, y - h / 2);
            c.lineTo(x - sr, y + h / 2);
            c.lineTo(x + sr, y + h / 2);
            c.closePath();
            c.fillStyle = color;
            c.shadowColor = color;
            c.shadowBlur = isHighlight ? 24 : 12;
            c.fill();
            c.shadowBlur = 0;

            // Inner highlight triangle
            c.beginPath();
            const inset = 0.3;
            c.moveTo(x, y - h / 2 + h * inset * 0.5);
            c.lineTo(x - sr * (1 - inset), y + h / 2 - h * inset * 0.3);
            c.lineTo(x + sr * (1 - inset), y + h / 2 - h * inset * 0.3);
            c.closePath();
            c.fillStyle = 'rgba(255,255,255,0.2)';
            c.fill();

            c.restore();
        }

        // ---- Draw KPI ring (Metrics nodes — bold & distinct) ----
        function drawKPINode(x, y, r, color, alpha, isHighlight) {
            const scale = 1.25; // Make metric nodes bigger
            const sr = r * scale;
            c.save();
            c.globalAlpha = alpha;

            // Larger glow for metrics
            const grad = c.createRadialGradient(x, y, sr * 0.3, x, y, sr * 3.5);
            grad.addColorStop(0, color + '30');
            grad.addColorStop(0.5, color + '15');
            grad.addColorStop(1, color + '00');
            c.beginPath();
            c.arc(x, y, sr * 3.5, 0, Math.PI * 2);
            c.fillStyle = grad;
            c.fill();

            // White backing circle for pop on light bg
            c.beginPath();
            c.arc(x, y, sr + 3, 0, Math.PI * 2);
            c.fillStyle = '#ffffff';
            c.shadowColor = 'rgba(0,0,0,0.12)';
            c.shadowBlur = 10;
            c.fill();
            c.shadowBlur = 0;

            // Outer ring — thick and bold
            c.beginPath();
            c.arc(x, y, sr, 0, Math.PI * 2);
            c.strokeStyle = color;
            c.lineWidth = 3.5;
            c.shadowColor = color;
            c.shadowBlur = isHighlight ? 24 : 12;
            c.stroke();
            c.shadowBlur = 0;

            // Dashed outer ring for extra distinction
            c.beginPath();
            c.arc(x, y, sr + 6, 0, Math.PI * 2);
            c.setLineDash([3, 4]);
            c.strokeStyle = color + '40';
            c.lineWidth = 1.5;
            c.stroke();
            c.setLineDash([]);

            // Inner filled circle — larger
            c.beginPath();
            c.arc(x, y, sr * 0.55, 0, Math.PI * 2);
            c.fillStyle = color;
            c.fill();

            // Inner highlight
            c.beginPath();
            c.arc(x, y - sr * 0.15, sr * 0.25, 0, Math.PI * 2);
            c.fillStyle = 'rgba(255,255,255,0.3)';
            c.fill();

            c.restore();
        }

        // ---- Draw nodes ----
        function drawNodes() {
            NODE_DATA.forEach(n => {
                const pos = getPos(n);
                const color = COLORS[n.group];
                let nodeAlpha = 1.0;

                if (activeLayer !== 'all') {
                    nodeAlpha = nodeMatchesLayer(n) ? 1.0 : 0.08;
                }

                const isHovered = hoveredNode && hoveredNode.id === n.id;
                const isSelected = selectedNode && selectedNode.id === n.id;
                const activeHighlight = hoveredNode || selectedNode;
                const refNode = hoveredNode || selectedNode;
                const isNeighbor = refNode && adjacency[refNode.id] && adjacency[refNode.id].some(a => a.target === n.id);

                if (activeHighlight) {
                    if (isHovered || isSelected) nodeAlpha = 1.0;
                    else if (isNeighbor) nodeAlpha = Math.max(nodeAlpha, 0.8);
                    else nodeAlpha = Math.min(nodeAlpha, 0.1);
                }

                const r = n.radius;
                const highlight = isHovered || isSelected;

                // Draw based on type
                if (n.type === 'decision') {
                    drawTriangle(pos.x, pos.y, r, color, nodeAlpha, highlight);
                } else if (n.type === 'kpi') {
                    drawKPINode(pos.x, pos.y, r, color, nodeAlpha, highlight);
                } else {
                    // Standard ontology circle — smaller, simpler for light bg
                    c.save();
                    c.globalAlpha = nodeAlpha;
                    const grad = c.createRadialGradient(pos.x, pos.y, r * 0.5, pos.x, pos.y, r * 2);
                    grad.addColorStop(0, color + '18');
                    grad.addColorStop(1, color + '00');
                    c.beginPath();
                    c.arc(pos.x, pos.y, r * 2, 0, Math.PI * 2);
                    c.fillStyle = grad;
                    c.fill();

                    c.beginPath();
                    c.arc(pos.x, pos.y, r, 0, Math.PI * 2);
                    c.fillStyle = color;
                    c.shadowColor = color;
                    c.shadowBlur = highlight ? 14 : 4;
                    c.fill();
                    c.shadowBlur = 0;

                    c.beginPath();
                    c.arc(pos.x, pos.y - r * 0.25, r * 0.4, 0, Math.PI * 2);
                    c.fillStyle = 'rgba(255,255,255,0.15)';
                    c.fill();
                    c.restore();
                }

                // Label
                const isSpecial = n.type === 'decision' || n.type === 'kpi';
                const fontSize = isSpecial ? (r >= 14 ? 12 : 11) : (r >= 14 ? 10 : r >= 11 ? 9 : 8);
                c.save();
                c.globalAlpha = nodeAlpha * 0.9;
                c.font = (isSpecial ? '600 ' : '500 ') + fontSize + 'px Inter, sans-serif';
                c.fillStyle = '#1a1d26';
                c.textAlign = 'center';
                c.textBaseline = 'top';
                const labelScale = n.type === 'decision' ? 1.35 : (n.type === 'kpi' ? 1.25 : 1);
                const labelY = n.type === 'decision' ? pos.y + r * labelScale * 1.0 : pos.y + r * labelScale + 5;
                c.fillText(n.label, pos.x, labelY);
                c.restore();
            });
        }

        // ---- Tooltip ----
        function updateTooltip() {
            if (!tooltip) return;
            if (hoveredNode && !selectedNode) {
                const pos = getPos(hoveredNode);
                const connections = adjacency[hoveredNode.id] || [];
                const typeLabel = hoveredNode.type === 'kpi' ? 'KPI' : hoveredNode.type === 'decision' ? 'Decision' : 'Ontology';
                const connList = connections.slice(0, 6).map(conn => {
                    const tn = nodeMap[conn.target];
                    const ch = tn ? COLORS[tn.group] : '#888';
                    return '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(0,0,0,0.65);">' +
                        '<span style="width:6px;height:6px;border-radius:50%;background:' + ch + ';flex-shrink:0;"></span>' +
                        '<span style="color:rgba(0,0,0,0.35);font-size:10px;">' + conn.label + '</span>' +
                        '<span>' + conn.target + '</span></div>';
                }).join('');
                const gc = COLORS[hoveredNode.group];
                tooltip.innerHTML = '<div style="font-weight:600;font-size:13px;margin-bottom:4px;color:' + gc + ';">' + hoveredNode.label + '</div>' +
                    '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
                    '<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(0,0,0,0.35);">' + hoveredNode.group + '</span>' +
                    '<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(0,0,0,0.06);color:rgba(0,0,0,0.5);">' + typeLabel + '</span></div>' +
                    '<div style="display:flex;flex-direction:column;gap:4px;">' + connList + '</div>' +
                    (connections.length > 6 ? '<div style="font-size:10px;color:rgba(0,0,0,0.3);margin-top:4px;">+' + (connections.length - 6) + ' more</div>' : '') +
                    (hoveredNode.type !== 'ontology' ? '<div style="font-size:10px;color:rgba(79,70,229,0.8);margin-top:6px;">Click to inspect →</div>' : '');
                tooltip.classList.add('visible');

                let tx = pos.x + 20;
                let ty = pos.y - 20;
                if (tx + 220 > W - 10) tx = pos.x - 240;
                if (ty + 160 > H - 10) ty = H - 170;
                if (ty < 10) ty = 10;
                tooltip.style.left = tx + 'px';
                tooltip.style.top = ty + 'px';
            } else {
                tooltip.classList.remove('visible');
            }
        }

        // ---- Hit test ----
        function hitTest(mx, my) {
            let closest = null;
            let closestDist = Infinity;
            NODE_DATA.forEach(n => {
                const pos = getPos(n);
                const dx = mx - pos.x;
                const dy = my - pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const threshold = n.radius + 12;
                if (dist < threshold && dist < closestDist) {
                    closest = n;
                    closestDist = dist;
                }
            });
            return closest;
        }

        // ---- Main loop ----
        function draw() {
            time += 0.008;
            c.clearRect(0, 0, W, H);
            drawEdges();
            drawNodes();
            updateTooltip();
            animId = requestAnimationFrame(draw);
        }

        // ============================================
        //  NODE DETAIL PANEL (Right sidebar)
        // ============================================
        const ndPanel = document.getElementById('nodeDetailPanel');
        const ndpClose = document.getElementById('ndpClose');
        const tPanel = document.getElementById('traversalPanel');
        const tpClose = document.getElementById('tpClose');

        function closeAllPanels() {
            ndPanel.classList.remove('open');
            tPanel.classList.remove('open');
            heroSection.classList.remove('panels-open');
            selectedNode = null;
        }

        if (ndpClose) ndpClose.addEventListener('click', closeAllPanels);
        if (tpClose) tpClose.addEventListener('click', closeAllPanels);

        function showNodeDetail(node) {
            selectedNode = node;
            heroSection.classList.add('panels-open');
            tPanel.classList.remove('open');

            const color = COLORS[node.group];
            const typeLabel = node.type === 'kpi' ? 'KPI' : node.type === 'decision' ? 'Decision' : 'Ontology';

            // Icon
            const iconEl = document.getElementById('ndpIcon');
            if (node.type === 'decision') {
                iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="' + color + '"/></svg>';
            } else if (node.type === 'kpi') {
                iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="' + color + '" stroke-width="2.5" fill="none"/><circle cx="10" cy="10" r="4.5" fill="' + color + '"/></svg>';
            } else {
                iconEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="' + color + '"/></svg>';
            }
            iconEl.style.borderColor = color + '44';

            // Title & badges
            document.getElementById('ndpTitle').textContent = node.label;
            const badgesEl = document.getElementById('ndpBadges');
            if (node.meta) {
                badgesEl.innerHTML = '<span class="ndp-badge ndp-badge-id">' + node.meta.code + '</span>' +
                    '<span class="ndp-badge ndp-badge-type" style="background:' + color + ';">' + node.meta.badge + '</span>';
            } else {
                badgesEl.innerHTML = '<span class="ndp-badge ndp-badge-type" style="background:' + color + ';">' + typeLabel + ' Node</span>' +
                    '<span class="ndp-badge ndp-badge-id">' + node.group + '</span>';
            }

            // Intent
            const intentEl = document.getElementById('ndpIntent');
            intentEl.textContent = node.meta ? node.meta.intent : 'Core entity node in the business ontology graph. Connected to ' + (adjacency[node.id] || []).length + ' other nodes.';

            // Formula (KPI) or Rule (Decision)
            const fSection = document.getElementById('ndpFormulaSection');
            const rSection = document.getElementById('ndpRuleSection');
            fSection.classList.remove('visible');
            rSection.classList.remove('visible');

            if (node.meta && node.meta.formula) {
                document.getElementById('ndpFormula').textContent = node.meta.formula;
                fSection.classList.add('visible');
            }
            if (node.meta && node.meta.rule) {
                document.getElementById('ndpRule').textContent = node.meta.rule;
                rSection.classList.add('visible');
            }

            // Meta row
            const metaL = document.getElementById('ndpMetaLeft');
            const metaR = document.getElementById('ndpMetaRight');
            if (node.meta) {
                metaL.innerHTML = '<span class="ndp-meta-label">UNIT</span><span class="ndp-meta-value">' + node.meta.unit + '</span>';
                metaR.innerHTML = '<span class="ndp-meta-label">INPUT NODES</span><span class="ndp-meta-pill">' + node.meta.inputNodes + '</span>';
            } else {
                metaL.innerHTML = '<span class="ndp-meta-label">TYPE</span><span class="ndp-meta-value">' + typeLabel + '</span>';
                metaR.innerHTML = '<span class="ndp-meta-label">CONNECTIONS</span><span class="ndp-meta-pill">' + (adjacency[node.id] || []).length + '</span>';
            }

            // Grain
            document.getElementById('ndpGrain').textContent = node.meta ? node.meta.grain : node.group + ' × CalendarDate';

            // Components
            const compEl = document.getElementById('ndpComponents');
            if (node.meta && node.meta.components) {
                compEl.innerHTML = node.meta.components.map(comp => {
                    const cc = COLORS[comp.group] || '#888';
                    return '<div class="ndp-comp-item"><span class="ndp-comp-dot" style="background:' + cc + ';"></span><div class="ndp-comp-info"><span class="ndp-comp-name">' + comp.label + '</span><span class="ndp-comp-group">' + comp.group + '</span></div></div>';
                }).join('');
            } else {
                const conns = (adjacency[node.id] || []).slice(0, 4);
                compEl.innerHTML = conns.map(conn => {
                    const tn = nodeMap[conn.target];
                    const cc = tn ? COLORS[tn.group] : '#888';
                    return '<div class="ndp-comp-item"><span class="ndp-comp-dot" style="background:' + cc + ';"></span><div class="ndp-comp-info"><span class="ndp-comp-name">' + conn.target + '</span><span class="ndp-comp-group">' + conn.label + '</span></div></div>';
                }).join('');
            }

            // Dimensions
            const dimEl = document.getElementById('ndpDimensions');
            if (node.meta && node.meta.dimensions) {
                dimEl.innerHTML = node.meta.dimensions.map(d => '<span class="ndp-dim-chip"><span class="ndp-dim-dot" style="background:' + d.color + ';"></span>' + d.label + '</span>').join('');
            } else {
                dimEl.innerHTML = '<span class="ndp-dim-chip"><span class="ndp-dim-dot" style="background:#1B6B5A;"></span>' + node.group + '</span>';
            }

            ndPanel.classList.add('open');

            // If it has traversal data, show a "View Traversal" button
            // For decision nodes with traversal, auto-show after a short delay
            if (node.meta && node.meta.traversal) {
                setTimeout(() => {
                    if (selectedNode && selectedNode.id === node.id) {
                        showTraversal(node);
                    }
                }, 1200);
            }
        }

        // ============================================
        //  TRAVERSAL REASONING PANEL
        // ============================================
        function showTraversal(node) {
            if (!node.meta || !node.meta.traversal) return;
            const t = node.meta.traversal;

            ndPanel.classList.remove('open');
            tPanel.classList.add('open');

            document.getElementById('tpTitle').textContent = t.title;
            document.getElementById('tpQuestion').textContent = t.question;

            const stepsEl = document.getElementById('tpSteps');
            stepsEl.innerHTML = '';

            // Animate steps appearing one by one
            t.steps.forEach((step, i) => {
                setTimeout(() => {
                    document.getElementById('tpIteration').textContent = 'Iteration ' + (i + 1) + ' / ' + t.steps.length;

                    const stepEl = document.createElement('div');
                    stepEl.className = 'tp-step';
                    stepEl.style.animationDelay = '0s';

                    let nodeChips = step.nodes.map(nid => {
                        const nd = nodeMap[nid];
                        const nc = nd ? COLORS[nd.group] : '#888';
                        return '<span class="tp-node-chip"><span class="tp-node-chip-dot" style="background:' + nc + ';"></span>' + nid + '</span>';
                    }).join('');

                    stepEl.innerHTML =
                        '<div class="tp-step-header"><span class="tp-step-num">' + step.num + '</span><span class="tp-step-title">' + step.title + '</span></div>' +
                        '<div class="tp-step-reasoning">"' + step.reasoning.replace(/"/g, '') + '"</div>' +
                        '<div class="tp-step-nodes"><div class="tp-step-nodes-label">Nodes Accessed:</div><div class="tp-step-node-chips">' + nodeChips + '</div></div>' +
                        (step.fetchResult ?
                            '<div class="tp-step-fetch"><div class="tp-fetch-header"><span class="tp-fetch-icon">⊜</span> Fetch</div>' +
                            '<div class="tp-fetch-nodes"><strong>Nodes:</strong> ' + step.fetchNodes + '</div>' +
                            '<div class="tp-fetch-result">' + step.fetchResult + '</div></div>' : '');

                    stepsEl.appendChild(stepEl);

                    // Highlight the accessed nodes on the graph
                    // (we temporarily boost their opacity by setting activeLayer)
                    highlightTraversalNodes(step.nodes);

                }, i * 1800);
            });
        }

        let traversalHighlight = [];
        function highlightTraversalNodes(nodeIds) {
            traversalHighlight = nodeIds;
            // Reset after 1.5s
            setTimeout(() => { traversalHighlight = []; }, 1500);
        }

        // ---- Events ----
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            hoveredNode = hitTest(mouseX, mouseY);
            canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        });

        canvas.addEventListener('mouseleave', () => {
            hoveredNode = null;
            mouseX = -9999;
            mouseY = -9999;
            canvas.style.cursor = 'default';
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const hit = hitTest(mx, my);

            if (hit) {
                showNodeDetail(hit);
            } else {
                closeAllPanels();
            }
        });

        // ---- Legend filter ----
        const legendChips = document.querySelectorAll('.legend-chip[data-layer]');
        legendChips.forEach(btn => {
            btn.addEventListener('click', () => {
                legendChips.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeLayer = btn.getAttribute('data-layer');
                closeAllPanels();
            });
        });

        // ---- Init ----
        resize();
        draw();

        window.addEventListener('resize', resize);

        // ============================================
        //  AUTO-DEMO: Guided walkthrough on first view
        //  Highlights one ontology → one KPI → one decision (with panel)
        // ============================================
        let demoPlayed = false;
        let demoActive = false;

        const demoSequence = [
            // Step 1: Highlight an ontology node (Product — central, easy to see)
            { nodeId: 'Product', type: 'ontology', duration: 2500, showPanel: false, pulseConnections: true },
            // Step 2: Highlight a KPI node (Fill Rate — has rich meta)
            { nodeId: 'FillRate', type: 'kpi', duration: 3000, showPanel: true, pulseConnections: true },
            // Step 3: Highlight a decision node (ReorderDecision — has traversal)
            { nodeId: 'ReorderDecision', type: 'decision', duration: 4500, showPanel: true, pulseConnections: true },
        ];

        // Demo pulse ring animation state
        let demoPulseNode = null;
        let demoPulseTime = 0;
        let demoPulseActive = false;

        function drawDemoPulse() {
            if (!demoPulseActive || !demoPulseNode) return;
            demoPulseTime += 0.04;
            const pos = getPos(demoPulseNode);
            const color = COLORS[demoPulseNode.group];
            const maxR = demoPulseNode.radius * 4;

            // Draw 3 expanding rings
            for (let i = 0; i < 3; i++) {
                const phase = (demoPulseTime + i * 0.7) % 2.1;
                const progress = phase / 2.1;
                const r = demoPulseNode.radius + progress * (maxR - demoPulseNode.radius);
                const alpha = (1 - progress) * 0.35;
                if (alpha <= 0) continue;

                c.beginPath();
                c.arc(pos.x, pos.y, r, 0, Math.PI * 2);
                c.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
                c.lineWidth = 2 * (1 - progress);
                c.stroke();
            }

            // Draw "Click to explore" label
            const labelAlpha = 0.5 + Math.sin(demoPulseTime * 2) * 0.3;
            c.save();
            c.globalAlpha = labelAlpha;
            c.font = '600 11px Inter, sans-serif';
            c.fillStyle = '#1a1d26';
            c.textAlign = 'center';
            c.textBaseline = 'bottom';
            const labelScale2 = demoPulseNode.type === 'decision' ? 1.35 : (demoPulseNode.type === 'kpi' ? 1.25 : 1);
            const labelY = demoPulseNode.type === 'decision' ? pos.y - demoPulseNode.radius * labelScale2 * 1.8 - 12 : pos.y - demoPulseNode.radius * labelScale2 - 16;
            // Background pill
            const txt = demoPulseNode.type === 'ontology' ? '● Ontology Node' : demoPulseNode.type === 'kpi' ? '◎ Metric Node — Click to inspect' : '▲ Decision Node — Click to inspect';
            const tw = c.measureText(txt).width;
            c.fillStyle = 'rgba(255,255,255,0.92)';
            c.beginPath();
            const pillH = 22, pillR = 6;
            const px = pos.x - tw / 2 - 10;
            const py = labelY - pillH + 4;
            c.roundRect(px, py, tw + 20, pillH, pillR);
            c.fill();
            c.fillStyle = '#1a1d26';
            c.fillText(txt, pos.x, labelY);
            c.restore();
        }

        // Patch the draw loop to include demo pulse
        const originalDraw = draw;
        draw = function demoPatched() {
            time += 0.008;
            c.clearRect(0, 0, W, H);
            drawEdges();
            drawNodes();
            drawDemoPulse();
            updateTooltip();
            animId = requestAnimationFrame(draw);
        };

        function runDemo() {
            if (demoPlayed || demoActive) return;
            demoPlayed = true;
            demoActive = true;

            let stepIndex = 0;

            function playStep() {
                if (stepIndex >= demoSequence.length || !demoActive) {
                    // Demo finished — clean up
                    demoPulseActive = false;
                    demoPulseNode = null;
                    selectedNode = null;
                    hoveredNode = null;
                    closeAllPanels();
                    demoActive = false;
                    return;
                }

                const step = demoSequence[stepIndex];
                const node = nodeMap[step.nodeId];
                if (!node) { stepIndex++; playStep(); return; }

                // Highlight this node
                demoPulseNode = node;
                demoPulseActive = true;
                demoPulseTime = 0;
                hoveredNode = node;

                // Show panel after a short delay for KPI/Decision
                if (step.showPanel) {
                    setTimeout(() => {
                        if (!demoActive) return;
                        showNodeDetail(node);
                    }, 1000);
                }

                // Move to next step
                setTimeout(() => {
                    demoPulseActive = false;
                    demoPulseNode = null;
                    if (!step.showPanel) {
                        hoveredNode = null;
                    }
                    closeAllPanels();
                    selectedNode = null;
                    hoveredNode = null;

                    setTimeout(() => {
                        stepIndex++;
                        playStep();
                    }, 600);
                }, step.duration);
            }

            // Start after a brief pause
            setTimeout(playStep, 1200);
        }

        // Stop demo on any user interaction
        canvas.addEventListener('click', () => {
            if (demoActive) {
                demoActive = false;
                demoPulseActive = false;
                demoPulseNode = null;
            }
        }, { once: false });

        canvas.addEventListener('mousemove', () => {
            if (demoActive && hoveredNode) {
                // User is interacting — stop demo
                demoActive = false;
                demoPulseActive = false;
                demoPulseNode = null;
            }
        }, { once: false });

        // Pause/resume on visibility + trigger demo
        const heroObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animId) draw();
                    // Trigger demo on first view
                    if (!demoPlayed) {
                        runDemo();
                    }
                } else {
                    if (animId) { cancelAnimationFrame(animId); animId = null; }
                }
            });
        }, { threshold: 0.3 });
        heroObs.observe(heroSection);
    })();

})();
