(function () {
    'use strict';

    /* ================================================
       SHARED: Nav, mobile menu, smooth scroll, animate
       ================================================ */
    (function nav() {
        const navEl = document.getElementById('nav');
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');

        window.addEventListener('scroll', function () {
            navEl.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                });
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var id = a.getAttribute('href');
                if (id.length > 1) {
                    var el = document.querySelector(id);
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                }
            });
        });
    })();

    (function animateOnScroll() {
        var els = document.querySelectorAll('[data-animate]');
        if (!els.length) return;
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('animated');
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.15 });
        els.forEach(function (el) { obs.observe(el); });
    })();

    /* ================================================
       SECTION 1: THE DECISION RACE
       ================================================ */
    (function decisionRace() {
        /* ---- PROMPT SIDE DATA: document-style paragraphs ---- */
        var PROMPT_DOC = [
            { type: 'heading', text: 'System Instructions' },
            { type: 'text', text: 'You are an enterprise supply chain analyst with deep expertise in FMCG trade operations. You have access to ERP inventory data (SAP), sales transaction records, complete product master data with category hierarchies, and the regional organizational structure.' },
            { type: 'heading', text: 'Business Rules' },
            { type: 'text', text: 'When evaluating whether a SKU should be marked down, follow these rules carefully. If Days of Inventory exceeds 120 days AND Sell-Through is below 30%, the SKU is a markdown candidate. The markdown depth depends on the margin tier: 15\u201325% margin = 8% markdown, 25\u201335% margin = 10%, above 35% = 15%.' },
            { type: 'text', text: 'Never recommend markdown for products launched within 90 days. Strategic SKUs flagged in product master require VP approval. Always check for seasonal exceptions \u2014 some products have seasonal patterns affecting performance metrics. Seasonal SKUs use a different sell-through threshold of 18% instead of 25%.' },
            { type: 'text', text: 'Cross-reference redistribution possibility before recommending markdown. Markdowns exceeding 10% require Zone Manager approval, not just RSM. Ensure minimum stock of 100 units before initiating any markdown.' },
            { type: 'text', text: '<em>[14 more rules omitted for brevity\u2026]</em>' },
            { type: 'heading', text: 'Product Hierarchy' },
            { type: 'text', text: 'Personal Care \u203A Skin Care \u203A Men\'s Grooming \u203A GlowMax brand. Three variants: GlowMax Men 50ml (SKU: GXM-50), GlowMax Women 50ml (SKU: GXW-50), GlowMax Men 100ml (SKU: GXM-100).' },
            { type: 'heading', text: 'Org Structure' },
            { type: 'text', text: 'National \u203A Zone (N/S/E/W) \u203A Region \u203A Territory \u203A Distributor. North Zone: RSM = Rajesh K, ZSM = Priya M.' },
            { type: 'heading', text: 'Current Data' },
            { type: 'text', text: 'SKU: GlowMax Men 50ml | Zone: North | DOI: 140 days | Sell-Through: 22% | Margin: 30% | Stock: 2,400 units | Launch Date: 14 months ago.' },
            { type: 'heading', text: 'Question' },
            { type: 'text', text: 'Should we markdown this SKU? If yes, by how much? Who needs to approve?' }
        ];

        /* ---- RULE SCAN DATA: visual grid ---- */
        var PROMPT_RULES = [
            { id: 'D1', name: 'DOI Trigger', status: 'correct', icon: '\u2713', detail: 'Correctly identified DOI>120 threshold' },
            { id: 'D2', name: 'Margin Tier', status: 'wrong', icon: '\u2717', detail: 'Confused 25-35% tier with 35%+ tier' },
            { id: 'D3', name: 'New Launch', status: 'correct', icon: '\u2713', detail: '14 months ago \u2014 not new launch' },
            { id: 'D4', name: 'Strategic SKU', status: 'correct', icon: '\u2713', detail: 'Not a strategic SKU \u2014 passed' },
            { id: 'D5', name: 'Seasonal Check', status: 'confused', icon: '?', detail: 'Vague rule, couldn\'t determine action' },
            { id: 'D6', name: 'Stock Floor', status: 'correct', icon: '\u2713', detail: '2,400 > 100 units \u2014 passed' },
            { id: 'D7', name: 'Seasonal Adj.', status: 'missed', icon: '\u2717', detail: 'Never connected to D5 \u2014 skipped entirely' },
            { id: 'D8', name: 'Redistribution', status: 'correct', icon: '\u2713', detail: 'Not applicable \u2014 passed' },
            { id: 'D9', name: 'Approval Level', status: 'wrong', icon: '\u2717', detail: 'Missed: >10% needs Zone Manager, not RSM' }
        ];

        var PROMPT_ANSWER = {
            text: 'Based on the data provided, I recommend a <err>markdown of 15%</err> on <err>GlowMax</err> in the North zone. The DOI of 140 days exceeds the 120-day threshold, and sell-through at 22% is below the 30% benchmark. With a 30% margin, a 15% markdown is appropriate. <err>The RSM can approve this markdown.</err>',
            errors: [
                { match: 'markdown of 15%', note: 'Wrong depth \u2014 missed seasonal exception. Should be 12% (Rule D7 + D2 interaction).' },
                { match: 'GlowMax', note: 'Ambiguous entity \u2014 didn\'t specify Men 50ml vs Women 50ml vs Men 100ml.' },
                { match: 'The RSM can approve this markdown.', note: 'Wrong authority \u2014 markdown >10% needs Zone Manager approval (Rule D9).' }
            ]
        };

        /* ---- WHY IT FAILS: hallucination explanation ---- */
        var FAILURE_REASONS = [
            { icon: '\u26A0', label: 'Hallucination \u2014 No Grounding', desc: 'The model generates plausible-sounding answers without being able to verify them against structured data. It "sounds right" but can\'t confirm that 30% margin maps to the 25\u201335% tier, not 35%+.' },
            { icon: '\u26D4', label: 'No Multi-Inference Reasoning', desc: 'Rules D5 and D7 require chained inference: identify seasonal flag \u2192 apply different threshold \u2192 adjust markdown depth. The model evaluates rules independently and drops the chain between D5\u2192D7\u2192D2.' },
            { icon: '\u2753', label: 'No Entity Resolution', desc: '"GlowMax" could be Men 50ml, Women 50ml, or Men 100ml. Without traversing a product graph, the model can\'t disambiguate \u2014 it picks the brand name and moves on.' },
            { icon: '\u274C', label: 'No Authority Graph', desc: 'Approval routing requires traversing Org \u2192 Zone \u2192 Role \u2192 Threshold. The model read "RSM manages North" from the prompt and assumed RSM can approve, missing Rule D9\'s 10% escalation threshold.' }
        ];

        /* ---- WHY IW WORKS: success counterpoints ---- */
        var SUCCESS_REASONS = [
            { icon: '\u2713', label: 'Grounded in Data', desc: 'Every claim verified against the knowledge graph. 30% margin \u2192 25\u201335% tier confirmed by traversing the Metric node \u2014 no guessing.' },
            { icon: '\u26A1', label: 'Multi-Inference Chain', desc: 'Agent follows edges D5\u2192D7\u2192D2 \u2014 each inference grounded in the previous step\'s output. Seasonal flag triggers threshold change triggers depth adjustment.' },
            { icon: '\u2316', label: 'Precise Entity Resolution', desc: 'Product graph traversal: GlowMax \u2192 Men\'s Grooming \u2192 GXM-50. No ambiguity \u2014 the SKU is resolved before any rule fires.' },
            { icon: '\u2692', label: 'Authority Graph Traversal', desc: 'Org graph: D9 threshold (>10%) \u2192 Zone Manager \u2192 North zone \u2192 ZSM Priya M. Approval routed correctly through the authority chain.' }
        ];

        /* ---- IW SIDE DATA ---- */
        var FLOW_NODES = [
            { id: 'entity', label: 'Entity' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'rules', label: 'Rules' },
            { id: 'exceptions', label: 'Except.' },
            { id: 'authority', label: 'Auth.' }
        ];

        var IW_STEPS = [
            {
                label: 'L1: Entity Resolution',
                phases: [
                    { icon: '?', type: 'think', text: 'Which exact SKU is "GlowMax Men 50ml"? What zone? Who owns it?' },
                    { icon: '\u229C', type: 'query', text: 'Traversing: Product \u2192 Brand \u2192 SKU \u00B7 Region \u2192 Zone \u2192 Org' },
                    { icon: '\u2193', type: 'retrieve', text: 'SKU GXM-50 \u00B7 Men\'s Grooming \u00B7 North Zone\nRSM: Rajesh K \u00B7 ZSM: Priya M' },
                    { icon: '\u2713', type: 'conclude', text: 'Entity resolved \u2014 unambiguous SKU, zone, and authority chain identified.' }
                ]
            },
            {
                label: 'L2: Metric Computation',
                phases: [
                    { icon: '?', type: 'think', text: 'What are the exact metric values? Is this a seasonal SKU?' },
                    { icon: '\u229C', type: 'query', text: 'Computing: DOI formula \u00B7 Sell-Through formula \u00B7 Margin \u00B7 Seasonal flag' },
                    { icon: '\u2193', type: 'retrieve', text: 'DOI = 140d \u00B7 ST = 22% \u00B7 Margin = 30%\nSeasonal flag = YES \u00B7 Stock = 2,400 units' },
                    { icon: '\u2713', type: 'conclude', text: 'All metrics computed from explicit formulas. Seasonal flag set \u2014 will affect rule application.' }
                ]
            },
            {
                label: 'L3: Rule Matching',
                phases: [
                    { icon: '?', type: 'think', text: 'Which rules fire? Any interactions between rules?' },
                    { icon: '\u229C', type: 'query', text: 'Evaluating: D1 (DOI trigger) \u2192 D7 (seasonal override) \u2192 D2 (margin tier)' },
                    { icon: '\u2193', type: 'retrieve', text: 'D1: DOI>120 \u2227 ST<30% \u2192 triggered \u2713\nD7: seasonal SKU \u2192 ST threshold is 18% not 25%\nD2: margin 25-35% \u2192 base markdown 10%' },
                    { icon: '\u2713', type: 'conclude', text: 'Three rules interact: D1 triggers, D7 modifies threshold, D2 sets base depth. No conflicts.' }
                ]
            },
            {
                label: 'Exception Check',
                phases: [
                    { icon: '?', type: 'think', text: 'Any exceptions that modify the markdown depth?' },
                    { icon: '\u229C', type: 'query', text: 'Checking: Seasonal adj. \u00B7 Stock floor \u00B7 New launch \u00B7 Strategic SKU' },
                    { icon: '\u2193', type: 'retrieve', text: 'Seasonal exception \u2192 +2% adjustment \u2192 12%\nStock 2,400 > 100 \u2713 \u00B7 Launch 14mo ago \u2713 \u00B7 Not strategic \u2713' },
                    { icon: '\u2713', type: 'conclude', text: 'Seasonal exception applied. Final markdown: 12%. All other exceptions clear.' }
                ]
            },
            {
                label: 'Authority Chain',
                phases: [
                    { icon: '?', type: 'think', text: 'Who needs to approve a 12% markdown?' },
                    { icon: '\u229C', type: 'query', text: 'Checking: D9 (approval thresholds) \u00B7 Org graph (authority)' },
                    { icon: '\u2193', type: 'retrieve', text: 'D9: markdown >10% \u2192 Zone Manager approval\nZSM for North = Priya M' },
                    { icon: '\u2713', type: 'conclude', text: '12% exceeds RSM limit. Routed to ZSM Priya M for approval.' }
                ]
            }
        ];

        var IW_ANSWER = 'Recommend <strong class="race-correct">12% markdown</strong> on GlowMax Men 50ml (SKU GXM-50) in North zone. Seasonal exception applied. Routed to <strong class="race-correct">ZSM Priya M</strong> for approval.';

        /* ---- DOM REFS ---- */
        var docEl = document.getElementById('racePromptDoc');
        var tokenEl = document.getElementById('raceTokenValue');
        var ruleScanEl = document.getElementById('raceRuleScan');
        var failureEl = document.getElementById('raceFailureExplain');
        var successEl = document.getElementById('raceSuccessExplain');
        var stepsEl = document.getElementById('raceSteps');
        var flowEl = document.getElementById('raceFlow');
        var resultPrompt = document.getElementById('raceResultPrompt');
        var resultIW = document.getElementById('raceResultIW');
        var accFillPrompt = document.getElementById('raceAccFillPrompt');
        var accFillIW = document.getElementById('raceAccFillIW');
        var accValPrompt = document.getElementById('raceAccValuePrompt');
        var accValIW = document.getElementById('raceAccValueIW');
        var replayBtn = document.getElementById('raceReplay');
        var container = document.getElementById('raceContainer');

        var generation = 0;
        var hasPlayed = false;

        /* ---- Build flow diagram (IW side) ---- */
        function buildFlowDiagram() {
            flowEl.innerHTML = '';
            FLOW_NODES.forEach(function (node, i) {
                var nodeEl = document.createElement('div');
                nodeEl.className = 'race-flow-node';
                nodeEl.setAttribute('data-node', node.id);
                nodeEl.innerHTML =
                    '<div class="race-flow-circle">' + (i + 1) + '</div>' +
                    '<div class="race-flow-label">' + node.label + '</div>';
                flowEl.appendChild(nodeEl);
                if (i < FLOW_NODES.length - 1) {
                    var edgeEl = document.createElement('div');
                    edgeEl.className = 'race-flow-edge';
                    flowEl.appendChild(edgeEl);
                }
            });
        }

        /* ---- Build rule scan grid (prompt side) ---- */
        function buildRuleScan() {
            ruleScanEl.innerHTML =
                '<div class="race-scan-label">Rule Evaluation \u2014 scanning rules independently</div>' +
                '<div class="race-scan-grid"></div>';
            var grid = ruleScanEl.querySelector('.race-scan-grid');
            PROMPT_RULES.forEach(function (rule) {
                var chip = document.createElement('div');
                chip.className = 'race-rule-chip';
                chip.setAttribute('data-rule', rule.id);
                chip.setAttribute('title', rule.detail);
                chip.innerHTML =
                    '<span class="race-rule-chip-id">' + rule.id + '</span>' +
                    '<span class="race-rule-chip-name">' + rule.name + '</span>' +
                    '<span class="race-rule-chip-status">' + rule.icon + '</span>';
                grid.appendChild(chip);
            });
        }

        function reset() {
            generation++;
            docEl.innerHTML = '';
            tokenEl.textContent = '0';
            stepsEl.innerHTML = '';
            ruleScanEl.innerHTML = '';
            ruleScanEl.classList.remove('visible');
            failureEl.innerHTML = '';
            failureEl.classList.remove('visible');
            successEl.innerHTML = '';
            successEl.classList.remove('visible');
            flowEl.innerHTML = '';
            resultPrompt.innerHTML = '';
            resultPrompt.classList.remove('visible');
            resultIW.innerHTML = '';
            resultIW.classList.remove('visible');
            accFillPrompt.style.width = '0%';
            accFillIW.style.width = '0%';
            accValPrompt.textContent = '\u2014';
            accValIW.textContent = '\u2014';
        }

        function run() {
            reset();
            var gen = generation;
            var tokenCount = 0;

            /* ---- Build IW flow diagram ---- */
            buildFlowDiagram();

            /* ---- Build IW step elements (hidden) with sub-phases ---- */
            IW_STEPS.forEach(function (step) {
                var el = document.createElement('div');
                el.className = 'race-step';
                var phasesHTML = step.phases.map(function (p) {
                    return '<div class="race-phase race-phase-' + p.type + '">' +
                        '<span class="race-phase-icon">' + p.icon + '</span>' +
                        '<span class="race-phase-text">' + p.text.replace(/\n/g, '<br>') + '</span>' +
                    '</div>';
                }).join('');
                el.innerHTML =
                    '<div class="race-step-indicator">' +
                        '<div class="race-step-dot"></div>' +
                        '<div class="race-step-line"></div>' +
                    '</div>' +
                    '<div class="race-step-content">' +
                        '<div class="race-step-label">' + step.label + '</div>' +
                        '<div class="race-step-phases">' + phasesHTML + '</div>' +
                    '</div>';
                stepsEl.appendChild(el);
            });

            /* ---- Animate prompt document paragraphs ---- */
            var paraIdx = 0;
            var tokensPerPara = Math.ceil(4200 / PROMPT_DOC.length);
            function addParagraph() {
                if (gen !== generation) return;
                if (paraIdx >= PROMPT_DOC.length) {
                    showRuleScan(gen);
                    return;
                }
                var p = PROMPT_DOC[paraIdx];
                var el = document.createElement('div');
                if (p.type === 'heading') {
                    el.className = 'race-prompt-doc-heading';
                    el.textContent = p.text;
                } else {
                    el.className = 'race-prompt-doc-text';
                    el.innerHTML = p.text;
                }
                docEl.appendChild(el);
                tokenCount += tokensPerPara;
                tokenEl.textContent = Math.min(tokenCount, 4200).toLocaleString();
                docEl.scrollTop = docEl.scrollHeight;
                paraIdx++;
                setTimeout(addParagraph, 280);
            }

            /* ---- Animate IW steps with flow diagram sync ---- */
            var stepEls = stepsEl.querySelectorAll('.race-step');
            var flowNodes = flowEl.querySelectorAll('.race-flow-node');
            var flowEdges = flowEl.querySelectorAll('.race-flow-edge');
            var iwDelay = 800;
            var PHASE_DELAY = 700;
            var STEP_GAP = 400;

            stepEls.forEach(function (stepEl, i) {
                var phases = stepEl.querySelectorAll('.race-phase');
                // Show the step container and activate flow node
                setTimeout(function () {
                    if (gen !== generation) return;
                    stepEl.classList.add('visible');
                    // Light up flow diagram node
                    if (flowNodes[i]) flowNodes[i].classList.add('active');
                    // Animate preceding edge
                    if (i > 0 && flowEdges[i - 1]) flowEdges[i - 1].classList.add('active');
                }, iwDelay);
                // Reveal each phase within the step
                phases.forEach(function (phaseEl, j) {
                    setTimeout(function () {
                        if (gen !== generation) return;
                        phaseEl.classList.add('visible');
                        stepsEl.scrollTop = stepsEl.scrollHeight;
                    }, iwDelay + 300 + j * PHASE_DELAY);
                });
                iwDelay += 300 + phases.length * PHASE_DELAY + STEP_GAP;
            });

            var iwTotalTime = iwDelay;

            // Show IW result after all steps
            setTimeout(function () {
                if (gen !== generation) return;
                resultIW.innerHTML = '<span class="race-result-label">Agent Decision</span>' + IW_ANSWER;
                resultIW.classList.add('visible');
            }, iwTotalTime + 200);

            // Show IW success explanation after result
            setTimeout(function () {
                if (gen !== generation) return;
                showSuccessExplanation(gen);
            }, iwTotalTime + 800);

            // Show IW accuracy after success explanation
            setTimeout(function () {
                if (gen !== generation) return;
                accFillIW.style.width = '98%';
                animateCounter(accValIW, 0, 98, 800, gen, '%');
            }, iwTotalTime + 800 + SUCCESS_REASONS.length * 500 + 400);

            addParagraph();
        }

        /* ---- Show rule scan grid — all chips at once ---- */
        function showRuleScan(gen) {
            if (gen !== generation) return;
            tokenEl.textContent = '4,200';

            buildRuleScan();
            ruleScanEl.classList.add('visible');

            // Show ALL rule chips at once
            var chips = ruleScanEl.querySelectorAll('.race-rule-chip');
            chips.forEach(function (chip, i) {
                var rule = PROMPT_RULES[i];
                chip.classList.add('scanned', rule.status);
            });

            // Show summary immediately
            var correct = 0, confused = 0, missed = 0, wrong = 0;
            PROMPT_RULES.forEach(function (r) {
                if (r.status === 'correct') correct++;
                else if (r.status === 'confused') confused++;
                else if (r.status === 'missed') missed++;
                else if (r.status === 'wrong') wrong++;
            });

            var summaryEl = document.createElement('div');
            summaryEl.className = 'race-scan-summary';
            summaryEl.innerHTML =
                '<span class="race-scan-stat"><span class="race-scan-dot" style="background:var(--accent);"></span>' + correct + ' applied</span>' +
                '<span class="race-scan-stat"><span class="race-scan-dot" style="background:var(--amber);"></span>' + confused + ' confused</span>' +
                '<span class="race-scan-stat"><span class="race-scan-dot" style="background:var(--red);"></span>' + (missed + wrong) + ' missed/wrong</span>';
            ruleScanEl.appendChild(summaryEl);
            requestAnimationFrame(function () { summaryEl.classList.add('visible'); });

            setTimeout(function () { showPromptAnswer(gen); }, 800);
        }

        function showPromptAnswer(gen) {
            if (gen !== generation) return;

            var html = '<span class="race-result-label">Agent Decision</span>';
            var answerText = PROMPT_ANSWER.text;
            answerText = answerText.replace(/<err>(.*?)<\/err>/g, '<span class="race-error">$1</span>');
            html += answerText;

            PROMPT_ANSWER.errors.forEach(function (err) {
                html += '<span class="race-error-note" data-err="' + err.match + '">' + err.note + '</span>';
            });

            resultPrompt.innerHTML = html;
            resultPrompt.classList.add('visible');

            // Stagger error note reveals
            var notes = resultPrompt.querySelectorAll('.race-error-note');
            notes.forEach(function (note, i) {
                setTimeout(function () {
                    if (gen !== generation) return;
                    note.classList.add('visible');
                }, 600 + i * 700);
            });

            // Show failure explanation after error notes
            var failureDelay = 600 + PROMPT_ANSWER.errors.length * 700 + 600;
            setTimeout(function () {
                if (gen !== generation) return;
                showFailureExplanation(gen);
            }, failureDelay);

            // Show accuracy after failure explanation
            setTimeout(function () {
                if (gen !== generation) return;
                accFillPrompt.style.width = '62%';
                animateCounter(accValPrompt, 0, 62, 800, gen, '%');
            }, failureDelay + FAILURE_REASONS.length * 500 + 400);
        }

        /* ---- Show WHY it fails: hallucination explanation ---- */
        function showFailureExplanation(gen) {
            if (gen !== generation) return;

            failureEl.innerHTML = '<div class="race-failure-explain-title">Why It Hallucinated</div>';
            FAILURE_REASONS.forEach(function (reason) {
                var item = document.createElement('div');
                item.className = 'race-failure-item';
                item.innerHTML =
                    '<span class="race-failure-item-icon">' + reason.icon + '</span>' +
                    '<div class="race-failure-item-content">' +
                        '<div class="race-failure-item-label">' + reason.label + '</div>' +
                        '<div class="race-failure-item-desc">' + reason.desc + '</div>' +
                    '</div>';
                failureEl.appendChild(item);
            });
            failureEl.classList.add('visible');

            // Stagger reveal of failure items
            var items = failureEl.querySelectorAll('.race-failure-item');
            items.forEach(function (item, i) {
                setTimeout(function () {
                    if (gen !== generation) return;
                    item.classList.add('visible');
                }, 200 + i * 500);
            });
        }

        /* ---- Show WHY IW works: success counterpoints ---- */
        function showSuccessExplanation(gen) {
            if (gen !== generation) return;

            successEl.innerHTML = '<div class="race-success-explain-title">Why It Got It Right</div>';
            SUCCESS_REASONS.forEach(function (reason) {
                var item = document.createElement('div');
                item.className = 'race-success-item';
                item.innerHTML =
                    '<span class="race-success-item-icon">' + reason.icon + '</span>' +
                    '<div class="race-success-item-content">' +
                        '<div class="race-success-item-label">' + reason.label + '</div>' +
                        '<div class="race-success-item-desc">' + reason.desc + '</div>' +
                    '</div>';
                successEl.appendChild(item);
            });
            successEl.classList.add('visible');

            // Stagger reveal of success items
            var items = successEl.querySelectorAll('.race-success-item');
            items.forEach(function (item, i) {
                setTimeout(function () {
                    if (gen !== generation) return;
                    item.classList.add('visible');
                }, 200 + i * 500);
            });
        }

        function animateCounter(el, from, to, duration, gen, suffix) {
            var start = performance.now();
            function tick(now) {
                if (gen !== generation) return;
                var t = Math.min((now - start) / duration, 1);
                t = t * t * (3 - 2 * t); // smoothstep
                el.textContent = Math.round(from + (to - from) * t) + (suffix || '');
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        // Auto-play on scroll
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && !hasPlayed) {
                    hasPlayed = true;
                    run();
                }
            });
        }, { threshold: 0.2 });
        obs.observe(container);

        replayBtn.addEventListener('click', function () {
            run();
        });
    })();

    /* ================================================
       SECTION 2: WALK THE GRAPH
       ================================================ */
    (function walkTheGraph() {
        var COLORS = {
            L1: '#1B6B5A',
            L2: '#14b8a6',
            L3: '#C4453C'
        };

        var SCENARIOS = {
            markdown: {
                question: '"Should we markdown GlowMax Men 50ml in North zone?" — DOI = 140d, ST = 22%, Margin = 30%',
                answer: 'Recommend 12% markdown on GlowMax Men 50ml (North). Seasonal exception applied. Routed to ZSM Priya M for approval.',
                nodes: [
                    { id: 'Product', label: 'Product', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.25 },
                    { id: 'SKU', label: 'SKU', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.55 },
                    { id: 'Region', label: 'Region', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.80 },
                    { id: 'DOI', label: 'DOI', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.20 },
                    { id: 'SellThrough', label: 'Sell-Through', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.50 },
                    { id: 'Margin', label: 'Margin', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.80 },
                    { id: 'MarkdownRule', label: 'Markdown Rule', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.25 },
                    { id: 'Exception', label: 'Seasonal Exc.', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.55 },
                    { id: 'Authority', label: 'Authority', layer: 'L3', type: 'decision', fx: 0.90, fy: 0.40 }
                ],
                edges: [
                    ['Product', 'SKU'], ['Product', 'DOI'], ['SKU', 'SellThrough'],
                    ['Region', 'SKU'], ['DOI', 'MarkdownRule'], ['SellThrough', 'MarkdownRule'],
                    ['Margin', 'MarkdownRule'], ['MarkdownRule', 'Exception'],
                    ['Exception', 'Authority'], ['Region', 'Authority']
                ],
                steps: [
                    { title: 'Resolve Entities', layer: 'L1', nodes: ['Product', 'SKU', 'Region'], result: 'GlowMax Men 50ml → GXM-50 · Men\'s Grooming · North Zone · RSM: Rajesh K' },
                    { title: 'Compute Metrics', layer: 'L2', nodes: ['DOI', 'SellThrough', 'Margin'], result: 'DOI = 140d · ST = 22% · Margin = 30% · Seasonal = YES' },
                    { title: 'Apply Rules', layer: 'L3', nodes: ['MarkdownRule', 'Exception'], result: 'D1 triggered · D7 seasonal override · Markdown depth: 12%' },
                    { title: 'Check Authority', layer: 'L3', nodes: ['Authority'], result: '12% > 10% threshold → ZSM approval required → Priya M' }
                ],
                layerErrors: {
                    L1: 'Entity hallucination — agent can\'t distinguish GlowMax Men 50ml from Women 50ml or Men 100ml. Resolves wrong SKU.',
                    L2: 'Wrong formula — agent approximates sell-through as revenue ratio instead of units. Gets 28% instead of 22%. Misses markdown trigger.',
                    L3: 'Missing rules — agent doesn\'t know about the 120-day DOI markdown trigger, seasonal exceptions, or authority thresholds. Recommends "monitor situation."'
                }
            },
            reorder: {
                question: '"Should we place a reorder for Premium Oats 1kg at DC-Mumbai?" — Current stock = 850, Safety stock = 500, Lead time = 14d',
                answer: 'Reorder triggered. Order 2,400 units of Premium Oats 1kg from Supplier Agricon. Expected delivery: 14 days. Approved automatically (within RSM authority).',
                nodes: [
                    { id: 'SKU', label: 'SKU', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.25 },
                    { id: 'DC', label: 'Dist. Center', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.55 },
                    { id: 'Supplier', label: 'Supplier', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.80 },
                    { id: 'SafetyStock', label: 'Safety Stock', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.20 },
                    { id: 'FillRate', label: 'Fill Rate', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.50 },
                    { id: 'LeadTime', label: 'Lead Time', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.80 },
                    { id: 'ReorderRule', label: 'Reorder Rule', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.25 },
                    { id: 'QtyCalc', label: 'Qty Calculation', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.55 },
                    { id: 'Approval', label: 'Approval', layer: 'L3', type: 'decision', fx: 0.90, fy: 0.40 }
                ],
                edges: [
                    ['SKU', 'SafetyStock'], ['DC', 'SKU'], ['Supplier', 'LeadTime'],
                    ['SafetyStock', 'ReorderRule'], ['FillRate', 'ReorderRule'],
                    ['LeadTime', 'QtyCalc'], ['ReorderRule', 'QtyCalc'],
                    ['QtyCalc', 'Approval'], ['DC', 'Approval']
                ],
                steps: [
                    { title: 'Resolve Entities', layer: 'L1', nodes: ['SKU', 'DC', 'Supplier'], result: 'Premium Oats 1kg → PO-1K · DC-Mumbai · Supplier: Agricon (preferred)' },
                    { title: 'Compute Metrics', layer: 'L2', nodes: ['SafetyStock', 'FillRate', 'LeadTime'], result: 'Current = 850 · Safety = 500 · Fill Rate = 94% · Lead Time = 14d' },
                    { title: 'Apply Reorder Logic', layer: 'L3', nodes: ['ReorderRule', 'QtyCalc'], result: 'Inventory position < reorder point ✓ · EOQ = 2,400 units · Supplier MOQ met ✓' },
                    { title: 'Check Authority', layer: 'L3', nodes: ['Approval'], result: 'Order value ₹4.8L within RSM limit (₹10L) → auto-approved' }
                ],
                layerErrors: {
                    L1: 'Entity confusion — agent doesn\'t know which distribution center or preferred supplier to use. Defaults to wrong DC.',
                    L2: 'Wrong calculation — agent uses average daily sales instead of EOQ model. Orders 600 units instead of 2,400.',
                    L3: 'Missing reorder logic — agent doesn\'t know the reorder point formula, MOQ requirements, or approval thresholds.'
                }
            },
            territory: {
                question: '"Reassign West Zone territories after RSM Amit leaves." — 3 territories, 47 distributors, ₹12Cr pipeline',
                answer: 'Split across 2 existing RSMs by geography. Territory T1→Deepa (adjacent), T2+T3→Vikram (capacity). ZSM approval obtained. Transition plan: 2 weeks.',
                nodes: [
                    { id: 'Territory', label: 'Territory', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.25 },
                    { id: 'SalesRep', label: 'Sales Rep', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.55 },
                    { id: 'Account', label: 'Accounts', layer: 'L1', type: 'ontology', fx: 0.10, fy: 0.80 },
                    { id: 'Pipeline', label: 'Pipeline', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.20 },
                    { id: 'Quota', label: 'Quota Attain.', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.50 },
                    { id: 'Capacity', label: 'Rep Capacity', layer: 'L2', type: 'kpi', fx: 0.40, fy: 0.80 },
                    { id: 'AssignRule', label: 'Assignment Rule', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.25 },
                    { id: 'Balance', label: 'Load Balance', layer: 'L3', type: 'decision', fx: 0.70, fy: 0.55 },
                    { id: 'ZSMApproval', label: 'ZSM Approval', layer: 'L3', type: 'decision', fx: 0.90, fy: 0.40 }
                ],
                edges: [
                    ['Territory', 'SalesRep'], ['Territory', 'Account'], ['SalesRep', 'Quota'],
                    ['Account', 'Pipeline'], ['Pipeline', 'AssignRule'], ['Quota', 'AssignRule'],
                    ['Capacity', 'Balance'], ['AssignRule', 'Balance'],
                    ['Balance', 'ZSMApproval'], ['Territory', 'ZSMApproval']
                ],
                steps: [
                    { title: 'Resolve Entities', layer: 'L1', nodes: ['Territory', 'SalesRep', 'Account'], result: '3 territories (T1-T3) · 47 distributors · 2 adjacent RSMs: Deepa, Vikram' },
                    { title: 'Compute Metrics', layer: 'L2', nodes: ['Pipeline', 'Quota', 'Capacity'], result: 'Pipeline: ₹12Cr · Deepa at 82% capacity · Vikram at 71% capacity' },
                    { title: 'Apply Assignment Rules', layer: 'L3', nodes: ['AssignRule', 'Balance'], result: 'Adjacency rule: T1→Deepa · Capacity rule: T2+T3→Vikram · Load balanced ✓' },
                    { title: 'Check Authority', layer: 'L3', nodes: ['ZSMApproval'], result: 'Territory reassignment requires ZSM approval → auto-routed · Transition: 2 weeks' }
                ],
                layerErrors: {
                    L1: 'Doesn\'t know org structure — can\'t identify adjacent RSMs or which distributors belong to which territory.',
                    L2: 'No capacity model — can\'t compute current rep workload or pipeline distribution. Assigns equally regardless of capacity.',
                    L3: 'Missing assignment rules — ignores adjacency preferences, load balancing constraints, and transition period requirements.'
                }
            }
        };

        var canvas = document.getElementById('walkCanvas');
        var ctx = canvas.getContext('2d');
        var stepsEl = document.getElementById('walkSteps');
        var questionEl = document.getElementById('walkQuestion');
        var answerEl = document.getElementById('walkFinalAnswer');
        var errorBanner = document.getElementById('walkErrorBanner');
        var scenarioSelect = document.getElementById('walkScenario');
        var checkL1 = document.getElementById('walkL1');
        var checkL2 = document.getElementById('walkL2');
        var checkL3 = document.getElementById('walkL3');

        var W, H, dpr;
        var currentScenario = 'markdown';
        var highlightNodes = [];
        var activeEdges = [];
        var walkGeneration = 0;
        var animTime = 0;
        var animId = null;
        var isVisible = false;

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            dpr = window.devicePixelRatio || 1;
            W = rect.width;
            H = rect.height;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function getScenario() { return SCENARIOS[currentScenario]; }

        function isLayerEnabled(layer) {
            if (layer === 'L1') return checkL1.checked;
            if (layer === 'L2') return checkL2.checked;
            if (layer === 'L3') return checkL3.checked;
            return true;
        }

        function getNodePos(node) {
            var bx = node.fx * W;
            var by = node.fy * H;
            var ox = Math.sin(animTime * 0.4 + node.fx * 10) * 2.5;
            var oy = Math.cos(animTime * 0.5 + node.fy * 10) * 2.5;
            return { x: bx + ox, y: by + oy };
        }

        function drawGraph() {
            animTime += 0.016;
            ctx.clearRect(0, 0, W, H);

            var sc = getScenario();
            var pad = 40;
            // Draw layer labels
            ctx.font = '600 10px ' + getComputedStyle(document.body).fontFamily;
            ctx.textAlign = 'center';
            var layerCenters = { L1: 0.10, L2: 0.40, L3: 0.78 };
            ['L1', 'L2', 'L3'].forEach(function (l) {
                var enabled = isLayerEnabled(l);
                ctx.globalAlpha = enabled ? 0.35 : 0.1;
                ctx.fillStyle = COLORS[l];
                var labels = { L1: 'ONTOLOGY', L2: 'METRICS', L3: 'DECISIONS' };
                ctx.fillText(labels[l], layerCenters[l] * W, 16);
            });
            ctx.globalAlpha = 1;

            // Draw edges
            sc.edges.forEach(function (edge) {
                var fromNode = sc.nodes.find(function (n) { return n.id === edge[0]; });
                var toNode = sc.nodes.find(function (n) { return n.id === edge[1]; });
                if (!fromNode || !toNode) return;

                var fromEnabled = isLayerEnabled(fromNode.layer);
                var toEnabled = isLayerEnabled(toNode.layer);
                var p1 = getNodePos(fromNode);
                var p2 = getNodePos(toNode);

                var isActive = activeEdges.some(function (ae) {
                    return (ae[0] === edge[0] && ae[1] === edge[1]) ||
                           (ae[0] === edge[1] && ae[1] === edge[0]);
                });

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = isActive ? COLORS[toNode.layer] : '#d4d0c8';
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.globalAlpha = (!fromEnabled || !toEnabled) ? 0.1 : (isActive ? 0.8 : 0.2);
                ctx.setLineDash(isActive ? [] : [4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            });

            // Draw nodes
            sc.nodes.forEach(function (node) {
                var pos = getNodePos(node);
                var enabled = isLayerEnabled(node.layer);
                var isHighlighted = highlightNodes.indexOf(node.id) >= 0;
                var color = COLORS[node.layer];
                var r = 18;

                ctx.globalAlpha = enabled ? 1 : 0.12;

                // Glow for highlighted nodes
                if (isHighlighted && enabled) {
                    var glow = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r * 2.5);
                    glow.addColorStop(0, color + '30');
                    glow.addColorStop(1, color + '00');
                    ctx.fillStyle = glow;
                    ctx.fillRect(pos.x - r * 2.5, pos.y - r * 2.5, r * 5, r * 5);
                }

                if (node.type === 'decision') {
                    // Triangle
                    var s = r * 1.2;
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y - s);
                    ctx.lineTo(pos.x - s * 0.866, pos.y + s * 0.5);
                    ctx.lineTo(pos.x + s * 0.866, pos.y + s * 0.5);
                    ctx.closePath();
                    ctx.fillStyle = isHighlighted ? color : '#fff';
                    ctx.strokeStyle = color;
                    ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
                    ctx.fill();
                    ctx.stroke();
                    if (isHighlighted) {
                        // Inner triangle
                        var si = s * 0.55;
                        ctx.beginPath();
                        ctx.moveTo(pos.x, pos.y - si);
                        ctx.lineTo(pos.x - si * 0.866, pos.y + si * 0.5);
                        ctx.lineTo(pos.x + si * 0.866, pos.y + si * 0.5);
                        ctx.closePath();
                        ctx.fillStyle = '#fff';
                        ctx.globalAlpha = enabled ? 0.3 : 0.05;
                        ctx.fill();
                        ctx.globalAlpha = enabled ? 1 : 0.12;
                    }
                } else if (node.type === 'kpi') {
                    // Ringed circle
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = isHighlighted ? 3 : 2;
                    ctx.stroke();
                    // Dashed outer ring
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);
                    ctx.setLineDash([3, 4]);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = enabled ? 0.4 : 0.08;
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.globalAlpha = enabled ? 1 : 0.12;
                    // Inner fill
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, r * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = enabled ? 0.15 : 0.03;
                    ctx.fill();
                    ctx.globalAlpha = enabled ? 1 : 0.12;
                } else {
                    // Standard circle (ontology)
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = isHighlighted ? color : '#fff';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
                    ctx.stroke();
                }

                // Label
                ctx.font = '500 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = enabled ? (isHighlighted ? color : '#52514D') : '#ccc';
                ctx.fillText(node.label, pos.x, pos.y + r + 14);

                ctx.globalAlpha = 1;
            });

            if (isVisible) animId = requestAnimationFrame(drawGraph);
        }

        function buildSteps(gen) {
            var sc = getScenario();
            stepsEl.innerHTML = '';
            answerEl.classList.remove('visible');
            answerEl.innerHTML = '';
            errorBanner.classList.remove('visible');
            errorBanner.innerHTML = '';
            highlightNodes = [];
            activeEdges = [];

            questionEl.textContent = sc.question;

            var disabledLayers = [];
            if (!checkL1.checked) disabledLayers.push('L1');
            if (!checkL2.checked) disabledLayers.push('L2');
            if (!checkL3.checked) disabledLayers.push('L3');

            sc.steps.forEach(function (step, i) {
                var isSkipped = !isLayerEnabled(step.layer);
                var el = document.createElement('div');
                el.className = 'walk-step' + (isSkipped ? ' skipped' : '');

                var nodeChips = step.nodes.map(function (nid) {
                    return '<span class="walk-step-node-chip">' + nid + '</span>';
                }).join('');

                el.innerHTML =
                    '<div class="walk-step-header">' +
                        '<span class="walk-step-num walk-step-num-' + step.layer.toLowerCase() + '">' + (i + 1) + '</span>' +
                        '<span class="walk-step-title">' + step.title + '</span>' +
                    '</div>' +
                    '<div class="walk-step-nodes">' + nodeChips + '</div>' +
                    (isSkipped
                        ? '<div class="walk-step-skip-msg">SKIPPED — Layer disabled</div>'
                        : '<div class="walk-step-result">' + step.result + '</div>');
                stepsEl.appendChild(el);

                // Animate step appearance
                setTimeout(function () {
                    if (gen !== walkGeneration) return;
                    el.classList.add('visible');
                    if (!isSkipped) {
                        el.classList.add('active');
                        // Highlight nodes on graph
                        step.nodes.forEach(function (nid) {
                            if (highlightNodes.indexOf(nid) < 0) highlightNodes.push(nid);
                        });
                        // Highlight edges
                        sc.edges.forEach(function (edge) {
                            var fromInStep = step.nodes.indexOf(edge[0]) >= 0;
                            var toInStep = step.nodes.indexOf(edge[1]) >= 0;
                            var fromInPrev = highlightNodes.indexOf(edge[0]) >= 0;
                            var toInPrev = highlightNodes.indexOf(edge[1]) >= 0;
                            if ((fromInStep && toInPrev) || (toInStep && fromInPrev) || (fromInStep && toInStep)) {
                                activeEdges.push(edge);
                            }
                        });
                    }
                    // Remove active from previous
                    setTimeout(function () {
                        el.classList.remove('active');
                    }, 600);
                }, 200 + i * 1200);
            });

            // Show answer or error
            var totalDelay = 200 + sc.steps.length * 1200 + 400;
            setTimeout(function () {
                if (gen !== walkGeneration) return;

                if (disabledLayers.length > 0) {
                    var errHtml = '<div class="walk-error-banner-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Decision Failed</div>';
                    disabledLayers.forEach(function (l) {
                        if (sc.layerErrors[l]) {
                            errHtml += '<div class="walk-error-banner-text" style="margin-top:0.5rem;"><strong>' + l + ':</strong> ' + sc.layerErrors[l] + '</div>';
                        }
                    });
                    errorBanner.innerHTML = errHtml;
                    errorBanner.classList.add('visible');
                } else {
                    answerEl.innerHTML = '<span class="walk-final-answer-label">Final Decision</span><div class="walk-final-answer-text">' + sc.answer + '</div>';
                    answerEl.classList.add('visible');
                }
            }, totalDelay);
        }

        function runScenario() {
            walkGeneration++;
            highlightNodes = [];
            activeEdges = [];
            buildSteps(walkGeneration);
        }

        scenarioSelect.addEventListener('change', function () {
            currentScenario = scenarioSelect.value;
            runScenario();
        });

        [checkL1, checkL2, checkL3].forEach(function (cb) {
            cb.addEventListener('change', runScenario);
        });

        // Visibility observer
        var walkObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                isVisible = en.isIntersecting;
                if (isVisible && !animId) {
                    drawGraph();
                }
            });
        }, { threshold: 0.1 });
        walkObs.observe(canvas.parentElement);

        window.addEventListener('resize', function () {
            resize();
        });

        // Init
        resize();
        runScenario();
        drawGraph();
    })();

    /* ================================================
       SECTION 3: THE COMPLEXITY CLIFF
       ================================================ */
    (function complexityCliff() {
        var canvas = document.getElementById('cliffCanvas');
        var ctx = canvas.getContext('2d');
        var slider = document.getElementById('cliffSlider');
        var sliderValue = document.getElementById('cliffSliderValue');
        var failureEl = document.getElementById('cliffFailure');

        var W, H, dpr;
        var currentRules = 3;

        var FAILURES = [
            { min: 3, max: 5, text: 'Prompt handles simple rules adequately. Few interactions between rules.' },
            { min: 6, max: 9, text: 'Occasional rule precedence errors — agent misorders which rule to apply first when two triggers overlap.' },
            { min: 10, max: 14, text: 'Agent starts conflating similar rules (e.g., D3 vs D3a). Subtle errors in edge cases increase.' },
            { min: 15, max: 19, text: 'Rule D7 conflicts with Rule D3 — prompt can\'t resolve precedence. Cross-rule dependencies are invisible to the model.' },
            { min: 20, max: 24, text: 'Prompt exceeds reliable context utilization. Rules near the middle of the prompt are frequently ignored ("lost in the middle" effect).' },
            { min: 25, max: 29, text: '72% of applicable decision rules are missed. Exception-to-exception chains (rule modifying another rule\'s exception) completely break.' },
            { min: 30, max: 39, text: 'Cross-domain rule interactions ignored entirely. A pricing rule that should trigger an inventory check never fires.' },
            { min: 40, max: 50, text: 'Prompt-based approach is effectively random for multi-step decisions. Hallucination rate exceeds 30%. Agent invents rules that don\'t exist.' }
        ];

        function promptAccuracy(rules) {
            // Decay curve: ~92% at 3, dropping to ~42% at 50
            var t = (rules - 3) / 47;
            var base = 92 - t * 52;
            var noise = Math.sin(rules * 0.7) * 2;
            return Math.max(38, Math.min(95, base + noise));
        }

        function iwAccuracy(rules) {
            return 97.5 + Math.sin(rules * 0.3) * 0.5;
        }

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            dpr = window.devicePixelRatio || 1;
            W = rect.width;
            H = rect.height;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            var padL = 50, padR = 30, padT = 20, padB = 40;
            var chartW = W - padL - padR;
            var chartH = H - padT - padB;

            // Y axis: 0-100%
            // X axis: 3-50 rules
            function xPos(rules) { return padL + ((rules - 3) / 47) * chartW; }
            function yPos(acc) { return padT + ((100 - acc) / 100) * chartH; }

            // Grid lines
            ctx.strokeStyle = '#e5e2db';
            ctx.lineWidth = 1;
            [20, 40, 60, 80, 100].forEach(function (v) {
                var y = yPos(v);
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(W - padR, y);
                ctx.stroke();
                // Label
                ctx.font = '500 10px Inter, sans-serif';
                ctx.fillStyle = '#a09d98';
                ctx.textAlign = 'right';
                ctx.fillText(v + '%', padL - 8, y + 3);
            });

            // X axis labels
            ctx.textAlign = 'center';
            [3, 10, 20, 30, 40, 50].forEach(function (v) {
                ctx.fillStyle = '#a09d98';
                ctx.fillText(v, xPos(v), H - padB + 18);
            });
            ctx.fillText('Business Rules', padL + chartW / 2, H - 4);

            // Draw IW line (flat at top) — full range
            ctx.beginPath();
            for (var r = 3; r <= 50; r++) {
                var x = xPos(r);
                var y = yPos(iwAccuracy(r));
                if (r === 3) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#1B6B5A';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // IW area fill
            ctx.lineTo(xPos(50), yPos(0));
            ctx.lineTo(xPos(3), yPos(0));
            ctx.closePath();
            ctx.fillStyle = 'rgba(27,107,90,0.06)';
            ctx.fill();

            // Draw Prompt line — up to slider position
            ctx.beginPath();
            for (var r2 = 3; r2 <= currentRules; r2++) {
                var x2 = xPos(r2);
                var y2 = yPos(promptAccuracy(r2));
                if (r2 === 3) ctx.moveTo(x2, y2);
                else ctx.lineTo(x2, y2);
            }
            ctx.strokeStyle = '#C4453C';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Prompt area fill
            if (currentRules > 3) {
                ctx.lineTo(xPos(currentRules), yPos(0));
                ctx.lineTo(xPos(3), yPos(0));
                ctx.closePath();
                ctx.fillStyle = 'rgba(196,69,60,0.06)';
                ctx.fill();
            }

            // Dashed line for prompt future (faded)
            if (currentRules < 50) {
                ctx.beginPath();
                ctx.moveTo(xPos(currentRules), yPos(promptAccuracy(currentRules)));
                for (var r3 = currentRules + 1; r3 <= 50; r3++) {
                    ctx.lineTo(xPos(r3), yPos(promptAccuracy(r3)));
                }
                ctx.strokeStyle = 'rgba(196,69,60,0.2)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Vertical line at current position
            var cx = xPos(currentRules);
            ctx.beginPath();
            ctx.moveTo(cx, padT);
            ctx.lineTo(cx, H - padB);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Dots at intersection
            var promptY = yPos(promptAccuracy(currentRules));
            var iwY = yPos(iwAccuracy(currentRules));

            // IW dot
            ctx.beginPath();
            ctx.arc(cx, iwY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#1B6B5A';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Prompt dot
            ctx.beginPath();
            ctx.arc(cx, promptY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#C4453C';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Value labels next to dots
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#1B6B5A';
            ctx.fillText(Math.round(iwAccuracy(currentRules)) + '%', cx + 10, iwY + 4);
            ctx.fillStyle = '#C4453C';
            ctx.fillText(Math.round(promptAccuracy(currentRules)) + '%', cx + 10, promptY + 4);

            // Gap indicator
            var gap = Math.round(iwAccuracy(currentRules) - promptAccuracy(currentRules));
            if (gap > 5) {
                var midY = (promptY + iwY) / 2;
                ctx.font = '700 13px "JetBrains Mono", monospace';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#B8734A';
                ctx.fillText(gap + 'pp gap', cx - 10, midY + 4);
            }
        }

        function updateFailure() {
            var failure = FAILURES.find(function (f) { return currentRules >= f.min && currentRules <= f.max; });
            if (failure) {
                failureEl.innerHTML = '<span class="cliff-failure-label">What goes wrong</span>' + failure.text;
            }
            failureEl.style.borderLeftColor = currentRules > 20 ? 'var(--red)' : (currentRules > 10 ? 'var(--amber)' : 'var(--accent)');
        }

        var drawPending = false;
        slider.addEventListener('input', function () {
            currentRules = parseInt(slider.value, 10);
            sliderValue.textContent = currentRules;
            updateFailure();
            if (!drawPending) {
                drawPending = true;
                requestAnimationFrame(function () {
                    draw();
                    drawPending = false;
                });
            }
        });

        window.addEventListener('resize', function () {
            resize();
            draw();
        });

        // Init
        resize();
        draw();
        updateFailure();
    })();

})();
