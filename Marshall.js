// Marshall.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './Allgemeines.js';
import { renderer, camera } from './View_functions.js';
import { Rohdichte, bitumenAnteil } from './Mischraum.js';
import { eimerWerte } from './Gesteinsraum.js';

const loader = new GLTFLoader();

let animationMixer;
let buttonOn; // Der Button aus der GLB-Datei
let action; // Die Animation selbst
let clock = new THREE.Clock(); // Uhr für präzise Delta-Zeit
const FPS = 24; // Frame-Rate

let probekörper; // Referenz auf das Objekt

// Funktion zum Laden und Einfügen des Modells
function loadMarshallModel() {
    loader.load(
        'Assets/Marshall.glb', // Pfad zur GLB
        (gltf) => {
            const marshallModel = gltf.scene;
            marshallModel.position.set(-8.5, 0.025, 1); // Positionierung in der Szene
            scene.add(marshallModel);

            // Animationen initialisieren
            if (gltf.animations.length > 0) {
                animationMixer = new THREE.AnimationMixer(marshallModel);
                action = animationMixer.clipAction(gltf.animations[0]);

                // Setze die Animationseigenschaften
                action.setLoop(THREE.LoopOnce); // Animation nur einmal abspielen
                action.clampWhenFinished = true; // Animation hält an, wenn sie endet
                action.timeScale = 24 / FPS; // Geschwindigkeit der Animation

                // Suche nach dem Button "button_on" und dem Objekt "Probekörper" in der Szene
                marshallModel.traverse((child) => {
                    if (child.isMesh) {
                        if (child.name === 'Button_on') {
                            buttonOn = child;
                            console.log('Button "Button_on" gefunden:', buttonOn);
                        }
                        if (child.name === 'Probekörper') {
                            probekörper = child;
                            probekörper.visible = false; // Standardmäßig unsichtbar
                            console.log('Probekörper gefunden:', probekörper);
                        }
                    }
                });

                // Überprüfen, ob der Button gefunden wurde
                if (buttonOn) {
                    window.addEventListener('click', (event) => {
                        const raycaster = new THREE.Raycaster();
                        const mouse = new THREE.Vector2();

                        // Mausposition normalisieren
                        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                        raycaster.setFromCamera(mouse, camera);

                        // Prüfen, ob der Button getroffen wird
                        const intersects = raycaster.intersectObject(buttonOn, true);
                        if (intersects.length > 0) {
                            console.log('Button "button_on" wurde angeklickt!');
                            playAnimation(); // Animation abspielen
                        }
                    });
                } else {
                    console.warn('Button "button_on" wurde in der GLB-Datei nicht gefunden.');
                }
            }
        },
        undefined,
        (error) => {
            console.error('Fehler beim Laden des Modells:', error);
        }
    );
}

let animationCompleted = false; // Variable zur Verfolgung des Animationsstatus

// Update-Funktion für Animation und Sichtbarkeitssteuerung
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Zeitdifferenz in Sekunden
    if (animationMixer) {
        animationMixer.update(delta); // Animation basierend auf Delta-Zeit aktualisieren

        // Sichtbarkeitssteuerung basierend auf der Zeit
        if (action) {
            const currentFrame = action.time * FPS; // Aktueller Frame basierend auf der Zeit
            if (probekörper) {
                if (currentFrame >= 115 && !probekörper.visible) {
                    probekörper.visible = true; // Sichtbar machen
                    console.log('Probekörper ist jetzt sichtbar.');
                }
            }
        }

        if (action && action.isRunning() === false && !animationCompleted) {
            animationCompleted = true; // Setze den Status auf abgeschlossen
            const rhoRM = Rohdichte;
            const bitumenGehalt = parseFloat(bitumenAnteil) || 0;
            const raumdichte = berechneRaumdichte(rhoRM, bitumenGehalt, eimerWerte);

            if (raumdichte) {
                updatePlaneText(`Raumdichte: ${raumdichte.toFixed(3)} g/cm³`);
            }
        }
    }

    renderer.render(scene, camera);
}

