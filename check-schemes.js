const fs = require('fs');

console.log('🔍 Checking data/schemes.json...\n');

try {
  const data = JSON.parse(fs.readFileSync('./data/schemes.json', 'utf8'));
  
  console.log(`📊 Total schemes: ${data.schemes.length}\n`);
  
  console.log('Last 10 schemes:');
  data.schemes.slice(-10).forEach(s => {
    console.log(`  ${s.scheme_id}: ${s.scheme_name} (${s.category})`);
  });
  
  console.log('\n✅ Checking for required fields in new schemes...\n');
  
  const newSchemeIds = ['SCH_043', 'SCH_044', 'SCH_045', 'SCH_046', 'SCH_047', 'SCH_048', 'SCH_049', 'SCH_050', 'SCH_051', 'SCH_052'];
  
  newSchemeIds.forEach(id => {
    const scheme = data.schemes.find(s => s.scheme_id === id);
    if (scheme) {
      const hasRequiredDocs = scheme.REQUIRED_DOCUMENTS && Array.isArray(scheme.REQUIRED_DOCUMENTS);
      const hasOnlineLink = scheme.online_apply_link !== undefined;
      const hasCategory = scheme.category !== undefined;
      
      console.log(`${id}: ${scheme.scheme_name}`);
      console.log(`  ✓ Category: ${scheme.category}`);
      console.log(`  ${hasRequiredDocs ? '✓' : '✗'} REQUIRED_DOCUMENTS: ${hasRequiredDocs ? scheme.REQUIRED_DOCUMENTS.length + ' docs' : 'MISSING'}`);
      console.log(`  ${hasOnlineLink ? '✓' : '✗'} online_apply_link: ${scheme.online_apply_link}`);
      console.log('');
    } else {
      console.log(`❌ ${id}: NOT FOUND\n`);
    }
  });
  
  console.log('✅ Validation complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
