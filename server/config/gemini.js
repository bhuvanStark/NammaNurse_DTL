const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get Gemini model (using gemini-2.5-flash - latest stable version)
const getModel = () => {
    return genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
        }
    });
};

module.exports = { getModel };
