import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

let camera, scene, renderer;
let cube;
let phaseSpaceLines = [];
let mu = 1.0; // Valor de mu en el oscilador de Van der Pol

const gui = new dat.GUI();

init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const gridHelper = new THREE.GridHelper(5, 10);
    scene.add(gridHelper);

    const vanDerPolParams = {
        mu: 1.0, // Valor de mu en el oscilador de Van der Pol
    };

    const vanDerPolFolder = gui.addFolder('Van der Pol Oscillator');
    vanDerPolFolder.add(vanDerPolParams, 'mu', 0, 10, 0.1).name('Mu').onChange((value) => {
        mu = value;
        updatePhaseSpaceLines();
    });

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    generatePhaseSpaceLines();

    // Event listener para cambiar el tamaño de la ventana
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function generatePhaseSpaceLines() {
    const numPoints = 1000; // Número de puntos en el diagrama de fase
    const dt = 0.01; // Paso de tiempo en la simulación
    let x = Math.random() - 0.5; // Valor inicial de x
    let y = Math.random() - 0.5; // Valor inicial de y

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < numPoints; i++) {
        const prevX = x;
        const prevY = y;

        // Ecuaciones de Van der Pol
        const dx = y;
        const dy = mu * (1 - x * x) * y - x;

        x += dx * dt;
        y += dy * dt;

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(prevX, prevY, 0), new THREE.Vector3(x, y, 0)]);
        const line = new THREE.Line(lineGeometry, material);
        phaseSpaceLines.push(line);
        scene.add(line);
    }
}

function updatePhaseSpaceLines() {
    const numPoints = phaseSpaceLines.length;
    const dt = 0.01; // Paso de tiempo en la simulación
    let x = Math.random() - 0.5; // Valor inicial de x
    let y = Math.random() - 0.5; // Valor inicial de y

    for (let i = 0; i < numPoints; i++) {
        const prevX = x;
        const prevY = y;

        // Ecuaciones de Van der Pol
        const dx = y;
        const dy = mu * (1 - x * x) * y - x;

        x += dx * dt;
        y += dy * dt;

        const line = phaseSpaceLines[i];
        const lineGeometry = line.geometry;
        lineGeometry.attributes.position.array[0] = prevX;
        lineGeometry.attributes.position.array[1] = prevY;
        lineGeometry.attributes.position.array[3] = x;
        lineGeometry.attributes.position.array[4] = y;
        lineGeometry.attributes.position.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001; // Tiempo en segundos
    const position = interpolatePosition(time);

    cube.position.copy(position);

    renderer.render(scene, camera);
}

function interpolatePosition(time) {
    const numPoints = phaseSpaceLines.length;
    const phaseTime = numPoints * 0.01; // Tiempo total del diagrama de fase
    const phaseIndex = Math.floor((time % phaseTime) / 0.01); // Índice del punto en el diagrama de fase

    const line = phaseSpaceLines[phaseIndex];
    const lineGeometry = line.geometry;
    const positions = lineGeometry.attributes.position.array;

    const t = (time % 0.01) / 0.01; // Interpolación entre los puntos vecinos
    const prevX = positions[0];
    const prevY = positions[1];
    const nextX = positions[3];
    const nextY = positions[4];

    const interpolatedX = prevX + t * (nextX - prevX);
    const interpolatedY = prevY + t * (nextY - prevY);

    return new THREE.Vector3(interpolatedX, interpolatedY, 0);
}
