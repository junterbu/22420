import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {dirLight} from "./Allgemeines.js";


export let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
document.body.appendChild(renderer.domElement);
renderer.antialias = false;
renderer.outputEncoding = THREE.sRGBEncoding; // Verbessert Farben ohne zusätzlichen Speicherbedarf
renderer.shadowMap.enabled = false; // Nur aktivieren, wenn Schatten notwendig

export let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 5);


// Kamera-Positionen für Lagerraum und Proberaum
let lagerViewpoint = new THREE.Vector3(-12.5, 1.5, 4);
let proberaumViewpoint = new THREE.Vector3(5, 1.5, -15);
let MischraumViewpoint = new THREE.Vector3(-8, 1.5, 7);
let MarshallViewpoint = new THREE.Vector3(-8, 1.5, 3);

//Kameraposition für Lager
export function goToLager() {
    camera.position.set(lagerViewpoint.x, lagerViewpoint.y, lagerViewpoint.z);
    camera.lookAt(-10.9, 1.1, -4.75);

    // Erlaube nur Rotation, kein Zoom
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;  // Behalte die Rotationssteuerung bei

    // Setze das Drehzentrum etwas vor die Kamera
    let targetPosition = new THREE.Vector3(lagerViewpoint.x, lagerViewpoint.y, lagerViewpoint.z - 0.1);
    controls.target.copy(targetPosition);
    controls.update();

    // Blende den `uiContainer`-Schieberegler aus
    document.getElementById('uiContainer').style.display = 'none';
}

export function goToProberaum() {
    camera.position.set(proberaumViewpoint.x, proberaumViewpoint.y, proberaumViewpoint.z);
    camera.lookAt(6.3, 0.77,-16);

    // Erlaube nur Rotation, kein Zoom
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;  // Behalte die Rotationssteuerung bei

    // Setze das Drehzentrum etwas vor die Kamera
    let targetPosition = new THREE.Vector3(proberaumViewpoint.x, proberaumViewpoint.y, proberaumViewpoint.z - 0.1);
    controls.target.copy(targetPosition);
    controls.update();

    // Blende den `uiContainer`-Schieberegler ein
    document.getElementById('uiContainer').style.display = 'block';
}

export function goToMischraum() {
    camera.position.set(MischraumViewpoint.x, MischraumViewpoint.y, MischraumViewpoint.z);
    camera.lookAt(-12, 1.1, -7);

    // Erlaube nur Rotation, kein Zoom
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;  // Behalte die Rotationssteuerung bei

    // Setze das Drehzentrum etwas vor die Kamera
    let targetPosition = new THREE.Vector3(MischraumViewpoint.x, MischraumViewpoint.y, MischraumViewpoint.z - 0.1);
    controls.target.copy(targetPosition);
    controls.update();

    // Blende den `uiContainer`-Schieberegler aus
    document.getElementById('uiContainer').style.display = 'none';

    // Blende den `bitumenUI`-Schieberegler ein
    document.getElementById('bitumenUI').style.display = 'block';
}

export function leaveView() {
    camera.position.set(20, 20, 20);  // Beispielposition für die freie Ansicht
    camera.lookAt(0, 0, 0);
    
    // Kamera-Steuerung komplett freigeben (Zoom und Rotation)
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enabled = true;

    // "Verlasse Ansicht"-Button ausblenden
    document.getElementById('leaveView').style.display = 'none';
    document.getElementById('toProberaum').style.display = 'none';
    document.getElementById('toLager').style.display = 'none';  // Button ausblenden   

    // Blende den `uiContainer`-Schieberegler aus
    document.getElementById('uiContainer').style.display = 'none';

    // Blende den `bitumenUI`-Schieberegler aus
    document.getElementById('bitumenUI').style.display = 'none';
}

export function toMarshall() {
    camera.position.set(MarshallViewpoint.x, MarshallViewpoint.y, MarshallViewpoint.z);
    camera.lookAt(-10.9, 1.1, -4.75);

    // Erlaube nur Rotation, kein Zoom
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;  // Behalte die Rotationssteuerung bei

    // Setze das Drehzentrum etwas vor die Kamera
    let targetPosition = new THREE.Vector3(MarshallViewpoint.x, MarshallViewpoint.y, MarshallViewpoint.z - 0.1);
    controls.target.copy(targetPosition);
    controls.update();

    // Blende den `uiContainer`-Schieberegler aus
    document.getElementById('uiContainer').style.display = 'none';

    // Blende den `bitumenUI`-Schieberegler ein
    document.getElementById('bitumenUI').style.display = 'none';
}

//Orbit Controls
export let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth Camera Movements
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2; // Kamera darf nicht nach unten gehen

// Frame-Rate-Messung und Qualitätsanpassung
let frameTimes = [];
let qualityLevel = 3;

function measureFrameRate() {
    const now = performance.now();
    frameTimes.push(now);

    if (frameTimes.length > 60) {
        frameTimes.shift();
    }

    if (frameTimes.length >= 2) {
        const avgDeltaTime = (frameTimes[frameTimes.length - 1] - frameTimes[0]) / (frameTimes.length - 1);
        const fps = 1000 / avgDeltaTime;

        // Dynamische Anpassung
        if (fps < 30 && qualityLevel > 1) {
            qualityLevel--;
            updateQuality(qualityLevel);
        } else if (fps > 50 && qualityLevel < 3) {
            qualityLevel++;
            updateQuality(qualityLevel);
        }
    }

    requestAnimationFrame(measureFrameRate);
}

function updateQuality(level) {
    switch (level) {
        case 1:
            renderer.setPixelRatio(0.5);
            renderer.antialias = false;
            dirLight.shadow.mapSize.set(256, 256); // Geringere Schattenauflösung
            break;
        case 2:
            renderer.setPixelRatio(1);
            renderer.antialias = true;
            dirLight.shadow.mapSize.set(512, 512);
            break;
        case 3:
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.antialias = true;
            dirLight.shadow.mapSize.set(1024, 1024);
            break;
    }
    dirLight.shadow.needsUpdate = true; // Aktualisiere Schatten
    console.log(`Renderqualität geändert: Level ${level}`);
}


measureFrameRate();