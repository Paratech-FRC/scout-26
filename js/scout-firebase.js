// Scout System with Firebase Integration
import { 
    saveReportToFirebase, 
    loadReportsFromFirebase, 
    getAllTeamsFromFirebase,
    getTeamReportsFromFirebase,
    initializeFirebaseScout 
} from './firebase-sout.js';

// Global state
let allReports = [];
let isFirebaseReady = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Scout System com Firebase...');
    
    // Initialize Firebase
    initializeFirebaseScout();
    
    // Setup form listeners
    setupFormListeners();
    
    // Load teams from Firebase with real-time updates
    loadTeamsFromFirebase();
    
    // Initial score calculation
    calculateScore();
    
    isFirebaseReady = true;
});

// Load teams from Firebase
function loadTeamsFromFirebase() {
    getAllTeamsFromFirebase((teams) => {
        console.log(`📊 ${teams.length} equipes carregadas`);
        displayTeams(teams);
    });
}

// Display teams in the grid
function displayTeams(teams) {
    const teamsList = document.getElementById('teamsList');
    
    if (teams.length === 0) {
        teamsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">Nenhum relatório disponível ainda.</div>
                <p style="margin-top: 16px; color: var(--color-text-secondary);">
                    Comece criando seu primeiro relatório de scouting!
                </p>
            </div>
        `;
        return;
    }
    
    teamsList.innerHTML = teams.map(team => {
        const avgScore = (team.reports.reduce((sum, r) => sum + r.totalScore, 0) / team.reports.length).toFixed(1);
        
        return `
            <div class="team-card" onclick="showTeamDetails(${team.teamNumber})">
                <div class="team-card-header">
                    <div class="team-number">#${team.teamNumber}</div>
                    <div class="team-reports-count">${team.reports.length} relatório${team.reports.length > 1 ? 's' : ''}</div>
                </div>
                <div class="team-name">${team.teamName}</div>
                <div class="team-avg-score">
                    ${avgScore} <span class="team-avg-label">pts média</span>
                </div>
            </div>
        `;
    }).join('');
}

// Form Setup
function setupFormListeners() {
    // Auto-score details visibility
    document.getElementById('autoScoreHub').addEventListener('change', function() {
        document.getElementById('autoScoreDetails').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('teleopDefensive').addEventListener('change', function() {
        document.getElementById('defensiveDetails').style.display = this.checked ? 'block' : 'none';
        document.getElementById('offensiveDetails').style.display = this.checked ? 'none' : 'block';
    });
    
    document.getElementById('endClimb').addEventListener('change', function() {
        document.getElementById('climbDetails').style.display = this.checked ? 'block' : 'none';
    });
    
    document.querySelectorAll('input[name="penalties"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('penaltyDetails').style.display = 
                (this.value !== '0') ? 'block' : 'none';
        });
    });
    
    // Real-time score calculation
    const scoreInputs = document.querySelectorAll('input[type="checkbox"][data-points], input[type="radio"]');
    scoreInputs.forEach(input => {
        input.addEventListener('change', calculateScore);
    });
    
    // Form submission
    document.getElementById('scoutForm').addEventListener('submit', handleSubmit);
}

// Score Calculation
function calculateScore() {
    let totalScore = 0;
    
    // Checkboxes with data-points
    document.querySelectorAll('input[type="checkbox"][data-points]:checked').forEach(checkbox => {
        totalScore += parseInt(checkbox.dataset.points);
    });
    
    // Radio buttons
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        totalScore += parseInt(radio.value);
    });
    
    document.getElementById('totalScore').textContent = totalScore;
    return totalScore;
}

// Form Submission
function handleSubmit(e) {
    e.preventDefault();
    
    const report = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        teamName: document.getElementById('teamName').value,
        teamNumber: parseInt(document.getElementById('teamNumber').value),
        matchNumber: document.getElementById('matchNumber').value,
        matchType: document.getElementById('matchType').value,
        scouterName: document.getElementById('scouterName').value,
        
        // Autonomous
        autoFunctional: document.getElementById('autoFunctional').checked,
        autoLeaveZone: document.getElementById('autoLeaveZone').checked,
        autoScoreHub: document.getElementById('autoScoreHub').checked,
        autoFuelAmount: getRadioValue('autoFuelAmount'),
        autoAccuracy: getRadioValue('autoAccuracy'),
        autoClimb: document.getElementById('autoClimb').checked,
        autoRPAuto: document.getElementById('autoRPAuto').checked,
        autoRPScore: document.getElementById('autoRPScore').checked,
        
        // Teleoperated
        teleopDefensive: document.getElementById('teleopDefensive').checked,
        defenseType: getRadioValue('defenseType'),
        defenseEfficiency: getRadioValue('defenseEfficiency'),
        fuelCapacity: getRadioValue('fuelCapacity'),
        scoreCycle: getRadioValue('scoreCycle'),
        scoreEfficiency: getRadioValue('scoreEfficiency'),
        posHub: document.getElementById('posHub').checked,
        posLong: document.getElementById('posLong').checked,
        posBoth: document.getElementById('posBoth').checked,
        scoreInactive: document.getElementById('scoreInactive').checked,
        moveRamp: document.getElementById('moveRamp').checked,
        moveSides: document.getElementById('moveSides').checked,
        
        // Endgame
        endClimb: document.getElementById('endClimb').checked,
        climbLevel: getRadioValue('climbLevel'),
        climbTime: getRadioValue('climbTime'),
        endRP: document.getElementById('endRP').checked,
        
        // Considerations
        penalties: getRadioValue('penalties'),
        penaltyType: document.getElementById('penaltyType').value,
        teamwork: getRadioValue('teamwork'),
        obsSpace: document.getElementById('obsSpace').checked,
        obsCycles: document.getElementById('obsCycles').checked,
        obsEndgame: document.getElementById('obsEndgame').checked,
        obsConflict: document.getElementById('obsConflict').checked,
        consistency: getRadioValue('consistency'),
        reliability: getRadioValue('reliability'),
        comments: document.getElementById('comments').value,
        
        // Score
        totalScore: calculateScore()
    };
    
    // Save to Firebase
    saveReportToFirebase(report)
        .then(() => {
            // Show success message
            alert('✅ Relatório salvo no Firebase com sucesso! Todos podem visualizar agora.');
            
            // Reset form
            resetForm();
            
            // Scroll to reports section
            document.getElementById('reports').scrollIntoView({ behavior: 'smooth' });
        })
        .catch((error) => {
            alert('❌ Erro ao salvar relatório: ' + error.message);
        });
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
}

// Reset Form
function resetForm() {
    document.getElementById('scoutForm').reset();
    document.getElementById('totalScore').textContent = '0';
    document.getElementById('autoScoreDetails').style.display = 'none';
    document.getElementById('defensiveDetails').style.display = 'none';
    document.getElementById('offensiveDetails').style.display = 'block';
    document.getElementById('climbDetails').style.display = 'none';
    document.getElementById('penaltyDetails').style.display = 'none';
}

// Search Team
window.searchTeam = function() {
    const searchTerm = document.getElementById('searchTeam').value.toLowerCase();
    
    getAllTeamsFromFirebase((teams) => {
        const filtered = teams.filter(team => 
            team.teamNumber.toString().includes(searchTerm) ||
            team.teamName.toLowerCase().includes(searchTerm)
        );
        
        displayTeams(filtered);
    });
}

// Show Team Details
window.showTeamDetails = function(teamNumber) {
    getTeamReportsFromFirebase(teamNumber, (reports) => {
        if (reports.length === 0) return;
        
        const teamName = reports[0].teamName;
        const avgScore = (reports.reduce((sum, r) => sum + r.totalScore, 0) / reports.length).toFixed(1);
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="modal-team-header">
                <div class="modal-team-number">#${teamNumber}</div>
                <div class="modal-team-name">${teamName}</div>
                <div style="margin-top: 16px; font-size: 20px; color: var(--color-text-secondary);">
                    Pontuação Média: <span style="color: var(--color-neon-cyan); font-weight: 700;">${avgScore} pts</span>
                </div>
                <div style="margin-top: 8px; font-size: 14px; color: var(--color-text-secondary);">
                    📊 Total de ${reports.length} relatório${reports.length > 1 ? 's' : ''}
                </div>
            </div>
            
            <div class="reports-list">
                ${reports.map(report => `
                    <div class="report-card">
                        <div class="report-header">
                            <div>
                                <div class="report-match">
                                    ${report.matchType === 'qualifier' ? 'Qualifier' : 'Playoff'} - ${report.matchNumber}
                                </div>
                                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
                                    Scouter: ${report.scouterName} • ${new Date(report.timestamp).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div class="report-score">${report.totalScore} pts</div>
                        </div>
                        
                        <div class="report-details">
                            <div class="report-detail-item">
                                <span class="report-detail-label">Autônomo:</span> 
                                ${report.autoFunctional ? '✅' : '❌'}
                            </div>
                            <div class="report-detail-item">
                                <span class="report-detail-label">Climb:</span> 
                                ${report.endClimb ? '✅' : '❌'}
                            </div>
                            <div class="report-detail-item">
                                <span class="report-detail-label">Defesa:</span> 
                                ${report.teleopDefensive ? '✅' : '❌'}
                            </div>
                            <div class="report-detail-item">
                                <span class="report-detail-label">Confiabilidade:</span> 
                                ${report.reliability > 0 ? 'Alta' : report.reliability < 0 ? 'Baixa' : 'Média'}
                            </div>
                        </div>
                        
                        ${report.comments ? `
                            <div class="report-comments">
                                💬 ${report.comments}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        document.getElementById('teamModal').style.display = 'block';
    });
}

// Close Modal
window.closeModal = function() {
    document.getElementById('teamModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('teamModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Mobile menu toggle
document.querySelector('.nav-toggle')?.addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Export for debugging
window.resetForm = resetForm;