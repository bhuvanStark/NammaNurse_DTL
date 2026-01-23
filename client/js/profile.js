// Patient Profile JavaScript

requireAuth();

// Get resident ID from URL
const urlParams = new URLSearchParams(window.location.search);
const residentId = urlParams.get('id');

if (!residentId) {
  window.location.href = '/caretaker/dashboard.html';
}

let currentResident = null;

// Load resident data
const loadResident = async () => {
  try {
    const data = await apiRequest(`/api/residents/${residentId}`);
    currentResident = data.resident;
    displayResidentInfo(data.resident);
    displayMedicalInfo(data.resident);
    loadReports();
  } catch (error) {
    console.error('Error loading resident:', error);
    alert('Failed to load resident data');
    window.location.href = '/caretaker/dashboard.html';
  }
};

// Display resident info
const displayResidentInfo = (resident) => {
  const riskBadge = getRiskBadge(resident.riskLevel);

  document.getElementById('residentInfo').innerHTML = `
    <div class="mb-4">
      <h2 class="text-2xl font-bold mb-2">${resident.name}</h2>
      <span class="${riskBadge.class}">${riskBadge.text}</span>
    </div>
    <div class="text-left space-y-2">
      <p><strong>Age:</strong> ${resident.age} years</p>
      <p><strong>Gender:</strong> ${resident.gender}</p>
      <p><strong>Room:</strong> ${resident.room}</p>
      <p><strong>Language:</strong> ${resident.preferredLanguage === 'kannada' ? 'ಕನ್ನಡ Kannada' : 'English'}</p>
    </div>
  `;
};

// Display medical info
const displayMedicalInfo = (resident) => {
  const html = `
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-lg mb-2">Conditions</h3>
        <div class="flex flex-wrap gap-2">
          ${resident.conditions.map(c => `
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${c}</span>
          `).join('') || '<p class="text-gray-600">None</p>'}
        </div>
      </div>

      <div>
        <h3 class="font-semibold text-lg mb-2">Medications</h3>
        ${resident.medications.length > 0 ? `
          <ul class="list-disc list-inside space-y-1">
            ${resident.medications.map(m => `
              <li>${m.name} - ${m.dosage} (${m.frequency})</li>
            `).join('')}
          </ul>
        ` : '<p class="text-gray-600">None</p>'}
      </div>

      <div>
        <h3 class="font-semibold text-lg mb-2">Allergies</h3>
        ${resident.allergies.length > 0 ? `
          <div class="flex flex-wrap gap-2">
            ${resident.allergies.map(a => `
              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">⚠️ ${a}</span>
            `).join('')}
          </div>
        ` : '<p class="text-gray-600">None</p>'}
      </div>

      <div>
        <h3 class="font-semibold text-lg mb-2">Emergency Contacts</h3>
        ${resident.emergencyContacts.length > 0 ? `
          <ul class="space-y-2">
            ${resident.emergencyContacts.map(c => `
              <li class="bg-gray-50 p-2 rounded">
                <strong>${c.name}</strong> (${c.relationship})<br>
                📞 ${c.phone}
              </li>
            `).join('')}
          </ul>
        ` : '<p class="text-gray-600">None</p>'}
      </div>
    </div>
  `;

  document.getElementById('medicalInfo').innerHTML = html;
};

// Get risk badge helper
const getRiskBadge = (level) => {
  switch (level) {
    case 'critical': return { class: 'badge-critical', text: 'CRITICAL' };
    case 'attention': return { class: 'badge-attention', text: 'ATTENTION' };
    default: return { class: 'badge-normal', text: 'NORMAL' };
  }
};

