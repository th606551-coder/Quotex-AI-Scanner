/**
 * QUOTEX AI MARKET SCANNER - v1.0
 * Phase 5: Signal History & Trade Journal
 */

// --- 1. State Management & LocalStorage ---
let botState = {
    wins: 0, losses: 0, draws: 0, netPL: 0,
    consecutiveLosses: 0, dailyLosses: 0,
    lastDate: new Date().toLocaleDateString(),
    isRiskLocked: false,
    history: [] // Phase 5: Array to store trade logs
};

const StorageManager = {
    save: function() { localStorage.setItem('QuotexAI_State', JSON.stringify(botState)); },
    load: function() {
        const saved = localStorage.getItem('QuotexAI_State');
        if (saved) {
            botState = JSON.parse(saved);
            if(!botState.history) botState.history = []; // Fallback for old save
            const today = new Date().toLocaleDateString();
            if (botState.lastDate !== today) {
                botState.dailyLosses = 0; botState.lastDate = today; this.save();
            }
        }
    }
};

// --- 2. Risk Engine & Results Logging (Phase 4 + 5) ---
const RiskEngine = {
    MAX_CONSECUTIVE_LOSSES: 2, DAILY_LOSS_LIMIT: 3,
    checkRiskStatus: function() {
        if (botState.consecutiveLosses >= this.MAX_CONSECUTIVE_LOSSES) return { locked: true, reason: 'CIRCUIT BREAKER' };
        if (botState.dailyLosses >= this.DAILY_LOSS_LIMIT) return { locked: true, reason: 'DAILY LIMIT REACHED' };
        return { locked: false, reason: 'SAFE' };
    },
    
    // Log Signal to History
    logSignal: function(direction, reason) {
        if(direction === 'WAIT') return; // Don't log WAIT signals
        const entry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            direction: direction,
            result: 'PENDING',
            net: 0
        };
        botState.history.unshift(entry); // Add to top
        if(botState.history.length > 50) botState.history.pop(); // Keep only last 50
        StorageManager.save();
        renderJournal();
    },

    // Process Result
    registerTradeResult: function(result) {
        if (botState.isRiskLocked) return;

        // Find the last pending signal to update it
        let lastPending = botState.history.find(h => h.result === 'PENDING');

        if (result === 'WIN') {
            botState.wins++; botState.netPL += 85; botState.consecutiveLosses = 0;
            if(lastPending) { lastPending.result = 'WIN'; lastPending.net = '+৳85'; }
        } 
        else if (result === 'LOSS') {
            botState.losses++; botState.netPL -= 100; botState.consecutiveLosses++; botState.dailyLosses++;
            if(lastPending) { lastPending.result = 'LOSS'; lastPending.net = '-৳100'; }
        }

        const riskCheck = this.checkRiskStatus();
        if (riskCheck.locked) botState.isRiskLocked = true;

        StorageManager.save();
        updateStatsUI();
        renderJournal();
    }
};

// --- 3. UI Updaters & Modal Logic (Phase 5) ---
const signalBox = document.getElementById('signal-display');
const signalText = document.getElementById('signal-text');
const signalReason = document.getElementById('signal-reason');
const btnDeepScan = document.getElementById('btn-deep-scan');
const journalModal = document.getElementById('journal-modal');

// Toggle Journal Modal
document.getElementById('btn-journal').addEventListener('click', () => journalModal.classList.remove('hidden'));
document.getElementById('close-journal').addEventListener('click', () => journalModal.classList.add('hidden'));

function updateStatsUI() {
    document.getElementById('win-loss-count').innerText = `${botState.wins} / ${botState.losses}`;
    const totalTrades = botState.wins + botState.losses;
    document.getElementById('win-rate').innerText = totalTrades > 0 ? `${((botState.wins / totalTrades) * 100).toFixed(1)}%` : `0%`;
    const plElement = document.getElementById('net-pl');
    plElement.innerText = `৳${botState.netPL.toFixed(2)}`;
    plElement.className = botState.netPL < 0 ? 'text-red' : 'text-green';

    const riskCheck = RiskEngine.checkRiskStatus();
    if (botState.isRiskLocked || riskCheck.locked) {
        document.getElementById('risk-status').innerText = 'RISK LOCK';
        document.getElementById('risk-status').className = 'text-red';
        btnDeepScan.disabled = true;
    }
}

function renderJournal() {
    const tbody = document.getElementById('journal-body');
    tbody.innerHTML = '';
    botState.history.forEach(log => {
        let resClass = log.result === 'WIN' ? 'res-win' : (log.result === 'LOSS' ? 'res-loss' : 'res-pend');
        let tr = `<tr>
            <td>${log.time}</td>
            <td class="${log.direction === 'UP' ? 'text-green' : 'text-red'}">${log.direction}</td>
            <td class="${resClass}">${log.result}</td>
            <td>${log.net !== 0 ? log.net : '-'}</td>
        </tr>`;
        tbody.innerHTML += tr;
    });
}

function showSignal(direction, reason, styleClass) {
    signalText.innerText = direction;
    signalReason.innerText = reason;
    signalBox.className = 'signal-box ' + styleClass;
}

// --- 4. Analysis Engine (Mock) ---
const AnalysisEngine = {
    generateSignal: function() {
        // Mocking an UP or DOWN signal for testing Journal
        const rand = Math.random();
        if(rand > 0.5) return { signal: 'UP', reason: 'Bullish Trend Confirmed', status: 'up' };
        else return { signal: 'DOWN', reason: 'Bearish Trend Confirmed', status: 'down' };
    }
};

// --- 5. Event Listeners ---
btnDeepScan.addEventListener('click', () => {
    if (botState.isRiskLocked) return;
    btnDeepScan.disabled = true;
    showSignal('SCANNING', 'Validation in progress...', 'wait');
    
    setTimeout(() => {
        const result = AnalysisEngine.generateSignal();
        showSignal(result.signal, result.reason, result.status);
        RiskEngine.logSignal(result.signal, result.reason); // Log to Journal
        btnDeepScan.disabled = false;
    }, 2000);
});

// Mock Test Buttons Generator
function createTestButtons() {
    const testDiv = document.createElement('div');
    testDiv.style = "margin-top: 15px; display: flex; gap: 10px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px;";
    testDiv.innerHTML = `
        <button onclick="RiskEngine.registerTradeResult('WIN')" style="background: #4ADE80; padding: 5px 10px; cursor: pointer;">WIN (+৳85)</button>
        <button onclick="RiskEngine.registerTradeResult('LOSS')" style="background: #FB7185; padding: 5px 10px; cursor: pointer; color: white;">LOSS (-৳100)</button>
        <button onclick="localStorage.clear(); location.reload();" style="background: #6B7280; padding: 5px 10px; cursor: pointer; color: white;">RESET SYSTEM</button>
    `;
    document.querySelector('.stats-grid').after(testDiv);
}

// Boot up
window.onload = () => {
    StorageManager.load();
    updateStatsUI();
    renderJournal();
    createTestButtons(); 
};
