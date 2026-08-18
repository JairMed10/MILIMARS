// ===== THREE.JS SCENES FOR ROVER PAGE =====
// Orden de secciones (ver rover.html): 1) Rover completo (chasis+brazo armados)
// 2) Chasis y Tracción (solo chasis+4 ruedas) 3) Módulo de Vida 4) Brazo Robótico.

// Three.js Scene for Rover Section (vista 1: rover completo)
let roverScene, roverCamera, roverRenderer, roverControls;
let roverModel;
let roverAutoRotate = true;

// Three.js Scene for Chasis Section (vista 2: solo chasis + tracción)
let chasisScene, chasisCamera, chasisRenderer, chasisControls;
let chasisModel;
let chasisAutoRotate = true;

// Three.js Scene for Module Section
let moduloScene, moduloCamera, moduloRenderer, moduloControls;
let moduloModel;
let moduloAutoRotate = true;

// Three.js Scene for Brazo Section
let brazoScene, brazoCamera, brazoRenderer, brazoControls;
let brazoModel;
let brazoAutoRotate = true;

// Piezas y helpers compartidos (loadSTLCached, addChasisParts, addArmParts,
// centerDigitalTwin) ahora viven en js/digital-twin.js -- cargado antes que
// este script en rover.html -- para poder reusarlos también desde
// principal.js (visor pequeño de index.html) sin duplicar ~180 líneas.

// ===== ROVER SCENE (vista 1: rover completo -- chasis + brazo armados) =====
function initRoverScene() {
    // Scene
    roverScene = new THREE.Scene();
    roverScene.background = new THREE.Color(0x000000);

    // Camera — escala real (metros), no el escalado x5 del STL único anterior.
    roverCamera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        50
    );
    roverCamera.position.set(2.2, 1.4, 2.2);

    // Renderer
    roverRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    roverRenderer.setSize(window.innerWidth, window.innerHeight);
    roverRenderer.shadowMap.enabled = true;
    roverRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('rover-canvas-container').appendChild(roverRenderer.domElement);

    // Controls
    roverControls = new THREE.OrbitControls(roverCamera, roverRenderer.domElement);
    roverControls.target.set(0, 0, 0);
    roverControls.enableDamping = true;
    roverControls.dampingFactor = 0.05;
    roverControls.minDistance = 0.3;
    roverControls.maxDistance = 6;
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

    // Build combined digital twin: chasis + 4 ruedas + brazo articulado
    buildFullDigitalTwin();

    // Start Animation
    animateRoverScene();
}

function buildFullDigitalTwin() {
    roverModel = new THREE.Group(); // grupo raíz — SOLO rotation.y se anima aquí
    roverScene.add(roverModel);

    // "core" contiene chasis + brazo juntos (mismo frame de ensamble SolidWorks,
    // no necesitan offset relativo entre sí). Se centra sobre su propio centroide
    // combinado en centerDigitalTwin() ANTES de que roverModel reciba su rotación
    // inicial -- ver comentario en centerDigitalTwin.
    const core = new THREE.Group();
    roverModel.add(core);

    const loadingEl = document.getElementById('rover-loading');
    const loadingText = document.querySelector('#rover-loading .hero-loading-text');
    let chasisDone = false, armDone = false;
    function maybeFinish() {
        if (chasisDone && armDone) {
            if (loadingEl) loadingEl.style.display = 'none';
            centerDigitalTwin(roverModel, roverCamera, roverControls, 1.7);
        }
    }
    function onEachLoaded(loaded, pending) {
        if (loadingText) {
            loadingText.textContent = 'Cargando Rover... ' + Math.round((loaded / pending) * 50 + (chasisDone ? 50 : 0)) + '%';
        }
    }

    addChasisParts(core, onEachLoaded, () => { chasisDone = true; maybeFinish(); });
    addArmParts(core, onEachLoaded, () => { armDone = true; maybeFinish(); });
}

function animateRoverScene() {
    requestAnimationFrame(animateRoverScene);

    if (roverModel && roverAutoRotate) {
        roverModel.rotation.y += 0.003;
    }

    roverControls.update();
    roverRenderer.render(roverScene, roverCamera);
}

// ===== CHASIS SCENE (vista 2: solo chasis + tracción, 4 ruedas) =====
function initChasisScene() {
    // Scene
    chasisScene = new THREE.Scene();
    chasisScene.background = new THREE.Color(0x000000);

    // Camera — escala real (metros)
    chasisCamera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        50
    );
    chasisCamera.position.set(2.2, 1.4, 2.2);

    // Renderer
    chasisRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    chasisRenderer.setSize(window.innerWidth, window.innerHeight);
    chasisRenderer.shadowMap.enabled = true;
    chasisRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('chasis-canvas-container').appendChild(chasisRenderer.domElement);

    // Controls
    chasisControls = new THREE.OrbitControls(chasisCamera, chasisRenderer.domElement);
    chasisControls.target.set(0, 0, 0);
    chasisControls.enableDamping = true;
    chasisControls.dampingFactor = 0.05;
    chasisControls.minDistance = 0.3;
    chasisControls.maxDistance = 6;
    chasisControls.autoRotate = true;
    chasisControls.autoRotateSpeed = 0.5;
    chasisControls.enablePan = false;
    chasisControls.enableZoom = false;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    chasisScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd4a3, 1.2);
    mainLight.position.set(20, 30, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    chasisScene.add(mainLight);

    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight1.position.set(-10, 10, -10);
    chasisScene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(0, -10, 0);
    chasisScene.add(fillLight2);

    // Add stars
    addStars(chasisScene);

    // Build chassis + 4-wheel digital twin
    buildChasisDigitalTwin();

    // Start Animation
    animateChasisScene();
}

