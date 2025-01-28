import * as THREE from "three";
import {camera} from "./View_functions.js";
import {loader} from "./Lager.js";
import {scene} from "./Allgemeines.js";
import {eimerWerte} from "./Gesteinsraum.js";
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {toMarshallMarker} from "./Marker.js";

// Erstellen einer Instanz des DRACOLoaders (aktivieren wenn Datei mit Draco Komprimiert)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Pfad zum Draco-Decoder (kann angepasst werden)

// Raycaster und Mauskoordinaten definieren
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Globale Variable für den Bitumenanteil und die Rohdichte
export let bitumenAnteil = 0;
let dichteMaterial = 2.7; // Beispielwert für die Dichte des Materials (in g/cm³)
let dichteFuller = 2.65;
let dichteBitumen = 1.02; // Dichte von Bitumen (in g/cm³)

// Event-Listener für den Bitumen-Schieberegler
document.getElementById('bitumenRange').addEventListener('input', function() {
    bitumenAnteil = parseFloat(this.value);
    document.getElementById('bitumenValue').textContent = `${bitumenAnteil}%`;
});

//Anzeige Rohdichte
export let Rohdichten = [null, null, null];  // Neue Variable für die Rohdichte

// Erstelle ein Canvas für die 3D-Anzeige der Rohdichte
let canvasRohdichte = document.createElement('canvas');
canvasRohdichte.width = 512;
canvasRohdichte.height = 192;
let contextRohdichte = canvasRohdichte.getContext('2d');
contextRohdichte.font = '30px Arial';
contextRohdichte.fillStyle = 'white';
contextRohdichte.textAlign = 'center';
contextRohdichte.textBaseline = 'middle';

// Initialer Text
// Zweizeiliger Text
const line1 = "Bitumengehalt einstellen";
const line2 = "und grünen Knopf drücken";

// Zeichne die erste Zeile (oben)
contextRohdichte.fillText(line1, canvasRohdichte.width / 2, canvasRohdichte.height / 3);

// Zeichne die zweite Zeile (unten)
contextRohdichte.fillText(line2, canvasRohdichte.width / 2, (canvasRohdichte.height / 3) * 2);


// Erstelle eine Textur und ein Material aus dem Canvas
let textureRohdichte = new THREE.CanvasTexture(canvasRohdichte);
let materialRohdichte = new THREE.MeshStandardMaterial({ map: textureRohdichte, side: THREE.DoubleSide });

// Erstelle ein Geometrieobjekt und verbinde es mit dem Material
let RohdichteGeometry = new THREE.PlaneGeometry(1.25, 0.5); // Größeres Plane für alle drei Werte
let RohdichteMesh = new THREE.Mesh(RohdichteGeometry, materialRohdichte);

// Platziere den Text über einem Marker
RohdichteMesh.rotation.y = Math.PI*2.5;
RohdichteMesh.position.set(-9.75, 2.1, 5.25); 
scene.add(RohdichteMesh);


// Funktion zur dynamischen Aktualisierung der Rohdichte im 3D-Text
function updateRohdichteDisplay() {
    contextRohdichte.clearRect(0, 0, canvasRohdichte.width, canvasRohdichte.height);
    let startX = 250; // Abstand von der linken Seite
    let startY = 50; // Abstand von oben für die erste Zeile
    let lineHeight = 50; // Abstand zwischen den Zeilen

    for (let i = 0; i < Rohdichten.length; i++) {
        if (Rohdichten[i] !== null) {
            contextRohdichte.fillText(`Rohdichte ${i + 1}: ${Rohdichten[i].toFixed(3)} g/cm³`, startX, startY + i * lineHeight);
        }
    }
    textureRohdichte.needsUpdate = true;
}

let currentStep = 0;
// Funktion zur Berechnung der Rohdichte des Materials
function berechneRohdichte() {
    if (currentStep == 2) {
        toMarshallMarker.visible = true;
    } else if (currentStep >= 3) {
        console.warn("Alle drei Rohdichten wurden bereits berechnet.");
        alert("Alle drei Rohdichten wurden bereits berechnet.");
        toMarshallMarker.visible = true;
        return;
    } 

    let eimerWertFuller = eimerWerte['Füller'];
    let Faktor = 100 / (100 - bitumenAnteil);
    let MAG = (100 - eimerWertFuller) / Faktor;
    let MAF = eimerWertFuller / Faktor;

    let dichteGesamt = (dichteBitumen * bitumenAnteil +
                        dichteFuller * MAF +
                        dichteMaterial * MAG) / 100;

    Rohdichten[currentStep] = dichteGesamt;
    updateRohdichteDisplay();
    currentStep++;
}

document.getElementById('bitumenRange').addEventListener('input', function() {
    bitumenAnteil = parseFloat(this.value);
    document.getElementById('bitumenValue').textContent = `${bitumenAnteil}%`;
});

// Knopf-Klick-Ereignis zum Berechnen der Rohdichte
//document.getElementById('calculateDensity').addEventListener('click', berechneRohdichte); //nur notwendig wenn ein extra Button zur Berechnung angesteuert wird. 

// Knopfname aus dem GLTF-Modell, "MixButton"
let mixButton;

loader.setDRACOLoader(dracoLoader); //nur wenn datei mit Draco komprimiert!
loader.setMeshoptDecoder(MeshoptDecoder);

// Laden des GLTF-Modells und Identifizieren des Knopfes
loader.load('Assets/Mixbutton.glb', function(loadedGltf) {
    scene.add(loadedGltf.scene)
    // Suche den Knopf in der GLTF-Szene und gebe alle Namen der gefundenen Objekte aus
    loadedGltf.scene.traverse(function(child) {
        if (child.isMesh) {
            if (child.name === "MixButton") {
                mixButton = child;
                console.log("MixButton gefunden:", mixButton); // Ausgabe zur Überprüfung
            }
        }
    });

    // Überprüfen, ob MixButton gefunden wurde
    if (!mixButton) {
        console.warn("MixButton wurde im GLTF-Modell nicht gefunden. Überprüfen Sie den Namen im Modell.");
    }
}, undefined, function(error) {
    console.error("Fehler beim Laden des GLTF-Modells:", error);
});

import { isMobileDevice } from './Allgemeines.js';

const inputEvent = isMobileDevice() ? 'touchstart' : 'click';

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

    if (mixButton) {
        let intersects = raycaster.intersectObjects([mixButton]);
        if (intersects.length > 0) {
            console.log("MixButton wurde angeklickt!");
            berechneRohdichte();
        }
    }
});
