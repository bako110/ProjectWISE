import { generateDictionary } from './generator.js';
import { exportPDF } from './exportPDF.js';

async function main() {
  // Générer le dictionnaire
  await generateDictionary();

  // Puis générer le PDF
  exportPDF();
}

main();