function buildChasisDigitalTwin() {
    chasisModel = new THREE.Group();
    chasisScene.add(chasisModel);

    const core = new THREE.Group();
    chasisModel.add(core);

    const loadingEl = document.getElementById('chasis-loading');
    const loadingText = document.querySelector('#chasis-loading .hero-loading-text');

    addChasisParts(core, (loaded, pending) => {
        if (loadingText) {
            loadingText.textContent = 'Cargando Chasis... ' + Math.round((loaded / pending) * 100) + '%';
        }
    }, () => {
        if (loadingEl) loadingEl.style.display = 'none';
        centerDigitalTwin(chasisModel, chasisCamera, chasisControls, 1.6);
    });
}

function animateChasisScene() {
    requestAnimationFrame(animateChasisScene);

    if (chasisModel && chasisAutoRotate) {
        chasisModel.rotation.y += 0.003;
    }

    chasisControls.update();
    chasisRenderer.render(chasisScene, chasisCamera);
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

// ===== BRAZO SCENE (gemelo digital articulado) =====
// Portado desde rover-dashboard/index.html (_buildRobot) — mismos pivotes y ejes
// de PIVOTES_BRAZO.md (cadena cinemática J1..J5 validada con export SolidWorks real).
// Estático: se muestra en pose Home (todas las articulaciones en 0°), sin conexión
// en vivo al robot -- solo para visualización correcta de la geometría real.
function initBrazoScene() {
    // Scene
    brazoScene = new THREE.Scene();
    brazoScene.background = new THREE.Color(0x000000);

    // Camera — el rig queda en escala real (metros), no en el escalado x5 del resto
    // de secciones, por eso usa una cámara mucho más cercana.
    brazoCamera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        50
    );
    brazoCamera.position.set(1.1, 0.6, 1.1);

    // Renderer
    brazoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    brazoRenderer.setSize(window.innerWidth, window.innerHeight);
    brazoRenderer.shadowMap.enabled = true;
    brazoRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('brazo-canvas-container').appendChild(brazoRenderer.domElement);

    // Controls
    brazoControls = new THREE.OrbitControls(brazoCamera, brazoRenderer.domElement);
    brazoControls.target.set(0, 0, 0);
    brazoControls.enableDamping = true;
    brazoControls.dampingFactor = 0.05;
    brazoControls.minDistance = 0.3;
    brazoControls.maxDistance = 3;
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

    // Build articulated Brazo digital twin
    buildBrazoDigitalTwin();

    // Start Animation
    animateBrazoScene();
}

function buildBrazoDigitalTwin() {
    brazoModel = new THREE.Group(); // grupo raíz — SOLO rotation.y se anima aquí, sin offset propio
    brazoScene.add(brazoModel);

    // "core" contiene la cadena cinemática real. Se centra sobre su propio
    // centroide (en centerDigitalTwin) ANTES de que brazoModel reciba su
    // rotación inicial -- si se centra después de rotar, el pivote de rotación
    // de brazoModel queda en un punto arbitrario (el origen local de joint1,
    // no el centro de la figura) y el modelo "orbita" en vez de girar sobre sí
    // mismo (bug detectado 2026-08-17: "el centro de rotación está muy grande").
    const core = new THREE.Group();
    brazoModel.add(core);

    const loadingEl = document.getElementById('brazo-loading');
    const loadingText = document.querySelector('#brazo-loading .hero-loading-text');

    addArmParts(core, (loaded, pending) => {
        if (loadingText) {
            loadingText.textContent = 'Cargando Brazo Robótico... ' + Math.round((loaded / pending) * 100) + '%';
        }
    }, () => {
        if (loadingEl) loadingEl.style.display = 'none';
        centerDigitalTwin(brazoModel, brazoCamera, brazoControls, 1.7);
    });
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

    if (chasisCamera && chasisRenderer) {
        chasisCamera.aspect = width / height;
        chasisCamera.updateProjectionMatrix();
        chasisRenderer.setSize(width, height);
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
    // Rover (vista 1, completa) arranca primero -- dispara la carga de chasis y
    // brazo, que Chasis (vista 2) y Brazo (vista 4) reaprovechan vía loadSTLCached
    // en vez de volver a descargar/parsear los mismos STL.
    setTimeout(initRoverScene, 100);
    setTimeout(initChasisScene, 150);
    setTimeout(initBrazoScene, 200);
    setTimeout(initModuloScene, 300);
    setTimeout(initRoverInfoStar, 600);
});

window.addEventListener('resize', onWindowResize, false);