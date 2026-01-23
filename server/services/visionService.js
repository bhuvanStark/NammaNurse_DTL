const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const { normalizeBiomarkerName } = require('./biomarkerParser');

/**
 * Extract biomarkers from medical report image using Gemini Vision
 */
const extractBiomarkersFromImage = async (imagePath) => {
    try {
        console.log('🔍 Using Gemini Vision to analyze medical report...');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Read image file
        const imageData = await fs.readFile(imagePath);
        const base64Image = imageData.toString('base64');

        const prompt = `You are a medical data extraction expert. Analyze this medical laboratory report image and extract ALL biomarker values in JSON format.

CRITICAL RULES:
1. Extract EXACT numeric values including decimals (e.g., 96.80 NOT 9680)
2. Look for these common biomarkers: Glucose/Sugar, HbA1c, Cholesterol, Creatinine, Hemoglobin/Hb, Blood Pressure, Urea, TSH, T3, T4, Vitamin D, Vitamin B12, Calcium, PSA
3. Include the unit (mg/dL, %, g/dL, mmHg, etc.)
4. If a biomarker is present but value is not numeric, skip it
5. Use standard names: "Glucose (Fasting)" not "Avg Glucose", "HbA1c" not "A1C"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "biomarkers": [
    {
      "name": "HbA1c",
      "value": "9",
      "unit": "%"
    },
    {
      "name": "Glucose (Fasting)",
      "value": "96.80",
      "unit": "mg/dL"
    }
  ]
}

Extract all biomarkers you can find in the image.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/png'
                }
            }
        ]);

        const response = result.response.text();
        console.log('📄 Gemini Vision response:', response.substring(0, 200));

        // Parse JSON response
        let jsonText = response.trim();

        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const data = JSON.parse(jsonText);

        if (!data.biomarkers || !Array.isArray(data.biomarkers)) {
            throw new Error('Invalid response format from Gemini Vision');
        }

        // Normalize biomarker names to match standard names
        const normalizedBiomarkers = data.biomarkers.map(bio => ({
            ...bio,
            name: normalizeBiomarkerName(bio.name)
        }));

        console.log(`✅ Extracted ${normalizedBiomarkers.length} biomarkers using Gemini Vision`);

        // Log normalized names
        normalizedBiomarkers.forEach(bio => {
            console.log(`   📊 ${bio.name}: ${bio.value} ${bio.unit}`);
        });

        return normalizedBiomarkers;

    } catch (error) {
        console.error('❌ Gemini Vision error:', error.message);
        throw error;
    }
};

module.exports = { extractBiomarkersFromImage };

