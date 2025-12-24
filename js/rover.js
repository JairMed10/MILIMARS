// ===== THREE.JS SCENES FOR ROVER PAGE =====

// Three.js Scene for Rover Section
let roverScene, roverCamera, roverRenderer, roverControls;
let roverModel;
let roverAutoRotate = true;

// Three.js Scene for Module Section
let moduloScene, moduloCamera, moduloRenderer, moduloControls;
let moduloModel;
let moduloAutoRotate = true;

// Three.js Scene for Brazo Section
let brazoScene, brazoCamera, brazoRenderer, brazoControls;
let brazoModel;
let brazoAutoRotate = true;

// ===== ROVER SCENE =====
function initRoverScene() {
    // Scene
    roverScene = new THREE.Scene();
    roverScene.background = new THREE.Color(0x000000);

    // Camera
    roverCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    roverCamera.position.set(12, 8, 12);

    // Renderer
    roverRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    roverRenderer.setSize(window.innerWidth, window.innerHeight);
    roverRenderer.shadowMap.enabled = true;
    roverRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('rover-canvas-container').appendChild(roverRenderer.domElement);

    // Controls
    roverControls = new THREE.OrbitControls(roverCamera, roverRenderer.domElement);
    roverControls.enableDamping = true;
    roverControls.dampingFactor = 0.05;
    roverControls.minDistance = 5;
    roverControls.maxDistance = 30;
    roverControls.autoRotate = true;
    roverControls.autoRotateSpeed = 0.5;
    roverControls.enablePan = false;
    roverControls.enableZoom = false;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    roverScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd4a3, 1.2);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    roverScene.add(mainLight);

    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    roverScene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(0, -10, 0);
    roverScene.add(fillLight2);

    // Add stars
    addStars(roverScene);

    // Load Rover STL
    loadRoverSTL();

    // Start Animation
    animateRoverScene();
}

function loadRoverSTL() {
    const loader = new THREE.STLLoader();

    loader.load(
        '../stl/ROVER 2025 MOVIL.STL',
        function(geometry) {
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.4,
                metalness: 0.8,
                flatShading: false
            });

            roverModel = new THREE.Mesh(geometry, material);

            // Center and scale
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            geometry.translate(-center.x, -center.y, -center.z);

            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            roverModel.scale.set(scale, scale, scale);

            roverModel.position.y = 0;
            roverModel.castShadow = true;
            roverModel.receiveShadow = true;
            roverModel.rotation.y = Math.PI / 2;

            roverScene.add(roverModel);
            document.getElementById('rover-loading').style.display = 'none';
        },
        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            const loadingText = document.querySelector('#rover-loading .hero-loading-text');
            if (loadingText) {
                loadingText.textContent = 'Cargando Rover... ' + Math.round(percentComplete) + '%';
            }
        },
        function(error) {
            console.error('Error loading Rover STL:', error);
            const loadingDiv = document.getElementById('rover-loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = '<div class="hero-loading-text">Error al cargar el modelo 3D.<br>Verifica que el archivo STL existe.</div>';
            }
        }
    );
}

function animateRoverScene() {
    requestAnimationFrame(animateRoverScene);

    if (roverModel && roverAutoRotate) {
        roverModel.rotation.y += 0.003;
    }

    roverControls.update();
    roverRenderer.render(roverScene, roverCamera);
}

// ===== MODULO SCENE =====
function initModuloScene() {
    // Scene
    moduloScene = new THREE.Scene();
    moduloScene.background = new THREE.Color(0x000000);

    // Camera
    moduloCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    moduloCamera.position.set(12, 8, 12);

    // Renderer
    moduloRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    moduloRenderer.setSize(window.innerWidth, window.innerHeight);
    moduloRenderer.shadowMap.enabled = true;
    moduloRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('modulo-canvas-container').appendChild(moduloRenderer.domElement);

    // Controls
    moduloControls = new THREE.OrbitControls(moduloCamera, moduloRenderer.domElement);
    moduloControls.enableDamping = true;
    moduloControls.dampingFactor = 0.05;
    moduloControls.minDistance = 5;
    moduloControls.maxDistance = 30;
    moduloControls.autoRotate = true;
    moduloControls.autoRotateSpeed = 0.5;
    moduloControls.enablePan = false;
    moduloControls.enableZoom = false;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    moduloScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd4a3, 1.2);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    moduloScene.add(mainLight);

    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    moduloScene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(0, -10, 0);
    moduloScene.add(fillLight2);

    // Add stars
    addStars(moduloScene);

    // Load Modulo STL
    loadModuloSTL();

    // Start Animation
    animateModuloScene();
}

