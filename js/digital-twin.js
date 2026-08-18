// ===== GEMELO DIGITAL: PIEZAS Y HELPERS COMPARTIDOS =====
// Usado por rover.js (rover.html) y principal.js (index.html, visor pequeño de
// "Proyecto"). Requiere THREE + THREE.STLLoader cargados antes que este script.

// ----- Cargador de STL con caché -----
// El chasis y el brazo aparecen en varias vistas/páginas distintas; cachear por
// ruta evita descargar y volver a parsear el mismo STL más de una vez (el
// parseo de estos archivos ya es el cuello de botella de carga -- ver notas de
// rendimiento 2026-08-17 en proyecto-rover.md).
const _stlLoader = new THREE.STLLoader();
const _stlCache = {};
function loadSTLCached(path, onLoad) {
    const entry = _stlCache[path];
    if (entry) {
        if (entry.geometry) onLoad(entry.geometry);
        else entry.callbacks.push(onLoad);
        return;
    }
    _stlCache[path] = { geometry: null, callbacks: [onLoad] };
    _stlLoader.load(path, geo => {
        geo.computeVertexNormals();
        _stlCache[path].geometry = geo;
        _stlCache[path].callbacks.forEach(cb => cb(geo));
        _stlCache[path].callbacks = [];
    }, undefined, () => {
        _stlCache[path].callbacks = [];
    });
}

// ----- Piezas compartidas: chasis + 4 ruedas -----
// Portado desde rover-dashboard/index.html (_buildRobot, piezas "flat") -- el
// diseño 2026 pasó de 6 a 4 ruedas; el STL único anterior (ROVER 2025 MOVIL.STL)
// quedó desactualizado. Mismas piezas que usa el gemelo digital real del
// dashboard que controla el rover (y que coincide con el modelo de Gazebo).
// newpowerdrive_2026 (x4, 20MB) y ensamble_final_para_imprimir.stl (29MB) quedan
// fuera -- mesh sobre-teselados, +60s de carga sin aportar detalle visible a
// esta escala (ver notas de rendimiento 2026-08-17).
function addChasisParts(core, onEachLoaded, onAllDone) {
    const ROOT = '../stl/chasis/';

    function _mat(hex, metalness, roughness) {
        return new THREE.MeshStandardMaterial({
            color: hex,
            metalness: metalness ?? 0.4,
            roughness: roughness ?? 0.6,
        });
    }

    const mCh = _mat(0x4a5568);
    const mDk = _mat(0x2d3748);
    const mOr = _mat(0xe3702b);
    const mWh = _mat(0x1a1a2e, 0.1, 0.9);

    const FILES = [
        ...['chasis_2026.stl', 'chasis_2026_2.stl', 'joint.stl',
            'motorholder.stl', 'motorholder_2.stl', 'motorholder_3.stl', 'motorholder_4.stl']
            .map(f => [f, f.startsWith('motor') || f === 'joint.stl' ? mDk : mCh]),
        ...['hipjoint2026.stl', 'hipjoint2026_2.stl'].map(f => [f, mOr]),
        ...['ensamblaje1_v2.stl', 'ensamblaje1_v2_2.stl',
            'ensamblaje1_v2_3.stl', 'ensamblaje1_v2_4.stl'].map(f => [f, mWh]),
        ['guacal.stl', mDk],
    ];

    // Total fijo antes de disparar ninguna carga -- si loadSTLCached resuelve
    // sincrónicamente (archivo ya en caché por otra vista), "pending" debe
    // estar completo desde el inicio o "loaded >= pending" dispara antes de tiempo.
    const pending = FILES.length;
    let loaded = 0;

    FILES.forEach(([file, mat]) => {
        loadSTLCached(ROOT + file, geo => {
            const m = new THREE.Mesh(geo, mat);
            m.scale.setScalar(0.001); // mm -> m, frame del ensamble SolidWorks
            m.castShadow = true;
            m.receiveShadow = true;
            core.add(m);
            loaded++;
            onEachLoaded(loaded, pending);
            if (loaded >= pending) onAllDone();
        });
    });
}

