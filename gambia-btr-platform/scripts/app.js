// Main Application State
const appState = {
    currentSection: 'dashboard',
    currentStep: 1,
    btrData: {
        step1: {},
        step2: {},
        step3: {},
        step4: {},
        step5: {},
        step6: {}
    },
    sectorData: {
        afolu: {},
        energy: {},
        waste: {},
        ipuu: {}
    },
    recentActivities: ['Platform initialized - Welcome!'],
    completedSteps: new Set()
};

// Initialize application
function initApp() {
    console.log('The Gambia BTR Platform initialized');
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Initialize dashboard
    updateRecentActivities();
    updateProgress();
    
    // Show initial section
    showSection('dashboard');
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    appState.currentSection = sectionId;
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Add to recent activities
    addActivity(`Navigated to ${getSectionName(sectionId)}`);
    
    // Special handling for BTR process
    if (sectionId === 'btr-process') {
        initializeBTRProcess();
    }
}

function getSectionName(sectionId) {
    const names = {
        'dashboard': 'Dashboard',
        'btr-process': 'BTR Process Navigator',
        'data': 'Data Repository',
        'reports': 'Report Generator'
    };
    return names[sectionId] || sectionId;
}

// BTR Process Functions
function initializeBTRProcess() {
    // Show the current step
    showStep(appState.currentStep);
    
    // Update step indicators
    updateStepIndicators();
}

function showStep(stepNumber) {
    // Hide all step panels
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected step panel
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    // Update current step
    appState.currentStep = stepNumber;
    
    // Load saved data for this step if it exists
    loadStepData(stepNumber);
}

function nextStep(currentStep) {
    if (validateStep(currentStep)) {
        saveStep(currentStep);
        
        if (currentStep < 6) {
            showStep(currentStep + 1);
            addActivity(`Advanced to BTR Step ${currentStep + 1}`);
        }
    } else {
        alert('Please complete all required fields before proceeding.');
    }
}

function prevStep(currentStep) {
    if (currentStep > 1) {
        showStep(currentStep - 1);
        addActivity(`Returned to BTR Step ${currentStep - 1}`);
    }
}

function validateStep(stepNumber) {
    const requiredFields = {
        1: ['team-lead', 'institutional-arrangements'],
        2: ['ghg-experience'],
        3: [],
        4: [],
        5: [],
        6: []
    };
    
    const fields = requiredFields[stepNumber] || [];
    
    for (const fieldId of fields) {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.focus();
            return false;
        }
    }
    
    return true;
}

function saveStep(stepNumber) {
    const form = document.getElementById(`step-${stepNumber}`);
    const inputs = form.querySelectorAll('input, select, textarea');
    
    const stepData = {};
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            // Handle checkboxes separately
            if (!stepData[input.name]) {
                stepData[input.name] = [];
            }
            if (input.checked) {
                stepData[input.name].push(input.value);
            }
        } else {
            stepData[input.id] = input.value;
        }
    });
    
    appState.btrData[`step${stepNumber}`] = stepData;
    appState.completedSteps.add(stepNumber);
    
    updateStepIndicators();
    updateProgress();
    saveToLocalStorage();
    
    console.log(`Step ${stepNumber} data saved:`, stepData);
}

function loadStepData(stepNumber) {
    const stepData = appState.btrData[`step${stepNumber}`];
    if (!stepData) return;
    
    Object.keys(stepData).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                // Handle checkbox arrays
                const values = stepData[fieldId];
                if (Array.isArray(values)) {
                    field.checked = values.includes(field.value);
                }
            } else {
                field.value = stepData[fieldId];
            }
        }
    });
}

function updateStepIndicators() {
    document.querySelectorAll('.step').forEach((stepElem, index) => {
        const stepNumber = index + 1;
        if (appState.completedSteps.has(stepNumber)) {
            stepElem.classList.add('completed');
        } else {
            stepElem.classList.remove('completed');
        }
        
        if (stepNumber === appState.currentStep) {
            stepElem.classList.add('active');
        } else {
            stepElem.classList.remove('active');
        }
    });
}

// Data Repository Functions
function saveSectorData(sector) {
    const form = document.querySelector(`#data .sector-card:nth-child(${getSectorIndex(sector)}) form`);
    const inputs = form.querySelectorAll('input');
    
    const sectorData = {};
    inputs.forEach(input => {
        sectorData[input.id] = input.value;
    });
    
    appState.sectorData[sector] = sectorData;
    saveToLocalStorage();
    
    addActivity(`Updated ${sector.toUpperCase()} sector data`);
    alert(`${sector.toUpperCase()} data saved successfully!`);
}

function getSectorIndex(sector) {
    const sectors = ['afolu', 'energy', 'waste'];
    return sectors.indexOf(sector) + 1;
}

// Report Generation Functions
function generateBTRReport() {
    const output = document.getElementById('report-content');
    
    let report = `<h3>BTR Draft Report for The Gambia</h3>`;
    report += `<p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>`;
    report += `<hr>`;
    
    // Step 1 Data
    if (appState.btrData.step1.teamLead) {
        report += `<h4>1. Institutional Arrangements</h4>`;
        report += `<p><strong>Team Lead:</strong> ${appState.btrData.step1.teamLead}</p>`;
        report += `<p><strong>Institutional Framework:</strong> ${appState.btrData.step1.institutionalArrangements || 'Not specified'}</p>`;
    }
    
    // Step 2 Data
    if (appState.btrData.step2.ghgExperience) {
        report += `<h4>2. Capacity Assessment</h4>`;
        report += `<p><strong>GHG Inventory Experience:</strong> ${appState.btrData.step2.ghgExperience}</p>`;
        report += `<p><strong>Data Availability (AFOLU):</strong> ${appState.btrData.step2.dataAfolu || 'Not assessed'}</p>`;
    }
    
    // Sector Data
    report += `<h4>3. Sectoral Data Summary</h4>`;
    Object.keys(appState.sectorData).forEach(sector => {
        if (Object.keys(appState.sectorData[sector]).length > 0) {
            report += `<p><strong>${sector.toUpperCase()}:</strong> Data available</p>`;
        }
    });
    
    report += `<hr>`;
    report += `<p class="text-center"><em>This is a draft report. Complete all BTR steps for a comprehensive report.</em></p>`;
    
    output.innerHTML = report;
    addActivity('Generated BTR Draft Report');
}

