const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF or image file using Tesseract OCR
 */
const extractTextFromFile = async (filePath, fileType) => {
    try {
        console.log(`🔍 Starting OCR for: ${filePath} (${fileType})`);

        // For PDF files, use pdf-parse first
        if (fileType === 'pdf') {
            try {
                const dataBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(dataBuffer);

                if (pdfData.text && pdfData.text.trim().length > 50) {
                    console.log('✅ Text extracted from PDF successfully');
                    return pdfData.text;
                }
            } catch (pdfError) {
                console.log('PDF parsing failed, falling back to OCR:', pdfError.message);
            }
        }

        // For images or if PDF parsing failed, use Tesseract OCR
        const result = await Tesseract.recognize(filePath, 'eng', {
            logger: info => {
                if (info.status === 'recognizing text') {
                    console.log(`📄 OCR Progress: ${Math.round(info.progress * 100)}%`);
                }
            }
        });

        console.log('✅ OCR completed successfully');
        return result.data.text;

    } catch (error) {
        console.error('❌ OCR Error:', error.message);
        throw new Error('Failed to extract text from file');
    }
};

module.exports = { extractTextFromFile };
