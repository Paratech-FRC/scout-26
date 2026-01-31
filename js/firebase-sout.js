// Firebase Scout System
import { database, ref, push, set, onValue, query, orderByChild } from './firebase-config.js';

// Database references
const reportsRef = ref(database, 'reports');

// Save report to Firebase
export function saveReportToFirebase(report) {
    const newReportRef = push(reportsRef);
    return set(newReportRef, {
        ...report,
        firebaseId: newReportRef.key,
        timestamp: report.timestamp || new Date().toISOString()
    }).then(() => {
        console.log('✅ Relatório salvo no Firebase com sucesso!');
        return newReportRef.key;
    }).catch((error) => {
        console.error('❌ Erro ao salvar relatório no Firebase:', error);
        throw error;
    });
}

// Load all reports from Firebase in real-time
export function loadReportsFromFirebase(callback) {
    const reportsQuery = query(reportsRef, orderByChild('timestamp'));
    
    onValue(reportsQuery, (snapshot) => {
        const reports = [];
        snapshot.forEach((childSnapshot) => {
            const report = childSnapshot.val();
            reports.push({
                ...report,
                firebaseId: childSnapshot.key
            });
        });
        
        // Sort by timestamp (newest first)
        reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(`📊 ${reports.length} relatórios carregados do Firebase`);
        callback(reports);
    }, (error) => {
        console.error('❌ Erro ao carregar relatórios do Firebase:', error);
        callback([]);
    });
}

// Get reports for a specific team
export function getTeamReportsFromFirebase(teamNumber, callback) {
    onValue(reportsRef, (snapshot) => {
        const reports = [];
        snapshot.forEach((childSnapshot) => {
            const report = childSnapshot.val();
            if (report.teamNumber === teamNumber) {
                reports.push({
                    ...report,
                    firebaseId: childSnapshot.key
                });
            }
        });
        
        // Sort by timestamp (newest first)
        reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        callback(reports);
    });
}

// Get all teams with their reports
export function getAllTeamsFromFirebase(callback) {
    onValue(reportsRef, (snapshot) => {
        const teamsMap = new Map();
        
        snapshot.forEach((childSnapshot) => {
            const report = childSnapshot.val();
            const teamNumber = report.teamNumber;
            
            if (!teamsMap.has(teamNumber)) {
                teamsMap.set(teamNumber, {
                    teamNumber: teamNumber,
                    teamName: report.teamName,
                    reports: []
                });
            }
            
            teamsMap.get(teamNumber).reports.push({
                ...report,
                firebaseId: childSnapshot.key
            });
        });
        
        const teams = Array.from(teamsMap.values());
        
        // Sort each team's reports by timestamp
        teams.forEach(team => {
            team.reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
        
        // Sort teams by average score (descending)
        teams.sort((a, b) => {
            const avgA = a.reports.reduce((sum, r) => sum + r.totalScore, 0) / a.reports.length;
            const avgB = b.reports.reduce((sum, r) => sum + r.totalScore, 0) / b.reports.length;
            return avgB - avgA;
        });
        
        callback(teams);
    });
}

// Update Firebase status UI
function updateFirebaseStatus(connected) {
    const statusDot = document.getElementById('firebaseStatus');
    const statusText = document.getElementById('firebaseStatusText');
    
    if (statusDot && statusText) {
        if (connected) {
            statusDot.style.background = '#00ff00';
            statusDot.style.boxShadow = '0 0 10px #00ff00';
            statusText.textContent = 'Conectado ao Firebase!';
            statusText.style.color = '#00ff00';
        } else {
            statusDot.style.background = '#ff0000';
            statusDot.style.boxShadow = '0 0 10px #ff0000';
            statusText.textContent = 'Desconectado do Firebase';
            statusText.style.color = '#ff0000';
        }
    }
}

// Initialize Firebase connection and migrate data
export function initializeFirebaseScout() {
    console.log('🔥 Inicializando Firebase Scout System...');
    
    // Check connection
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val() === true;
        
        if (isConnected) {
            console.log('✅ Conectado ao Firebase!');
            updateFirebaseStatus(true);
            // Migrate local data on first connection
            migrateLocalStorageToFirebase();
        } else {
            console.log('⚠️ Desconectado do Firebase');
            updateFirebaseStatus(false);
        }
    });
}