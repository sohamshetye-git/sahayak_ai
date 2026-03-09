/**
 * Test JSON Integration
 * Verifies the schemes JSON file is properly loaded and accessible
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing JSON Integration\n');

// Test 1: Check source file
console.log('1️⃣ Checking source file (data/schemes.json)...');
try {
    const sourceData = JSON.parse(fs.readFileSync('data/schemes.json', 'utf8'));
    console.log(`   ✅ Source file exists`);
    console.log(`   ✅ Contains ${sourceData.schemes.length} schemes`);
    console.log(`   ✅ First scheme: ${sourceData.schemes[0].scheme_id} - ${sourceData.schemes[0].scheme_name}`);
    console.log(`   ✅ Last scheme: ${sourceData.schemes[49].scheme_id} - ${sourceData.schemes[49].scheme_name}`);
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
}

console.log('');

// Test 2: Check frontend public file
console.log('2️⃣ Checking frontend file (frontend/public/data/schemes.json)...');
try {
    const frontendData = JSON.parse(fs.readFileSync('frontend/public/data/schemes.json', 'utf8'));
    console.log(`   ✅ Frontend file exists`);
    console.log(`   ✅ Contains ${frontendData.schemes.length} schemes`);
    console.log(`   ✅ First scheme: ${frontendData.schemes[0].scheme_id} - ${frontendData.schemes[0].scheme_name}`);
    console.log(`   ✅ Last scheme: ${frontendData.schemes[49].scheme_id} - ${frontendData.schemes[49].scheme_name}`);
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
}

console.log('');

// Test 3: Verify first 30 schemes
console.log('3️⃣ Verifying first 30 schemes (displayed in Explore Schemes)...');
try {
    const data = JSON.parse(fs.readFileSync('frontend/public/data/schemes.json', 'utf8'));
    const first30 = data.schemes.slice(0, 30);
    console.log(`   ✅ First 30 schemes extracted`);
    console.log(`   ✅ Scheme IDs: ${first30[0].scheme_id} to ${first30[29].scheme_id}`);
    
    // List all 30 schemes
    console.log('\n   📋 First 30 Schemes:');
    first30.forEach((scheme, index) => {
        console.log(`      ${index + 1}. ${scheme.scheme_id} - ${scheme.scheme_name}`);
    });
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
}

console.log('');

// Test 4: Verify scheme structure
console.log('4️⃣ Verifying scheme data structure...');
try {
    const data = JSON.parse(fs.readFileSync('frontend/public/data/schemes.json', 'utf8'));
    const sampleScheme = data.schemes[0];
    
    const requiredFields = [
        'scheme_id',
        'scheme_name',
        'category',
        'short_description',
        'detailed_description',
        'financial_assistance',
        'application_mode',
        'status',
        'REQUIRED_DOCUMENTS'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in sampleScheme));
    
    if (missingFields.length === 0) {
        console.log(`   ✅ All required fields present`);
        console.log(`   ✅ Sample scheme structure valid`);
    } else {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
    }
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
}

console.log('');

// Test 5: Check specific scheme IDs
console.log('5️⃣ Testing specific scheme lookups...');
try {
    const data = JSON.parse(fs.readFileSync('frontend/public/data/schemes.json', 'utf8'));
    const testIds = ['SCH_001', 'SCH_015', 'SCH_030'];
    
    testIds.forEach(id => {
        const scheme = data.schemes.find(s => s.scheme_id === id);
        if (scheme) {
            console.log(`   ✅ ${id}: ${scheme.scheme_name}`);
        } else {
            console.log(`   ❌ ${id}: Not found`);
        }
    });
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
}

console.log('');
console.log('✅ JSON Integration Test Complete!');
console.log('');
console.log('📝 Next Steps:');
console.log('   1. Open http://localhost:3000/schemes');
console.log('   2. Verify 30 schemes are displayed');
console.log('   3. Click "View Details" on any scheme');
console.log('   4. Check browser console for debug logs');
console.log('   5. Open TEST-NAVIGATION.html for interactive testing');
