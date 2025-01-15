import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from "three";
import {scene} from "./Allgemeines.js"
import {camera} from "./View_functions.js";
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import {lagerproberaumMarker} from "./Marker.js";
import { isMobileDevice } from './Allgemeines.js';

const inputEvent = isMobileDevice() ? 'touchstart' : 'click';

// Erstellen einer Instanz des DRACOLoaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Pfad zum Draco-Decoder (kann angepasst werden)

// GLTFLoader, um Modelle (Gebäude, Eimer, Siebturm) zu laden
export const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); //nur wenn datei mit Draco komprimiert!
loader.setMeshoptDecoder(MeshoptDecoder);

// Raycaster und Mauskoordinaten definieren
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

export function createEimerLabel(eimerName, position) {
    let labelGeometry = new THREE.PlaneGeometry(0.4, 0.2);  // Schildgröße
    let labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // Text Canvas erstellen
    let canvas = document.createElement('canvas');
    canvas.width = 256;  // Breite des Canvas
    canvas.height = 128;  // Höhe des Canvas
    let context = canvas.getContext('2d');
    context.font = '50px Arial';
    context.fillStyle = 'white';
    
    // Textausrichtung und Basislinie setzen, um Text zu zentrieren
    context.textAlign = 'center';  // Horizontal zentriert
    context.textBaseline = 'middle';  // Vertikal zentriert

    context.fillText(eimerName, canvas.width / 2, canvas.height / 2);  // Eimername als Text

    let texture = new THREE.CanvasTexture(canvas);
    labelMaterial.map = texture;
    
    let label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.rotation.y = -Math.PI / 2;  // 90 Grad um die Y-Achse
    label.position.set(position.x, position.y + 0.5, position.z);  // Schild über dem Eimer platzieren
    
    label.name=eimerName

    return label;
}

// Anleitungsschild erstellen
let anleitungCanvas = document.createElement('canvas');
anleitungCanvas.width = 640;
anleitungCanvas.height = 256;
let anleitungContext = anleitungCanvas.getContext('2d');
anleitungContext.fillStyle = 'white';
anleitungContext.font = '30px Arial';
anleitungContext.textAlign = 'center';
anleitungContext.textBaseline = 'middle';

// Mehrzeiliger Text
let textLines = [
    "Willkommen im virtuellen Labor!",
    "Klicken Sie auf einen Eimer,",
    "um ihn in den Proberaum zu verschieben."
];

// Startposition und Zeilenabstand
let lineHeight = 40; // Abstand zwischen den Zeilen
let startY = anleitungCanvas.height / 2 - (lineHeight * (textLines.length - 1)) / 2;

// Text zeilenweise schreiben
textLines.forEach((line, index) => {
    anleitungContext.fillText(line, anleitungCanvas.width / 2, startY + index * lineHeight);
});

let anleitungTexture = new THREE.CanvasTexture(anleitungCanvas);
let anleitungMaterial = new THREE.MeshBasicMaterial({ map: anleitungTexture });
let anleitungGeometry = new THREE.PlaneGeometry(3, 1);
let anleitungMesh = new THREE.Mesh(anleitungGeometry, anleitungMaterial);

anleitungMesh.rotation.y = Math.PI*1;
// Position des Schilds im Lagerraum
anleitungMesh.position.set(-13, 1.5, 7);
scene.add(anleitungMesh);

export let eimerPositionen = [
    { name: 'Füller', position: new THREE.Vector3(-10.9, 1.124, 3.25) },
    { name: '0/2', position: new THREE.Vector3(-10.9, 1.124, 3.75) },
    { name: '2/4', position: new THREE.Vector3(-10.9, 1.124, 4.25) },
    { name: '4/8', position: new THREE.Vector3(-10.9, 1.124, 4.75) },
    { name: '8/11', position: new THREE.Vector3(-10.9, 1.124, 5.25) },
    { name: '11/16', position: new THREE.Vector3(-10.9, 1.124, 5.75) },
    { name: '16/22', position: new THREE.Vector3(-10.9, 1.124, 6.25) },
    { name: '22/32', position: new THREE.Vector3(-10.9, 1.124, 6.75) },
];

