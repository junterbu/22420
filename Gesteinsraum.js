import * as THREE from "three";
import {scene} from "./Allgemeines.js"
import {schildchenProberaum} from "./Lager.js";
import {goToMischraum, camera,} from "./View_functions.js";
import {toMischraumMarker} from "./Marker.js";
// import { eimerWerte, currentEimer } from "./Daten.js";

// Raycaster und Mauskoordinaten definieren
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Raycasting für die Eimer-Labels im Proberaum (Prozentsatzauswahl)
window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Prüfe, ob ein Schildchen im Proberaum angeklickt wurde
    let intersects = raycaster.intersectObjects(schildchenProberaum);  // Proberaum-Schilder

    if (intersects.length > 0) {
        let clickedLabel = intersects[0].object;
        console.log(`Schild im Proberaum angeklickt: ${clickedLabel.name}`);  // Zeigt den Namen des geklickten Schilds an

        // Öffne den Schieberegler für den angeklickten Eimer im Proberaum
        showPercentageUI(clickedLabel.name);
    };
});

let totalProzent = 0;  // Neue Variable für den Gesamtprozentsatz

// Erstelle ein Canvas für die 3D-Anzeige des Gesamtprozentsatzes
let canvasTotalProzent = document.createElement('canvas');
canvasTotalProzent.width = 256;
canvasTotalProzent.height = 128;
let contextTotalProzent = canvasTotalProzent.getContext('2d');
contextTotalProzent.font = '50px Arial';
contextTotalProzent.fillStyle = 'white';
contextTotalProzent.textAlign = 'center';
contextTotalProzent.textBaseline = 'middle';

// Initialer Text
contextTotalProzent.fillText('Total: 0%', canvasTotalProzent.width / 2, canvasTotalProzent.height / 2);

// Erstelle eine Textur und ein Material aus dem Canvas
let textureTotalProzent = new THREE.CanvasTexture(canvasTotalProzent);
let materialTotalProzent = new THREE.MeshStandardMaterial({ map: textureTotalProzent, side: THREE.DoubleSide });

// Erstelle ein Geometrieobjekt und verbinde es mit dem Material
let totalProzentGeometry = new THREE.PlaneGeometry(1, 0.5);  // Größe des 3D-Texts
let totalProzentMesh = new THREE.Mesh(totalProzentGeometry, materialTotalProzent);

// Platziere den Text über einem Marker (z. B. proberaumMarker)
totalProzentMesh.rotation.y = Math.PI*-2.5;
totalProzentMesh.position.set(8, 2, -16.5);  // Beispielposition über dem Proberaum-Marker
scene.add(totalProzentMesh);

// Funktion zur dynamischen Aktualisierung des Gesamtprozentsatzes im 3D-Text
function updateTotalPercentageDisplay() {
    contextTotalProzent.clearRect(0, 0, canvasTotalProzent.width, canvasTotalProzent.height);
    contextTotalProzent.fillText(`Total: ${totalProzent}%`, canvasTotalProzent.width / 2, canvasTotalProzent.height / 2);
    textureTotalProzent.needsUpdate = true;  // Aktualisiere die Textur im 3D-Raum
}



// Globale Variablen
export let eimerWerte = {
    'Füller': 0,
    '0/2': 0,
    '2/4': 0,
    '4/8': 0,
    '8/11': 0,
    '11/16': 0,
    '16/22': 0,
    '22/32': 0
};

export let currentEimer = null;  // Diese Variable muss global initialisiert werden

function showPercentageUI(eimerName) {
    // Falls schon ein Schieberegler angezeigt wird, verstecke ihn
    let uiContainer = document.getElementById('uiContainer');

    // Setze den aktuellen Eimer
    currentEimer = eimerName;

    // Zeige die UI an und aktualisiere die Werte für den aktuellen Eimer
    uiContainer.style.display = 'block';
    
    // Aktualisiere den Text des Labels mit dem Namen des Eimers
    document.querySelector('label[for="percentRange"]').textContent = `Prozentsatz aus Eimer ${eimerName}:`;

    // Setze den Schiebereglerwert und die Anzeige
    document.getElementById('percentRange').value = eimerWerte[eimerName];
    document.getElementById('percentValue').textContent = `${eimerWerte[eimerName]}%`;
};

