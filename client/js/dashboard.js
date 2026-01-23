// Dashboard JavaScript

requireAuth();

let allResidents = [];

// Load organization name
document.getElementById('orgName').textContent = localStorage.getItem('orgName') || 'Dashboard';

// Fetch residents
const loadResidents = async () => {
  try {
    const data = await apiRequest('/api/residents');
    allResidents = data.residents;
    displayResidents(allResidents);
    updateStats(allResidents);
  } catch (error) {
    console.error('Error loading residents:', error);
    document.getElementById('loadingState').innerHTML =
      `<p class="text-red-600">Error loading residents: ${error.message}</p>`;
  }
};

// Display residents
const displayResidents = (residents) => {
  const grid = document.getElementById('residentsGrid');
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');

  loadingState.classList.add('hidden');

  if (residents.length === 0) {
    emptyState.classList.remove('hidden');
    grid.innerHTML = '';
    return;
  }

  emptyState.classList.add('hidden');

  grid.innerHTML = residents.map(resident => {
    const riskIcon = getRiskIcon(resident.riskLevel);
    const riskBadge = getRiskBadge(resident.riskLevel);

    return `
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer resident-card ${resident.riskLevel}"
           onclick="window.location.href='/caretaker/profile.html?id=${resident._id}'">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800">${riskIcon} ${resident.name}</h3>
              <p class="text-gray-600">${resident.age}y, ${resident.gender} • Room ${resident.room}</p>
            </div>
            <span class="${riskBadge.class}">${riskBadge.text}</span>
          </div>
          
          <div class="space-y-2">
            <div class="text-sm">
              <span class="font-semibold">Conditions:</span>
              <p class="text-gray-700">${resident.conditions.join(', ') || 'None'}</p>
            </div>
            
            <div class="text-sm">
              <span class="font-semibold">Language:</span>
              <span class="text-gray-700">${resident.preferredLanguage === 'kannada' ? 'ಕನ್ನಡ' : 'English'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

// Get risk icon
const getRiskIcon = (level) => {
  switch (level) {
    case 'critical': return '🔴';
    case 'attention': return '🟡';
    default: return '🟢';
  }
};

// Get risk badge
const getRiskBadge = (level) => {
  switch (level) {
    case 'critical':
      return { class: 'badge-critical', text: 'CRITICAL' };
    case 'attention':
      return { class: 'badge-attention', text: 'ATTENTION' };
    default:
      return { class: 'badge-normal', text: 'NORMAL' };
  }
};

// Update stats
const updateStats = (residents) => {
  const total = residents.length;
  const critical = residents.filter(r => r.riskLevel === 'critical').length;
  const attention = residents.filter(r => r.riskLevel === 'attention').length;

  document.getElementById('totalCount').textContent = total;
  document.getElementById('criticalCount').textContent = critical;
  document.getElementById('attentionCount').textContent = attention;
};

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();

  const filtered = allResidents.filter(resident => {
    return resident.name.toLowerCase().includes(query) ||
      resident.room.toLowerCase().includes(query) ||
      resident.conditions.some(c => c.toLowerCase().includes(query));
  });

  displayResidents(filtered);
});

// Modal handling
const modal = document.getElementById('addPatientModal');
const addPatientBtn = document.getElementById('addPatientBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const addPatientForm = document.getElementById('addPatientForm');

// Open modal
addPatientBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  addPatientForm.reset();
});

// Close modal
const closeModal = () => {
  modal.classList.add('hidden');
};

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal on outside click
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Form submission
addPatientForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(addPatientForm);

  // Build patient data
  const patientData = {
    name: formData.get('name').trim(),
    age: parseInt(formData.get('age')),
    gender: formData.get('gender'),
    room: formData.get('room').trim(),
    preferredLanguage: formData.get('preferredLanguage'),
    conditions: formData.get('conditions')
      ? formData.get('conditions').split(',').map(c => c.trim()).filter(c => c)
      : [],
    allergies: formData.get('allergies')
      ? formData.get('allergies').split(',').map(a => a.trim()).filter(a => a)
      : [],
    medications: [],
    emergencyContacts: []
  };

  // Add emergency contact if provided
  const emergencyName = formData.get('emergencyName')?.trim();
  const emergencyRelationship = formData.get('emergencyRelationship')?.trim();
  const emergencyPhone = formData.get('emergencyPhone')?.trim();

  if (emergencyName && emergencyRelationship && emergencyPhone) {
    patientData.emergencyContacts.push({
      name: emergencyName,
      relationship: emergencyRelationship,
      phone: emergencyPhone
    });
  }

  try {
    // Disable submit button
    const submitBtn = addPatientForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    // Send to API
    await apiRequest('/api/residents', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });

    // Success!
    alert('Patient created successfully!');
    closeModal();

    // Reload residents list
    await loadResidents();

  } catch (error) {
    console.error('Error creating patient:', error);
    alert('Failed to create patient: ' + error.message);
  } finally {
    // Re-enable submit button
    const submitBtn = addPatientForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Patient';
  }
});

// Load residents on page load
loadResidents();