export let proberaumPositionen = [
    new THREE.Vector3(7.25, 0, -16),  
    new THREE.Vector3(7.25, 0, -15.5), 
    new THREE.Vector3(7.25, 0, -15),   
    new THREE.Vector3(7.25, 0, -14.5),   
    new THREE.Vector3(8, 0, -16),
    new THREE.Vector3(8, 0, -15.5),
    new THREE.Vector3(8, 0, -15),
    new THREE.Vector3(8, 0, -14.5),     
];

// Erstelle für jeden Eimer ein Schild und füge es der Szene hinzu
export let schildchen = [];  // Liste für die Schildchen
export let eimerMeshes = [];  // Liste für die Eimer (Mesh-Objekte)

// Liste für die Schilder im Proberaum
export let schildchenProberaum = [];

// Lade das GLTF-Modell (das deine Eimer enthält)
loader.load('Assets/Eimer.glb', function(gltf) {
    scene.add(gltf.scene)
    // Annahme: Die Eimer sind in der Szene als separate Objekte (z.B. durch Namen)
    let currentEimerIndex = 0;
    // Iteriere durch alle Objekte in der GLTF-Szene und finde die Eimer
    gltf.scene.traverse(function (child) {
        if (child.isMesh && child.name.startsWith('Cylinder') && currentEimerIndex < eimerPositionen.length) {  // Beispiel: Eimername beginnt mit "Eimer"
            eimerMeshes.push(child);
            console.log(`Eimer gefunden: ${child.name}`);
            currentEimerIndex++;  
        }
    });

    // Erstelle Schildchen über jedem Eimer
    eimerPositionen.forEach((eimer, index) => {
        let label = createEimerLabel(eimer.name, eimer.position);
        schildchen.push(label);  // Füge das Schild zur Liste der klickbaren Objekte hinzu
        scene.add(label);  // Füge das Schild zur Szene hinzu
        console.log(`Schild für ${eimer.name} erstellt und hinzugefügt`);
    });
});

// Raycasting-Interaktion hinzufügen: Eimer vom Lager in den Proberaum verschieben
window.addEventListener(inputEvent, function(event) {
    const mouse = new THREE.Vector2();
    if (inputEvent === 'touchstart') {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);
    // Prüfe, ob ein Schildchen im Lager angeklickt wurde
    let intersects = raycaster.intersectObjects(schildchen);  // `schildchen` bezieht sich auf die Lager-Schilder

    if (intersects.length > 0) {
        let clickedLabel = intersects[0].object;
        console.log(`Schild im Lager angeklickt: ${clickedLabel.name}`);  // Zeigt den Namen des geklickten Schilds an

        // Finde heraus, welches Schild angeklickt wurde (Index)
        let eimerIndex = schildchen.indexOf(clickedLabel);

        if (eimerIndex !== -1) {
            // Bewege den entsprechenden Eimer in den Proberaum
            let eimerMesh = eimerMeshes[eimerIndex];

            // Setze den Eimer und das Schildchen unsichtbar im Lager
            eimerMesh.visible = false;
            clickedLabel.visible = false;

            // Anleitung unsichtbar machen
            anleitungMesh.visible = false;

            // Proberaum Marker sichtbar machen
            lagerproberaumMarker.visible = true; 

            // Bewege das Eimer-Mesh in den Proberaum und mache es dort sichtbar
            let eimerMeshClone = eimerMesh.clone();  // Optional: Klonen, falls du Kopien im Proberaum willst
            eimerMeshClone.position.copy(proberaumPositionen[eimerIndex]);  // Setze die neue Position im Proberaum
            eimerMeshClone.visible = true;  // Sichtbar im Proberaum
            scene.add(eimerMeshClone);  // Füge das duplizierte Eimer-Mesh in die Szene ein

            // Bewege das zugehörige Schildchen ebenfalls in den Proberaum
            let schildClone = clickedLabel.clone();  // Klone das Schild
            schildClone.position.set(
                proberaumPositionen[eimerIndex].x,
                proberaumPositionen[eimerIndex].y + 0.7,  // Schild über dem Eimer
                proberaumPositionen[eimerIndex].z
            );
            schildClone.visible = true;  // Sichtbar im Proberaum
            scene.add(schildClone);  // Füge das Schild in den Proberaum ein

            // Füge das geklonte Schild zur Liste der Proberaumschilder hinzu
            schildchenProberaum.push(schildClone);  // Füge das **Objekt**, nicht den Namen hinzu

            console.log(`Eimer ${eimerPositionen[eimerIndex].name} in den Proberaum bewegt und im Lager entfernt`);
        }
    }
});