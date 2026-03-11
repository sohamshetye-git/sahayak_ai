const fs = require('fs');

console.log('📦 Adding remaining 8 schemes to data/schemes.json...\n');

// Load the 8 remaining scheme files
const schemeFiles = [
  { file: './scheme-045-health-rbsk.json', id: 'SCH_045' },
  { file: './scheme-046-agriculture-pkvy.json', id: 'SCH_046' },
  { file: './scheme-047-education-prematric-obc.json', id: 'SCH_047' },
  { file: './scheme-048-health-rksk.json', id: 'SCH_048' },
  { file: './scheme-049-health-npcdcs.json', id: 'SCH_049' },
  { file: './scheme-050-agriculture-nmsa.json', id: 'SCH_050' },
  { file: './scheme-051-financial-pmsby.json', id: 'SCH_051' },
  { file: './scheme-052-financial-standup.json', id: 'SCH_052' }
];

// Load main schemes file
const mainData = JSON.parse(fs.readFileSync('./data/schemes.json', 'utf8'));
console.log(`Current schemes in data/schemes.json: ${mainData.schemes.length}\n`);

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
fs.writeFileSync('./data/schemes.json', JSON.stringify(mainData, null, 2), 'utf8');

console.log(`\n✅ Successfully added ${addedCount} schemes!`);
console.log(`📊 Total schemes now: ${mainData.schemes.length}\n`);