function loadModuloSTL() {
    const loader = new THREE.STLLoader();

    loader.load(
        '../stl/ModuloVida.STL',
        function(geometry) {
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.4,
                metalness: 0.8,
                flatShading: false
            });

            moduloModel = new THREE.Mesh(geometry, material);

            // Center and scale
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            geometry.translate(-center.x, -center.y, -center.z);

            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            moduloModel.scale.set(scale, scale, scale);

            moduloModel.position.y = 0;
            moduloModel.castShadow = true;
            moduloModel.receiveShadow = true;
            moduloModel.rotation.y = Math.PI / 2;

            moduloScene.add(moduloModel);
            document.getElementById('modulo-loading').style.display = 'none';
        },
        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            const loadingText = document.querySelector('#modulo-loading .hero-loading-text');
            if (loadingText) {
                loadingText.textContent = 'Cargando Módulo de Vida... ' + Math.round(percentComplete) + '%';
            }
        },
        function(error) {
            console.error('Error loading Modulo STL:', error);
            const loadingDiv = document.getElementById('modulo-loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = '<div class="hero-loading-text">Error al cargar el modelo 3D.<br>Verifica que el archivo STL existe.</div>';
            }
        }
    );
}

function animateModuloScene() {
    requestAnimationFrame(animateModuloScene);

    if (moduloModel && moduloAutoRotate) {
        moduloModel.rotation.y += 0.003;
    }

    moduloControls.update();
    moduloRenderer.render(moduloScene, moduloCamera);
}

// ===== BRAZO SCENE =====
function initBrazoScene() {
    // Scene
    brazoScene = new THREE.Scene();
    brazoScene.background = new THREE.Color(0x000000);

    // Camera
    brazoCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    brazoCamera.position.set(12, 8, 12);

    // Renderer
    brazoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    brazoRenderer.setSize(window.innerWidth, window.innerHeight);
    brazoRenderer.shadowMap.enabled = true;
    brazoRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('brazo-canvas-container').appendChild(brazoRenderer.domElement);

    // Controls
    brazoControls = new THREE.OrbitControls(brazoCamera, brazoRenderer.domElement);
    brazoControls.enableDamping = true;
    brazoControls.dampingFactor = 0.05;
    brazoControls.minDistance = 5;
    brazoControls.maxDistance = 30;
    brazoControls.autoRotate = true;
    brazoControls.autoRotateSpeed = 0.5;
    brazoControls.enablePan = false;
    brazoControls.enableZoom = false;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    brazoScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd4a3, 1.2);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    brazoScene.add(mainLight);

    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    brazoScene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(0, -10, 0);
    brazoScene.add(fillLight2);

    // Add stars
    addStars(brazoScene);

    // Load Brazo STL
    loadBrazoSTL();

    // Start Animation
    animateBrazoScene();
}

function loadBrazoSTL() {
    const loader = new THREE.STLLoader();

    loader.load(
        '../stl/BRAZO.STL',
        function(geometry) {
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.4,
                metalness: 0.8,
                flatShading: false
            });

            brazoModel = new THREE.Mesh(geometry, material);

            // Center and scale
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            geometry.translate(-center.x, -center.y, -center.z);

            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            brazoModel.scale.set(scale, scale, scale);

            brazoModel.position.y = 0;
            brazoModel.castShadow = true;
            brazoModel.receiveShadow = true;
            brazoModel.rotation.y = Math.PI / 2;

            brazoScene.add(brazoModel);
            document.getElementById('brazo-loading').style.display = 'none';
        },
        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            const loadingText = document.querySelector('#brazo-loading .hero-loading-text');
            if (loadingText) {
                loadingText.textContent = 'Cargando Brazo Robótico... ' + Math.round(percentComplete) + '%';
            }
        },
        function(error) {
            console.error('Error loading Brazo STL:', error);
            const loadingDiv = document.getElementById('brazo-loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = '<div class="hero-loading-text">Error al cargar el modelo 3D.<br>Verifica que el archivo STL existe.</div>';
            }
        }
    );
}

