import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


export default function Escena1() {
    let camera, scene, renderer;
    let cube;
    let amplitude = 1; // Variable de amplitud
    let frequency = 1; // Variable de frecuencia
    let time = 0; // Variable de tiempo

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
        document.querySelector('.canvas').appendChild(renderer.domElement);
        document.querySelector('.canvas').appendChild(VRButton.createButton(renderer));
        const controls = new OrbitControls(camera, renderer.domElement);

        const gridHelper = new THREE.GridHelper(5, 10);
        scene.add(gridHelper);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const gui = new dat.GUI();

        // Obtener el controlador de la amplitud y la frecuencia
        const amplitudeController = gui.add({ amplitude: 1 }, 'amplitude', 0, 2, 0.1).name('Amplitud');
        const frequencyController = gui.add({ frequency: 1 }, 'frequency', 0, 5, 0.1).name('Frecuencia');

        // Actualizar la posición del cubo al modificar la amplitud
        amplitudeController.onChange(() => {
            amplitude = amplitudeController.object.amplitude;
        });

        // Actualizar la posición del cubo al modificar la frecuencia
        frequencyController.onChange(() => {
            frequency = frequencyController.object.frequency;
        });

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
        time += 0.01; // Incrementar el tiempo en cada frame

        // Resolver la ecuación diferencial
        const position = solveODE(time);

        cube.position.y = position;

        renderer.render(scene, camera);
    }

    function solveODE(time) {
        // Ejemplo de una EDO simple: movimiento armónico simple
        const position = amplitude * Math.cos(2 * Math.PI * frequency * time);

        return position;
    }
}
