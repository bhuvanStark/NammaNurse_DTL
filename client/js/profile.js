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
      loadTrendGraphs(); // Auto-update graphs
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
          <div class="flex gap-2">
            ${report.criticalAlert ? '<span class="badge-critical">🚨 CRITICAL</span>' : ''}
            <button onclick="deleteReport('${report._id}', '${report.fileName}')" 
                    class="text-red-600 hover:text-red-800 text-sm font-semibold">
              🗑️ Delete
            </button>
          </div>
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

// Delete report function
window.deleteReport = async (reportId, fileName) => {
  if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
    return;
  }

  try {
    await apiRequest(`/api/reports/${reportId}`, { method: 'DELETE' });
    // Reload both reports and graphs
    await loadReports();
    await loadTrendGraphs();
    alert('Report deleted and graphs updated!');
  } catch (error) {
    console.error('Error deleting report:', error);
    alert('Failed to delete report');
  }
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

  // Define biomarker priority and mappings
  const biomarkerConfig = {
    'Glucose (Fasting)': { title: 'Blood Sugar Trend', color: '#3B82F6', criticalLine: 126 },
    'HbA1c': { title: 'HbA1c Trend (Diabetes Control)', color: '#EF4444', criticalLine: 5.7 },
    'Creatinine': { title: 'Kidney Function (Creatinine)', color: '#8B5CF6', criticalLine: 1.3 },
    'Cholesterol (Total)': { title: 'Cholesterol Trend', color: '#F59E0B', criticalLine: 200 },
    'Hemoglobin': { title: 'Hemoglobin Levels', color: '#10B981', criticalLine: 12 },
    'Vitamin D': { title: 'Vitamin D Levels', color: '#F97316', criticalLine: 30 },
    'TSH': { title: 'Thyroid (TSH) Levels', color: '#EC4899', criticalLine: 4.0 },
    'T3': { title: 'Thyroid T3 Levels', color: '#8B5CF6', criticalLine: null },
    'T4': { title: 'Thyroid T4 Levels', color: '#06B6D4', criticalLine: null },
    'Vitamin B12': { title: 'Vitamin B12 Levels', color: '#14B8A6', criticalLine: 200 },
    'Blood Pressure': { title: 'Blood Pressure Trend', color: '#F43F5E', criticalLine: 120 },
    'PSA': { title: 'PSA Levels', color: '#A855F7', criticalLine: 4.0 },
    'Calcium': { title: 'Calcium Levels', color: '#0EA5E9', criticalLine: null },
    'Urea': { title: 'Urea Levels', color: '#6366F1', criticalLine: 40 }
  };

  //=== CONDITION-SPECIFIC GRAPHS ===

  // For diabetic patients
  if (conditions.some(c => c.toLowerCase().includes('diabetes'))) {
    if (datasets['Glucose (Fasting)']) {
      graphsToRender.push({
        id: 'glucoseTrend',
        title: biomarkerConfig['Glucose (Fasting)'].title,
        biomarker: datasets['Glucose (Fasting)'],
        color: biomarkerConfig['Glucose (Fasting)'].color,
        criticalLine: biomarkerConfig['Glucose (Fasting)'].criticalLine
      });
    }

    if (datasets['HbA1c']) {
      graphsToRender.push({
        id: 'hba1cTrend',
        title: biomarkerConfig['HbA1c'].title,
        biomarker: datasets['HbA1c'],
        color: biomarkerConfig['HbA1c'].color,
        criticalLine: biomarkerConfig['HbA1c'].criticalLine
      });
    }
  }

  // For kidney patients
  if (conditions.some(c => c.toLowerCase().includes('kidney'))) {
    if (datasets['Creatinine']) {
      graphsToRender.push({
        id: 'creatinineTrend',
        title: biomarkerConfig['Creatinine'].title,
        biomarker: datasets['Creatinine'],
        color: biomarkerConfig['Creatinine'].color,
        criticalLine: biomarkerConfig['Creatinine'].criticalLine
      });
    }
  }

  // For heart/hypertension patients
  if (conditions.some(c => c.toLowerCase().includes('heart') || c.toLowerCase().includes('hypertension'))) {
    if (datasets['Cholesterol (Total)']) {
      graphsToRender.push({
        id: 'cholesterolTrend',
        title: biomarkerConfig['Cholesterol (Total)'].title,
        biomarker: datasets['Cholesterol (Total)'],
        color: biomarkerConfig['Cholesterol (Total)'].color,
        criticalLine: biomarkerConfig['Cholesterol (Total)'].criticalLine
      });
    }

    if (datasets['Blood Pressure']) {
      graphsToRender.push({
        id: 'bpTrend',
        title: biomarkerConfig['Blood Pressure'].title,
        biomarker: datasets['Blood Pressure'],
        color: biomarkerConfig['Blood Pressure'].color,
        criticalLine: biomarkerConfig['Blood Pressure'].criticalLine
      });
    }
  }

  // For anemia patients
  if (conditions.some(c => c.toLowerCase().includes('anemia'))) {
    if (datasets['Hemoglobin']) {
      graphsToRender.push({
        id: 'hemoglobinTrend',
        title: biomarkerConfig['Hemoglobin'].title,
        biomarker: datasets['Hemoglobin'],
        color: biomarkerConfig['Hemoglobin'].color,
        criticalLine: biomarkerConfig['Hemoglobin'].criticalLine
      });
    }
  }

  // For bone/osteo patients
  if (conditions.some(c => c.toLowerCase().includes('osteo') || c.toLowerCase().includes('bone'))) {
    if (datasets['Vitamin D']) {
      graphsToRender.push({
        id: 'vitaminDTrend',
        title: biomarkerConfig['Vitamin D'].title,
        biomarker: datasets['Vitamin D'],
        color: biomarkerConfig['Vitamin D'].color,
        criticalLine: biomarkerConfig['Vitamin D'].criticalLine
      });
    }

    if (datasets['Calcium']) {
      graphsToRender.push({
        id: 'calciumTrend',
        title: biomarkerConfig['Calcium'].title,
        biomarker: datasets['Calcium'],
        color: biomarkerConfig['Calcium'].color,
        criticalLine: biomarkerConfig['Calcium'].criticalLine
      });
    }
  }

  // For thyroid patients (Hypothyroidism, Hyperthyroidism)
  if (conditions.some(c => c.toLowerCase().includes('thyroid') || c.toLowerCase().includes('hypothyroid') || c.toLowerCase().includes('hyperthyroid'))) {
    if (datasets['TSH']) {
      graphsToRender.push({
        id: 'tshTrend',
        title: biomarkerConfig['TSH'].title,
        biomarker: datasets['TSH'],
        color: biomarkerConfig['TSH'].color,
        criticalLine: biomarkerConfig['TSH'].criticalLine
      });
    }

    if (datasets['T3']) {
      graphsToRender.push({
        id: 't3Trend',
        title: biomarkerConfig['T3'].title,
        biomarker: datasets['T3'],
        color: biomarkerConfig['T3'].color,
        criticalLine: biomarkerConfig['T3'].criticalLine
      });
    }

    if (datasets['T4']) {
      graphsToRender.push({
        id: 't4Trend',
        title: biomarkerConfig['T4'].title,
        biomarker: datasets['T4'],
        color: biomarkerConfig['T4'].color,
        criticalLine: biomarkerConfig['T4'].criticalLine
      });
    }
  }

  // For dementia/cognitive patients
  if (conditions.some(c => c.toLowerCase().includes('dementia') || c.toLowerCase().includes('cognitive') || c.toLowerCase().includes('alzheimer'))) {
    if (datasets['Vitamin B12']) {
      graphsToRender.push({
        id: 'b12Trend',
        title: biomarkerConfig['Vitamin B12'].title,
        biomarker: datasets['Vitamin B12'],
        color: biomarkerConfig['Vitamin B12'].color,
        criticalLine: biomarkerConfig['Vitamin B12'].criticalLine
      });
    }

    if (datasets['Glucose (Fasting)'] && !graphsToRender.find(g => g.id === 'glucoseTrend')) {
      graphsToRender.push({
        id: 'glucoseTrend',
        title: biomarkerConfig['Glucose (Fasting)'].title,
        biomarker: datasets['Glucose (Fasting)'],
        color: biomarkerConfig['Glucose (Fasting)'].color,
        criticalLine: biomarkerConfig['Glucose (Fasting)'].criticalLine
      });
    }
  }

  // For prostate patients
  if (conditions.some(c => c.toLowerCase().includes('prostate'))) {
    if (datasets['PSA']) {
      graphsToRender.push({
        id: 'psaTrend',
        title: biomarkerConfig['PSA'].title,
        biomarker: datasets['PSA'],
        color: biomarkerConfig['PSA'].color,
        criticalLine: biomarkerConfig['PSA'].criticalLine
      });
    }
  }

  //=== FALLBACK: If no condition-specific graphs, show any available biomarkers ===
  if (graphsToRender.length === 0) {
    console.log('📊 No condition-specific graphs. Showing all available biomarkers...');

    // Priority order for general health monitoring
    const fallbackPriority = [
      'Glucose (Fasting)', 'HbA1c', 'Cholesterol (Total)', 'Hemoglobin',
      'Blood Pressure', 'Creatinine', 'Vitamin D', 'Vitamin B12',
      'TSH', 'T3', 'T4', 'Calcium', 'PSA', 'Urea'
    ];

    let graphIndex = 0;
    fallbackPriority.forEach(biomarkerName => {
      if (graphIndex >= 3) return; // Limit to 3 graphs

      if (datasets[biomarkerName] && datasets[biomarkerName].data.length >= 2) {
        const config = biomarkerConfig[biomarkerName];
        graphsToRender.push({
          id: biomarkerName.replace(/\s+/g, '').replace(/[()]/g, '') + 'Trend',
          title: config.title,
          biomarker: datasets[biomarkerName],
          color: config.color,
          criticalLine: config.criticalLine
        });
        graphIndex++;
      }
    });
  }

  // Final check: if still no graphs, show message
  if (graphsToRender.length === 0) {
    document.getElementById('trendsSection').innerHTML =
      '<p class="text-gray-600">Upload at least 2 medical reports to see trend visualization.</p>';
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

