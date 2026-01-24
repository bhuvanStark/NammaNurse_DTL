// Voice Interface JavaScript using Web Speech API

let selectedLanguage = null;
let selectedPatientId = null;
let recognition = null;
let synthesis = window.speechSynthesis;
let isListening = false;

// Initialize Web Speech API
const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set language based on user selection
    if (selectedLanguage === 'kannada') {
        recognition.lang = 'kn-IN'; // Kannada (India)
        console.log('🎤 Speech recognition set to Kannada (kn-IN)');
    } else {
        recognition.lang = 'en-IN'; // English (India)
        console.log('🎤 Speech recognition set to English (en-IN)');
    }

    recognition.onstart = () => {
        isListening = true;
        document.getElementById('micButton').classList.add('listening');
        document.getElementById('statusText').textContent = '🎤 Listening...';
    };

    recognition.onend = () => {
        isListening = false;
        document.getElementById('micButton').classList.remove('listening');
        document.getElementById('statusText').textContent = 'Tap to speak';
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('User said:', transcript);

        document.getElementById('statusText').textContent = `You said: "${transcript}"`;

        // Send to backend
        await getAIResponse(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        document.getElementById('statusText').textContent = 'Error: Please try again';
        isListening = false;
        document.getElementById('micButton').classList.remove('listening');
    };

    return recognition;
};

// Select language
const selectLanguage = (lang) => {
    selectedLanguage = lang;

    // Update UI
    document.getElementById('languageSelection').style.display = 'none';
    document.getElementById('voiceInterface').classList.add('active');

    // Initialize speech recognition
    initializeSpeechRecognition();

    // Load patients
    loadPatients();
};

// Load patients
const loadPatients = async () => {
    try {
        const response = await fetch('/api/residents/public');
        const data = await response.json();

        const select = document.getElementById('patientSelect');
        select.innerHTML = data.residents.map(r =>
            `<option value="${r._id}">${r.name} - Room ${r.room}</option>`
        ).join('');

        // Auto-select first patient
        if (data.residents.length > 0) {
            selectedPatientId = data.residents[0]._id;
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        alert('Failed to load patients. Please refresh the page.');
    }
};

// Patient selection change
document.addEventListener('DOMContentLoaded', () => {
    const patientSelect = document.getElementById('patientSelect');
    if (patientSelect) {
        patientSelect.addEventListener('change', (e) => {
            selectedPatientId = e.target.value;
            console.log('Selected patient:', selectedPatientId);
        });
    }

    // Mic button click
    const micButton = document.getElementById('micButton');
    if (micButton) {
        micButton.addEventListener('click', () => {
            if (!selectedPatientId) {
                alert('Please select a patient first');
                return;
            }

            if (!recognition) {
                alert('Speech recognition not initialized. Please refresh the page.');
                return;
            }

            if (!isListening) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error starting recognition:', error);
                }
            }
        });
    }
});

// Get AI response
const getAIResponse = async (userMessage) => {
    try {
        document.getElementById('statusText').textContent = '🤔 Thinking...';

        const response = await fetch('/api/voice/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                residentId: selectedPatientId,
                message: userMessage,
                language: selectedLanguage
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get response');
        }

        // Display response
        const responseBox = document.getElementById('responseBox');
        responseBox.textContent = data.response;
        responseBox.classList.add('visible');

        // Speak response
        speakText(data.response);

        document.getElementById('statusText').textContent = '✅ Response received';

    } catch (error) {
        console.error('Error getting AI response:', error);
        document.getElementById('statusText').textContent = '❌ Error: ' + error.message;
    }
};

// Speak text using Web Speech Synthesis
const speakText = (text) => {
    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Select voice based on selected language
    const voices = synthesis.getVoices();
    let selectedVoice = null;

    if (selectedLanguage === 'kannada') {
        // Try to find Kannada voice first
        selectedVoice = voices.find(v =>
            v.lang.includes('kn') ||
            v.lang.includes('kn-IN') ||
            v.name.toLowerCase().includes('kannada')
        );

        // Fallback to Hindi/Indian voice if Kannada not available
        if (!selectedVoice) {
            console.log('⚠️ No Kannada voice found, using Hindi/Indian voice as fallback');
            selectedVoice = voices.find(v =>
                v.lang.includes('hi-IN') ||
                v.lang.includes('en-IN') ||
                v.name.includes('India')
            );
        }

        // Set language to Kannada for better pronunciation
        utterance.lang = 'kn-IN';
    } else {
        // For English, use Indian English voice
        selectedVoice = voices.find(v =>
            v.lang.includes('en-IN') ||
            v.name.includes('India')
        );
        utterance.lang = 'en-IN';
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🔊 Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
        console.log('⚠️ No suitable voice found, using default');
    }

    // Slower rate for elderly
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => {
        document.getElementById('statusText').textContent = '🔊 Speaking...';
    };

    utterance.onend = () => {
        document.getElementById('statusText').textContent = 'Tap to speak again';
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        document.getElementById('statusText').textContent = 'Error speaking. Tap to try again';
    };

    synthesis.speak(utterance);
};

// Load voices (needed for some browsers)
if (synthesis.onvoiceschanged !== undefined) {
    synthesis.onvoiceschanged = () => {
        synthesis.getVoices();
    };
}
