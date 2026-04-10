// ========================================
// CARRUSEL DE OBJETIVOS URC
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del carrusel
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicators = Array.from(document.querySelectorAll('.indicator'));
    const wrapper = document.querySelector('.carousel-wrapper');

    // Verificar que existan los elementos
    if (!track || slides.length === 0 || !wrapper) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Función para obtener el ancho del slide
    function getSlideWidth() {
        return wrapper.offsetWidth;
    }

    // Función para actualizar el carrusel
    function updateCarousel(index) {
        // Remover clase active de todos los indicadores
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // Añadir clase active al indicador actual
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }

        // Mover el track con el ancho actualizado
        const slideWidth = getSlideWidth();
        track.style.transform = `translateX(-${index * slideWidth}px)`;

        currentSlide = index;
    }

    // Función para ir al siguiente slide
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        updateCarousel(next);
    }

    // Función para ir al slide anterior
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel(prev);
    }

    // Auto-play del carrusel
    let autoplayInterval = null;

    function startAutoplay() {
        // Limpiar cualquier intervalo existente antes de crear uno nuevo
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
        autoplayInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    // Event listeners para los botones
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
    }

    // Event listeners para los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoplay();
            updateCarousel(index);
            startAutoplay();
        });
    });

    // Inicializar el carrusel en la posición 0
    updateCarousel(0);

    // Iniciar autoplay
    startAutoplay();

    // Pausar autoplay cuando el mouse está sobre el carrusel
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            stopAutoplay();
        });
        carouselContainer.addEventListener('mouseleave', () => {
            stopAutoplay();
            startAutoplay();
        });
    }

    // Soporte para navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        } else if (e.key === 'ArrowRight') {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        }
    });

    // Soporte para gestos táctiles (swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > swipeThreshold) {
            stopAutoplay();
            if (difference > 0) {
                // Swipe left - siguiente
                nextSlide();
            } else {
                // Swipe right - anterior
                prevSlide();
            }
            startAutoplay();
        }
    }

    // Ajustar el carrusel en resize
    window.addEventListener('resize', () => {
        updateCarousel(currentSlide);
    });
});

