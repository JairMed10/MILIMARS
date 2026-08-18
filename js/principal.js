(function () {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initHeader();
        initMobileNav();
        initSmoothAnchors();
        initReveal();
        initCounters();
        initStarfield();
        initMissionTelemetry();
        initLeadersCarousel();
        initHomeSTLViewer();
    });

    function initHeader() {
        const header = document.querySelector(".header");
        if (!header) return;

        const update = () => {
            header.classList.toggle("scrolled", window.scrollY > 20);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function initMobileNav() {
        const toggle = document.querySelector("[data-nav-toggle]");
        const menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) return;

        toggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (event) {
                const href = this.getAttribute("href");
                if (!href || href === "#") return;

                const target = document.querySelector(href);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    function initReveal() {
        const elements = document.querySelectorAll(".reveal");
        if (!elements.length) return;

        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            elements.forEach((element) => element.classList.add("in-view"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

        elements.forEach((element) => observer.observe(element));
    }

    function initCounters() {
        const counters = document.querySelectorAll("[data-count]");
        if (!counters.length) return;

        const animate = (counter) => {
            const target = Number(counter.dataset.count || 0);
            const duration = 1400;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = String(Math.round(target * eased));

                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            counters.forEach((counter) => {
                counter.textContent = counter.dataset.count || "0";
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.8 });

        counters.forEach((counter) => observer.observe(counter));
    }

    function initMissionTelemetry() {
        const links = document.querySelectorAll(".nav-link[href^='#']");
        const sections = Array.from(links)
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { threshold: 0.35 });

        sections.forEach((section) => observer.observe(section));
    }

    function initStarfield() {
        const canvas = document.getElementById("starfield-canvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const pointer = { x: 0, y: 0 };
        let stars = [];
        let meteors = [];
        let width = 0;
        let height = 0;
        let animationId = null;

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth || window.innerWidth;
            height = canvas.clientHeight || window.innerHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            const starCount = Math.max(90, Math.floor((width * height) / 9000));
            stars = Array.from({ length: starCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 0.9 + 0.1,
                size: Math.random() * 1.4 + 0.3,
                speed: Math.random() * 0.16 + 0.03
            }));
        };

        const addMeteor = () => {
            if (meteors.length > 3 || Math.random() > 0.018) return;
            meteors.push({
                x: width * (0.25 + Math.random() * 0.75),
                y: Math.random() * height * 0.38,
                vx: -6 - Math.random() * 4,
                vy: 2.5 + Math.random() * 1.5,
                life: 1
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(3, 5, 11, 0.18)";
            ctx.fillRect(0, 0, width, height);

            stars.forEach((star) => {
                star.y += star.speed;
                if (star.y > height) {
                    star.y = -4;
                    star.x = Math.random() * width;
                }

                const parallaxX = pointer.x * star.z * 10;
                const parallaxY = pointer.y * star.z * 10;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + star.z * 0.7})`;
                ctx.arc(star.x + parallaxX, star.y + parallaxY, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            addMeteor();
            meteors = meteors.filter((meteor) => meteor.life > 0);
            meteors.forEach((meteor) => {
                meteor.x += meteor.vx;
                meteor.y += meteor.vy;
                meteor.life -= 0.018;

                const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 8, meteor.y - meteor.vy * 8);
                gradient.addColorStop(0, `rgba(255, 138, 42, ${meteor.life})`);
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(meteor.x, meteor.y);
                ctx.lineTo(meteor.x - meteor.vx * 9, meteor.y - meteor.vy * 9);
                ctx.stroke();
            });

            if (!prefersReducedMotion) animationId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", (event) => {
            pointer.x = (event.clientX / window.innerWidth - 0.5) * -1;
            pointer.y = (event.clientY / window.innerHeight - 0.5) * -1;
        }, { passive: true });

        resize();
        draw();

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            } else if (!animationId && !prefersReducedMotion) {
                draw();
            }
        });
    }

    function initLeadersCarousel() {
        const carousel = document.querySelector("[data-leaders-carousel]");
        if (!carousel) return;

        const cards = Array.from(carousel.querySelectorAll("[data-leader-card]"));
        const dots = Array.from(carousel.querySelectorAll("[data-leaders-dot]"));
        const prevButton = carousel.querySelector("[data-leaders-prev]");
        const nextButton = carousel.querySelector("[data-leaders-next]");
        if (!cards.length) return;

        let current = 0;
        let autoplayId = null;
        let touchStartX = 0;

        const getSpacing = () => {
            if (window.innerWidth <= 460) return 52;
            if (window.innerWidth <= 760) return 68;
            if (window.innerWidth <= 980) return 190;
            return 260;
        };

        const getCircularOffset = (index) => {
            const total = cards.length;
            let offset = (index - current + total) % total;
            if (offset > total / 2) offset -= total;
            return offset;
        };

        const update = (nextIndex) => {
            current = (nextIndex + cards.length) % cards.length;
            const spacing = getSpacing();

            cards.forEach((card, index) => {
                const offset = getCircularOffset(index);
                const distance = Math.abs(offset);
                const scale = distance === 0 ? 1 : distance === 1 ? 0.88 : 0.72;
                const opacity = distance === 0 ? 1 : distance === 1 ? 0.46 : 0.16;
                const blur = distance === 0 ? 0 : distance === 1 ? 0.5 : 2;

                card.classList.toggle("active", offset === 0);
                card.classList.toggle("prev", offset === -1);
                card.classList.toggle("next", offset === 1);
                card.classList.toggle("far", distance === 2);
                card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
                card.style.zIndex = String(10 - distance);
                card.style.setProperty("--orbit-x", `${offset * spacing}px`);
                card.style.setProperty("--orbit-y", `${distance * 14}px`);
                card.style.setProperty("--orbit-rotate", `${offset * -18}deg`);
                card.style.setProperty("--orbit-scale", String(scale));
                card.style.setProperty("--orbit-opacity", String(opacity));
                card.style.setProperty("--orbit-blur", `${blur}px`);
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === current);
            });
        };

        const next = () => update(current + 1);
        const prev = () => update(current - 1);

        const stopAutoplay = () => {
            if (!autoplayId) return;
            clearInterval(autoplayId);
            autoplayId = null;
        };

        const startAutoplay = () => {
            if (prefersReducedMotion || autoplayId) return;
            autoplayId = setInterval(next, 5200);
        };

        prevButton?.addEventListener("click", () => {
            stopAutoplay();
            prev();
            startAutoplay();
        });

        nextButton?.addEventListener("click", () => {
            stopAutoplay();
            next();
            startAutoplay();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                stopAutoplay();
                update(index);
                startAutoplay();
            });
        });

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);
        carousel.addEventListener("focusin", stopAutoplay);
        carousel.addEventListener("focusout", startAutoplay);

        carousel.addEventListener("touchstart", (event) => {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        carousel.addEventListener("touchend", (event) => {
            const delta = touchStartX - event.changedTouches[0].clientX;
            if (Math.abs(delta) < 40) return;
            stopAutoplay();
            delta > 0 ? next() : prev();
            startAutoplay();
        }, { passive: true });

        window.addEventListener("resize", () => update(current), { passive: true });

        update(0);
        startAutoplay();
    }

    function initHomeSTLViewer() {
        const container = document.getElementById("home-stl-viewer");
        if (!container || typeof THREE === "undefined" || typeof THREE.STLLoader === "undefined") return;
        // addChasisParts/addArmParts/centerDigitalTwin/loadSTLCached vienen de
        // js/digital-twin.js (debe cargarse antes que este script).
        const hasDigitalTwinHelpers = typeof addChasisParts === "function" && typeof addArmParts === "function";

        const loading = container.querySelector("[data-stl-loading]");
        const title = document.querySelector("[data-model-title]");
        const copy = document.querySelector("[data-model-copy]");
        const buttons = document.querySelectorAll(".model-selector");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        const loader = new THREE.STLLoader();
        const clock = new THREE.Clock();
        // "activeObject" es un THREE.Mesh (Módulo, STL único) o un THREE.Group
        // (Rover/Brazo, ensambles multi-pieza vía digital-twin.js).
        let activeObject = null;
        let activeKind = null; // 'stl' | 'full' | 'arm'
        let frameId = null;

        // Stub para centerDigitalTwin() -- solo necesita target/minDistance/
        // maxDistance/update(), no hace falta un OrbitControls real ya que este
        // visor no tiene interacción de mouse (auto-rotación fija, como antes).
        const controlsStub = {
            target: new THREE.Vector3(),
            minDistance: 0,
            maxDistance: 0,
            update() {}
        };

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
        keyLight.position.set(5, 7, 4);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0xfc3d21, 1.4, 16);
        rimLight.position.set(-4, 2, 3);
        scene.add(rimLight);

        const blueLight = new THREE.PointLight(0x0b3d91, 1.6, 18);
        blueLight.position.set(4, -1, -4);
        scene.add(blueLight);

        const grid = new THREE.GridHelper(8, 24, 0x284568, 0x142132);
        grid.position.y = -1.2;
        scene.add(grid);

        function resize() {
            const width = container.clientWidth || 520;
            const height = container.clientHeight || 420;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        function setLoading(message) {
            if (!loading) return;
            loading.style.display = message ? "grid" : "none";
            if (message) loading.textContent = message;
        }

        function disposeActive() {
            if (!activeObject) return;
            scene.remove(activeObject);
            activeObject.traverse((o) => {
                if (o.isMesh) {
                    o.geometry.dispose();
                    o.material.dispose();
                }
            });
            activeObject = null;
        }

        // Rover completo (chasis+brazo) y Brazo solo: ensambles multi-pieza,
        // mismas piezas/pivotes reales que rover.html -- ver digital-twin.js.
        function loadAssembly(kind, label, description) {
            if (!hasDigitalTwinHelpers) {
                setLoading("No se pudo cargar el gemelo digital (digital-twin.js no disponible).");
                return;
            }
            setLoading("Cargando modelo 3D...");
            disposeActive();
            activeKind = kind;

            if (title && label) title.textContent = label;
            if (copy && description) copy.textContent = description;

            const model = new THREE.Group();
            scene.add(model);
            activeObject = model;
            const core = new THREE.Group();
            model.add(core);

            function onEachLoaded(loadedN, pendingN) {
                setLoading(`Cargando modelo 3D... ${Math.round((loadedN / pendingN) * 100)}%`);
            }
            function finish() {
                setLoading("");
                centerDigitalTwin(model, camera, controlsStub, 1.7);
            }

            if (kind === "full") {
                let chasisDone = false, armDone = false;
                const maybeDone = () => { if (chasisDone && armDone) finish(); };
                addChasisParts(core, onEachLoaded, () => { chasisDone = true; maybeDone(); });
                addArmParts(core, onEachLoaded, () => { armDone = true; maybeDone(); });
            } else if (kind === "arm") {
                addArmParts(core, onEachLoaded, finish);
            }
        }

        // Módulo de vida: STL único (sin cambios de contenido -- pendiente de un
        // archivo real, ver memoria del proyecto: ModuloVida.STL es actualmente
        // idéntico a BRAZO.STL, un duplicado, no un módulo de vida real).
        function loadSingle(path, label, description) {
            setLoading("Cargando modelo 3D...");
            disposeActive();
            activeKind = "stl";

            // Reset explícito: si la vista anterior fue un ensamble (Rover/Brazo),
            // centerDigitalTwin() movió la cámara -- este modo usa un encuadre fijo.
            camera.position.set(4, 2.3, 6);
            camera.lookAt(0, 0, 0);

            if (title && label) title.textContent = label;
            if (copy && description) copy.textContent = description;

            loader.load(
                path,
                (geometry) => {
                    geometry.computeVertexNormals();
                    geometry.center();

                    const material = new THREE.MeshStandardMaterial({
                        color: 0xd6dce7,
                        metalness: 0.72,
                        roughness: 0.32
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    activeObject = mesh;

                    const box = new THREE.Box3().setFromObject(mesh);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z) || 1;
                    const scale = 3.6 / maxDim;
                    mesh.scale.setScalar(scale);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.rotation.z = Math.PI * 0.08 + Math.PI / 2;
                    scene.add(mesh);

                    setLoading("");
                    renderer.render(scene, camera);
                },
                (xhr) => {
                    if (!xhr.total) return;
                    const progress = Math.round((xhr.loaded / xhr.total) * 100);
                    setLoading(`Cargando modelo 3D... ${progress}%`);
                },
                () => {
                    setLoading("No se pudo cargar el STL. Revisa la ruta del archivo.");
                }
            );
        }

        function loadFromButton(button) {
            const kind = button.dataset.kind;
            if (kind === "full" || kind === "arm") {
                loadAssembly(kind, button.dataset.title, button.dataset.copy);
            } else {
                loadSingle(button.dataset.stl, button.dataset.title, button.dataset.copy);
            }
        }

        function animate() {
            const time = clock.getElapsedTime();
            if (activeObject) {
                if (activeKind === "stl") {
                    activeObject.rotation.z += 0.006;
                } else {
                    activeObject.rotation.y += 0.006;
                }
                activeObject.position.y = Math.sin(time * 1.2) * 0.05;
            }

            renderer.render(scene, camera);
            if (!prefersReducedMotion) frameId = requestAnimationFrame(animate);
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                loadFromButton(button);
            });
        });

        resize();
        new ResizeObserver(resize).observe(container);

        const initialButton = document.querySelector(".model-selector.active") || buttons[0];
        if (initialButton) {
            loadFromButton(initialButton);
        }
        animate();

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            } else if (!frameId && !prefersReducedMotion) {
                animate();
            }
        });
    }
})();
