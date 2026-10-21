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
/**
 * PHASE 3: ANALYSIS ENGINE (TECHNICAL INDICATORS & CANDLE LOGIC)
 * Calculates EMA, RSI, ATR, and strict candle patterns.
 */

const AnalysisEngine = {
    
    // ১. EMA (Exponential Moving Average) ক্যালকুলেটর
    calculateEMA: function(data, period) {
        if (data.length < period) return null;
        const k = 2 / (period + 1);
        let emaArray = [data[0]]; // প্রথম ভ্যালুটিকে SMA হিসেবে ধরা হলো
        
        for (let i = 1; i < data.length; i++) {
            const currentEMA = (data[i] * k) + (emaArray[i - 1] * (1 - k));
            emaArray.push(currentEMA);
        }
        return emaArray[emaArray.length - 1]; // সর্বশেষ EMA ভ্যালু রিটার্ন করবে
    },

    // ২. RSI (Relative Strength Index) ক্যালকুলেটর
    calculateRSI: function(data, period = 14) {
        if (data.length < period + 1) return null;
        let gains = 0, losses = 0;

        for (let i = 1; i <= period; i++) {
            const difference = data[i] - data[i - 1];
            if (difference > 0) gains += difference;
            else losses -= difference;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        for (let i = period + 1; i < data.length; i++) {
            const difference = data[i] - data[i - 1];
            let gain = difference > 0 ? difference : 0;
            let loss = difference < 0 ? -difference : 0;

            avgGain = ((avgGain * (period - 1)) + gain) / period;
            avgLoss = ((avgLoss * (period - 1)) + loss) / period;
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs)); // সর্বশেষ RSI রিটার্ন করবে
    },

    // ৩. ক্যান্ডেলস্টিক স্ট্রাকচার ও রিজেকশন অ্যানালাইসিস
    analyzeCandle: function(candle) {
        const { open, high, low, close } = candle;
        const body = Math.abs(close - open);
        const totalSize = high - low;
        const upperWick = high - Math.max(open, close);
        const lowerWick = Math.min(open, close) - low;
        
        const isBullish = close > open;
        const isBearish = close < open;
        
        // Strict Validation: ক্যান্ডেলের বডি খুব ছোট বা উইক খুব বড় হলে তা রিস্কি
        const isDoji = body <= (totalSize * 0.1); 
        const hasStrongRejection = (isBullish && lowerWick > body * 1.5) || (isBearish && upperWick > body * 1.5);

        return {
            isBullish,
            isBearish,
            isDoji,
            hasStrongRejection,
            body,
            totalSize
        };
    },

    // ৪. 5-Gate Ultra-Safe Decision Maker
    generateSignal: function(ohlcData) {
        // শুধু Close প্রাইসের অ্যারে তৈরি করা (EMA ও RSI এর জন্য)
        const closePrices = ohlcData.map(candle => candle.close);
        
        // Gate 1: Data Check
        if (closePrices.length < 30) return { signal: 'WAIT', reason: 'Not enough historical data (warming up).', status: 'wait' };

        // Indicators
        const ema9 = this.calculateEMA(closePrices, 9);
        const ema21 = this.calculateEMA(closePrices, 21);
        const rsi = this.calculateRSI(closePrices, 14);
        const lastCandle = this.analyzeCandle(ohlcData[ohlcData.length - 1]);

        // Gate 2: Trend Confirmation
        const isUptrend = ema9 > ema21;
        const isDowntrend = ema9 < ema21;

        // Gate 3 & 4: Momentum & Candle Validation
        if (lastCandle.isDoji) return { signal: 'WAIT', reason: 'Doji detected. Market undecided.', status: 'wait' };
        if (rsi > 75 || rsi < 25) return { signal: 'WAIT', reason: 'Extreme Momentum (Overbought/Oversold).', status: 'wait' };

        // Gate 5: Final Signal Execution
        if (isUptrend && lastCandle.isBullish && !lastCandle.hasStrongRejection && rsi > 50) {
            return { signal: 'UP', reason: 'Uptrend, Bullish Candle & Solid RSI Confirmed.', status: 'up' };
        } 
        else if (isDowntrend && lastCandle.isBearish && !lastCandle.hasStrongRejection && rsi < 50) {
            return { signal: 'DOWN', reason: 'Downtrend, Bearish Candle & Solid RSI Confirmed.', status: 'down' };
        }

        return { signal: 'WAIT', reason: 'Strict criteria not met. Skipping to next candle.', status: 'wait' };
    }
};