// ========================================
// V-CAROUSEL DE UBICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del V-carousel
    const vTrack = document.querySelector('.v-carousel-track');
    const vCards = Array.from(document.querySelectorAll('.v-card'));
    const vPrevBtn = document.querySelector('.v-carousel-prev');
    const vNextBtn = document.querySelector('.v-carousel-next');
    const vDots = Array.from(document.querySelectorAll('.v-dot'));
    const vWrapper = document.querySelector('.v-carousel-wrapper');

    // Verificar que existan los elementos
    if (!vTrack || vCards.length === 0 || !vWrapper) return;

    let vCurrentSlide = 0;
    const vTotalSlides = vCards.length;
    const anglePerSlide = 360 / vTotalSlides; // 72 grados para 5 tarjetas
    const radius = 500; // Radio del semicírculo

    // Función para actualizar el V-carousel
    function updateVCarousel(index) {
        // Remover clase active de todos los dots
        vDots.forEach(dot => dot.classList.remove('active'));

        // Añadir clase active al dot actual
        if (vDots[index]) {
            vDots[index].classList.add('active');
        }

        // Actualizar cada tarjeta
        vCards.forEach((card, i) => {
            // Calcular posición relativa a la tarjeta activa
            let offset = (i - index + vTotalSlides) % vTotalSlides;

            // Ajustar para tener valores centrados (-2, -1, 0, 1, 2 para 5 tarjetas)
            if (offset > vTotalSlides / 2) {
                offset -= vTotalSlides;
            }

            // Calcular ángulo en el semicírculo (solo frente: -90° a 90°)
            const angle = (offset * anglePerSlide) * (Math.PI / 180);

            // Posición X e Y para formar V (semicírculo frontal)
            const x = Math.sin(angle) * radius;
            const z = (Math.cos(angle) - 1) * radius; // -1 para empujar hacia atrás

            // Calcular Y para formar V (triangulo): centro abajo, extremos arriba
            const normalizedPos = Math.abs(offset / 2); // 0 al centro, 1 en extremos
            const y = normalizedPos * 80; // Elevación de los extremos

            // Opacidad: solo visible al frente (offset -2 a 2)
            let opacity = 1;
            if (Math.abs(offset) > 2) {
                opacity = 0; // Ocultar las que están atrás
            } else if (Math.abs(offset) === 2) {
                opacity = 0.5; // Semi-transparente en los extremos
            }

            // Z-index: centro al frente
            const zIndex = 10 - Math.abs(offset);

            // Aplicar transformación (tarjetas siempre mirando al frente)
            card.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;
        });

        vCurrentSlide = index;
    }

    // Función para ir al siguiente slide
    function vNextSlide() {
        const next = (vCurrentSlide + 1) % vTotalSlides;
        updateVCarousel(next);
    }

    // Función para ir al slide anterior
    function vPrevSlide() {
        const prev = (vCurrentSlide - 1 + vTotalSlides) % vTotalSlides;
        updateVCarousel(prev);
    }

    // Auto-play del V-carousel
    let vAutoplayInterval = null;

    function startVAutoplay() {
        if (vAutoplayInterval) {
            clearInterval(vAutoplayInterval);
        }
        vAutoplayInterval = setInterval(vNextSlide, 4000); // Cambia cada 4 segundos
    }

    function stopVAutoplay() {
        if (vAutoplayInterval) {
            clearInterval(vAutoplayInterval);
            vAutoplayInterval = null;
        }
    }

    // Event listeners para los botones
    if (vNextBtn) {
        vNextBtn.addEventListener('click', () => {
            stopVAutoplay();
            vNextSlide();
            startVAutoplay();
        });
    }

    if (vPrevBtn) {
        vPrevBtn.addEventListener('click', () => {
            stopVAutoplay();
            vPrevSlide();
            startVAutoplay();
        });
    }

    // Event listeners para los dots
    vDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopVAutoplay();
            updateVCarousel(index);
            startVAutoplay();
        });
    });

    // Inicializar el V-carousel en la posición 0
    updateVCarousel(0);

    // Iniciar autoplay
    startVAutoplay();

    // Pausar autoplay cuando el mouse está sobre el V-carousel
    const vCarouselContainer = document.querySelector('.v-carousel-container');
    if (vCarouselContainer) {
        vCarouselContainer.addEventListener('mouseenter', () => {
            stopVAutoplay();
        });
        vCarouselContainer.addEventListener('mouseleave', () => {
            stopVAutoplay();
            startVAutoplay();
        });
    }

    // Soporte para navegación con teclado (solo si el V-carousel está en viewport)
    document.addEventListener('keydown', (e) => {
        const rect = vCarouselContainer.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (inViewport) {
            if (e.key === 'ArrowLeft') {
                stopVAutoplay();
                vPrevSlide();
                startVAutoplay();
            } else if (e.key === 'ArrowRight') {
                stopVAutoplay();
                vNextSlide();
                startVAutoplay();
            }
        }
    });

    // Soporte para gestos táctiles (swipe)
    let vTouchStartX = 0;
    let vTouchEndX = 0;

    if (vCarouselContainer) {
        vCarouselContainer.addEventListener('touchstart', (e) => {
            vTouchStartX = e.changedTouches[0].screenX;
        });

        vCarouselContainer.addEventListener('touchend', (e) => {
            vTouchEndX = e.changedTouches[0].screenX;
            handleVSwipe();
        });
    }

    function handleVSwipe() {
        const swipeThreshold = 50;
        const difference = vTouchStartX - vTouchEndX;

        if (Math.abs(difference) > swipeThreshold) {
            stopVAutoplay();
            if (difference > 0) {
                // Swipe left - siguiente
                vNextSlide();
            } else {
                // Swipe right - anterior
                vPrevSlide();
            }
            startVAutoplay();
        }
    }

    // Ajustar el V-carousel en resize
    window.addEventListener('resize', () => {
        updateVCarousel(vCurrentSlide);
    });

    // Funcionalidad de botones de favoritos
    const vFavoriteButtons = document.querySelectorAll('.v-favorite-btn');

    vFavoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();

            const svg = this.querySelector('svg');
            const currentFill = svg.getAttribute('fill');

            if (currentFill === 'currentColor') {
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
    function padZero(num, size = 2) {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    // Función para actualizar el contador
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Si la fecha ya pasó
        if (distance < 0) {
            daysElement.textContent = '000';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            return;
        }

        // Cálculos de tiempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Actualizar el DOM con animación
        daysElement.textContent = padZero(days, 3);
        hoursElement.textContent = padZero(hours);
        minutesElement.textContent = padZero(minutes);
        secondsElement.textContent = padZero(seconds);
    }

    // Actualizar inmediatamente
    updateCountdown();

    // Actualizar cada segundo
    const countdownInterval = setInterval(updateCountdown, 1000);
});