// ----- Piezas compartidas: brazo articulado -----
// Cadena cinemática — pivotes en mm (frame ensamble SolidWorks), ejes en Three.js
// Y-up. Ver PIVOTES_BRAZO.md (rover-dashboard) para la derivación completa.
function addArmParts(core, onEachLoaded, onAllDone) {
    const ROOT = '../stl/brazo/';

    function _mat(hex, metalness, roughness) {
        return new THREE.MeshStandardMaterial({
            color: hex,
            metalness: metalness ?? 0.4,
            roughness: roughness ?? 0.6,
        });
    }

    const PIVOTS = [
        { p: [397.7, 460.0, 608.2], name: 'joint1',
          meshes: [ ['brazo_cadera.stl', _mat(0xf0883e, 0.5, 0.5)] ] },
        { p: [386.0, 693.0, 601.2], name: 'joint2',
          meshes: [ ['brazo_eslabonhombro.stl',    _mat(0x1d4ed8)],
                    ['brazo_eslabonhombropt2.stl', _mat(0xc2410c)] ] },
        { p: [636.7, 1050.4, 597.2], name: 'joint3',
          meshes: [ ['brazo_poleae3pt1.stl', _mat(0x15803d)],
                    ['brazo_poleae3pt2.stl', _mat(0x0e7a3d)] ] },
        { p: [489.4, 1077.8, 601.6], name: 'joint4',
          meshes: [ ['brazo_unionae3.stl',       _mat(0x2f9e5c)],
                    ['brazo_eslabon_ultimo.stl', _mat(0x92400e)],
                    ['brazo_puntae3.stl',        _mat(0xa371f7)],
                    ['brazo_dsw_poignet_differentiel.stl', _mat(0x6d28d9)] ] },
        { p: [40.2, 1162.6, 628.6], name: 'joint5',
          meshes: [] },
    ];

    // Total fijo antes de disparar ninguna carga (mismo motivo que en addChasisParts).
    const pending = PIVOTS.reduce((n, pv) => n + pv.meshes.length, 0);
    let loaded = 0;

    let prevGroup = core, prevPx = 0, prevPy = 0, prevPz = 0;

    PIVOTS.forEach(({ p: [Px, Py, Pz], meshes }, i) => {
        const px = Px * 0.001, py = Py * 0.001, pz = Pz * 0.001;
        const g = new THREE.Group();

        if (i === 0) {
            g.position.set(px, py, pz);
        } else {
            g.position.set(px - prevPx, py - prevPy, pz - prevPz);
        }
        prevGroup.add(g);

        meshes.forEach(([file, mat]) => {
            const off = [-px, -py, -pz];
            loadSTLCached(ROOT + file, geo => {
                const m = new THREE.Mesh(geo, mat);
                m.scale.setScalar(0.001);
                m.position.set(off[0], off[1], off[2]);
                m.castShadow = true;
                m.receiveShadow = true;
                g.add(m);
                loaded++;
                onEachLoaded(loaded, pending);
                if (loaded >= pending) onAllDone();
            });
        });

        prevGroup = g; prevPx = px; prevPy = py; prevPz = pz;
    });

    // J6 — pinza (sin STL propio, no cuenta para pending/loaded -- es síncrono),
    // 60mm más allá de J5 en la muñeca.
    const j6g = new THREE.Group();
    j6g.position.set(-0.060, 0, 0);
    prevGroup.add(j6g);
    const gm6 = _mat(0x991b1b);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.020, 0.060), gm6);
    palm.position.set(-0.040, 0, 0);
    palm.castShadow = true;
    j6g.add(palm);
}

// ----- Centrado + encuadre de cámara -----
// Centra un grupo "model" (con hijo único "core") sobre el centroide real de su
// bounding box, calculado tras cargar todas sus piezas -- evita descentrar el
// modelo con constantes a mano, y evita que el pivote de rotación quede en un
// punto arbitrario en vez del centro de la figura (bug detectado 2026-08-17:
// "el centro de rotación está muy grande" -- el modelo "orbitaba" en vez de
// girar sobre sí mismo). Se mide con rotation.y=0 para no distorsionar el
// centroide con rotación ya acumulada durante la carga, y la rotación inicial
// se aplica DESPUÉS de centrar. "controls" solo necesita implementar
// target/minDistance/maxDistance/update() -- no tiene que ser un OrbitControls
// real (el visor pequeño de index.html usa un stub sin interacción de mouse).
function centerDigitalTwin(model, camera, controls, distanceFactor) {
    if (!model || !camera || !controls) return;
    const core = model.children[0];

    model.rotation.y = 0;
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(core);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.01);

    core.position.sub(center);
    model.rotation.y = Math.PI / 2;

    controls.target.set(0, 0, 0);
    const dir = new THREE.Vector3(1, 0.55, 1).normalize();
    camera.position.copy(dir).multiplyScalar(maxDim * distanceFactor);
    camera.lookAt(controls.target); // redundante con OrbitControls real (su propio
    // update() recalcula lookAt), pero necesario si "controls" es un stub sin
    // interacción de mouse (ver visor de index.html) -- sin esto la cámara queda
    // en la posición correcta pero mirando hacia -Z, mismo bug que ya se corrigió
    // en el visor original de principal.js.
    controls.minDistance = maxDim * 0.4;
    controls.maxDistance = maxDim * 6;
    controls.update();
}
