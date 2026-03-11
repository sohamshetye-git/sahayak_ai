const fs = require('fs');

console.log('📦 Adding 10 new schemes (SCH_053 to SCH_062) to all schemes.json files...\n');

// Load the 10 new scheme files
const schemeFiles = [
  { file: './scheme-053-education-nsp.json', id: 'SCH_053' },
  { file: './scheme-054-education-pmshri.json', id: 'SCH_054' },
  { file: './scheme-055-health-abhwc.json', id: 'SCH_055' },
  { file: './scheme-056-agriculture-pmkmy.json', id: 'SCH_056' },
  { file: './scheme-057-finance-mudra-tarun.json', id: 'SCH_057' },
  { file: './scheme-058-health-pmmvy.json', id: 'SCH_058' },
  { file: './scheme-059-agriculture-pmksy.json', id: 'SCH_059' },
  { file: './scheme-060-education-samagra.json', id: 'SCH_060' },
  { file: './scheme-061-finance-pmjdy.json', id: 'SCH_061' },
  { file: './scheme-062-health-ayushman.json', id: 'SCH_062' }
];

// Files to update
const targetFiles = [
  './data/schemes.json',
  './backend/data/schemes.json',
  './frontend/public/data/schemes.json'
];

// Process each target file
targetFiles.forEach(targetFile => {
  console.log(`\n🔄 Processing ${targetFile}...`);
  
  try {
    // Load main schemes file
    const mainData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    console.log(`Current schemes: ${mainData.schemes.length}`);

    // Load and add each scheme
    let addedCount = 0;
    schemeFiles.forEach(({ file, id }) => {
      try {
        const schemeData = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        // Check if already exists
        const exists = mainData.schemes.find(s => s.scheme_id === id);
        if (exists) {
          console.log(`⚠️  ${id} already exists, skipping...`);
        } else {
          mainData.schemes.push(schemeData);
          console.log(`✅ Added ${id}: ${schemeData.scheme_name}`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
      }
    });

    // Save updated file
    fs.writeFileSync(targetFile, JSON.stringify(mainData, null, 2), 'utf8');
    console.log(`✅ Successfully added ${addedCount} schemes to ${targetFile}`);
    console.log(`📊 Total schemes now: ${mainData.schemes.length}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
  }
});

console.log('\n🎉 All schemes.json files updated successfully!');