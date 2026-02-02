const { getModel } = require('../config/gemini');

/**
 * Generate health summary using Gemini AI
 */
const generateHealthSummary = async (biomarkers, language = 'english') => {
    try {
        const model = getModel();

        // Prepare biomarker data for prompt
        const biomarkerText = biomarkers.map(b =>
            `${b.name}: ${b.value} ${b.unit} (Normal: ${b.normalRange}) - Status: ${b.status}`
        ).join('\n');

        const prompt = `You are "Namma Nurse", a warm and caring AI health assistant for elderly patients in Karnataka, India.

Patient's latest test results:
${biomarkerText}

Generate a health summary in ${language === 'kn' ? 'Kannada' : 'English'} following these rules:
1. Use simple, warm, reassuring language (no medical jargon)
2. Keep it to 2-3 sentences maximum
3. If values are high/critical, mention them gently
4. Provide ONE simple lifestyle advice
5. Always end with: "Please consult your doctor for medical advice"
6. For elderly: speak like a caring nurse, not a robot

${language === 'kn' ? 'Response should be in Kannada script.' : ''}

Health Summary:`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        console.log(`✅ Generated ${language} summary:`, summary.substring(0, 100) + '...');

        return summary.trim();

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);

        // Fallback summary
        if (language === 'kn') {
            return 'ನಿಮ್ಮ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.';
        }
        return 'Your report is ready. Please consult your doctor for detailed advice.';
    }
};

/**
 * Safety layer - Rule-based checks BEFORE LLM processing
 */
const applySafetyRules = (resident, biomarkers) => {
    const criticalWarnings = [];
    const safetyOverride = {
        forceDisclaimer: false,
        blockResponse: false,
        blockedReason: null
    };

    // Critical biomarker checks
    if (biomarkers && biomarkers.length > 0) {
        // HbA1c > 8% → Critical diabetic emergency
        const hba1c = biomarkers.find(b => b.name.includes('HbA1c'));
        if (hba1c && parseFloat(hba1c.value) > 8) {
            criticalWarnings.push({
                type: 'CRITICAL',
                message: `⚠️ URGENT: Your HbA1c level (${hba1c.value}%) is dangerously high. This requires immediate medical attention.`,
                biomarker: 'HbA1c',
                value: hba1c.value
            });
        }

        // Creatinine > 2.0 → Severe kidney dysfunction
        const creatinine = biomarkers.find(b => b.name.includes('Creatinine'));
        if (creatinine && parseFloat(creatinine.value) > 2.0) {
            criticalWarnings.push({
                type: 'CRITICAL',
                message: `⚠️ URGENT: Your kidney function (Creatinine ${creatinine.value} mg/dL) needs immediate evaluation by a nephrologist.`,
                biomarker: 'Creatinine',
                value: creatinine.value
            });
        }

        // Very high glucose → Hyperglycemia risk
        const glucose = biomarkers.find(b => b.name.includes('Glucose') && !b.name.includes('HbA1c'));
        if (glucose && parseFloat(glucose.value) > 250) {
            criticalWarnings.push({
                type: 'CRITICAL',
                message: `⚠️ WARNING: Your blood sugar (${glucose.value} mg/dL) is very high. Please check with your doctor immediately.`,
                biomarker: 'Glucose',
                value: glucose.value
            });
        }

        // Very low hemoglobin → Severe anemia
        const hemoglobin = biomarkers.find(b => b.name.includes('Hemoglobin'));
        if (hemoglobin && parseFloat(hemoglobin.value) < 8) {
            criticalWarnings.push({
                type: 'CRITICAL',
                message: `⚠️ ALERT: Your hemoglobin (${hemoglobin.value} g/dL) is very low. You need immediate medical evaluation.`,
                biomarker: 'Hemoglobin',
                value: hemoglobin.value
            });
        }
    }

    // Critical risk level → Force doctor disclaimer
    if (resident.riskLevel === 'critical') {
        safetyOverride.forceDisclaimer = true;
    }

    return { criticalWarnings, safetyOverride };
};

