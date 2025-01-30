// Marshall.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './Allgemeines.js';
import { renderer, camera } from './View_functions.js';
import { Rohdichten, bitumenAnteil, bitumengehalt, dichteBitumen } from './Mischraum.js';
import { canvasSieblinie, eimerWerte, selectedMix } from './Gesteinsraum.js';
import { isMobileDevice } from './Allgemeines.js';
import { generatePDFReport } from './Excel.js';

const inputEvent = isMobileDevice() ? 'touchstart' : 'click';

const loader = new GLTFLoader();

let animationMixer;
let buttonOn; // Der Button aus der GLB-Datei
let action; // Die Animation selbst
let clock = new THREE.Clock(); // Uhr für präzise Delta-Zeit
const FPS = 1; // Frame-Rate

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
                    window.addEventListener(inputEvent, (event) => {
                        const mouse = new THREE.Vector2();
                        if (inputEvent === 'touchstart') {
                            const touch = event.touches[0];
                            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
                        } else {
                            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                        }
                        
                        const raycaster = new THREE.Raycaster();
                        raycaster.setFromCamera(mouse, camera);
                    
                        const intersects = raycaster.intersectObject(buttonOn, true);
                        if (intersects.length > 0) {
                            console.log('Button "button_on" wurde angeklickt!');
                            playAnimation();
                            animate();
                            // generateExcelAfterMarshall();
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
export let raumdichten = Array(3).fill(null).map(() => Array(4).fill(null)); // 3 Rohdichten mit je 4 Raumdichten
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
        
        
            for (let i = 0; i < Rohdichten.length; i++) {
                if (Rohdichten[i] !== null) {
                    raumdichten[i] = berechneRaumdichte(Rohdichten[i], bitumengehalt[i], eimerWerte, selectedMix);
                }
            }
            console.log(raumdichten)
            console.log(Rohdichten)
            context.clearRect(0, 0, canvas.width, canvas.height); // Lösche den alten Text
            context.font = '20px Arial'; // Kleinere Schrift für mehrere Werte
            let startX = 125;
            let startY = 75;
            let lineHeight = 30;
            let colWidth = 175; // Spaltenbreite
            let rowHeight = 50; // Zeilenhöhe

            context.fillText("Raumdichten Übersicht:", canvas.width / 2, 20);

            // Werte anzeigen
            for (let i = 0; i < raumdichten.length; i++) {
                for (let j = 0; j < raumdichten[i].length; j++) {
                    const value = raumdichten[i][j];
                    if (value !== null) {
                        context.fillText(
                            `R${i + 1}-${j + 1}: ${value} g/cm³`,
                            startX + j * colWidth,
                            startY + i * rowHeight
                        );
                    } else {
                        context.fillText(
                            `R${i + 1}-${j + 1}: N/A`,
                            startX + j * colWidth,
                            startY + i * rowHeight
                        );
                    }
                }
            }
            
            
            const sieblinieCanvas = document.querySelector("#canvas-container canvas"); // Sieblinie Canvas abrufen
            generatePDFReport(selectedMix, eimerWerte, bitumengehalt, Rohdichten, raumdichten, canvasSieblinie);
            texture.needsUpdate = true; // Textur aktualisieren
        }
    }

    renderer.render(scene, camera);
}

// Modul initialisieren
function init() {
    loadMarshallModel();
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
    const randomFactor = (1 - 0.95) * (Math.random()-0.5); // Bereich: [-0.025, 0.025]
    const randomizedValue = baseValue + randomFactor;
    return baseValue; // Auf zwei Dezimalstellen runden
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

function berechneParabel(bitumenAnteil, selectedMix) {
    let Bx = 0;

    if (selectedMix == "AC 11 deck A1") {
        return Bx = 5+0.4*Math.random();
    } else if (selectedMix == "AC 22 bin H1") {
        return Bx = 4.3+0.4*Math.random();
    } else if (selectedMix == "AC 32 trag T3") {
        return Bx = 4+0.4*Math.random();
    }

    let By = 0.95 + 0.1*Math.random();

    let Ax = Bx - 1;
    let Ay = By - 0.05;
    let Cx = Bx + 1;
    let Cy = By - 0.05;

    let A = [
        [Ax**2, Ax, 1],
        [Bx**2, Bx, 1],
        [Cx**2, Cx, 1]
    ];

    let B = [Ay, By, Cy];

    function inverseMatrix(matrix) {
        const det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

        if (det === 0) throw new Error("Matrix ist nicht invertierbar");

        const inv = [
            [ (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) / det,
             -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]) / det,
              (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) / det],
            [-(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) / det,
              (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) / det,
             -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]) / det],
            [ (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) / det,
             -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]) / det,
              (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) / det]
        ];
        return inv;
    }

    function multiplyMatrixVector(matrix, vector) {
        return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    }

    const A_inv = inverseMatrix(A);
    const [a, b, c] = multiplyMatrixVector(A_inv, B);
    
    
    const y = a*(bitumenAnteil*100)**2 + b*bitumenAnteil*100 + c;
    console.log("this is:", y)
    return y; 
} 


// Funktion zur Berechnung der Raumdichte
function berechneRaumdichte(rhoRM, bitumenAnteil, eimerWerte, selectedMix) {
    const maxKorn = berechneGroesstkorn(eimerWerte);
    const hohlraumgehalt = getHohlraumgehalt(maxKorn);

    if (!hohlraumgehalt) {
        return Array(4).fill(null); // Wenn keine gültigen Werte, fülle mit null
    }

    let raumdichtenSet = [];
    for (let i = 0; i < 4; i++) {
        let HFB = Math.random() * (85 - 75) + 75; // Zufälliger Wert zwischen 75 und 85
        let H_bit = (hohlraumgehalt/100) - (HFB / 100) * (hohlraumgehalt/100);
        console.log(H_bit)
        let rhoA = rhoRM - rhoRM * H_bit; // Berechnung der Raumdichte
        let rhoA_fitted = berechneParabel(bitumenAnteil,selectedMix)*rhoA;
        raumdichtenSet.push(rhoA_fitted.toFixed(3));
    }
    return raumdichtenSet;
}

// Plane und Text erstellen
let canvas = document.createElement('canvas');
canvas.width = 768;
canvas.height = 256;
let context = canvas.getContext('2d');
context.font = '40px Arial';
context.fillStyle = 'white';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('Marshall-Verdichter starten', canvas.width / 2, canvas.height / 2);

let texture = new THREE.CanvasTexture(canvas);
let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
let planeGeometry = new THREE.PlaneGeometry(3, 1.25); // Breite und Höhe der Plane
let planeMesh = new THREE.Mesh(planeGeometry, material);
planeMesh.position.set(-6, 2, 1); // Setze die Position im Raum
scene.add(planeMesh);

function updatePlaneText(newText) {
    context.clearRect(0, 0, canvas.width, canvas.height); // Lösche den alten Text
    context.font = '30px Arial'; // Anpassung für bessere Lesbarkeit
    let lines = newText.split('\n');
    lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, (canvas.height / 4) * (index + 1));
    });
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

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


