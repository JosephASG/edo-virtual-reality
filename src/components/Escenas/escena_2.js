import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
export default function Escena2() {
    let camera, scene, renderer;
    let cube;
    let light;

    init();
    animate();

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);
        document.body.appendChild(VRButton.createButton(renderer));

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        light = new THREE.PointLight(0xffffff, 1, 10);
        scene.add(light);

        // Event listener para cambiar el tamaño de la ventana
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render() {
        const time = performance.now() * 0.001; // Convertir el tiempo en segundos

        // Resolver la ecuación diferencial para la posición
        const position = solveODE(time);
        cube.position.y = position;

        // Resolver la ecuación diferencial para la intensidad de luz
        const intensity = solveLightODE(time);
        light.intensity = intensity;

        renderer.render(scene, camera);
    }

    function solveODE(time) {
        // Ejemplo de una EDO simple: oscilación armónica simple
        const amplitude = 1; // Amplitud de la oscilación
        const frequency = 0.5; // Frecuencia de la oscilación
        const position = amplitude * Math.sin(2 * Math.PI * frequency * time);

        return position;
    }

    function solveLightODE(time) {
        // Ejemplo de una EDO simple para la intensidad de luz: oscilación luminosa
        const amplitude = 1; // Amplitud de la oscilación luminosa
        const frequency = 0.5; // Frecuencia de la oscilación luminosa
        const intensity = amplitude * Math.sin(2 * Math.PI * frequency * time) + 1; // Aseguramos que la intensidad sea positiva

        return intensity;
    }
}