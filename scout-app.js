// Scout Application JavaScript
// Manages the scouting system functionality

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeScoutApp();
});

function initializeScoutApp() {
    // Get elements
    const newScoutBtn = document.getElementById('newScoutBtn');
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const scoutForm = document.getElementById('scoutForm');
    const scoutFormSection = document.getElementById('scoutFormSection');
    const reportsSection = document.getElementById('reportsSection');
    const reportDetail = document.getElementById('reportDetail');
    const searchBtn = document.getElementById('searchBtn');
    const searchTeam = document.getElementById('searchTeam');

    // Event listeners
    newScoutBtn.addEventListener('click', showScoutForm);
    viewReportsBtn.addEventListener('click', showReports);
    cancelBtn.addEventListener('click', hideAllSections);
    scoutForm.addEventListener('submit', handleFormSubmit);
    searchBtn.addEventListener('click', searchReports);
    searchTeam.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchReports();
    });

    // Initialize conditional sections
    setupConditionalSections();
    
    // Initialize score calculation
    setupScoreCalculation();

    // Load reports on page load
    loadReports();
}

function showScoutForm() {
    hideAllSections();
    document.getElementById('scoutFormSection').style.display = 'block';
    document.getElementById('scoutForm').reset();
    updateTotalScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showReports() {
    hideAllSections();
    document.getElementById('reportsSection').style.display = 'block';
    loadReports();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllSections() {
    document.getElementById('scoutFormSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('reportDetail').style.display = 'none';
}

function setupConditionalSections() {
    // Auto scoring conditional
    const autoScoresHub = document.querySelectorAll('input[name="autoScoresHub"]');
    autoScoresHub.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === '5';
            document.getElementById('autoFuelSection').style.display = show ? 'block' : 'none';
            document.getElementById('autoAccuracySection').style.display = show ? 'block' : 'none';
        });
    });

    // Defensive/Offensive conditional
    const teleopDefensive = document.querySelectorAll('input[name="teleopDefensive"]');
    teleopDefensive.forEach(radio => {
        radio.addEventListener('change', function() {
            const isDefensive = this.value === 'yes';
            document.getElementById('defensiveSection').style.display = isDefensive ? 'block' : 'none';
            document.getElementById('offensiveSection').style.display = isDefensive ? 'none' : 'block';
        });
    });

    // Climb conditional
    const endgameClimb = document.querySelectorAll('input[name="endgameClimb"]');
    endgameClimb.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === 'yes';
            document.getElementById('climbSection').style.display = show ? 'block' : 'none';
        });
    });

    // Penalties conditional
    const penalties = document.querySelectorAll('input[name="penalties"]');
    penalties.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value !== '0';
            document.getElementById('penaltyTypeSection').style.display = show ? 'block' : 'none';
        });
    });
}

function setupScoreCalculation() {
    const form = document.getElementById('scoutForm');
    const inputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    
    inputs.forEach(input => {
        input.addEventListener('change', updateTotalScore);
    });
}

function updateTotalScore() {
    let totalScore = 0;

    // Helper function to get radio value
    function getRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? parseInt(radio.value) || 0 : 0;
    }

    // Helper function to get checkbox values
    function getCheckboxValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        let total = 0;
        checkboxes.forEach(cb => {
            const value = parseInt(cb.value);
            if (!isNaN(value)) total += value;
        });
        return total;
    }

    // Autonomous
    totalScore += getRadioValue('autoFunctional');
    totalScore += getRadioValue('autoLeaveZone');
    totalScore += getRadioValue('autoScoresHub');
    
    if (getRadioValue('autoScoresHub') === 5) {
        totalScore += getRadioValue('autoFuelAmount');
        totalScore += getRadioValue('autoAccuracy');
    }
    
    totalScore += getRadioValue('autoClimb');
    
    // Auto RP
    const autoRPCheckboxes = document.querySelectorAll('input[name="autoRP"]:checked');
    autoRPCheckboxes.forEach(() => totalScore += 6);

    // Teleoperated
    const isDefensive = document.querySelector('input[name="teleopDefensive"]:checked')?.value === 'yes';
    
    if (isDefensive) {
        totalScore += getRadioValue('defenseType');
        totalScore += getRadioValue('defenseEfficiency');
    } else {
        totalScore += getRadioValue('fuelCapacity');
        totalScore += getRadioValue('cycleSpeed');
        totalScore += getRadioValue('scoreEfficiency');
        
        // Positioning
        const positioningBoth = document.querySelector('input[name="positioning"][value="both"]:checked');
        if (positioningBoth) totalScore += 5;
        
        totalScore += getRadioValue('inactiveHub');
        
        // Movement
        const movementCheckboxes = document.querySelectorAll('input[name="movement"]:checked');
        movementCheckboxes.forEach(() => totalScore += 3);
    }

    // Endgame
    const hasClimb = document.querySelector('input[name="endgameClimb"]:checked')?.value === 'yes';
    if (hasClimb) {
        totalScore += getRadioValue('climbLevel');
        totalScore += getRadioValue('climbSpeed');
    }
    totalScore += getRadioValue('endgameRP');

    // Considerations
    totalScore += getRadioValue('penalties');
    totalScore += getRadioValue('teamwork');
    totalScore += getRadioValue('consistency');
    totalScore += getRadioValue('reliability');

    // Update display
    document.getElementById('totalScore').textContent = totalScore;
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Collect form data
    const formData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        basicInfo: {
            teamName: document.getElementById('teamName').value,
            teamNumber: document.getElementById('teamNumber').value,
            matchNumber: document.getElementById('matchNumber').value,
            matchType: document.getElementById('matchType').value,
            scouterName: document.getElementById('scouterName').value
        },
        autonomous: collectAutonomousData(),
        teleoperated: collectTeleoperatedData(),
        endgame: collectEndgameData(),
        considerations: collectConsiderationsData(),
        totalScore: parseInt(document.getElementById('totalScore').textContent)
    };

    // Save to localStorage
    saveReport(formData);

    // Show success message
    alert('✅ Relatório salvo com sucesso!');

    // Reset form and show reports
    document.getElementById('scoutForm').reset();
    updateTotalScore();
    showReports();
}

