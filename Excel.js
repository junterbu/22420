// excel_export_virtual_lab.js
import * as XLSX from 'https://unpkg.com/xlsx/xlsx.mjs'
import { eimerWerte, neueSieblinie } from './Gesteinsraum.js';
import { Rohdichten, bitumenAnteil } from './Mischraum.js';
import { raumdichten } from './Marshall.js';

export function generateExcelAfterMarshall() {
    // Daten für die Excel-Tabelle vorbereiten
    const materialData = Object.entries(eimerWerte).map(([material, value]) => ({
        Material: material,
        'Eimerwerte (%)': value,
    }));

    // Extrahiere alle Material-Werte
    const materialValues = materialData.map(item => item.Material);
    const eimerwerteValues = materialData.map(item => item['Eimerwerte (%)']);

    const parameterData = [
        { Parameter: 'Bindemittelgehalt (%)', Value: bitumenAnteil },
        ...Rohdichten.map((rho, index) => ({ Parameter: `Rohdichte ${index + 1} (g/cm³)`, Value: rho })),
        ...raumdichten.map((rho, index) => ({ Parameter: `Raumdichte ${index + 1} (g/cm³)`, Value: rho })),
    ];

    // Sieblinienwerte (als Beispiel, basierend auf vorhandenen Daten)
    const sieblinieData = [
        { "Sieve Size (mm)": 0.063, "Accumulated Passing (%)": neueSieblinie[0] },
        { "Sieve Size (mm)": 0.125, "Accumulated Passing (%)": neueSieblinie[1] },
        { "Sieve Size (mm)": 0.25, "Accumulated Passing (%)": neueSieblinie[2] },
        { "Sieve Size (mm)": 0.5, "Accumulated Passing (%)": neueSieblinie[3] },
        { "Sieve Size (mm)": 1, "Accumulated Passing (%)": neueSieblinie[4] },
        { "Sieve Size (mm)": 2, "Accumulated Passing (%)": neueSieblinie[5] },
        { "Sieve Size (mm)": 4, "Accumulated Passing (%)": neueSieblinie[6] },
        { "Sieve Size (mm)": 8, "Accumulated Passing (%)": neueSieblinie[7] },
        { "Sieve Size (mm)": 11.2, "Accumulated Passing (%)": neueSieblinie[8] },
        { "Sieve Size (mm)": 16, "Accumulated Passing (%)": neueSieblinie[9] },
        { "Sieve Size (mm)": 22.4, "Accumulated Passing (%)": neueSieblinie[10] },
        { "Sieve Size (mm)": 31.5, "Accumulated Passing (%)": neueSieblinie[11] },
        { "Sieve Size (mm)": 45, "Accumulated Passing (%)": neueSieblinie[12] },
    ];

    // Arbeitsblätter erstellen
    const materialSheet = XLSX.utils.json_to_sheet(materialData);
    
    
    const parameterSheet = XLSX.utils.json_to_sheet(parameterData);
    const sieblinieSheet = XLSX.utils.json_to_sheet(sieblinieData);

    // Workbook erstellen
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, materialSheet, 'Material Übersicht');
    XLSX.utils.sheet_add_aoa(workbook, [["Asphaltmischung: z.B. AC 11 deck A1"]], {Origin: "A1:L1"});

    
    // Workbook speichern
    XLSX.writeFile(workbook, 'Labor_Daten.xlsx');

    console.log('Excel-Datei Labor_Daten.xlsx wurde erfolgreich erstellt!');
}