// ========================================
// URC INTRO — SCROLL REVEAL + STAT COUNTER
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Scroll reveal con IntersectionObserver
    var revealEls = document.querySelectorAll('.intro-reveal');

    if (revealEls.length > 0) {
        if ('IntersectionObserver' in window) {
            var revealObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });
            revealEls.forEach(function(el) { revealObserver.observe(el); });
        } else {
            revealEls.forEach(function(el) { el.classList.add('is-visible'); });
        }
    }

    // Contador animado para las estadísticas
    var statNumbers = document.querySelectorAll('.stat-number');
    var countersStarted = false;

    function runCounters() {
        if (countersStarted) return;
        countersStarted = true;
        statNumbers.forEach(function(el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            var duration = 1500;
            var startTime = null;
            function step(ts) {
                if (!startTime) startTime = ts;
                var progress = Math.min((ts - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
                el.textContent = Math.floor(eased * target);
                if (progress < 1) { requestAnimationFrame(step); }
                else { el.textContent = target; }
            }
            requestAnimationFrame(step);
        });
    }

    var statsRow = document.querySelector('.intro-stats');
    if (statsRow) {
        if ('IntersectionObserver' in window) {
            var statsObs = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) { runCounters(); statsObs.disconnect(); }
            }, { threshold: 0.3 });
            statsObs.observe(statsRow);
        } else {
            runCounters();
        }
    }
});

// ========================================
// OBJETIVOS URC — TABS CON AUTO-AVANCE
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    var objTabs   = Array.from(document.querySelectorAll('.obj-tab'));
    var objPanels = Array.from(document.querySelectorAll('.obj-panel-content'));

    if (!objTabs.length || !objPanels.length) return;

    var objCurrent     = 0;
    var objAutoTimer   = null;
    var OBJ_DURATION   = 5000;

    // Scroll reveal para .obj-reveal
    var objRevEls = document.querySelectorAll('.obj-reveal');
    if (objRevEls.length > 0) {
        if ('IntersectionObserver' in window) {
            var objRevObs = new IntersectionObserver(function(entries) {
                entries.forEach(function(e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        objRevObs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });
            objRevEls.forEach(function(el) { objRevObs.observe(el); });
        } else {
            objRevEls.forEach(function(el) { el.classList.add('is-visible'); });
        }
    }

    function objGo(newIdx) {
        if (newIdx === objCurrent) return;
        var prev = objCurrent;

        // Salida del panel anterior
        objPanels[prev].classList.add('leaving');
        objPanels[prev].classList.remove('active');
        setTimeout(function() { objPanels[prev].classList.remove('leaving'); }, 250);

        objTabs[prev].classList.remove('active');

        // Activar nuevo
        objCurrent = newIdx;
        objPanels[newIdx].classList.add('active');
        objTabs[newIdx].classList.add('active');

        // Reiniciar barra de progreso
        var pg = objTabs[newIdx].querySelector('.tab-progress');
        if (pg) { pg.style.animation = 'none'; void pg.offsetWidth; pg.style.animation = ''; }
    }

    function objNext() { objGo((objCurrent + 1) % objTabs.length); }

    function objStartAuto() {
        objStopAuto();
        objAutoTimer = setInterval(objNext, OBJ_DURATION);
    }
    function objStopAuto() {
        if (objAutoTimer) { clearInterval(objAutoTimer); objAutoTimer = null; }
    }

    // Clicks en tabs
    objTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            objStopAuto();
            objGo(parseInt(tab.getAttribute('data-index'), 10));
            objStartAuto();
        });
    });

    // Pausar en hover del layout
    var objLayout = document.querySelector('.obj-layout');
    if (objLayout) {
        objLayout.addEventListener('mouseenter', objStopAuto);
        objLayout.addEventListener('mouseleave', objStartAuto);
    }

    // Swipe táctil en el panel
    var objPanel = document.querySelector('.obj-panel');
    var objTouchX = 0;
    if (objPanel) {
        objPanel.addEventListener('touchstart', function(e) { objTouchX = e.changedTouches[0].screenX; });
        objPanel.addEventListener('touchend', function(e) {
            var diff = objTouchX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                objStopAuto();
                objGo(diff > 0 ? (objCurrent + 1) % objTabs.length : (objCurrent - 1 + objTabs.length) % objTabs.length);
                objStartAuto();
            }
        });
    }

    // Arrancar progreso inicial y auto-avance
    var initPg = objTabs[0] && objTabs[0].querySelector('.tab-progress');
    if (initPg) { initPg.style.animation = 'none'; void initPg.offsetWidth; initPg.style.animation = ''; }
    objStartAuto();
});

