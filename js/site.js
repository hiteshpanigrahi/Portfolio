document.addEventListener('DOMContentLoaded', () => {

            // ================= 0. LANDING PAGE DEFAULT ON LOAD =================
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            window.scrollTo(0, 0);

            // ================= 1. LAYOUT MODE =================
            const COMPACT_MQ = '(max-width: 1024px) and (orientation: portrait), (max-width: 700px), (max-width: 1024px) and (max-height: 520px)';
            const SLIDER_V_MQ = '(max-width: 1024px), (hover: none) and (pointer: coarse)';
            const compactMQL = window.matchMedia(COMPACT_MQ);
            let isCompact = compactMQL.matches;
            let lenis = null;
            const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
            const pad2 = (n) => String(n).padStart(2, '0');

            // ================= 2. CYBERPUNK SCRAMBLE TEXT ENGINE =================
            const matrixGlyphs = '0123456789ABCDEF_//<>[]#*+~=-';
            function scrambleElement(el, originalText, duration = 0.6) {
                if (el.dataset.scrambling === 'true') return;
                el.dataset.scrambling = 'true';
                const totalFrames = Math.round(duration * 60);
                let currentFrame = 0;

                const timer = setInterval(() => {
                    currentFrame++;
                    const progress = currentFrame / totalFrames;
                    const resolvedChars = Math.floor(progress * originalText.length);

                    let result = '';
                    for (let i = 0; i < originalText.length; i++) {
                        const targetChar = originalText[i];
                        if (targetChar === ' ' || targetChar === '\n' || targetChar === '\t') {
                            result += targetChar;
                        } else if (i < resolvedChars) {
                            result += targetChar;
                        } else {
                            result += matrixGlyphs[Math.floor(Math.random() * matrixGlyphs.length)];
                        }
                    }

                    if (el.querySelector('br')) {
                        el.innerText = result;
                    } else {
                        el.textContent = result;
                    }

                    if (currentFrame >= totalFrames) {
                        clearInterval(timer);
                        el.innerText = originalText;
                        el.dataset.scrambling = 'false';
                    }
                }, 1000 / 60);
            }

            document.querySelectorAll('[data-scramble]').forEach((el) => {
                const targetText = el.getAttribute('data-scramble');
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 92%',
                    end: 'bottom 8%',
                    onEnter: () => scrambleElement(el, targetText, 0.75),
                    onEnterBack: () => scrambleElement(el, targetText, 0.55)
                });
            });

            // ================= 3. MOBILE MENU =================
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileNavOverlay = document.getElementById('mobileNavOverlay');
            const mobileNavClose = document.getElementById('mobileNavClose');
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

            function setMenu(open) {
                if (!mobileNavOverlay || !mobileMenuBtn) return;
                mobileNavOverlay.classList.toggle('is-active', open);
                mobileNavOverlay.setAttribute('aria-hidden', String(!open));
                mobileMenuBtn.setAttribute('aria-expanded', String(open));
                if (lenis) { open ? lenis.stop() : lenis.start(); }
            }

            if (mobileMenuBtn && mobileNavOverlay) {
                mobileMenuBtn.addEventListener('click', () => setMenu(!mobileNavOverlay.classList.contains('is-active')));
                if (mobileNavClose) mobileNavClose.addEventListener('click', () => setMenu(false));
                mobileNavLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
                document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
            }

            // ================= 4. PRELOADER & TEXT REVEAL =================
            const preloader = document.getElementById('sitePreloader');
            const loaderCounterNumber = document.getElementById('loaderCounterNumber');
            const heroGlyphs = document.querySelectorAll('.hero-char-glyph');
            const heroDot = document.getElementById('heroDot');

            let isRevealed = false;
            const loaderDuration = 3.2;

            function triggerReveal() {
                if (isRevealed) return;
                isRevealed = true;
                if (loaderCounterNumber) loaderCounterNumber.innerText = '100';

                window.scrollTo(0, 0);

                setTimeout(() => {
                    if (preloader) preloader.classList.add('is-hidden');

                    heroGlyphs.forEach((glyph) => {
                        const baseDelay = parseFloat(glyph.getAttribute('data-base-delay')) || 0;
                        glyph.style.transitionDelay = `${baseDelay.toFixed(2)}s`;
                        glyph.style.opacity = '1';
                        glyph.style.transform = 'translateY(0%) scale(1)';
                    });

                    if (heroDot) {
                        const dotDelay = parseFloat(heroDot.getAttribute('data-base-delay')) || 0;
                        heroDot.style.transitionDelay = `${dotDelay.toFixed(2)}s`;
                        heroDot.style.opacity = '1';
                        heroDot.style.transform = 'translateY(-5%) scale(1)';
                    }

                    setTimeout(() => {
                        document.body.classList.add('is-loaded', 'is-scrubbing');
                    }, 1200);
                }, 180);
            }

            let currentCount = 1;
            const stepInterval = 30;
            const totalSteps = (loaderDuration * 1000) / stepInterval;
            const increment = 100 / totalSteps;

            const counterTimer = setInterval(() => {
                currentCount += increment * (0.8 + Math.random() * 0.4);
                if (currentCount >= 100) {
                    currentCount = 100;
                    clearInterval(counterTimer);
                    triggerReveal();
                }
                if (loaderCounterNumber) loaderCounterNumber.innerText = String(Math.min(Math.round(currentCount), 100)).padStart(2, '0');
            }, stepInterval);

            setTimeout(triggerReveal, (loaderDuration + 0.6) * 1000);

            // ================= 5. LENIS + GSAP SYNC =================
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.config({ ignoreMobileResize: true });

            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                smoothWheel: true
            });

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);

            window.scrollTo(0, 0);

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const hash = this.getAttribute('href');
                    if (hash === '#home') { lenis.scrollTo(0); return; }
                    const target = document.querySelector(hash);
                    if (target) { lenis.scrollTo(target, { offset: -16 }); }
                });
            });

            // ================= 6. CANVAS & TEXT FADE ENGINE =================
            const canvas = document.getElementById('sequenceCanvas');
            const ctx = canvas.getContext('2d');
            const canvasStage = document.getElementById('canvasStage');
            const bgStage = document.getElementById('backgroundTypographyStage');
            const aboutSection = document.getElementById('about');
            const heroStage = document.getElementById('heroStage');
            const heroSticky = document.getElementById('heroSticky');

            const frameCount = 224;
            const images = new Array(frameCount);
            let lastRenderedIndex = 1;
            let lastDrawn = -1;
            canvas.width = 1920; canvas.height = 1080;

            const framePath = (dir, i) => `${dir}/frame_${String(i).padStart(4, '0')}.webp`;
            function loadFrame(i) {
                if (images[i - 1]) return;
                const img = new Image();
                img.decoding = 'async';
                img.onload = () => { if (i === 1) renderFrame(1, true); };
                img.onerror = () => { if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = framePath('frames', i); } };
                img.src = framePath('frames_nobg', i);
                images[i - 1] = img;
            }
            const stride = isCompact ? 2 : 1;
            for (let i = 1; i <= frameCount; i += stride) loadFrame(i);
            loadFrame(frameCount);

            const usable = (img) => img && img.complete && img.naturalWidth > 0;

            function renderFrame(index, force) {
                const clamped = Math.min(Math.max(Math.floor(index), 1), frameCount);
                let pick = clamped;
                if (!usable(images[pick - 1])) {
                    pick = 0;
                    for (let d = 1; d <= 4 && !pick; d++) {
                        if (clamped - d >= 1 && usable(images[clamped - d - 1])) pick = clamped - d;
                        else if (clamped + d <= frameCount && usable(images[clamped + d - 1])) pick = clamped + d;
                    }
                    if (!pick) pick = lastRenderedIndex;
                }
                const targetImg = images[pick - 1];
                if (!usable(targetImg) || (pick === lastDrawn && !force)) return;
                lastDrawn = pick;
                lastRenderedIndex = pick;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const scale = Math.min(canvas.width / targetImg.naturalWidth, canvas.height / targetImg.naturalHeight);
                ctx.drawImage(targetImg, (canvas.width - targetImg.naturalWidth * scale) / 2, Math.max(0, canvas.height - targetImg.naturalHeight * scale), targetImg.naturalWidth * scale, targetImg.naturalHeight * scale);
            }

            function onScroll() {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

                const totalScrubDistance = isCompact
                    ? Math.max(1, aboutSection.offsetTop - window.innerHeight * 0.55)
                    : (aboutSection.offsetTop + aboutSection.offsetHeight) * 0.75;
                const rawProgress = Math.min(Math.max(scrollY / totalScrubDistance, 0), 1);
                const progress = Math.pow(rawProgress, 1.25);
                renderFrame(1 + progress * (frameCount - 1));

                if (document.body.classList.contains('is-loaded')) {
                    const exitStart = isCompact ? Math.max(0, heroStage.offsetHeight - heroSticky.offsetHeight) * 0.75 : 0;
                    const heroScrollProgress = clamp01((scrollY - exitStart) / (window.innerHeight * 0.55));

                    heroGlyphs.forEach((glyph) => {
                        const baseDelay = parseFloat(glyph.getAttribute('data-base-delay')) || 0;
                        const letterProgress = Math.min(Math.max((heroScrollProgress - baseDelay * 0.3) * 1.6, 0), 1);

                        const moveY = -(letterProgress * 118);
                        const letterOpacity = Math.max(0, 1 - letterProgress * 1.6);

                        glyph.style.transform = `translateY(${moveY.toFixed(2)}%) scale(${Math.max(0.85, 1 - letterProgress * 0.08).toFixed(3)})`;
                        glyph.style.opacity = letterOpacity.toFixed(2);
                    });

                    if (heroDot) {
                        const dotDelay = parseFloat(heroDot.getAttribute('data-base-delay')) || 0;
                        const dotProgress = Math.min(Math.max((heroScrollProgress - dotDelay * 0.3) * 1.6, 0), 1);
                        heroDot.style.transform = `translateY(${-(dotProgress * 118 - 5).toFixed(2)}%) scale(${Math.max(0.85, 1 - dotProgress * 0.08).toFixed(3)})`;
                        heroDot.style.opacity = Math.max(0, 1 - dotProgress * 1.6).toFixed(2);
                    }
                }

                const pinWrapper = document.getElementById('projectsPinContainer');
                if (pinWrapper) {
                    const pinRect = pinWrapper.getBoundingClientRect();
                    if (pinRect.top <= window.innerHeight) {
                        const fadeProgress = (window.innerHeight - pinRect.top) / (window.innerHeight * 0.5);
                        canvasStage.style.opacity = Math.max(0, 1 - fadeProgress).toFixed(2);
                        if (bgStage) bgStage.style.opacity = Math.max(0, 1 - fadeProgress).toFixed(2);
                    } else {
                        canvasStage.style.opacity = '1';
                        if (bgStage) bgStage.style.opacity = '1';
                    }
                }
            }
            window.addEventListener('scroll', onScroll, { passive: true });

            // ================= 7. FOCUS-STACK CAROUSEL & TRAILING EXIT BUFFER =================
            const horizontalTrack = document.getElementById('horizontalTrack');
            const projectsPinContainer = document.getElementById('projectsPinContainer');
            const projectsIntroPanel = document.getElementById('projectsIntroPanel');
            const cards = Array.from(document.querySelectorAll('.horizontal-project-card'));
            const projectsHud = document.getElementById('projectsHud');
            const projectsCounter = document.getElementById('projectsCounter');
            const projectsProgress = document.getElementById('projectsProgress');

            const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

            function buildProjects(vertical, compact) {
                if (!horizontalTrack || !projectsPinContainer || !cards.length) return null;
                const n = cards.length;
                const dur = 0.7;
                const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
                let lastIdx = -1;
                const fadeFrom = vertical ? 1.35 : 1.9, fadeTo = vertical ? 1.85 : 2.4;

                let M = measure();
                function measure() {
                    const sample = cards[0];
                    const w = sample.offsetWidth || (window.innerWidth * (vertical ? 0.84 : 0.58));
                    const h = sample.offsetHeight || (w * 1086 / 1448);
                    const vh = window.innerHeight;
                    const intro = vh * 0.9;
                    const step = vh * (vertical ? 0.5 : 0.6);
                    const exitBuffer = vh * (vertical ? 0.75 : 0.85);
                    return {
                        S: (vertical ? h : w) * 0.95,
                        intro, step, exitBuffer,
                        cardsEnd: intro + step * (n - 1),
                        total: Math.round(intro + step * (n - 1) + exitBuffer)
                    };
                }

                function layout(p) {
                    for (let i = 0; i < n; i++) {
                        const c = cards[i];
                        const u = i - p;
                        const a = Math.abs(u);

                        if (a > fadeTo) {
                            c.style.visibility = 'hidden';
                            continue;
                        }

                        const scale = 1 - 0.36 * Math.min(a, 1);
                        const along = u * M.S;

                        const hazeAmount = clamp01(a * 0.65);
                        c.style.setProperty('--card-haze', hazeAmount.toFixed(3));

                        c.style.visibility = 'visible';
                        c.style.opacity = (1 - sstep(fadeFrom, fadeTo, a)).toFixed(3);
                        c.style.zIndex = String(100 - Math.round(a * 20));

                        c.style.transform = `translate3d(${(vertical ? 0 : along).toFixed(2)}px, ${(vertical ? along : 0).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
                    }
                }

                function render(local) {
                    const introT = clamp01(local / M.intro);
                    projectsIntroPanel.style.opacity = (1 - sstep(0.15, 1, introT)).toFixed(3);
                    projectsIntroPanel.style.transform = `scale(${(1 - 0.15 * introT).toFixed(4)})`;

                    const p = Math.min(Math.max((local - M.intro) / M.step, 0), n - 1);
                    layout(p);

                    if (local > M.cardsEnd) {
                        const exitProg = clamp01((local - M.cardsEnd) / M.exitBuffer);
                        const exitFade = (1 - sstep(0.08, 0.95, exitProg)).toFixed(3);
                        const exitScale = (1 - 0.08 * exitProg).toFixed(4);

                        horizontalTrack.style.opacity = exitFade;
                        horizontalTrack.style.transform = `scale(${exitScale})`;
                        if (projectsHud) projectsHud.style.opacity = exitFade;
                    } else {
                        horizontalTrack.style.opacity = sstep(0.20, 0.85, introT).toFixed(3);
                        horizontalTrack.style.transform = 'scale(1)';
                    }

                    const idx = Math.round(p);
                    if (idx !== lastIdx) { lastIdx = idx; }

                    if (projectsHud && local <= M.cardsEnd) {
                        if (projectsCounter) projectsCounter.textContent = `${pad2(idx + 1)} / ${pad2(n)}`;
                        if (projectsProgress) {
                            projectsProgress.style.transform = vertical ? `scaleY(${(p / (n - 1)).toFixed(4)})` : `scaleX(${(p / (n - 1)).toFixed(4)})`;
                        }
                        projectsHud.style.opacity = sstep(0.7, 1, introT).toFixed(2);
                    }
                }

                gsap.to(projectsPinContainer, {
                    borderRadius: "0px 0px 0px 0px",
                    ease: "none",
                    scrollTrigger: { trigger: projectsPinContainer, start: compact ? "top 40%" : "top 30%", end: "top top", scrub: true }
                });

                const st = ScrollTrigger.create({
                    trigger: projectsPinContainer,
                    start: "top top",
                    end: () => { M = measure(); return `+=${M.total}`; },
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => render(self.scroll() - self.start),
                    onRefresh: (self) => render(self.scroll() - self.start),
                    onLeave: () => render(M.total),
                    onLeaveBack: () => render(0)
                });

                let wheelTimer = null, wheelDir = 1, lastWheelAt = 0;
                let snapTimer = null, touching = false, lastY = window.pageYOffset || 0, userDir = 1;
                function doSnap(fromWheel) {
                    if (!st.isActive || touching || !lenis) return;
                    const y = fromWheel === true ? lenis.targetScroll : lenis.scroll;
                    const local = y - st.start;
                    if (local <= 0 || local >= M.total - 1) return;

                    if (local > M.cardsEnd + M.exitBuffer * 0.45) return;

                    const raw = (local - M.intro) / M.step;
                    const dir = fromWheel === true ? wheelDir : userDir;
                    let target;
                    if (raw < 0) {
                        if (dir < 0 || local < M.intro * 0.5) return;
                        target = 0;
                    } else {
                        target = dir > 0 ? Math.ceil(raw - 0.12) : Math.floor(raw + 0.12);
                    }
                    target = Math.min(Math.max(target, 0), n - 1);
                    const to = st.start + M.intro + target * M.step;
                    if (Math.abs(to - y) < 2) return;
                    lenis.scrollTo(to, { duration: dur, easing: ease });
                }
                const scheduleSnap = () => { clearTimeout(snapTimer); snapTimer = setTimeout(doSnap, 170); };
                const offLenis = lenis ? lenis.on('scroll', (l) => {
                    const y = l.scroll;
                    if (y !== lastY) { userDir = y > lastY ? 1 : -1; lastY = y; }
                    if (st.isActive && performance.now() - lastWheelAt > 250) scheduleSnap();
                }) : null;
                const onWheel = (e) => {
                    if (!st.isActive) return;
                    wheelDir = e.deltaY > 0 ? 1 : -1; lastWheelAt = performance.now();
                    clearTimeout(snapTimer); clearTimeout(wheelTimer);
                    wheelTimer = setTimeout(() => doSnap(true), 110);
                };
                window.addEventListener('wheel', onWheel, { passive: true });
                const onTouchStart = () => { touching = true; clearTimeout(snapTimer); };
                const onTouchEnd = () => { touching = false; scheduleSnap(); };
                window.addEventListener('touchstart', onTouchStart, { passive: true });
                window.addEventListener('touchend', onTouchEnd, { passive: true });
                window.addEventListener('touchcancel', onTouchEnd, { passive: true });

                layout(0);
                render(0);

                return () => {
                    clearTimeout(snapTimer); clearTimeout(wheelTimer);
                    window.removeEventListener('wheel', onWheel);
                    if (typeof offLenis === 'function') offLenis();
                    window.removeEventListener('touchstart', onTouchStart);
                    window.removeEventListener('touchend', onTouchEnd);
                    window.removeEventListener('touchcancel', onTouchEnd);
                    cards.forEach(c => {
                        c.style.transform = '';
                        c.style.opacity = '';
                        c.style.zIndex = '';
                        c.style.visibility = '';
                        c.style.removeProperty('--card-haze');
                    });
                    horizontalTrack.style.opacity = '';
                    horizontalTrack.style.transform = '';
                    projectsIntroPanel.style.opacity = ''; projectsIntroPanel.style.transform = '';
                    if (projectsHud) projectsHud.style.opacity = '';
                    if (projectsProgress) projectsProgress.style.transform = '';
                };
            }

            const mm = gsap.matchMedia();
            mm.add({ compact: COMPACT_MQ, vertical: SLIDER_V_MQ, all: '(min-width: 0px)' }, (ctxMM) => {
                const compact = !!ctxMM.conditions.compact;
                const vertical = !!ctxMM.conditions.vertical;
                isCompact = compact;

                const cleanupProjects = buildProjects(vertical, compact);

                if (compact && heroStage && heroSticky) {
                    gsap.to(heroSticky, {
                        opacity: 0, ease: "none",
                        scrollTrigger: { trigger: heroStage, start: "bottom 100%", end: "bottom 91%", scrub: true }
                    });
                }

                onScroll();
                return () => { if (cleanupProjects) cleanupProjects(); };
            });

            compactMQL.addEventListener('change', (e) => {
                isCompact = e.matches;
                if (!e.matches) {
                    for (let i = 1; i <= frameCount; i++) loadFrame(i);
                    setMenu(false);
                }
                onScroll();
            });

            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    ScrollTrigger.refresh();
                });
            }

            const pinWrapper = document.getElementById('projectsPinContainer');
            if (pinWrapper) {
                new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        pinWrapper.classList.toggle('is-revealed', e.isIntersecting);
                        if (e.isIntersecting) {
                            // Trigger intro letter pop animation for PROJECTS title
                            document.querySelectorAll('#projectsGiantText .proj-pop-glyph').forEach((glyph, idx) => {
                                glyph.style.transitionDelay = `${idx * 0.05}s`;
                                glyph.style.opacity = '1';
                                glyph.style.transform = 'translateY(0%) scale(1)';
                            });
                            const arrow = document.querySelector('#projectsGiantText .projects-arrow-up-right');
                            if (arrow) {
                                arrow.style.transitionDelay = '0.42s';
                                arrow.style.opacity = '1';
                                arrow.style.transform = 'translateY(0%) scale(1)';
                            }
                        }
                    });
                }, { threshold: 0.15 }).observe(pinWrapper);
            }

            const submergedStage = document.getElementById('submergedStage');
            if (submergedStage) {
                new IntersectionObserver((entries) => {
                    entries.forEach(e => submergedStage.classList.toggle('is-revealed', e.isIntersecting));
                }, { threshold: 0.15 }).observe(submergedStage);
            }
        });