// Event-Listener für Schieberegler-Änderungen
document.getElementById('percentRange').addEventListener('input', function() {
    const eimerName = currentEimer; // Aktueller Eimer
    const selectedValue = parseInt(this.value);
  
    // Prüfen, ob Gesamtprozentsatz überschritten wird
    const difference = selectedValue - eimerWerte[eimerName];
    if (totalProzent + difference > 100) {
      alert("Du kannst insgesamt nur maximal 100% entnehmen.");
      this.value = eimerWerte[eimerName]; // Zurücksetzen auf vorherigen Wert
      return;
    }
  
    // Prozentwert und Gesamtsumme aktualisieren
    eimerWerte[eimerName] = selectedValue;
    totalProzent += difference;
  
    document.getElementById("percentValue").textContent = `${selectedValue}%`;
  
    // 3D-Anzeige des Gesamtprozentsatzes aktualisieren
    updateTotalPercentageDisplay();
  
    // Sieblinie aktualisieren
    aktualisiereSieblinie();
});

let sieblinien = {
    "Füller" : [76.5, 95, 99.8, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    "0/2" : [5.89, 9.92, 20.44, 35.26, 53.57, 87.24, 100, 100, 100, 100, 100, 100],
    "2/4" : [0.87, 0.95, 0.99, 1.02, 1.31, 6.79, 93.4, 100, 100, 100, 100, 100],
    "4/8" : [0.53, 0.59, 0.61, 0.63, 0.69, 0.84, 7.06, 94.16, 100, 100, 100, 100],
    "8/11" : [0.53, 0.62, 0.66, 0.70, 0.75, 0.84, 0.96, 9.89, 94.35, 100, 100, 100],
    "11/16" : [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.8, 7.00, 89.2, 100, 100],
    "16/22" : [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 10.9, 80.5, 100],
    "22/32" : [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 10.9, 80.5, 100], //hier noch richtige Werte eintragen!
}


function berechneGesamtsieblinie() {
    let gesamtsieblinie = Array(12).fill(0);; // Länge des Gesamtsieblinien-Arrays

    for (let eimer in eimerWerte) {
        let prozent = eimerWerte[eimer] / 100;
        let sieblinie = sieblinien[eimer];
        
        // Sicherstellen, dass das spezifische Sieblinien-Array vorhanden ist
        if (sieblinie && sieblinie.length > 0) {
            for (let i = 0; i < sieblinie.length; i++) {
                gesamtsieblinie[i] += sieblinie[i] * prozent;
            }
        }
    }
    return gesamtsieblinie;
}

function zeichneSieblinie(sieblinie) {
    let canvasWidth = 512;
    let canvasHeight = 256;
    let paddingLeft = 50;  // Abstand links für Y-Achsen-Beschriftung
    let paddingBottom = 30;  // Abstand unten für X-Achsen-Beschriftung
    let paddingTop = 30;  // Abstand oben für Titel
    let paddingRight = 20;  // Rechter Rand

    let canvasSieblinie = document.createElement('canvas');
    canvasSieblinie.width = canvasWidth;
    canvasSieblinie.height = canvasHeight + paddingBottom + paddingTop;  // Platz für Titel und X-Achse
    let contextSieblinie = canvasSieblinie.getContext('2d');

    // Hintergrundfarbe setzen
    contextSieblinie.fillStyle = 'white'; // Weißer Hintergrund wie im Beispielbild
    contextSieblinie.fillRect(0, 0, canvasSieblinie.width, canvasSieblinie.height);

    // Gitternetzlinien zeichnen (horizontal und vertikal)
    contextSieblinie.strokeStyle = '#e0e0e0';  // Hellgrau für Gitternetzlinien
    contextSieblinie.lineWidth = 1;

    // Horizontalen Linien (Y-Achse) zeichnen
    for (let i = 0; i <= 10; i++) {
        let y = paddingTop + i * ((canvasHeight - paddingTop) / 10);
        contextSieblinie.beginPath();
        contextSieblinie.moveTo(paddingLeft, y);
        contextSieblinie.lineTo(canvasWidth - paddingRight, y);
        contextSieblinie.stroke();
    }

    // Vertikale Linien (X-Achse) zeichnen
    let xLabels = [0.063, 0.125, 0.25, 0.5, 1, 2, 4, 8, 11.2, 16, 22.4, 31.5]; // Fixe Werte für die X-Achse
    for (let i = 0; i < xLabels.length; i++) {
        let x = paddingLeft + i * ((canvasWidth - paddingLeft - paddingRight) / (xLabels.length - 1));
        contextSieblinie.beginPath();
        contextSieblinie.moveTo(x, paddingTop);
        contextSieblinie.lineTo(x, canvasHeight);
        contextSieblinie.stroke();
    }

    // Achsenbeschriftungen (Y-Achse)
    contextSieblinie.fillStyle = 'black';
    contextSieblinie.font = '12px Arial';
    contextSieblinie.textAlign = 'right';
    contextSieblinie.textBaseline = 'middle';

    for (let i = 0; i <= 10; i++) {
        let y = paddingTop + i * ((canvasHeight - paddingTop) / 10);
        let yLabel = (100 - i * 10).toFixed(2);  // Prozentuale Y-Achse von 0 bis 100
        contextSieblinie.fillText(yLabel, paddingLeft - 10, y);  // Links neben dem Diagramm
    }

    // Achsenbeschriftungen (X-Achse)
    contextSieblinie.textAlign = 'center';
    contextSieblinie.textBaseline = 'top';

    for (let i = 0; i < xLabels.length; i++) {
        let x = paddingLeft + i * ((canvasWidth - paddingLeft - paddingRight) / (xLabels.length - 1));
        contextSieblinie.fillText(xLabels[i], x, canvasHeight + 5);  // Unterhalb des Diagramms
    }

    // Sieblinie zeichnen
    contextSieblinie.strokeStyle = 'green';
    contextSieblinie.lineWidth = 2;
    contextSieblinie.beginPath();

    let xScale = (canvasWidth - paddingLeft - paddingRight) / (xLabels.length - 1);
    let yMax = 100;  // Maximaler Wert auf der Y-Achse
    let yScale = (canvasHeight - paddingTop) / yMax;

    for (let i = 0; i < sieblinie.length; i++) {
        let x = paddingLeft + i * xScale;
        let y = paddingTop + (canvasHeight - paddingTop) - sieblinie[i] * yScale;  // Invertierte Y-Achse
        if (i === 0) {
            contextSieblinie.moveTo(x, y);
        } else {
            contextSieblinie.lineTo(x, y);
        }
    }

    contextSieblinie.stroke();
    
    // Titel über dem Diagramm
    contextSieblinie.textAlign = 'center';
    contextSieblinie.textBaseline = 'top';
    contextSieblinie.font = '16px Arial';
    contextSieblinie.fillText("Sieblinie", canvasSieblinie.width / 2, 5);  // Titel über dem Diagramm

    // **Obere Grenz-Sieblinie** definieren (fiktive Werte, bitte anpassen)
    let obereGrenze = [10, 16, 22, 29, 38, 50, 67, 88, 100, 100, 100, 100];
    
    // **Untere Grenz-Sieblinie** definieren (fiktive Werte, bitte anpassen)
    let untereGrenze = [5, 7.5, 10, 13, 19, 30, 43, 65, 90, 100, 100, 100];
    
    // Obere Grenz-Sieblinie zeichnen
    contextSieblinie.strokeStyle = 'red';  // Rot für die Grenz-Sieblinien
    contextSieblinie.lineWidth = 1;
    contextSieblinie.beginPath();
    for (let i = 0; i < obereGrenze.length; i++) {
        let x = paddingLeft + i * xScale;
        let y = paddingTop + (canvasHeight - paddingTop) - obereGrenze[i] * yScale;  // Invertierte Y-Achse
        if (i === 0) {
            contextSieblinie.moveTo(x, y);
        } else {
            contextSieblinie.lineTo(x, y);
        }
    }
    contextSieblinie.stroke();

    // Untere Grenz-Sieblinie zeichnen
    contextSieblinie.strokeStyle = 'red';  // Rot für die Grenz-Sieblinien
    contextSieblinie.lineWidth = 1;
    contextSieblinie.beginPath();
    for (let i = 0; i < untereGrenze.length; i++) {
        let x = paddingLeft + i * xScale;
        let y = paddingTop + (canvasHeight - paddingTop) - untereGrenze[i] * yScale;  // Invertierte Y-Achse
        if (i === 0) {
            contextSieblinie.moveTo(x, y);
        } else {
            contextSieblinie.lineTo(x, y);
        }
    }
    contextSieblinie.stroke();
    return canvasSieblinie;
}


// Globale Variablen für die Sieblinie-Textur und das Mesh
let textureSieblinie;
let sieblinieMesh;

function zeigeSieblinieMarker() {
    // Berechne die Gesamtsieblinie
    let gesamtsieblinie = berechneGesamtsieblinie();
    
    // Zeichne die Sieblinie
    let canvasSieblinie = zeichneSieblinie(gesamtsieblinie);
    textureSieblinie = new THREE.CanvasTexture(canvasSieblinie);
    let materialSieblinie = new THREE.MeshBasicMaterial({ map: textureSieblinie, side: THREE.DoubleSide });
    let planeGeometry = new THREE.PlaneGeometry(3, 1.5);  // Größe der Sieblinie-Anzeige
    
    // Initialisiere das Mesh und platziere es
    sieblinieMesh = new THREE.Mesh(planeGeometry, materialSieblinie);
    sieblinieMesh.position.set(8, 2, -14);
    sieblinieMesh.rotation.y = -Math.PI / 2;
    scene.add(sieblinieMesh);
}

// Funktion zur Aktualisierung der Sieblinie
function aktualisiereSieblinie() {
    // Berechne die neue Sieblinie basierend auf den aktuellen Prozentwerten
    let neueSieblinie = berechneGesamtsieblinie();
    
    // Zeichne die neue Sieblinie
    let canvasNeueSieblinie = zeichneSieblinie(neueSieblinie);
    
    // Aktualisiere die Textur des Sieblinie-Markers
    textureSieblinie.image = canvasNeueSieblinie;
    textureSieblinie.needsUpdate = true;  // Aktualisiere die Textur in der Szene

    // Überprüfen, ob die Sieblinie innerhalb der Grenzen liegt
    if (SieblinienGrenzanalyse(neueSieblinie) == true) {
        toMischraumMarker.visible = true; // Marker sichtbar machen
    } else {
        toMischraumMarker.visible = false; // Marker verstecken
    }
}

zeigeSieblinieMarker();

function SieblinienGrenzanalyse(sieblinie) {
    // Obere Grenz-Sieblinie 
    let obereGrenze = [10, 16, 22, 29, 38, 50, 67, 88, 100, 100, 100, 100];
    
    // Untere Grenz-Sieblinie
    let untereGrenze = [5, 7.5, 10, 13, 19, 30, 43, 65, 90, 100, 100, 100];

    for (let i = 0; i < sieblinie.length; i++) {
        if (sieblinie[i] < untereGrenze[i] || sieblinie[i] > obereGrenze[i]) {
            return false; // Sieblinie liegt außerhalb der Grenzen
        }
    }
    return true; // Sieblinie liegt innerhalb der Grenzen
}

window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Prüfen, ob der Raycaster den Raumwechsel-Marker trifft
    let intersects = raycaster.intersectObjects([toMischraumMarker]);

    if (intersects.length > 0 && intersects[0].object === toMischraumMarker) {
        // toMischraum ausführen, z.B.:
        goToMischraum(); // nach Raumziel
    }
});