function collectAutonomousData() {
    return {
        functional: getRadioValue('autoFunctional'),
        leaveZone: getRadioValue('autoLeaveZone'),
        scoresHub: getRadioValue('autoScoresHub'),
        fuelAmount: getRadioValue('autoFuelAmount'),
        accuracy: getRadioValue('autoAccuracy'),
        climb: getRadioValue('autoClimb'),
        rankingPoints: getCheckboxValues('autoRP')
    };
}

function collectTeleoperatedData() {
    const isDefensive = document.querySelector('input[name="teleopDefensive"]:checked')?.value === 'yes';
    
    if (isDefensive) {
        return {
            type: 'defensive',
            defenseType: getRadioValue('defenseType'),
            defenseEfficiency: getRadioValue('defenseEfficiency')
        };
    } else {
        return {
            type: 'offensive',
            fuelCapacity: getRadioValue('fuelCapacity'),
            cycleSpeed: getRadioValue('cycleSpeed'),
            scoreEfficiency: getRadioValue('scoreEfficiency'),
            positioning: getCheckboxValuesArray('positioning'),
            inactiveHub: getRadioValue('inactiveHub'),
            movement: getCheckboxValuesArray('movement')
        };
    }
}

function collectEndgameData() {
    const hasClimb = document.querySelector('input[name="endgameClimb"]:checked')?.value === 'yes';
    
    return {
        climb: hasClimb,
        climbLevel: hasClimb ? getRadioValue('climbLevel') : 0,
        climbSpeed: hasClimb ? getRadioValue('climbSpeed') : 0,
        rankingPoint: getRadioValue('endgameRP')
    };
}

function collectConsiderationsData() {
    return {
        penalties: getRadioValue('penalties'),
        penaltyTypes: getCheckboxValuesArray('penaltyType'),
        penaltyOther: document.getElementById('penaltyOther')?.value || '',
        teamwork: getRadioValue('teamwork'),
        teamworkObs: getCheckboxValuesArray('teamworkObs'),
        consistency: getRadioValue('consistency'),
        reliability: getRadioValue('reliability'),
        comments: document.getElementById('scouterComments').value
    };
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? parseInt(radio.value) || 0 : 0;
}

function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    let total = 0;
    checkboxes.forEach(cb => {
        const value = parseInt(cb.value);
        if (!isNaN(value)) total += value;
    });
    return total;
}

