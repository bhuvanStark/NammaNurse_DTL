const { extractBiomarkersFromImage } = require('./server/services/visionService');
const path = require('path');

async function testVision() {
    const imagePath = '/Users/bhuvan/.gemini/antigravity/brain/db14d28b-8632-4af2-a0d0-bae14ba10cae/uploaded_image_1769168369710.png';

    console.log('🔍 Testing Gemini Vision on uploaded medical report...\n');

    try {
        const biomarkers = await extractBiomarkersFromImage(imagePath);

        console.log('\n✅ Extracted Biomarkers:');
        console.log(JSON.stringify(biomarkers, null, 2));

        console.log(`\n📊 Total: ${biomarkers.length} biomarkers found`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

testVision();
