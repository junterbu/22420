// import Chart from "chart.js/auto";

export function generatePDFReport(mischgutName, eimerWerte, bitumengehalt, Rohdichten, raumdichten, sieblinieCanvas) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let startY = 10;

    // Titel
    pdf.setFontSize(16);
    pdf.text("Virtueller Laborbericht - Asphaltmischung", 105, startY, { align: "center" });
    startY += 10;

    // Mischgut
    pdf.setFontSize(12);
    pdf.text(`Asphaltmischung: ${mischgutName}`, 10, startY);
    startY += 10;

    // Eimerwerte Tabelle
    pdf.text("Eimerwerte [%]:", 10, startY);
    startY += 5;

    const eimerHeaders = ["Füller", "0/2", "2/4", "4/8", "8/11", "11/16", "16/22", "22/32"];
    const eimerData = [Object.values(eimerWerte)];
    pdf.autoTable({
        startY,
        head: [eimerHeaders],
        body: eimerData,
    });
    startY = pdf.lastAutoTable.finalY + 10;

    // Sieblinie
    if (sieblinieCanvas) {
        pdf.text("Sieblinie:", 10, startY);
        startY += 5;
        const sieblinieImage = sieblinieCanvas.toDataURL("image/png");
        pdf.addImage(sieblinieImage, "PNG", 10, startY, 180, 100);
    }

    startY += 100;

    // Bindemittel und Rohdichten
    pdf.text("Bindemittelgehalt [%]:", 10, startY);
    startY += 5;

    const biHeaders = ["Bitumengehalt 1", "Bitumengehalt 2", "Bitumengehalt 3"];
    const biData = [bitumengehalt.flat()];
    pdf.autoTable({
        startY,
        head: [biHeaders],
        body: biData,
    });
    startY = pdf.lastAutoTable.finalY + 10;

    // Bindemittel und Rohdichten
    pdf.text("Rohdichten [g/cm³]:", 10, startY);
    startY += 5;

    const rohHeaders = ["Rohdichte 1", "Rohdichte 2", "Rohdichte 3"];
    const rohData = [Rohdichten.flat()];
    pdf.autoTable({
        startY,
        head: [rohHeaders],
        body: rohData,
    });
    startY = pdf.lastAutoTable.finalY + 10;    

    // Raumdichten
    pdf.text("Raumdichten [g/cm³]:", 10, startY);
    startY += 5;

    const raumHeaders = ["R1-1", "R1-2", "R1-3", "R1-4", "R2-1", "R2-2", "R2-3", "R2-4", "R3-1", "R3-2", "R3-3", "R3-4"];
    const raumData = [raumdichten.flat()];
    pdf.autoTable({
        startY,
        head: [raumHeaders],
        body: raumData,
    });
    startY = pdf.lastAutoTable.finalY + 10;

    // Speichern der PDF
    pdf.save("Laborbericht.pdf");
}