function getCheckboxValuesArray(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function saveReport(report) {
    let reports = getReports();
    reports.push(report);
    localStorage.setItem('scoutReports', JSON.stringify(reports));
}

function getReports() {
    const reports = localStorage.getItem('scoutReports');
    return reports ? JSON.parse(reports) : [];
}

function loadReports(searchQuery = '') {
    const reports = getReports();
    const reportsGrid = document.getElementById('reportsGrid');
    
    // Filter reports if search query exists
    let filteredReports = reports;
    if (searchQuery) {
        filteredReports = reports.filter(report => 
            report.basicInfo.teamNumber.includes(searchQuery) ||
            report.basicInfo.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort by timestamp (newest first)
    filteredReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filteredReports.length === 0) {
        reportsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p class="empty-state-text">${searchQuery ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível'}</p>
                <p class="empty-state-text">Crie seu primeiro relatório de scouting!</p>
            </div>
        `;
        return;
    }

    reportsGrid.innerHTML = filteredReports.map(report => `
        <div class="report-card" onclick="viewReportDetail('${report.id}')">
            <div class="report-card-header">
                <div class="report-team-number">#${report.basicInfo.teamNumber}</div>
                <div class="report-score">${report.totalScore} pts</div>
            </div>
            <div class="report-card-body">
                <div class="report-team-name">${report.basicInfo.teamName}</div>
                <div class="report-match-info">
                    ${report.basicInfo.matchType === 'qualifier' ? 'Qualifier' : 'Playoff'} - 
                    Partida ${report.basicInfo.matchNumber}
                </div>
                <div class="report-scouter">Scouter: ${report.basicInfo.scouterName}</div>
                <div class="report-date">${formatDate(report.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function searchReports() {
    const searchQuery = document.getElementById('searchTeam').value;
    loadReports(searchQuery);
}

function viewReportDetail(reportId) {
    const reports = getReports();
    const report = reports.find(r => r.id === reportId);
    
    if (!report) return;

    hideAllSections();
    const reportDetail = document.getElementById('reportDetail');
    reportDetail.style.display = 'block';

    reportDetail.innerHTML = `
        <div class="report-detail-header">
            <div class="report-detail-team">#${report.basicInfo.teamNumber} - ${report.basicInfo.teamName}</div>
            <div class="report-detail-info">
                ${report.basicInfo.matchType === 'qualifier' ? 'Qualifier' : 'Playoff'} - 
                Partida ${report.basicInfo.matchNumber}
            </div>
            <div class="report-detail-info">Scouter: ${report.basicInfo.scouterName}</div>
            <div class="report-detail-info">${formatDate(report.timestamp)}</div>
            <div class="report-detail-score">${report.totalScore} pontos</div>
        </div>

        <div class="report-detail-sections">
            ${generateAutonomousSection(report.autonomous)}
            ${generateTeleoperatedSection(report.teleoperated)}
            ${generateEndgameSection(report.endgame)}
            ${generateConsiderationsSection(report.considerations)}
        </div>

        <div class="report-detail-actions">
            <button class="btn btn-secondary" onclick="showReports()">
                <span>← Voltar</span>
                <div class="btn-glow"></div>
            </button>
            <button class="btn btn-primary" onclick="deleteReport('${report.id}')">
                <span>🗑️ Excluir</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateAutonomousSection(auto) {
    return `
        <div class="report-detail-section">
            <h4>🤖 Autônomo</h4>
            <div class="report-detail-item">
                <span class="report-detail-label">Autônomo funcional:</span>
                <span class="report-detail-value">${auto.functional > 0 ? 'Sim' : 'Não'} (${auto.functional > 0 ? '+' : ''}${auto.functional})</span>
            </div>
            <div class="report-detail-item">
                <span class="report-detail-label">Sai da zona inicial:</span>
                <span class="report-detail-value">${auto.leaveZone > 0 ? 'Sim' : 'Não'} (${auto.leaveZone > 0 ? '+' : ''}${auto.leaveZone})</span>
            </div>
            <div class="report-detail-item">
                <span class="report-detail-label">Pontua no HUB:</span>
                <span class="report-detail-value">${auto.scoresHub > 0 ? 'Sim' : 'Não'} (${auto.scoresHub > 0 ? '+' : ''}${auto.scoresHub})</span>
            </div>
            ${auto.scoresHub > 0 ? `
                <div class="report-detail-item">
                    <span class="report-detail-label">Quantidade de FUEL:</span>
                    <span class="report-detail-value">+${auto.fuelAmount}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Precisão:</span>
                    <span class="report-detail-value">+${auto.accuracy}</span>
                </div>
            ` : ''}
            <div class="report-detail-item">
                <span class="report-detail-label">CLIMB no autônomo:</span>
                <span class="report-detail-value">${auto.climb > 0 ? 'Sim' : 'Não'} (${auto.climb > 0 ? '+' : ''}${auto.climb})</span>
            </div>
            <div class="report-detail-item">
                <span class="report-detail-label">Ranking Points:</span>
                <span class="report-detail-value">+${auto.rankingPoints}</span>
            </div>
        </div>
    `;
}

function generateTeleoperatedSection(teleop) {
    if (teleop.type === 'defensive') {
        return `
            <div class="report-detail-section">
                <h4>🎮 Teleoperado (Defensivo)</h4>
                <div class="report-detail-item">
                    <span class="report-detail-label">Tipo de defesa:</span>
                    <span class="report-detail-value">+${teleop.defenseType}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Eficiência defensiva:</span>
                    <span class="report-detail-value">+${teleop.defenseEfficiency}</span>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="report-detail-section">
                <h4>🎮 Teleoperado (Ofensivo)</h4>
                <div class="report-detail-item">
                    <span class="report-detail-label">Capacidade de FUEL:</span>
                    <span class="report-detail-value">+${teleop.fuelCapacity}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Velocidade de ciclo:</span>
                    <span class="report-detail-value">+${teleop.cycleSpeed}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Eficiência de pontuação:</span>
                    <span class="report-detail-value">+${teleop.scoreEfficiency}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Posicionamento:</span>
                    <span class="report-detail-value">${teleop.positioning.join(', ')}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">HUB inativo:</span>
                    <span class="report-detail-value">${teleop.inactiveHub > 0 ? 'Sim' : 'Não'} (${teleop.inactiveHub > 0 ? '+' : ''}${teleop.inactiveHub})</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Movimentação:</span>
                    <span class="report-detail-value">${teleop.movement.join(', ')}</span>
                </div>
            </div>
        `;
    }
}

function generateEndgameSection(endgame) {
    return `
        <div class="report-detail-section">
            <h4>🏁 Endgame</h4>
            <div class="report-detail-item">
                <span class="report-detail-label">Conseguiu CLIMB:</span>
                <span class="report-detail-value">${endgame.climb ? 'Sim' : 'Não'}</span>
            </div>
            ${endgame.climb ? `
                <div class="report-detail-item">
                    <span class="report-detail-label">Nível do CLIMB:</span>
                    <span class="report-detail-value">+${endgame.climbLevel}</span>
                </div>
                <div class="report-detail-item">
                    <span class="report-detail-label">Velocidade:</span>
                    <span class="report-detail-value">+${endgame.climbSpeed}</span>
                </div>
            ` : ''}
            <div class="report-detail-item">
                <span class="report-detail-label">RP de Endgame:</span>
                <span class="report-detail-value">${endgame.rankingPoint > 0 ? 'Sim' : 'Não'} (${endgame.rankingPoint > 0 ? '+' : ''}${endgame.rankingPoint})</span>
            </div>
        </div>
    `;
}

function generateConsiderationsSection(considerations) {
    return `
        <div class="report-detail-section">
            <h4>⚠️ Considerações</h4>
            <div class="report-detail-item">
                <span class="report-detail-label">Penalidades:</span>
                <span class="report-detail-value">${considerations.penalties}</span>
            </div>
            ${considerations.penaltyTypes.length > 0 ? `
                <div class="report-detail-item">
                    <span class="report-detail-label">Tipos de penalidade:</span>
                    <span class="report-detail-value">${considerations.penaltyTypes.join(', ')}</span>
                </div>
            ` : ''}
            <div class="report-detail-item">
                <span class="report-detail-label">Trabalho em equipe:</span>
                <span class="report-detail-value">${considerations.teamwork > 0 ? '+' : ''}${considerations.teamwork}</span>
            </div>
            ${considerations.teamworkObs.length > 0 ? `
                <div class="report-detail-item">
                    <span class="report-detail-label">Observações:</span>
                    <span class="report-detail-value">${considerations.teamworkObs.join(', ')}</span>
                </div>
            ` : ''}
            <div class="report-detail-item">
                <span class="report-detail-label">Consistência:</span>
                <span class="report-detail-value">${considerations.consistency > 0 ? '+' : ''}${considerations.consistency}</span>
            </div>
            <div class="report-detail-item">
                <span class="report-detail-label">Confiabilidade:</span>
                <span class="report-detail-value">${considerations.reliability > 0 ? '+' : ''}${considerations.reliability}</span>
            </div>
            ${considerations.comments ? `
                <div class="report-detail-item" style="flex-direction: column; align-items: flex-start;">
                    <span class="report-detail-label">Comentários:</span>
                    <span class="report-detail-value" style="margin-top: 8px; white-space: pre-wrap;">${considerations.comments}</span>
                </div>
            ` : ''}
        </div>
    `;
}

function deleteReport(reportId) {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
        return;
    }

    let reports = getReports();
    reports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('scoutReports', JSON.stringify(reports));
    
    alert('✅ Relatório excluído com sucesso!');
    showReports();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Make functions globally accessible
window.viewReportDetail = viewReportDetail;
window.deleteReport = deleteReport;
window.showReports = showReports;