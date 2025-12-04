// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 71, 42, 0.98)';
    } else {
        navbar.style.background = 'rgba(26, 71, 42, 0.95)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to cards
document.querySelectorAll('.project-card, .team-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-content');
    const scrolled = window.pageYOffset;
    if (hero && scrolled < window.innerHeight) {
        // Solo aplicar opacidad, no transform ya que usamos flex layout
        hero.style.opacity = 1 - (scrolled / window.innerHeight * 0.8);
    }
});

// Counter animation for stats
const animateCounter = (element, target, duration) => {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                stat.textContent = '0';
                animateCounter(stat, target, 2000);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const missionStats = document.querySelector('.mission-stats');
if (missionStats) {
    statsObserver.observe(missionStats);
}

// Three.js Scene for Hero Section
let heroScene, heroCamera, heroRenderer, heroControls;
let heroRover;
let heroAutoRotate = true;

function initHeroScene() {
    // Scene
    heroScene = new THREE.Scene();
    heroScene.background = new THREE.Color(0x000000);

    // Camera
    heroCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    heroCamera.position.set(12, 8, 12);

    // Renderer
    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.shadowMap.enabled = true;
    heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('hero-canvas-container').appendChild(heroRenderer.domElement);

    // Controls
    heroControls = new THREE.OrbitControls(heroCamera, heroRenderer.domElement);
    heroControls.enableDamping = true;
    heroControls.dampingFactor = 0.05;
    heroControls.minDistance = 5;
    heroControls.maxDistance = 30;
    heroControls.autoRotate = true;
    heroControls.autoRotateSpeed = 0.5;
    heroControls.enablePan = false;
    heroControls.enableZoom = false; // Disable zoom to allow page scrolling

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    heroScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd4a3, 1.2);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    heroScene.add(mainLight);

    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    heroScene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(0, -10, 0);
    heroScene.add(fillLight2);

    // Add stars
    addHeroStars();

    // Load Rover STL
    loadHeroRover();

    // Window Resize
    window.addEventListener('resize', onHeroWindowResize, false);

    // Start Animation
    animateHeroScene();
}

function addHeroStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    heroScene.add(stars);

    // Add larger stars for depth
    const bigStarsGeometry = new THREE.BufferGeometry();
    const bigStarsMaterial = new THREE.PointsMaterial({
        color: 0xd4af37,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });

    const bigStarsVertices = [];
    for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * 250;
        const y = (Math.random() - 0.5) * 250;
        const z = (Math.random() - 0.5) * 250;
        bigStarsVertices.push(x, y, z);
    }

    bigStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bigStarsVertices, 3));
    const bigStars = new THREE.Points(bigStarsGeometry, bigStarsMaterial);
    heroScene.add(bigStars);
}

function loadHeroRover() {
    const loader = new THREE.STLLoader();

    loader.load(
        'ROVER 2025 MOVIL.STL',
        function(geometry) {
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.4,
                metalness: 0.8,
                flatShading: false
            });

            heroRover = new THREE.Mesh(geometry, material);

            // Center and scale the rover
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            geometry.translate(-center.x, -center.y, -center.z);

            // Scale to appropriate size
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            heroRover.scale.set(scale, scale, scale);

            heroRover.position.y = 0;
            heroRover.castShadow = true;
            heroRover.receiveShadow = true;

            // Rotate rover
            heroRover.rotation.y = Math.PI / 2;

            heroScene.add(heroRover);

            // Hide loading screen
            document.getElementById('hero-loading').style.display = 'none';
        },
        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            const loadingText = document.querySelector('.hero-loading-text');
            if (loadingText) {
                loadingText.textContent = 'Cargando Rover... ' + Math.round(percentComplete) + '%';
            }
        },
        function(error) {
            console.error('Error loading STL:', error);
            const loadingDiv = document.getElementById('hero-loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = '<div class="hero-loading-text">Error al cargar el modelo 3D.<br>Verifica que el archivo STL existe.</div>';
            }
        }
    );
}

function animateHeroScene() {
    requestAnimationFrame(animateHeroScene);

    if (heroRover && heroAutoRotate) {
        heroRover.rotation.y += 0.003;
    }

    heroControls.update();
    heroRenderer.render(heroScene, heroCamera);
}

function onHeroWindowResize() {
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize hero scene when page loads
if (document.getElementById('hero-canvas-container')) {
    // Wait for Three.js libraries to load
    window.addEventListener('load', function() {
        setTimeout(initHeroScene, 100);
    });
}