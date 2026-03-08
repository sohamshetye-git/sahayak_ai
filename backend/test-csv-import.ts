import { SchemeDatasetManager } from './src/db/scheme-dataset-manager';
import * as path from 'path';

async function test() {
  const manager = new SchemeDatasetManager();
  const csvPath = path.join(__dirname, '../data/schemes/schemes.csv');
  
  console.log('CSV Path:', csvPath);
  const result = await manager.importFromCSV(csvPath);
  
  console.log('\n=== Import Result ===');
  console.log('Success:', result.success);
  console.log('Total Rows:', result.totalRows);
  console.log('Successful Imports:', result.successfulImports);
  console.log('Failed Imports:', result.failedImports);
  
  if (result.errors.length > 0) {
    console.log('\n=== Errors ===');
    result.errors.forEach(err => {
      console.log(`Row ${err.row}: ${err.message}`);
      if (err.data) {
        console.log('Data:', err.data);
      }
    });
  }
  
  console.log('\n=== Schemes ===');
  result.schemes.forEach(scheme => {
    console.log(`\n${scheme.schemeId}: ${scheme.name}`);
    console.log('  Category:', scheme.category);
    console.log('  State:', scheme.state);
    console.log('  Eligibility:', JSON.stringify(scheme.eligibility, null, 2));
    console.log('  Benefit:', JSON.stringify(scheme.benefit, null, 2));
  });
}

test().catch(console.error);