// Modul initialisieren
function init() {
    loadMarshallModel();
    animate();
}

init();


// Funktion zur Berechnung von Hohlraumgehalt basierend auf Größtkorn mit Zufallsbereich
function getHohlraumgehalt(maxKorn) {
    // Werte für H_M,bit aus der Abbildung
    const hohlraumTabelle = {
        0: 0,
        0.63: 28,
        2: 24,
        4: 20.2,
        8: 17.2,
        11: 14.4,
        16: 12.4,
        22: 11,
        32: 10
    };

    const baseValue = hohlraumTabelle[maxKorn] || null; // Basiswert aus der Tabelle
    if (baseValue === null) {
        updatePlaneText("kein Gestein ausgew.");
        return null;
    } else {
        updatePlaneText("Marshall-Verdichter starten")
    }

    // Zufälligen Wert im Bereich +-0.5 hinzufügen
    const randomFactor = (Math.random() - 0.5) * 1; // Bereich: [-0.5, 0.5]
    const randomizedValue = baseValue + randomFactor;
    return randomizedValue.toFixed(2); // Auf zwei Dezimalstellen runden
}

const eimeraktuell = eimerWerte


// Funktion zur Berechnung des Größtkorns
export function berechneGroesstkorn(eimeraktuell) {
    let maxKorn = 0;

    // Iteriere durch alle Schlüssel im Objekt
    for (const [key, value] of Object.entries(eimeraktuell)) {
        if (value > 0) {
            // Extrahiere das Größtkorn aus dem Eimerbereich
            const bereich = key.split('/');
            const obergrenze = bereich.length > 1 ? parseInt(bereich[1]) : 0;

            if (obergrenze > maxKorn) {
                maxKorn = obergrenze;
            }
        }
    }

    return maxKorn;
}

// Funktion zur Berechnung der Raumdichte
function berechneRaumdichte(rhoRM, bitumenAnteil, eimerWerte) {
    const maxKorn = berechneGroesstkorn(eimerWerte);
    const hohlraumgehalt = getHohlraumgehalt(maxKorn);

    if (!hohlraumgehalt) {
        return null;
    }

    let HFB = Math.random() * (85 - 75) + 75;
    let H_bit = (hohlraumgehalt/100) -  (HFB/100) * (hohlraumgehalt/100)

    console.log(HFB, H_bit)

    // Berechnung der Raumdichte
    const rhoA = rhoRM - rhoRM * H_bit
    return rhoA;
}

// Plane und Text erstellen
let canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 128;
let context = canvas.getContext('2d');
context.font = '40px Arial';
context.fillStyle = 'white';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('Marshall-Verdichter starten', canvas.width / 2, canvas.height / 2);

let texture = new THREE.CanvasTexture(canvas);
let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
let planeGeometry = new THREE.PlaneGeometry(1, 0.5); // Breite und Höhe der Plane
let planeMesh = new THREE.Mesh(planeGeometry, material);
planeMesh.position.set(-7, 1.5, 1); // Setze die Position im Raum
scene.add(planeMesh);

function updatePlaneText(newText) {
    context.clearRect(0, 0, canvas.width, canvas.height); // Lösche den alten Text
    context.fillText(newText, canvas.width / 2, canvas.height / 2); // Zeichne den neuen Text
    texture.needsUpdate = true; // Aktualisiere die Textur
}


function playAnimation() {
    if (action) {
        action.reset(); // Setze die Animation zurück
        action.timeScale = 24 / FPS; // Anpassung der Abspielgeschwindigkeit
        probekörper.visible = false; // Sichtbarkeit zurücksetzen
        updatePlaneText('Marshall-Verdichter läuft...'); // Text aktualisieren
        animationCompleted = false; // Animationsstatus zurücksetzen
        action.play(); // Starte die Animation
    }
}

document.getElementById('bitumenRange').addEventListener('input', () => {
    updatePlaneText('Marshall-Verdichter starten');
});