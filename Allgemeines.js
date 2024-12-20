import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { camera, renderer} from "./View_functions.js";
import {TWEEN} from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';


// Erstellen einer Instanz des DRACOLoaders (aktivieren wenn Datei mit Draco Komprimiert)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Pfad zum Draco-Decoder (kann angepasst werden)

// Setup der Three.js Szene
export let scene = new THREE.Scene();

const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

// Licht hinzufügen
export let ambientLight = new THREE.AmbientLight(0xffffff, 0.6);  // Weiches Umgebungslicht
scene.add(ambientLight);

//let directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);  // Richtungslicht
//directionalLight.position.set(1, 1, 0);  // Beispielposition des Lichts
//scene.add(directionalLight);

// Globale Beleuchtung
let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Richtungslicht mit Schatten
export let dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = false;  // Schatten aktivieren
dirLight.shadow.mapSize.width = 512;  // Schattenauflösung
dirLight.shadow.mapSize.height = 512;
scene.add(dirLight);

// const hdrLoader = new RGBELoader(); // Lade HDR-Umgebungstexturen new GLTFLoader();
// hdrLoader.load('Assets/rosendal_park_sunset_puresky_4k.hdr', function(texture) {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = texture; // Verwende die HDR als Hintergrund, und keine Lichtquelle (scene.environment)
// });

scene.background = new THREE.Color(0x87ceeb); // Hellblauer Himmel

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// // Bloom-Effekt hinzufügen
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
// bloomPass.threshold = 0;
// bloomPass.strength = 1.5;
// bloomPass.radius = 0;
// composer.addPass(bloomPass);

// Animation-Loop mit Composer
function animate_renderer() {
    requestAnimationFrame(animate_renderer);
    TWEEN.update(); // Tween-Animationen aktualisieren
    composer.render(); // Verwende Composer anstelle von renderer.render()
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setAntialias();

// GLTFLoader, um Modelle (Gebäude, Eimer, Siebturm) zu laden
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); //nur wenn datei mit Draco komprimiert!
loader.setMeshoptDecoder(MeshoptDecoder);

// Lade das Gebäudemodell
loader.load('Assets/Gesamtmodell-v1.glb', function(gltf) {
    const necessaryNodes = [];
    const geometries = {};
    const materials = {};

    gltf.scene.traverse((node) => {
        if (node.isMesh && node.name.startsWith('Cylinder')) {
            if (!geometries[node.name]) {
                geometries[node.name] = node.geometry;
                materials[node.name] = node.material;
            }
            const instance = new THREE.Mesh(geometries[node.name], materials[node.name]);
            instance.position.copy(node.position);
            instance.rotation.copy(node.rotation);
            instance.scale.copy(node.scale);
            scene.add(instance);
        }
    });
    const optimizedGroup = new THREE.Group();
    necessaryNodes.forEach(node => optimizedGroup.add(node));
    scene.add(optimizedGroup);
}, undefined, function(error) {
    console.error('Fehler beim Laden des GLTF-Modells:', error);
});

animate_renderer(); 