// ========================================
// V-CAROUSEL DE UBICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const vTrack = document.querySelector('.v-carousel-track');
    const vCards = Array.from(document.querySelectorAll('.v-card'));
    const vPrevBtn = document.querySelector('.v-carousel-prev');
    const vNextBtn = document.querySelector('.v-carousel-next');
    const vDots = Array.from(document.querySelectorAll('.v-dot'));
    const vWrapper = document.querySelector('.v-carousel-wrapper');

    if (!vTrack || vCards.length === 0 || !vWrapper) return;

    let vCurrentSlide = 0;
    const vTotalSlides = vCards.length;
    const anglePerSlide = 360 / vTotalSlides;
    const radius = 500;

    function updateVCarousel(index) {
        vDots.forEach(dot => dot.classList.remove('active'));
        if (vDots[index]) vDots[index].classList.add('active');

        vCards.forEach((card, i) => {
            let offset = (i - index + vTotalSlides) % vTotalSlides;
            if (offset > vTotalSlides / 2) offset -= vTotalSlides;

            const angle = (offset * anglePerSlide) * (Math.PI / 180);
            const x = Math.sin(angle) * radius;
            const z = (Math.cos(angle) - 1) * radius;
            const normalizedPos = Math.abs(offset / 2);
            const y = normalizedPos * 80;

            let opacity = 1;
            if (Math.abs(offset) > 2) opacity = 0;
            else if (Math.abs(offset) === 2) opacity = 0.5;

            const zIndex = 10 - Math.abs(offset);
            card.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;
        });

        vCurrentSlide = index;
    }

    function vNextSlide() { updateVCarousel((vCurrentSlide + 1) % vTotalSlides); }
    function vPrevSlide() { updateVCarousel((vCurrentSlide - 1 + vTotalSlides) % vTotalSlides); }

    let vAutoplayInterval = null;
    function startVAutoplay() {
        if (vAutoplayInterval) clearInterval(vAutoplayInterval);
        vAutoplayInterval = setInterval(vNextSlide, 4000);
    }
    function stopVAutoplay() {
        if (vAutoplayInterval) { clearInterval(vAutoplayInterval); vAutoplayInterval = null; }
    }

    if (vNextBtn) vNextBtn.addEventListener('click', () => { stopVAutoplay(); vNextSlide(); startVAutoplay(); });
    if (vPrevBtn) vPrevBtn.addEventListener('click', () => { stopVAutoplay(); vPrevSlide(); startVAutoplay(); });

    vDots.forEach((dot, index) => {
        dot.addEventListener('click', () => { stopVAutoplay(); updateVCarousel(index); startVAutoplay(); });
    });

    updateVCarousel(0);
    startVAutoplay();

    const vCarouselContainer = document.querySelector('.v-carousel-container');
    if (vCarouselContainer) {
        vCarouselContainer.addEventListener('mouseenter', stopVAutoplay);
        vCarouselContainer.addEventListener('mouseleave', () => { stopVAutoplay(); startVAutoplay(); });
    }

    document.addEventListener('keydown', (e) => {
        const rect = vCarouselContainer.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) {
            if (e.key === 'ArrowLeft')  { stopVAutoplay(); vPrevSlide(); startVAutoplay(); }
            if (e.key === 'ArrowRight') { stopVAutoplay(); vNextSlide(); startVAutoplay(); }
        }
    });

    let vTouchStartX = 0;
    if (vCarouselContainer) {
        vCarouselContainer.addEventListener('touchstart', (e) => { vTouchStartX = e.changedTouches[0].screenX; });
        vCarouselContainer.addEventListener('touchend', (e) => {
            const diff = vTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                stopVAutoplay();
                if (diff > 0) vNextSlide(); else vPrevSlide();
                startVAutoplay();
            }
        });
    }

    window.addEventListener('resize', () => updateVCarousel(vCurrentSlide));

    document.querySelectorAll('.v-favorite-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const svg = this.querySelector('svg');
            if (svg.getAttribute('fill') === 'currentColor') {
                svg.setAttribute('fill', 'none');
                this.style.background = 'rgba(255, 255, 255, 0.95)';
            } else {
                svg.setAttribute('fill', 'currentColor');
                this.style.background = '#FFC857';
            }
        });
    });
});

// ========================================
// FECHAS IMPORTANTES — TIMELINE
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    const track   = document.querySelector('.tl-track');
    const tlItems = document.querySelectorAll('.tl-item.tl-reveal');
    const tlHead  = document.querySelector('.tl-header.tl-reveal');

    if (!track) return;

    // Spine fill animates when track enters viewport
    const spineObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                track.classList.add('spine-active');
                spineObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    spineObs.observe(track);

    // Header reveal
    if (tlHead) {
        const headObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); headObs.unobserve(e.target); }
            });
        }, { threshold: 0.3 });
        headObs.observe(tlHead);
    }

    // Items reveal — stagger within each observer batch
    if (tlItems.length) {
        const itemObs = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('is-visible'), i * 65);
                    itemObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
        tlItems.forEach(el => itemObs.observe(el));
    }
});

