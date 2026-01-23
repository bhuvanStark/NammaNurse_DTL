const { parseBiomarkers } = require('./server/services/biomarkerParser');
const fs = require('fs');

// Read the test report
const testText = fs.readFileSync('./test-report.txt', 'utf8');

console.log('📄 Testing Biomarker Parser\n');
console.log('Input text:');
console.log(testText);
console.log('\n' + '='.repeat(60) + '\n');

const biomarkers = parseBiomarkers(testText);

console.log('\n📊 Extracted Biomarkers:');
console.log(JSON.stringify(biomarkers, null, 2));

console.log(`\n✅ Total: ${biomarkers.length} biomarkers found`);
