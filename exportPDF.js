import { jsPDF } from 'jspdf';
import fs from 'fs';

export function exportPDF() {
  // Lire le JSON uniquement au moment de l'appel
  if (!fs.existsSync('./dictionary.json')) {
    console.error("dictionary.json n'existe pas. Génération échouée.");
    return;
  }

  const dictionary = JSON.parse(fs.readFileSync('./dictionary.json', 'utf-8'));

  const doc = new jsPDF();
  let y = 10;

  dictionary.forEach(col => {
    doc.setFontSize(14);
    doc.text(`Collection: ${col.collection}`, 10, y);
    y += 7;

    if (col.description) {
      doc.setFontSize(11);
      doc.text(`Description: ${col.description}`, 12, y);
      y += 7;
    }

    col.fields.forEach(field => {
      doc.setFontSize(10);
      doc.text(`- ${field.name} (${field.type})${field.required ? ', required' : ''}`, 15, y);
      y += 6;
      if (y > 280) { 
        doc.addPage(); 
        y = 10; 
      }
    });

    y += 10;
  });

  doc.save('dictionary.pdf');
  console.log('PDF généré : dictionary.pdf');
}
