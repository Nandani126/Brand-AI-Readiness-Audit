const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const folderToZip = path.join(__dirname, 'brand-ai-readiness-audit');
const zipFile = path.join(__dirname, 'brand-ai-readiness-audit.zip');

try {
  if (!fs.existsSync(folderToZip)) {
    console.error(`Folder ${folderToZip} does not exist!`);
    process.exit(1);
  }

  const zip = new AdmZip();
  // Add the folder contents (rather than the folder node itself) so that
  // the marketplace.json is in the root of the ZIP
  zip.addLocalFolder(folderToZip);
  zip.writeZip(zipFile);
  
  const stats = fs.statSync(zipFile);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`Success! Created ZIP archive: ${zipFile}`);
  console.log(`Size: ${sizeInMB} MB (Adobe Limit: 50 MB)`);
} catch (err) {
  console.error('Error creating ZIP archive:', err);
  process.exit(1);
}