/**
 * Detect unsafe queries that should NOT be answered
 */
const detectUnsafeQuery = (userQuestion) => {
    const lowerQ = userQuestion.toLowerCase();

    // Block medication recommendations
    if (lowerQ.includes('medicine') || lowerQ.includes('medication') ||
        lowerQ.includes('tablet') || lowerQ.includes('pill') ||
        lowerQ.includes('drug') || lowerQ.includes('dose')) {
        return {
            unsafe: true,
            reason: 'medication_request',
            safeResponse: "I cannot recommend or advise on medications. Please consult your doctor or the nursing staff for any medication-related questions. They will provide you with safe, personalized medical advice."
        };
    }

    // Block diagnosis requests
    if (lowerQ.includes('cure') || lowerQ.includes('treatment') ||
        lowerQ.includes('diagnose') || lowerQ.includes('disease')) {
        return {
            unsafe: true,
            reason: 'diagnosis_request',
            safeResponse: "I cannot diagnose conditions or recommend treatments. Please speak with your doctor for proper medical evaluation and treatment plans. They are best equipped to help you."
        };
    }

    // Handle existential/death questions compassionately
    if (lowerQ.includes('die') || lowerQ.includes('death') || lowerQ.includes('dying')) {
        return {
            unsafe: true,
            reason: 'existential_question',
            safeResponse: "I understand these concerns can be worrying. Please talk to your doctor or a counselor who can provide proper support and address your concerns with care. We are here to support you."
        };
    }

    return { unsafe: false };
};

/**
 * Generate conversational response for voice chat with comprehensive patient context
 */
