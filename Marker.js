import * as THREE from "three";

// Funktion zum Erstellen eines Markers
function createMarker(h, b, pxx, pxz, text, x, y, z, r) {
    const geometry = new THREE.PlaneGeometry(b, h);
    const material = new THREE.MeshStandardMaterial({ color: 0xbebdb8, side: THREE.DoubleSide });
    
    // Canvas für den Text
    const canvas = document.createElement('canvas');
    canvas.width = pxx;
    canvas.height = pxz;
    const context = canvas.getContext('2d');
    context.font = '50px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    material.map = new THREE.CanvasTexture(canvas);
    const marker = new THREE.Mesh(geometry, material);
    marker.rotation.y = Math.PI*r;
    marker.position.set(x, y, z);
    
    return marker;
}

export const proberaumlagerMarker = createMarker(0.5, 1, 256, 128, "zum Lager", 4, 1.5, -10, 1);
export const lagerMarker = createMarker(1, 2, 256, 128, "Start", -12, 10, 4, 0);
// export const proberaumMarker = createMarker(1, 2, 256, 128, "Proberaum", 6.3, 10, -15, 0);
export const leavelagerMarker = createMarker(0.5, 2, 512, 128, "zur Übersicht", -12.5, 1.5, -2, 0);
export const leaveproberaumMarker = createMarker(0.5, 2, 512, 128, "zur Übersicht", 2, 1.5, -10, 1);
export const lagerproberaumMarker = createMarker(0.5, 2, 512, 128, "zum Gesteinsraum", -12.5, 1.5, 8, 1);
export const toMischraumMarker = createMarker(0.5, 1.5, 384, 128, "zum Mischer", 6, 1.5, -10, 1);
export const leaveMischraum = createMarker(0.5, 1.5, 512, 128, "zur Übersicht", -3, 1.5, 6, 1.5);
export const toMarshallMarker = createMarker(0.5, 1, 640, 128, "zum Marshall-Verdichter", -8, 2, 4.5, 2)
export const leaveMarshall = createMarker(0.5, 1.5, 512, 128, "zur Übersicht", -3, 1.5, 3, 1.5);
// export let totalProzentMesh = createMarker(1, 0.5, 256, 128, "Total: 0%", 8, 2, -16.75, -2);

export let markers = [lagerMarker, leaveproberaumMarker, proberaumlagerMarker, lagerproberaumMarker, leavelagerMarker, leaveMischraum, toMarshallMarker, leaveMarshall];  // Die Marker-Objekte
export let activeMarkers = [lagerMarker, leaveproberaumMarker, proberaumlagerMarker, lagerproberaumMarker, leavelagerMarker, leaveMischraum, toMarshallMarker, leaveMarshall];  // Die aktiven Marker (wird leer sein, wenn in einem Viewpoint)

lagerproberaumMarker.visible = false;
toMarshallMarker.visible = false;

// // Marker für den Proberaum zum Lagerraum
// let proberaumlagerMarkerGeometry = new THREE.PlaneGeometry(1, 0.5);
// let proberaumlagerMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0xbebdb8 ,side: THREE.DoubleSide })  

// // Text Canvas erstellen
// let canvas_Probe_Lager = document.createElement('canvas');
// canvas_Probe_Lager.width = 256;  // Breite des Canvas
// canvas_Probe_Lager.height = 128;  // Höhe des Canvas
// let context_Probe_Lager = canvas_Probe_Lager.getContext('2d');
// context_Probe_Lager.font = '50px Arial';
// context_Probe_Lager.fillStyle = 'white';

// // Textausrichtung und Basislinie setzen, um Text zu zentrieren
// context_Probe_Lager.textAlign = 'center';  // Horizontal zentriert
// context_Probe_Lager.textBaseline = 'middle';  // Vertikal zentriert

// context_Probe_Lager.fillText("zum Lager", canvas_Probe_Lager.width / 2, canvas_Probe_Lager.height / 2);  // Text

// let texture_Probe_Lager = new THREE.CanvasTexture(canvas_Probe_Lager);
// proberaumlagerMarkerMaterial.map = texture_Probe_Lager;

// let proberaumlagerMarker = new THREE.Mesh(proberaumlagerMarkerGeometry, proberaumlagerMarkerMaterial);
// proberaumlagerMarker.rotation.y = Math.PI;
// proberaumlagerMarker.position.set(4, 1.5, -10);  // Setze den Marker an die gewünschte Position im Proberaum
// scene.add(proberaumlagerMarker);