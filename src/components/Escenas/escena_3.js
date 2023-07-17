import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export default function Escena3() {
    let camera, scene, renderer;
    let particles = [];
    let selectedParticle = null;

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

        const geometry = new THREE.SphereGeometry(0.05);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        for (let i = 0; i < 100; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.x = Math.random() * 4 - 2; // Posición inicial aleatoria en el rango (-2, 2)
            particle.position.y = Math.random() * 4 - 2;
            particle.position.z = Math.random() * 4 - 2;
            particles.push(particle);
            scene.add(particle);
        }

        // Event listener para cambiar el tamaño de la ventana
        window.addEventListener('resize', onWindowResize, false);
        // Event listener para interactuar con las partículas en realidad virtual
        renderer.xr.addEventListener('selectstart', onSelectStart);
        renderer.xr.addEventListener('selectend', onSelectEnd);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onSelectStart(event) {
        const controller = event.target;
        const intersectedObjects = controller.getIntersectionObjects();

        if (intersectedObjects.length > 0) {
            selectedParticle = intersectedObjects[0];
            selectedParticle.material.color.set(0x00ff00);
        }
    }

    function onSelectEnd() {
        if (selectedParticle) {
            selectedParticle.material.color.set(0xff0000);
            selectedParticle = null;
        }
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render() {
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            if (!particle.userData.velocity) {
                particle.userData.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.01);
            }

            if (selectedParticle && particle === selectedParticle.object) {
                const controller = renderer.xr.getController(0);
                particle.position.copy(controller.position);
            } else {
                particle.position.add(particle.userData.velocity);

                // Aplicar límites al movimiento de las partículas
                const maxPosition = 2;
                if (
                    particle.position.x < -maxPosition ||
                    particle.position.x > maxPosition ||
                    particle.position.y < -maxPosition ||
                    particle.position.y > maxPosition ||
                    particle.position.z < -maxPosition ||
                    particle.position.z > maxPosition
                ) {
                    particle.position.set(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);
                }
            }
        }

        renderer.render(scene, camera);
    }
}