// ========================================
// CARRUSEL DE MISIONES
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const missionsTrack = document.querySelector('.missions-carousel-track');
    const missionsSlides = document.querySelectorAll('.missions-slide');
    const missionsPrevBtn = document.querySelector('.missions-carousel-prev');
    const missionsNextBtn = document.querySelector('.missions-carousel-next');
    const missionsDots = document.querySelectorAll('.missions-dot');

    if (!missionsTrack || missionsSlides.length === 0) return;

    let missionsCurrentIndex = 0;
    const missionsTotalSlides = missionsSlides.length;
    let missionsAutoplayInterval;

    // Función para actualizar el carrusel
    function updateMissionsCarousel(index) {
        const translateX = -index * 100;
        missionsTrack.style.transform = `translateX(${translateX}%)`;

        // Actualizar dots
        missionsDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Navegación - Siguiente
    function nextMissionsSlide() {
        missionsCurrentIndex = (missionsCurrentIndex + 1) % missionsTotalSlides;
        updateMissionsCarousel(missionsCurrentIndex);
    }

    // Navegación - Anterior
    function prevMissionsSlide() {
        missionsCurrentIndex = (missionsCurrentIndex - 1 + missionsTotalSlides) % missionsTotalSlides;
        updateMissionsCarousel(missionsCurrentIndex);
    }

    // Event listeners para botones
    if (missionsNextBtn) {
        missionsNextBtn.addEventListener('click', () => {
            stopMissionsAutoplay();
            nextMissionsSlide();
            startMissionsAutoplay();
        });
    }

    if (missionsPrevBtn) {
        missionsPrevBtn.addEventListener('click', () => {
            stopMissionsAutoplay();
            prevMissionsSlide();
            startMissionsAutoplay();
        });
    }

    // Event listeners para dots
    missionsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopMissionsAutoplay();
            missionsCurrentIndex = index;
            updateMissionsCarousel(missionsCurrentIndex);
            startMissionsAutoplay();
        });
    });

    // Autoplay
    function startMissionsAutoplay() {
        missionsAutoplayInterval = setInterval(nextMissionsSlide, 8000);
    }

    function stopMissionsAutoplay() {
        if (missionsAutoplayInterval) {
            clearInterval(missionsAutoplayInterval);
        }
    }

    // Iniciar autoplay
    startMissionsAutoplay();

    // Pausar autoplay al hover
    const missionsContainer = document.querySelector('.missions-carousel-container');
    if (missionsContainer) {
        missionsContainer.addEventListener('mouseenter', stopMissionsAutoplay);
        missionsContainer.addEventListener('mouseleave', startMissionsAutoplay);
    }

    // Soporte para teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopMissionsAutoplay();
            prevMissionsSlide();
            startMissionsAutoplay();
        } else if (e.key === 'ArrowRight') {
            stopMissionsAutoplay();
            nextMissionsSlide();
            startMissionsAutoplay();
        }
    });
});
