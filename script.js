/**
 * QUOTEX AI MARKET SCANNER - v1.0
 * Master Logic & Validation Engine
 */

// --- State Management ---
let isScanning = false;
let isRiskLocked = false;
let consecutiveLosses = 0;
let journal = { wins: 0, losses: 0, draws: 0, netPL: 0 };

// --- DOM Elements ---
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnDeepScan = document.getElementById('btn-deep-scan');
const signalBox = document.getElementById('signal-display');
const signalText = document.getElementById('signal-text');
const signalReason = document.getElementById('signal-reason');
const dataStatus = document.getElementById('data-status');
const riskStatus = document.getElementById('risk-status');
const progressBar = document.getElementById('scan-progress');

// --- Event Listeners ---
btnStart.addEventListener('click', startScanner);
btnStop.addEventListener('click', stopScanner);
btnDeepScan.addEventListener('click', performDeepScan);

// Load state from local storage on boot
window.onload = () => {
    loadState();
    updateStatsUI();
};

function startScanner() {
    if(isRiskLocked) {
        showSignal('WAIT', 'RISK LOCK ACTIVE - Trading Halted.', 'wait');
        return;
    }
    isScanning = true;
    btnStart.disabled = true;
    btnStop.disabled = false;
    dataStatus.innerText = 'VALID';
    dataStatus.className = 'text-green';
    
    // Start continuous 1-minute scanning loop
    showSignal('WAIT', 'Warming up data adapter...', 'wait');
}

function stopScanner() {
    isScanning = false;
    btnStart.disabled = false;
    btnStop.disabled = true;
    dataStatus.innerText = 'NOT CONNECTED';
    dataStatus.className = 'text-warning';
    showSignal('WAIT', 'Scanner stopped manually.', 'wait');
    progressBar.style.width = '0%';
}

async function performDeepScan() {
    if (!isScanning) return alert('Start scanner first!');
    if (isRiskLocked) return;

    btnDeepScan.disabled = true;
    showSignal('SCANNING', 'Running 5-Gate Validation...', 'wait');
    
    // Simulate 10-20 sec deep scan (CSS animation mock for 3 seconds here)
    progressBar.style.width = '0%';
    setTimeout(() => progressBar.style.width = '50%', 1000);
    setTimeout(() => progressBar.style.width = '80%', 2000);
    
    setTimeout(() => {
        progressBar.style.width = '100%';
        btnDeepScan.disabled = false;
        execute5GateLogic();
        setTimeout(() => { progressBar.style.width = '0%'; }, 1000);
    }, 3000);
}

// --- The 5-Gate Ultra-Safe Logic ---
function execute5GateLogic() {
    // GATE 1: Data Integrity (Simulated)
    const hasData = true; // In live, this checks Quotex OHLC array
    if (!hasData) return showSignal('DATA ERROR', 'Missing or Stale Chart Data', 'wait');

    // GATE 2: Trend Confirmation (Simulated)
    const ema9 = 1.1050;
    const ema21 = 1.1040;
    const isUptrend = ema9 > ema21;
    const isDowntrend = ema9 < ema21;

    // GATE 3: Candle Confirmation (Simulated Body Size)
    const candleValid = true; // No abnormal wicks

    // GATE 4: Momentum & Volatility (Simulated RSI/ATR)
    const rsi = 55; // Neutral-Bullish
    if (rsi > 80 || rsi < 20) return showSignal('WAIT', 'High Risk: Extreme Momentum (Overbought/Oversold)', 'wait');

    // GATE 5: Risk Validation
    if (consecutiveLosses >= 2) {
        lockRisk();
        return showSignal('RISK LOCK', 'Circuit Breaker: 2 Consecutive Losses.', 'wait');
    }

    // Final Decision Engine
    if (isUptrend && candleValid && rsi > 50) {
        showSignal('UP', 'Trend, Momentum & Candle Confirmed.', 'up');
    } else if (isDowntrend && candleValid && rsi < 50) {
        showSignal('DOWN', 'Trend, Momentum & Candle Confirmed.', 'down');
    } else {
        showSignal('WAIT', 'Conditions Unclear. Waiting for Next Candle.', 'wait');
    }
}

// --- UI & State Controllers ---
function showSignal(direction, reason, styleClass) {
    signalText.innerText = direction;
    signalReason.innerText = reason;
    
    // Update classes
    signalBox.className = 'signal-box ' + styleClass;
}

function lockRisk() {
    isRiskLocked = true;
    riskStatus.innerText = 'RISK LOCK';
    riskStatus.className = 'text-red';
    stopScanner();
    saveState();
}

// Mock function to simulate a trade outcome for testing the Risk Lock
function simulateTradeResult(result) {
    if(result === 'WIN') {
        consecutiveLosses = 0;
        journal.wins++;
        journal.netPL += 85; // Mock 85% payout on 100
    } else if (result === 'LOSS') {
        consecutiveLosses++;
        journal.losses++;
        journal.netPL -= 100;
    }
    saveState();
    updateStatsUI();
    if(consecutiveLosses >= 2) lockRisk();
}

// LocalStorage Persistence
function saveState() {
    const data = { journal, consecutiveLosses, isRiskLocked };
    localStorage.setItem('QuotexAI_State', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('QuotexAI_State');
    if (saved) {
        const data = JSON.parse(saved);
        journal = data.journal;
        consecutiveLosses = data.consecutiveLosses;
        isRiskLocked = data.isRiskLocked;
        if(isRiskLocked) lockRisk();
    }
}

function updateStatsUI() {
    document.getElementById('win-loss-count').innerText = `${journal.wins} / ${journal.losses}`;
    const total = journal.wins + journal.losses;
    const wr = total > 0 ? ((journal.wins / total) * 100).toFixed(1) : 0;
    document.getElementById('win-rate').innerText = `${wr}%`;
    document.getElementById('net-pl').innerText = `৳${journal.netPL.toFixed(2)}`;
    
    if(journal.netPL < 0) document.getElementById('net-pl').className = 'text-red';
    else document.getElementById('net-pl').className = 'text-green';
}
