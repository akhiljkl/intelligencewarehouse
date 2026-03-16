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
       CORTEX: Conversational Chat Interface
       ================================================ */
    (function cortexChat() {
        var ROLES = [
            {
                name: 'Sales Manager',
                conversations: [
                    {
                        question: 'Which SKUs in North zone are underperforming vs margin target?',
                        answer: 'GXM-50 (18% margin) and GXM-100 (27% margin) are underperforming vs 30% target in North zone. D4 rule triggered for both. Routed to ZSM Priya M. for markdown review.',
                        trace: [
                            { layer: 'L1', label: 'Entity Resolution', desc: 'Product hierarchy \u2192 GlowMax \u2192 Men\u2019s Grooming \u2192 3 active SKUs in North zone' },
                            { layer: 'L2', label: 'Metric Computation', desc: 'Margin per SKU: GXM-50 at 18%, GXM-30 at 31%, GXM-100 at 27%. Target: 30%' },
                            { layer: 'L3', label: 'Rule Evaluation', desc: 'D4: Margin < 25% \u2192 flag underperforming. 2 SKUs triggered' },
                            { layer: 'L1', label: 'Authority Routing', desc: 'North zone ZSM: Priya M. \u2192 Markdown review required' }
                        ]
                    },
                    {
                        question: 'What markdown depth should we apply to GXM-50?',
                        answer: 'GXM-50 has a 12-point margin gap (18% vs 30% target). D4 tiered markdown rule: gap > 10% \u2192 15% markdown. Projected post-markdown sell-through: 2.1x current rate. Markdown value: \u20B94.2L. Requires ZSM approval (below \u20B95L threshold).',
                        trace: [
                            { layer: 'L2', label: 'Margin Gap Calc', desc: 'Current margin 18% vs target 30% = 12pt gap. Category: Men\u2019s Grooming premium' },
                            { layer: 'L3', label: 'Tiered Markdown Rule', desc: 'D4.2: Gap 5\u201310% \u2192 10% markdown. Gap > 10% \u2192 15% markdown. GXM-50 qualifies for 15%' },
                            { layer: 'L2', label: 'Impact Simulation', desc: 'Historical elasticity: 15% markdown \u2192 2.1x sell-through lift. Projected DOI reduction: 45d \u2192 21d' },
                            { layer: 'L3', label: 'Approval Threshold', desc: 'Markdown value \u20B94.2L < \u20B95L cap \u2192 ZSM can approve. No Regional Head escalation needed' }
                        ]
                    },
                    {
                        question: 'Will that recover our zone margin target?',
                        answer: 'With GXM-50 at 15% markdown and GXM-100 held: blended North zone margin moves from 24.8% to 28.6%. Still 1.4pts below 30% target. Recommendation: pair with GXM-30 premium push (currently 31% margin, room to increase facing allocation).',
                        trace: [
                            { layer: 'L2', label: 'Zone Margin Simulation', desc: 'Current blended: 24.8%. Post-markdown GXM-50 clears inventory \u2192 mix shifts to GXM-30 + GXM-100. New blend: 28.6%' },
                            { layer: 'L3', label: 'Target Gap Analysis', desc: 'D4 zone target: 30%. Post-action gap: 1.4pts. Within acceptable range (D4.5: gap < 2% \u2192 monitor, don\u2019t escalate)' },
                            { layer: 'L1', label: 'Product Opportunity', desc: 'GXM-30 at 31% margin, 42% SOV in zone. Increasing facings from 2 \u2192 3 projected to close remaining gap' }
                        ]
                    }
                ]
            },
            {
                name: 'Supply Chain Head',
                conversations: [
                    {
                        question: 'Should we increase reorder quantity for GlowMax before monsoon season?',
                        answer: 'Yes \u2014 increase reorder by 1.4x for all 4 GlowMax SKUs. D6 seasonal rule triggered. DOI is 45d vs 60d seasonal target. No exceptions blocking.',
                        trace: [
                            { layer: 'L1', label: 'Entity Resolution', desc: 'GlowMax \u2192 Skin Care \u2192 4 SKUs. Monsoon = Jun\u2013Sep seasonal window' },
                            { layer: 'L2', label: 'Metric Computation', desc: 'Inventory velocity: +35% in monsoon. Current DOI: 45 days (target: 60 for seasonal)' },
                            { layer: 'L3', label: 'Rule Evaluation', desc: 'D6: Seasonal exception \u2192 increase reorder by 1.4x when DOI < seasonal target' },
                            { layer: 'L3', label: 'Exception Check', desc: 'Not a new launch \u2713. Distributor credit clear \u2713. Warehouse capacity available \u2713' }
                        ]
                    },
                    {
                        question: 'What\u2019s the lead time risk if we increase by 1.4x?',
                        answer: 'Primary supplier (Vasu Chemicals) current lead time: 18 days. At 1.4x volume, capacity model shows stretch to 22 days. Buffer rule D6.3 requires 14-day safety stock \u2014 you\u2019re covered. Secondary supplier (KPL Industries) on standby at 12-day lead time if needed.',
                        trace: [
                            { layer: 'L1', label: 'Supplier Resolution', desc: 'GlowMax primary: Vasu Chemicals (78% share). Secondary: KPL Industries (22%). Both approved vendors' },
                            { layer: 'L2', label: 'Lead Time Computation', desc: 'Vasu base: 18d. At 1.4x load: +22% \u2192 22d projected. KPL base: 12d, capacity available' },
                            { layer: 'L3', label: 'Buffer Rule', desc: 'D6.3: Seasonal reorder must maintain 14d safety stock. Current buffer: 45d \u2212 22d lead = 23d. Sufficient' }
                        ]
                    },
                    {
                        question: 'Which distributor should absorb the extra stock?',
                        answer: 'North zone: Pinnacle Distributors (current utilization 61%, credit limit \u20B918L clear). They handled last monsoon\u2019s 1.3x surge with zero SLA breach. West zone: split between Metro Supply (71% utilization) and CityLink (54% utilization).',
                        trace: [
                            { layer: 'L1', label: 'Distributor Capacity', desc: 'North: Pinnacle at 61% warehouse utilization (cap: 12K units). West: Metro at 71%, CityLink at 54%' },
                            { layer: 'L2', label: 'Credit Check', desc: 'Pinnacle: \u20B918L available credit. Metro: \u20B97.2L. CityLink: \u20B914L. All above reorder threshold' },
                            { layer: 'L3', label: 'Allocation Rule', desc: 'D6.5: Prefer distributor with <65% utilization AND historical SLA > 95%. Pinnacle: 61% util, 97.2% SLA \u2713' }
                        ]
                    }
                ]
            },
            {
                name: 'Finance Analyst',
                conversations: [
                    {
                        question: 'What\u2019s our markdown exposure in West zone this quarter?',
                        answer: '23 SKUs in West zone qualify for markdown. Total exposure: \u20B92.3Cr this quarter. 4 high-value markdowns need Regional Head sign-off. 2 SKUs near exception threshold.',
                        trace: [
                            { layer: 'L1', label: 'Scope Resolution', desc: 'West zone \u2192 3 territories \u2192 12 distributors \u2192 847 active SKUs' },
                            { layer: 'L2', label: 'Metric Computation', desc: 'Scan all 847 SKUs against D1 triggers. 23 SKUs meet DOI > 120 AND ST < 30%' },
                            { layer: 'L3', label: 'Rule Simulation', desc: 'Apply tiered markdown logic: 8 SKUs at 10%, 11 at 15%, 4 at 20%. Total exposure: \u20B92.3Cr' },
                            { layer: 'L3', label: 'Authority Check', desc: '4 SKUs above \u20B95L threshold \u2192 require Regional Head approval, not just ZSM' }
                        ]
                    },
                    {
                        question: 'Which of the 4 high-value markdowns have the best recovery potential?',
                        answer: 'Ranked by recovery probability: (1) SKU WC-220 \u2014 87% recovery likelihood, seasonal demand uptick in 6 weeks. (2) SKU WC-185 \u2014 72%, strong channel partner interest. (3) SKU WC-340 \u2014 41%, declining category. (4) SKU WC-112 \u2014 23%, near end-of-life. Recommend approving WC-220 and WC-185 first.',
                        trace: [
                            { layer: 'L2', label: 'Velocity Trend', desc: 'WC-220: sell-through trending +12% MoM (seasonal). WC-185: flat but distributor pipeline strong. WC-340: -8% MoM. WC-112: -15% MoM' },
                            { layer: 'L3', label: 'Recovery Probability', desc: 'D1.4: Recovery score = f(velocity trend, seasonal index, channel demand). WC-220: 87%, WC-185: 72%, WC-340: 41%, WC-112: 23%' },
                            { layer: 'L3', label: 'Prioritization Rule', desc: 'D1.5: Approve recovery-probable markdowns first (score > 60%). Defer low-recovery for write-off review' }
                        ]
                    },
                    {
                        question: 'What\u2019s the net P&L impact if we approve all 23?',
                        answer: 'Gross markdown cost: \u20B92.3Cr. Projected recovery from accelerated sell-through: \u20B91.4Cr. Net impact: -\u20B90.9Cr. However, holding cost of non-markdown path: \u20B91.6Cr over 2 quarters. Net benefit of markdown: +\u20B90.7Cr vs hold.',
                        trace: [
                            { layer: 'L2', label: 'Margin Simulation', desc: 'Markdown cost at blended 14.2% avg depth: \u20B92.3Cr. Sell-through lift: 1.8x avg \u2192 \u20B91.4Cr recovered within quarter' },
                            { layer: 'L2', label: 'Holding Cost Model', desc: 'Alternative: hold inventory. Warehousing: \u20B90.4Cr/qtr. Depreciation: \u20B90.6Cr/qtr. Total 2-qtr hold cost: \u20B91.6Cr' },
                            { layer: 'L3', label: 'Write-off Threshold', desc: 'D1.8: SKUs with DOI > 180 auto-escalate to write-off review. 6 of 23 will hit this threshold next quarter if not marked down now' }
                        ]
                    }
                ]
            },
            {
                name: 'Trade Marketing',
                conversations: [
                    {
                        question: 'Which promotions should we run for slow-movers in South zone?',
                        answer: '15 SKUs eligible for promotion (3 excluded \u2014 already in markdown pipeline). 7 qualify for BOGO, 8 for display discount. Total budget: \u20B99.8L within \u20B912L cap.',
                        trace: [
                            { layer: 'L1', label: 'Entity Resolution', desc: 'South zone \u2192 identify slow-movers: DOI > 90 AND ST < 25%. 18 SKUs qualify' },
                            { layer: 'L2', label: 'Metric Analysis', desc: 'Segment by margin: 7 high-margin (>35%), 11 low-margin (<25%). Different promo strategies' },
                            { layer: 'L3', label: 'Promotion Rules', desc: 'D8: High-margin slow \u2192 BOGO eligible. Low-margin slow \u2192 display discount only. Cap: \u20B912L/qtr' },
                            { layer: 'L3', label: 'Cross-Rule Check', desc: 'Cross-check D1: 3 SKUs already flagged for markdown \u2014 exclude from promo to avoid double-discount' }
                        ]
                    },
                    {
                        question: 'What\u2019s the expected sell-through lift from the BOGO promotions?',
                        answer: 'Historical BOGO lift for high-margin slow-movers in South zone: 2.4x average. Projected for these 7 SKUs: 2.1x\u20132.7x range. Expected to clear 68% of excess inventory within promo window (4 weeks). ROI: 3.2x on promo spend of \u20B94.1L.',
                        trace: [
                            { layer: 'L2', label: 'Historical Promo Lift', desc: 'South zone BOGO history (last 4 qtrs): avg 2.4x lift. Category-adjusted: Skin Care 2.7x, Hair Care 2.1x, Oral Care 2.3x' },
                            { layer: 'L3', label: 'Category Benchmark', desc: 'D8.3: BOGO benchmark \u2192 min acceptable lift 1.8x. All 7 SKUs project above threshold. Green light' },
                            { layer: 'L2', label: 'Inventory Impact', desc: 'Current excess units: 14.2K. At 2.4x lift: 9.7K units cleared in 4 weeks. Remaining: 4.5K (manageable at normal velocity)' }
                        ]
                    },
                    {
                        question: 'Should we extend the promo to East zone too?',
                        answer: 'East zone has 11 slow-movers but only 4 overlap with South zone SKUs. Budget remaining: \u20B92.2L (of \u20B912L cap). Recommendation: run display discounts on the 4 overlapping SKUs (\u20B91.8L). Hold BOGO \u2014 East zone BOGO history shows lower lift (1.6x) due to different channel mix.',
                        trace: [
                            { layer: 'L1', label: 'East Zone Slow-Movers', desc: 'East zone: DOI > 90 AND ST < 25% \u2192 11 SKUs. 4 overlap with South zone promotional set' },
                            { layer: 'L2', label: 'Budget Check', desc: 'Q3 promo budget: \u20B912L. South allocation: \u20B99.8L. Remaining: \u20B92.2L. Display discount for 4 SKUs: \u20B91.8L \u2192 fits' },
                            { layer: 'L3', label: 'Zone Lift Comparison', desc: 'D8.5: East zone BOGO historical lift 1.6x (below 1.8x benchmark). Display discount lift: 1.4x (meets 1.2x benchmark). Recommend display only' }
                        ]
                    }
                ]
            },
            {
                name: 'Store Manager',
                conversations: [
                    {
                        question: 'Why is aisle 7 conversion dropping and what should I change?',
                        answer: 'Conversion dropped because Section 3 has 6 delisted SKUs blocking 4 new launches. Action: remove delisted, restock new launches on eye-level shelf. Recovery: 2\u20133 weeks.',
                        trace: [
                            { layer: 'L1', label: 'Location Resolution', desc: 'Aisle 7 \u2192 Premium Skin Care \u2192 24 SKUs across 4 planogram sections' },
                            { layer: 'L2', label: 'Metric Analysis', desc: 'Conversion dropped 18% MoM. Foot traffic stable. Basket analysis: category mix shifted' },
                            { layer: 'L3', label: 'Assortment Rules', desc: 'D12: Planogram compliance check \u2014 Section 3 has 6 delisted SKUs still on shelf' },
                            { layer: 'L3', label: 'Action Chain', desc: 'Remove 6 delisted \u2192 restock 4 new launches \u2192 shift premium facings to eye-level' }
                        ]
                    },
                    {
                        question: 'Which new launches should take the freed-up shelf space?',
                        answer: 'Priority order: (1) GlowMax Serum 30ml \u2014 highest margin at 42%, category demand index 8.2/10. (2) AquaPure Toner \u2014 38% margin, complements existing moisturizer facings. (3) DermaCare SPF \u2014 seasonal demand peak incoming. (4) HerbGlow Night Cream \u2014 fills gap in \u20B9500\u2013800 price band.',
                        trace: [
                            { layer: 'L1', label: 'New Launch Catalog', desc: '4 pending launches for Premium Skin Care: GlowMax Serum, AquaPure Toner, DermaCare SPF, HerbGlow Night Cream' },
                            { layer: 'L2', label: 'Margin Ranking', desc: 'GlowMax Serum: 42%. AquaPure Toner: 38%. DermaCare SPF: 34%. HerbGlow Night: 31%. All above 25% shelf threshold' },
                            { layer: 'L3', label: 'Planogram Rule', desc: 'D12.3: New launches get eye-level placement if margin > 30% AND category demand index > 7.0. All 4 qualify' }
                        ]
                    },
                    {
                        question: 'How long until I see conversion recover?',
                        answer: 'Based on historical planogram resets in similar aisles: conversion recovers 60% within 1 week (returning shoppers), 90% by week 2 (new discovery), full recovery by week 3. Track daily using your aisle-level dashboard.',
                        trace: [
                            { layer: 'L2', label: 'Recovery Curves', desc: 'Historical data: 12 similar resets across stores. Median recovery: 60% week 1, 90% week 2, 100% week 3' },
                            { layer: 'L3', label: 'Category Benchmark', desc: 'D12.5: Premium Skin Care recovery benchmark: 2.5 weeks. Your aisle has higher foot traffic \u2192 expect faster (2 weeks)' }
                        ]
                    }
                ]
            },
            {
                name: 'Ops Head',
                conversations: [
                    {
                        question: 'Which warehouses are at risk of SLA breach this week?',
                        answer: 'WH-3 (West) and WH-7 (North) projected below 85% SLA this week. Escalation D15 triggered. Routed to Deepak S. and Rahul K. Root cause: 3 delayed inbound shipments.',
                        trace: [
                            { layer: 'L1', label: 'Facility Resolution', desc: '8 active warehouses \u2192 current capacity, staffing levels, pending orders' },
                            { layer: 'L2', label: 'Metric Computation', desc: 'Fill rate forecast: WH-3 at 71% (SLA: 85%), WH-7 at 79% (SLA: 85%). 2 at risk' },
                            { layer: 'L3', label: 'Escalation Rules', desc: 'D15: Fill rate < 80% projected \u2192 escalate to Regional Ops Manager within 24hrs' },
                            { layer: 'L1', label: 'Authority Routing', desc: 'WH-3 \u2192 West \u2192 Ops Mgr: Deepak S. WH-7 \u2192 North \u2192 Ops Mgr: Rahul K.' }
                        ]
                    },
                    {
                        question: 'Can we reroute orders from WH-3 to WH-5?',
                        answer: 'WH-5 (South) has capacity: 43% utilization, 8.2K units available. However, transit time increases from 1.2 days to 3.1 days for West zone deliveries. D15.3 allows rerouting if SLA breach probability > 70% AND transit delta < 3 days. Transit delta is 1.9 days \u2014 rerouting approved.',
                        trace: [
                            { layer: 'L1', label: 'WH-5 Capacity', desc: 'WH-5 South: 43% utilization (cap 19K units). Available: 8.2K units. Staffing adequate for +30% load' },
                            { layer: 'L2', label: 'Transit Impact', desc: 'WH-3 to West zone avg: 1.2d. WH-5 to West zone avg: 3.1d. Delta: +1.9 days' },
                            { layer: 'L3', label: 'Rerouting Rule', desc: 'D15.3: Reroute if breach probability > 70% (WH-3: 84% \u2713) AND transit delta < 3d (1.9d \u2713). Approved' }
                        ]
                    },
                    {
                        question: 'What caused the 3 delayed inbound shipments?',
                        answer: 'All 3 from Vasu Chemicals (supplier S-014). Root cause: raw material shortage at their Pune facility. Pattern: 3rd delay incident in 8 weeks. D16 supplier performance rule triggered \u2014 penalty clause activated, backup supplier KPL Industries notified for standby allocation.',
                        trace: [
                            { layer: 'L1', label: 'Supplier Resolution', desc: 'Shipment IDs: SH-4401, SH-4403, SH-4407. All mapped to Vasu Chemicals (S-014), Pune facility' },
                            { layer: 'L2', label: 'On-Time Metrics', desc: 'Vasu Chemicals: on-time rate dropped from 94% to 78% over 8 weeks. 3 incidents flagged in current window' },
                            { layer: 'L3', label: 'Penalty Rule', desc: 'D16: 3+ delays in 8-week window \u2192 activate penalty clause (\u20B92.1L). Notify procurement head. Trigger backup supplier allocation' }
                        ]
                    }
                ]
            }
        ];

        // DOM refs
        var rolesEl = document.getElementById('cortexRoles');
        var messagesEl = document.getElementById('cortexChatMessages');
        var suggestionsEl = document.getElementById('cortexSuggestions');
        if (!rolesEl) return;

        var activeRoleIndex = 0;
        var conversationStep = 0;
        var animTimers = [];

        function clearTimers() {
            animTimers.forEach(function (t) { clearTimeout(t); });
            animTimers = [];
        }

        function scrollToBottom() {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function addUserMessage(text) {
            var div = document.createElement('div');
            div.className = 'cortex-msg-user';
            div.textContent = text;
            messagesEl.appendChild(div);
            // Trigger visibility
            requestAnimationFrame(function () {
                div.classList.add('visible');
            });
            return div;
        }

        function addTypingIndicator() {
            var div = document.createElement('div');
            div.className = 'cortex-typing';
            div.innerHTML = '<div class="cortex-typing-dot"></div><div class="cortex-typing-dot"></div><div class="cortex-typing-dot"></div>';
            messagesEl.appendChild(div);
            scrollToBottom();
            return div;
        }

        function removeTypingIndicator(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }

        function addIWMessage(answer, trace) {
            var msgDiv = document.createElement('div');
            msgDiv.className = 'cortex-msg-iw';

            // Label
            var labelDiv = document.createElement('div');
            labelDiv.className = 'cortex-msg-iw-label';
            labelDiv.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Intelligence Warehouse';
            msgDiv.appendChild(labelDiv);

            // Answer text
            var answerP = document.createElement('p');
            answerP.className = 'cortex-msg-answer-text';
            answerP.textContent = answer;
            msgDiv.appendChild(answerP);

            // Trace toggle
            var toggleDiv = document.createElement('div');
            toggleDiv.className = 'cortex-trace-toggle';
            toggleDiv.innerHTML = '<span class="cortex-trace-toggle-arrow">\u25B6</span> Graph Trace (' + trace.length + ' steps)';

            var traceBody = document.createElement('div');
            traceBody.className = 'cortex-trace-body';

            trace.forEach(function (step) {
                var stepDiv = document.createElement('div');
                stepDiv.className = 'cortex-trace-step';
                var badgeClass = 'cortex-trace-badge cortex-trace-badge-' + step.layer.toLowerCase();
                stepDiv.innerHTML = '<span class="' + badgeClass + '">' + step.layer + '</span>' +
                    '<div class="cortex-trace-content"><div class="cortex-trace-label">' + step.label + '</div>' +
                    '<div class="cortex-trace-desc">' + step.desc + '</div></div>';
                traceBody.appendChild(stepDiv);
            });

            toggleDiv.addEventListener('click', function () {
                var isOpen = traceBody.classList.toggle('open');
                toggleDiv.classList.toggle('expanded', isOpen);
            });

            msgDiv.appendChild(toggleDiv);
            msgDiv.appendChild(traceBody);

            messagesEl.appendChild(msgDiv);

            // Animate in
            requestAnimationFrame(function () {
                msgDiv.classList.add('visible');
                scrollToBottom();
            });

            return msgDiv;
        }

        function showSuggestions(questions) {
            suggestionsEl.innerHTML = '';
            questions.forEach(function (q, i) {
                var chip = document.createElement('button');
                chip.className = 'cortex-suggestion-chip';
                chip.textContent = q;
                suggestionsEl.appendChild(chip);

                animTimers.push(setTimeout(function () {
                    chip.classList.add('visible');
                }, 150 * (i + 1)));
            });
        }

        function renderRole(idx) {
            clearTimers();
            activeRoleIndex = idx;
            conversationStep = 0;
            messagesEl.innerHTML = '';
            suggestionsEl.innerHTML = '';

            // Update active button
            rolesEl.querySelectorAll('.cortex-role').forEach(function (btn, i) {
                btn.classList.toggle('active', i === idx);
            });

            var role = ROLES[idx];
            var firstConv = role.conversations[0];

            // Show user message immediately
            addUserMessage(firstConv.question);

            // Show typing indicator
            var typingEl = null;
            animTimers.push(setTimeout(function () {
                typingEl = addTypingIndicator();
            }, 500));

            // Show IW response
            animTimers.push(setTimeout(function () {
                removeTypingIndicator(typingEl);
                addIWMessage(firstConv.answer, firstConv.trace);
            }, 1400));

            // Show follow-up suggestions
            animTimers.push(setTimeout(function () {
                var followUps = role.conversations.slice(1).map(function (c) {
                    return c.question;
                });
                if (followUps.length > 0) {
                    showSuggestions(followUps);
                }
            }, 1900));
        }

        function handleFollowUp(questionText) {
            conversationStep++;
            suggestionsEl.innerHTML = '';

            var role = ROLES[activeRoleIndex];
            if (conversationStep >= role.conversations.length) return;

            var conv = role.conversations[conversationStep];

            // Add user message
            addUserMessage(conv.question);
            scrollToBottom();

            // Typing indicator
            var typingEl = null;
            animTimers.push(setTimeout(function () {
                typingEl = addTypingIndicator();
            }, 400));

            // IW response
            animTimers.push(setTimeout(function () {
                removeTypingIndicator(typingEl);
                addIWMessage(conv.answer, conv.trace);
            }, 1200));

            // Show remaining follow-ups
            animTimers.push(setTimeout(function () {
                var remaining = role.conversations.slice(conversationStep + 1).map(function (c) {
                    return c.question;
                });
                if (remaining.length > 0) {
                    showSuggestions(remaining);
                }
            }, 1700));
        }

        // Click handlers
        rolesEl.addEventListener('click', function (e) {
            var btn = e.target.closest('.cortex-role');
            if (!btn) return;
            var idx = parseInt(btn.getAttribute('data-role'), 10);
            renderRole(idx);
        });

        suggestionsEl.addEventListener('click', function (e) {
            var chip = e.target.closest('.cortex-suggestion-chip');
            if (!chip) return;
            handleFollowUp(chip.textContent);
        });

        // Initial render
        renderRole(0);
    })();

})();