const generateVoiceResponse = async (userQuestion, residentProfile, recentReports = [], language = 'english') => {
    try {
        const model = getModel();

        // STEP 1: Check for unsafe queries FIRST
        const unsafeCheck = detectUnsafeQuery(userQuestion);
        if (unsafeCheck.unsafe) {
            console.log(`🚫 Blocked unsafe query (${unsafeCheck.reason}): "${userQuestion}"`);
            return unsafeCheck.safeResponse;
        }

        // STEP 2: Apply safety rules for critical biomarkers
        const latestBiomarkers = recentReports.length > 0 ? (recentReports[0].biomarkers || []) : [];
        const { criticalWarnings, safetyOverride } = applySafetyRules(residentProfile, latestBiomarkers);

        // Build comprehensive patient context
        const age = residentProfile.age;
        const gender = residentProfile.gender;
        const conditions = residentProfile.conditions.join(', ') || 'None reported';
        const medications = residentProfile.medications.length > 0
            ? residentProfile.medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ')
            : 'None reported';
        const allergies = residentProfile.allergies.join(', ') || 'None reported';

        // Build biomarker context from latest reports
        let biomarkerContext = 'No recent test results available';
        let summaryContext = '';

        if (recentReports.length > 0) {
            const latestReport = recentReports[0];

            // Latest biomarkers
            if (latestReport.biomarkers && latestReport.biomarkers.length > 0) {
                const biomarkerList = latestReport.biomarkers.map(b =>
                    `${b.name}: ${b.value} ${b.unit} (Status: ${b.status.toUpperCase()}, Normal: ${b.normalRange})`
                ).join('\n');
                biomarkerContext = `LATEST TEST RESULTS:\n${biomarkerList}`;

                // Identify what's high and low
                const highValues = latestReport.biomarkers.filter(b => b.status === 'high' || b.status === 'critical');
                const lowValues = latestReport.biomarkers.filter(b => b.status === 'low');

                if (highValues.length > 0) {
                    biomarkerContext += `\n\nHIGH/ELEVATED: ${highValues.map(b => b.name).join(', ')}`;
                }
                if (lowValues.length > 0) {
                    biomarkerContext += `\n\nLOW/DEFICIENT: ${lowValues.map(b => b.name).join(', ')}`;
                }
            }

            // Include AI-generated summaries for context
            if (latestReport.summaryEnglish) {
                summaryContext = `\nHEALTH SUMMARY: ${latestReport.summaryEnglish}`;
            }
        }

        // Build the comprehensive prompt with examples
        const prompt = `You are "Namma Nurse", a compassionate and knowledgeable AI health assistant for elderly patients in old-age homes in Karnataka, India.

PATIENT PROFILE:
- Name: ${residentProfile.name}
- Age: ${age} years old
- Gender: ${gender}
- Medical Conditions: ${conditions}
- Current Medications: ${medications}
- Allergies: ${allergies}

${biomarkerContext}
${summaryContext}

PATIENT ASKED: "${userQuestion}"

INSTRUCTIONS FOR YOUR RESPONSE:
1. Answer in ${language === 'kn' ? 'KANNADA SCRIPT (ಕನ್ನಡ)' : 'ENGLISH'}
2. Use a warm, caring tone - speak like a nurse who deeply cares about the patient
3. Keep response to 2-4 sentences maximum
4. Use SIMPLE language (avoid medical jargon)
5. Answer the SPECIFIC question based on their actual health data

QUESTION TYPE GUIDANCE:
- If asking about DIET ("what to eat", "food", "diet"):
  → Consider their conditions (diabetes → avoid sugar, kidney disease → low salt/protein, hypertension → low sodium)
  → Suggest 2-3 specific foods appropriate for their condition
  → Keep it practical and culturally relevant (Indian foods)

- If asking about EXERCISE ("exercise", "physical activity", "walk"):
  → Consider their age and conditions
  → Suggest gentle, age-appropriate activities (walking, light yoga, stretching)
  → Mention duration (10-15 minutes) and safety

- If asking about SPECIFIC BIOMARKERS ("sugar", "glucose", "BP", "blood pressure", "cholesterol", "kidney", "creatinine"):
  → Report the actual value from their latest test
  → Explain if it's normal, high, or low in simple terms
  → Provide ONE actionable tip

- If asking "what is HIGH" or "what is elevated":
  → List the biomarkers that are high/critical
  → Explain what they mean in simple terms
  → Reassure and suggest consulting doctor

- If asking "what is LOW":
  → List the biomarkers that are low
  → Explain significance simply
  → Suggest foods or actions to improve

- If asking general "how am I" or "am I healthy":
  → Give overall assessment based on conditions and latest reports
  → Mention if any values need attention
  → End with reassurance

6. ALWAYS end with gentle reassurance or encouragement
7. If uncertain or question needs doctor, say "Please consult your doctor for medical advice"

${language === 'kn' ? '\n🔴 CRITICAL: Your ENTIRE response MUST be in Kannada script (ಕನ್ನಡ). Do NOT use English characters.\n' : ''}

YOUR CARING RESPONSE:`;

        const result = await model.generateContent(prompt);
        let response = result.response.text();

        // STEP 3: Prepend critical warnings if present
        if (criticalWarnings.length > 0) {
            const warningText = criticalWarnings.map(w => w.message).join('\n\n');
            response = `${warningText}\n\n${response}`;
            console.log(`⚠️ Added ${criticalWarnings.length} critical warnings to response`);
        }

        // STEP 4: Force disclaimer for critical risk patients
        if (safetyOverride.forceDisclaimer) {
            response += '\n\n⚠️ IMPORTANT: You are in a critical risk category. Please ensure regular monitoring by medical staff.';
        }

        console.log(`✅ Generated intelligent voice response (${language}, ${userQuestion.length} chars question):`, response.substring(0, 150));

        return response.trim();

    } catch (error) {
        console.error('❌ Gemini Voice API Error:', error.message);

        // Fallback responses
        if (language === 'kn') {
            return 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಒಳ್ಳೆಯದಾಗಿದೆ. ಚಿಂತಿಸಬೇಡಿ. ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.';
        }
        return 'Your health is being monitored. Please consult your doctor for detailed guidance.';
    }
};

module.exports = {
    generateHealthSummary,
    generateVoiceResponse,
    applySafetyRules,
    detectUnsafeQuery
};