function generateProgressReport() {
    const output = document.getElementById('report-content');
    
    let report = `<h3>UNEP Progress Report</h3>`;
    report += `<p><strong>Reporting Period:</strong> ${new Date().toLocaleDateString()}</p>`;
    report += `<p><strong>Project:</strong> BTR1/NC4 Implementation</p>`;
    report += `<hr>`;
    
    report += `<h4>Activities Completed</h4>`;
    report += `<ul>`;
    appState.recentActivities.slice(0, 10).forEach(activity => {
        report += `<li>${activity}</li>`;
    });
    report += `</ul>`;
    
    report += `<h4>BTR Process Completion</h4>`;
    report += `<p>Steps completed: ${appState.completedSteps.size}/6 (${Math.round((appState.completedSteps.size / 6) * 100)}%)</p>`;
    
    report += `<h4>Next Steps</h4>`;
    report += `<ul>`;
    for (let i = 1; i <= 6; i++) {
        if (!appState.completedSteps.has(i)) {
            report += `<li>Complete Step ${i} of BTR Process</li>`;
        }
    }
    report += `</ul>`;
    
    output.innerHTML = report;
    addActivity('Generated UNEP Progress Report');
}

function generateRoadmap() {
    const output = document.getElementById('report-content');
    
    let roadmap = `<h3>BTR Implementation Roadmap</h3>`;
    roadmap += `<p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>`;
    roadmap += `<hr>`;
    
    roadmap += `<div class="roadmap-timeline">`;
    
    const steps = [
        { number: 1, name: 'Scene Setting', duration: '2 weeks' },
        { number: 2, name: 'Taking Stock', duration: '3 weeks' },
        { number: 3, name: 'Planning', duration: '2 weeks' },
        { number: 4, name: 'Implementation', duration: '4 months' },
        { number: 5, name: 'TER Preparation', duration: '1 month' },
        { number: 6, name: 'Continuous Improvement', duration: 'Ongoing' }
    ];
    
    steps.forEach(step => {
        const status = appState.completedSteps.has(step.number) ? '✅ Completed' : '📝 Pending';
        roadmap += `
            <div class="roadmap-item">
                <div class="roadmap-step">Step ${step.number}</div>
                <div class="roadmap-content">
                    <h4>${step.name}</h4>
                    <p><strong>Duration:</strong> ${step.duration}</p>
                    <p><strong>Status:</strong> ${status}</p>
                </div>
            </div>
        `;
    });
    
    roadmap += `</div>`;
    roadmap += `<hr>`;
    roadmap += `<p><strong>Total Estimated Timeline:</strong> 6-8 months</p>`;
    roadmap += `<p><strong>BTR Submission Deadline:</strong> December 31, 2024</p>`;
    
    output.innerHTML = roadmap;
    addActivity('Generated Implementation Roadmap');
}

function exportToExcel() {
    // Simple alert for now - in real implementation, this would use SheetJS
    alert('Excel export functionality will be implemented with SheetJS library. All your data is saved and ready for export.');
    addActivity('Attempted Excel export');
}

// Utility Functions
function addActivity(activity) {
    const timestamp = new Date().toLocaleTimeString();
    appState.recentActivities.unshift(`${timestamp}: ${activity}`);
    
    // Keep only last 20 activities
    if (appState.recentActivities.length > 20) {
        appState.recentActivities.pop();
    }
    
    updateRecentActivities();
    saveToLocalStorage();
}

function updateRecentActivities() {
    const activitiesList = document.getElementById('recent-activities');
    if (activitiesList) {
        activitiesList.innerHTML = appState.recentActivities
            .map(activity => `<li>${activity}</li>`)
            .join('');
    }
}

function updateProgress() {
    const totalSteps = 6;
    const completedSteps = appState.completedSteps.size;
    const progress = (completedSteps / totalSteps) * 100;
    
    const progressBar = document.querySelector('.timeline-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    const progressText = document.querySelector('.timeline-text');
    if (progressText) {
        progressText.textContent = `Project Progress: ${Math.round(progress)}%`;
    }
}

// Local Storage Functions
function saveToLocalStorage() {
    const dataToSave = {
        btrData: appState.btrData,
        sectorData: appState.sectorData,
        recentActivities: appState.recentActivities,
        completedSteps: Array.from(appState.completedSteps),
        currentStep: appState.currentStep
    };
    
    localStorage.setItem('gambiaBTRData', JSON.stringify(dataToSave));
}

function loadSavedData() {
    const savedData = localStorage.getItem('gambiaBTRData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            
            appState.btrData = parsed.btrData || appState.btrData;
            appState.sectorData = parsed.sectorData || appState.sectorData;
            appState.recentActivities = parsed.recentActivities || appState.recentActivities;
            appState.completedSteps = new Set(parsed.completedSteps || []);
            appState.currentStep = parsed.currentStep || 1;
            
            addActivity('Loaded saved data from previous session');
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Save data before page unload
window.addEventListener('beforeunload', saveToLocalStorage);