function animateBrazoScene() {
    requestAnimationFrame(animateBrazoScene);

    if (brazoModel && brazoAutoRotate) {
        brazoModel.rotation.y += 0.003;
    }

    brazoControls.update();
    brazoRenderer.render(brazoScene, brazoCamera);
}

// ===== SHARED FUNCTIONS =====
function addStars(scene) {
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
    scene.add(stars);

    // Add larger stars for depth
    const bigStarsGeometry = new THREE.BufferGeometry();
    const bigStarsMaterial = new THREE.PointsMaterial({
        color: 0xFFC857,
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
    scene.add(bigStars);
}

// Window resize handler
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (roverCamera && roverRenderer) {
        roverCamera.aspect = width / height;
        roverCamera.updateProjectionMatrix();
        roverRenderer.setSize(width, height);
    }

    if (moduloCamera && moduloRenderer) {
        moduloCamera.aspect = width / height;
        moduloCamera.updateProjectionMatrix();
        moduloRenderer.setSize(width, height);
    }

    if (brazoCamera && brazoRenderer) {
        brazoCamera.aspect = width / height;
        brazoCamera.updateProjectionMatrix();
        brazoRenderer.setSize(width, height);
    }
}

// ===== ROVER INFO STAR =====
function initRoverInfoStar() {
    const infoStar = document.getElementById('rover-info-star');
    const tooltip = document.getElementById('rover-tooltip');
    const infoLine = document.getElementById('rover-info-line');
    
    if (!infoStar || !tooltip || !infoLine) return;
    
    // Position the star
    updateStarPosition();
    
    // Mouse events
    infoStar.addEventListener('mouseenter', function() {
        tooltip.classList.add('visible');
    });
    
    infoStar.addEventListener('mouseleave', function() {
        tooltip.classList.remove('visible');
    });
    
    // Update positions on window resize
    window.addEventListener('resize', updateStarPosition);
    
    // Update line animation
    setInterval(updateInfoLine, 50);
}

function updateStarPosition() {
    const infoStar = document.getElementById('rover-info-star');
    const tooltip = document.getElementById('rover-tooltip');
    
    if (!infoStar || !tooltip) return;
    
    // Position star on the right side
    const starX = window.innerWidth * 0.75;
    const starY = window.innerHeight * 0.4;
    
    infoStar.style.left = starX + 'px';
    infoStar.style.top = starY + 'px';
    
    // Position tooltip above star
    tooltip.style.left = (starX - 50) + 'px';
    tooltip.style.top = (starY - 60) + 'px';
}

function updateInfoLine() {
    const infoLine = document.getElementById('rover-info-line');
    const infoStar = document.getElementById('rover-info-star');
    
    if (!infoLine || !infoStar || !roverRenderer) return;
    
    const line = infoLine.querySelector('line');
    if (!line) return;
    
    // Get star position
    const starRect = infoStar.getBoundingClientRect();
    const starX = starRect.left + starRect.width / 2;
    const starY = starRect.top + starRect.height / 2;
    
    // Get rover center position
    const roverX = window.innerWidth / 2;
    const roverY = window.innerHeight / 2;
    
    // Update line
    line.setAttribute('x1', starX);
    line.setAttribute('y1', starY);
    line.setAttribute('x2', roverX);
    line.setAttribute('y2', roverY);
}

// ===== INITIALIZATION =====
window.addEventListener('load', function() {
    setTimeout(initRoverScene, 100);
    setTimeout(initModuloScene, 200);
    setTimeout(initBrazoScene, 300);
    setTimeout(initRoverInfoStar, 500);
});

window.addEventListener('resize', onWindowResize, false);