// Upload report
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('reportFile');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadStatus = document.getElementById('uploadStatus');

  if (!fileInput.files[0]) return;

  const formData = new FormData();
  formData.append('report', fileInput.files[0]);
  formData.append('residentId', residentId);

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  uploadStatus.className = 'mt-4 p-4 bg-blue-100 text-blue-800 rounded';
  uploadStatus.textContent = '📤 Uploading file...';
  uploadStatus.classList.remove('hidden');

  try {
    const response = await fetch('/api/reports/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    // Now parse the report
    uploadStatus.textContent = '🔬 Analyzing report with AI...';

    const parseResponse = await apiRequest(`/api/reports/parse/${data.report._id}`, {
      method: 'POST'
    });

    uploadStatus.className = 'mt-4 p-4 bg-green-100 text-green-800 rounded';
    uploadStatus.textContent = '✅ Report uploaded and analyzed successfully!';

    // Reload reports
    setTimeout(() => {
      loadReports();
      fileInput.value = '';
      uploadStatus.classList.add('hidden');
    }, 2000);

  } catch (error) {
    uploadStatus.className = 'mt-4 p-4 bg-red-100 text-red-800 rounded';
    uploadStatus.textContent = `❌ Error: ${error.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload & Analyze Report';
  }
});

// Load reports
const loadReports = async () => {
  try {
    const data = await apiRequest(`/api/reports/resident/${residentId}`);
    displayReports(data.reports);
  } catch (error) {
    console.error('Error loading reports:', error);
    document.getElementById('reportHistory').innerHTML =
      '<p class="text-red-600">Failed to load reports</p>';
  }
};

// Display reports
const displayReports = (reports) => {
  if (reports.length === 0) {
    document.getElementById('reportHistory').innerHTML =
      '<p class="text-gray-600">No reports yet</p>';
    return;
  }

  const html = reports.map(report => {
    const date = new Date(report.uploadDate).toLocaleDateString('en-IN');
    const statusClass = report.criticalAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50';

    return `
      <div class="mb-4 p-4 border rounded-lg ${statusClass}">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="font-semibold">${report.fileName}</h4>
            <p class="text-sm text-gray-600">📅 ${date}</p>
          </div>
          ${report.criticalAlert ? '<span class="badge-critical">🚨 CRITICAL</span>' : ''}
        </div>

        ${report.biomarkers.length > 0 ? `
          <div class="mt-3">
            <p class="text-sm font-semibold mb-2">Biomarkers:</p>
            <div class="grid grid-cols-2 gap-2">
              ${report.biomarkers.map(b => `
                <div class="text-sm">
                  <span class="font-medium">${b.name}:</span>
                  <span class="biomarker-${b.status}">${b.value} ${b.unit}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${report.summaryEnglish ? `
          <div class="mt-3 p-3 bg-white rounded border">
            <p class="text-sm"><strong>Summary:</strong> ${report.summaryEnglish}</p>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  document.getElementById('reportHistory').innerHTML = html;
};

// Load and render trend graphs
const loadTrendGraphs = async () => {
  try {
    const data = await apiRequest(`/api/reports/trends/${residentId}`);

    if (!data.reports || data.reports.length === 0) {
      document.getElementById('trendsSection').innerHTML =
        '<p class="text-gray-600">No historical data available yet. Upload reports to see trends.</p>';
      return;
    }

    renderTrendGraphs(data.trends, currentResident.conditions);
  } catch (error) {
    console.error('Error loading trend data:', error);
    document.getElementById('trendsSection').innerHTML =
      '<p class="text-red-600">Failed to load trend data</p>';
  }
};

// Render 3 clinical graphs based on patient conditions
const renderTrendGraphs = (trends, conditions) => {
  const months = trends.months;
  const datasets = trends.datasets;

  // Determine which biomarkers to graph based on conditions
  const graphsToRender = [];

  //Graph 1: Glucose (for all diabetic patients)
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) {
    const glucoseData = datasets['Glucose (Fasting)'];
    if (glucoseData) {
      graphsToRender.push({
        id: 'glucoseTrend',
        title: 'Blood Sugar Trend',
        biomarker: glucoseData,
        color: '#3B82F6',
        criticalLine: 126 // Pre-diabetic threshold
      });
    }

    // Graph 2: HbA1c for diabetic patients
    const hba1cData = datasets['HbA1c'];
    if (hba1cData) {
      graphsToRender.push({
        id: 'hba1cTrend',
        title: 'HbA1c Trend (Diabetes Control)',
        biomarker: hba1cData,
        color: '#EF4444',
        criticalLine: 5.7 // Pre-diabetic threshold
      });
    }
  }

  // Graph 3: Condition-specific biomarker
  if (conditions.some(c => c.toLowerCase().includes('kidney'))) {
    const creatinineData = datasets['Creatinine'];
    if (creatinineData) {
      graphsToRender.push({
        id: 'creatinineTrend',
        title: 'Kidney Function (Creatinine)',
        biomarker: creatinineData,
        color: '#8B5CF6',
        criticalLine: 1.3
      });
    }
  } else if (conditions.some(c => c.toLowerCase().includes('heart') || c.toLowerCase().includes('hypertension'))) {
    const cholesterolData = datasets['Cholesterol (Total)'];
    if (cholesterolData) {
      graphsToRender.push({
        id: 'cholesterolTrend',
        title: 'Cholesterol Trend',
        biomarker: cholesterolData,
        color: '#F59E0B',
        criticalLine: 200
      });
    }
  } else if (conditions.some(c => c.toLowerCase().includes('anemia'))) {
    const hemoglobinData = datasets['Hemoglobin'];
    if (hemoglobinData) {
      graphsToRender.push({
        id: 'hemoglobinTrend',
        title: 'Hemoglobin Levels',
        biomarker: hemoglobinData,
        color: '#10B981',
        criticalLine: 12 // Low threshold
      });
    }
  } else if (conditions.some(c => c.toLowerCase().includes('osteo') || c.toLowerCase().includes('bone'))) {
    const vitaminDData = datasets['Vitamin D'];
    if (vitaminDData) {
      graphsToRender.push({
        id: 'vitaminDTrend',
        title: 'Vitamin D Levels',
        biomarker: vitaminDData,
        color: '#F97316',
        criticalLine: 30
      });
    }
  }

  // Render the graphs
  if (graphsToRender.length === 0) {
    document.getElementById('trendsSection').innerHTML =
      '<p class="text-gray-600">Insufficient biomarker data for trend visualization.</p>';
    return;
  }

  let html = '';
  graphsToRender.forEach((graph, index) => {
    html += `
            <div class="border-t pt-4 ${index === 0 ? 'border-t-0 pt-0' : ''}">
                <h3 class="font-semibold text-gray-700 mb-3">${graph.title}</h3>
                <div class="bg-white" style="position: relative; height: 250px;">
                    <canvas id="${graph.id}"></canvas>
                </div>
            </div>
        `;
  });

  document.getElementById('trendsSection').innerHTML = html;

  // Render each chart
  graphsToRender.forEach(graph => {
    const ctx = document.getElementById(graph.id).getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: graph.biomarker.label,
          data: graph.biomarker.data.map(d => d.value),
          borderColor: graph.color,
          backgroundColor: graph.color + '20',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const status = graph.biomarker.data[context.dataIndex].status;
                const statusEmoji = status === 'high' || status === 'critical' ? '⚠️' :
                  status === 'low' ? '⬇️' : '✓';
                return `${statusEmoji} ${value} ${graph.biomarker.unit}`;
              }
            }
          },
          annotation: {
            annotations: graph.criticalLine ? {
              line1: {
                type: 'line',
                yMin: graph.criticalLine,
                yMax: graph.criticalLine,
                borderColor: '#DC2626',
                borderWidth: 1,
                borderDash: [5, 5],
                label: {
                  content: 'Threshold',
                  enabled: true,
                  position: 'start'
                }
              }
            } : {}
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#E5E7EB',
              drawBorder: false
            },
            ticks: {
              color: '#6B7280',
              callback: (value) => value + ' ' + graph.biomarker.unit
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280'
            }
          }
        }
      }
    });
  });
};

// Load resident on page load
loadResident().then(() => {
  if (currentResident) {
    loadTrendGraphs();
  }
});