// ========================================
// TEMPORIZADOR CUENTA REGRESIVA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Fecha objetivo: 27 de Mayo de 2026
    const targetDate = new Date('May 27, 2026 00:00:00').getTime();

    // Elementos del DOM
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // Verificar que los elementos existan
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        return;
    }

    // Función para agregar cero a la izquierda
    function padZero(num, size) {
        size = size || 2;
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    // Flip animation: valor actual sale hacia arriba, nuevo entra desde abajo
    function animateValue(element, newValue) {
        if (element.textContent === newValue) return;
        element.classList.remove('flip-in', 'flip-out');
        void element.offsetWidth; // forzar reflow para reiniciar la animación
        element.classList.add('flip-out');
        setTimeout(function() {
            element.textContent = newValue;
            element.classList.remove('flip-out');
            element.classList.add('flip-in');
            setTimeout(function() {
                element.classList.remove('flip-in');
            }, 300);
        }, 190);
    }

    // Función para actualizar el contador
    function updateCountdown() {
        var now = new Date().getTime();
        var distance = targetDate - now;

        // Si la fecha ya pasó
        if (distance < 0) {
            animateValue(daysElement, '000');
            animateValue(hoursElement, '00');
            animateValue(minutesElement, '00');
            animateValue(secondsElement, '00');
            return;
        }

        // Cálculos de tiempo
        var days    = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        animateValue(daysElement,    padZero(days, 3));
        animateValue(hoursElement,   padZero(hours));
        animateValue(minutesElement, padZero(minutes));
        animateValue(secondsElement, padZero(seconds));
    }

    // Primer render sin animación (valores instantáneos)
    var now0 = new Date().getTime();
    var d0   = targetDate - now0;
    if (d0 > 0) {
        daysElement.textContent    = padZero(Math.floor(d0 / (1000 * 60 * 60 * 24)), 3);
        hoursElement.textContent   = padZero(Math.floor((d0 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        minutesElement.textContent = padZero(Math.floor((d0 % (1000 * 60 * 60)) / (1000 * 60)));
        secondsElement.textContent = padZero(Math.floor((d0 % (1000 * 60)) / 1000));
    }

    // Actualizar cada segundo con flip animation
    setInterval(updateCountdown, 1000);
});

// ========================================
// CARRUSEL DE MISIONES
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const msTrack = document.getElementById('msTrack');
    if (!msTrack) return;

    const msDots = document.querySelectorAll('.ms-dot');
    const msProgBar = document.getElementById('msProgBar');
    const msPrev = document.querySelector('.ms-prev');
    const msNext = document.querySelector('.ms-next');
    const msTotal = 5;

    let msCurrent = 0;
    let msTimer;

    function msGo(idx) {
        msCurrent = ((idx % msTotal) + msTotal) % msTotal;
        msTrack.style.transform = `translateX(${msCurrent * -100}%)`;
        msDots.forEach((d, i) => d.classList.toggle('ms-dot-active', i === msCurrent));
        if (msProgBar) msProgBar.style.width = `${((msCurrent + 1) / msTotal) * 100}%`;
    }

    function msAutoStart() { msTimer = setInterval(() => msGo(msCurrent + 1), 7000); }
    function msAutoStop()  { clearInterval(msTimer); }

    if (msPrev) msPrev.addEventListener('click', () => { msAutoStop(); msGo(msCurrent - 1); msAutoStart(); });
    if (msNext) msNext.addEventListener('click', () => { msAutoStop(); msGo(msCurrent + 1); msAutoStart(); });

    msDots.forEach((dot, i) => {
        dot.addEventListener('click', () => { msAutoStop(); msGo(i); msAutoStart(); });
    });

    // Swipe
    const msViewport = document.querySelector('.ms-viewport');
    if (msViewport) {
        let msSwipeX = 0;
        msViewport.addEventListener('touchstart', e => { msSwipeX = e.touches[0].clientX; }, { passive: true });
        msViewport.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - msSwipeX;
            if (Math.abs(dx) > 45) { msAutoStop(); msGo(msCurrent + (dx < 0 ? 1 : -1)); msAutoStart(); }
        }, { passive: true });
    }

    // Pause on hover
    const msWrap = document.querySelector('.ms-carousel-wrap');
    if (msWrap) {
        msWrap.addEventListener('mouseenter', msAutoStop);
        msWrap.addEventListener('mouseleave', msAutoStart);
    }

    // Header reveal
    const msHeader = document.querySelector('.ms-header.ms-reveal');
    if (msHeader) {
        new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('ms-visible'); });
        }, { threshold: 0.25 }).observe(msHeader);
    }

    msGo(0);
    msAutoStart();
});
