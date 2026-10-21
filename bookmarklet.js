javascript:(function() {
    // 1. Prevent duplicate injection
    if (document.getElementById('quotex-ai-scanner-bot')) {
        alert('Quotex AI Scanner is already running!');
        return;
    }

    // 2. Inject CSS for the Floating Panel
    const style = document.createElement('style');
    style.innerHTML = `
        #quotex-ai-scanner-bot {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: rgba(8, 13, 24, 0.95);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            z-index: 999999;
            color: #EAF2FF;
            font-family: 'Inter', sans-serif;
            padding: 20px;
            cursor: move;
        }
        #quotex-ai-scanner-bot .header { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px; }
        #quotex-ai-scanner-bot h1 { font-size: 1.2rem; font-weight: 800; margin: 0; color: #38BDF8; }
        #quotex-ai-scanner-bot .status-text { font-size: 0.8rem; color: #FBBF24; }
        #quotex-ai-scanner-bot .signal-box { text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 15px; }
        #quotex-ai-scanner-bot .signal-box h2 { font-size: 2.5rem; margin: 0; }
        #quotex-ai-scanner-bot .btn { width: 100%; padding: 10px; border: none; border-radius: 8px; background: linear-gradient(135deg, #2563EB, #38BDF8); color: white; font-weight: bold; cursor: pointer; margin-bottom: 10px; }
        #quotex-ai-scanner-bot .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        #quotex-ai-scanner-bot .close-btn { background: #FB7185; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 2px 8px; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // 3. Inject HTML Structure
    const botContainer = document.createElement('div');
    botContainer.id = 'quotex-ai-scanner-bot';
    botContainer.innerHTML = `
        <div class="header">
            <h1>QUOTEX AI <span>v1.0</span></h1>
            <button class="close-btn" id="q-bot-close">X</button>
        </div>
        <div style="font-size:0.8rem; margin-bottom: 10px; display:flex; justify-content:space-between;">
            <span>Asset: <strong id="q-asset-name">Loading...</strong></span>
            <span>Data: <strong id="q-data-status" class="status-text">WAITING</strong></span>
        </div>
        <div class="signal-box" id="q-signal-box">
            <h2 id="q-signal-text">WAIT</h2>
            <p id="q-signal-reason" style="font-size:0.75rem; opacity:0.8; margin-top:5px;">Connecting to Data Adapter...</p>
        </div>
        <button class="btn" id="q-btn-scan">START DEEP SCAN</button>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:10px;">
            <span>Win Rate: <strong>0%</strong></span>
            <span>Net P/L: <strong>৳0.00</strong></span>
        </div>
    `;
    document.body.appendChild(botContainer);

    // 4. Drag & Drop Logic (Make it floating)
    let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    botContainer.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        if (e.target.tagName.toLowerCase() === 'button') return; 
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }
    function dragEnd(e) { initialX = currentX; initialY = currentY; isDragging = false; }
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            botContainer.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";
        }
    }

    // 5. Data Adapter Module (Phase 2 Core)
    const DataAdapter = {
        getAsset: function() {
            // Quotex DOM-এর উপর ভিত্তি করে অ্যাসেট নাম খোঁজার চেষ্টা
            const assetElement = document.querySelector('.pair-name, .asset-title'); 
            return assetElement ? assetElement.innerText : 'UNKNOWN ASSET';
        },
        getLiveOHLC: function() {
            // Note: Quotex uses Canvas/WebSockets. This is a placeholder for the actual extraction logic.
            // Future step: Intercept WebSocket frames or read Canvas pixel data.
            return null; 
        },
        validateData: function(data) {
            if (!data) return { valid: false, reason: "DATA UNAVAILABLE - Cannot read live chart." };
            return { valid: true, reason: "Data is stable." };
        }
    };

    // 6. UI Interaction & Scan Logic
    document.getElementById('q-bot-close').addEventListener('click', () => {
        botContainer.remove();
        style.remove();
    });

    document.getElementById('q-btn-scan').addEventListener('click', () => {
        const btn = document.getElementById('q-btn-scan');
        const status = document.getElementById('q-data-status');
        const sigText = document.getElementById('q-signal-text');
        const sigReason = document.getElementById('q-signal-reason');
        
        btn.disabled = true;
        btn.innerText = "SCANNING...";
        sigText.innerText = "---";
        sigReason.innerText = "Validating 5-Gate Rules...";

        // Fetch Data via Adapter
        document.getElementById('q-asset-name').innerText = DataAdapter.getAsset();
        const ohlcData = DataAdapter.getLiveOHLC();
        const validation = DataAdapter.validateData(ohlcData);

        setTimeout(() => {
            if (!validation.valid) {
                // Strict Rule: No Data = No Signal
                status.innerText = "DATA ERROR";
                status.style.color = "#FB7185";
                sigText.innerText = "WAIT";
                sigText.style.color = "#FBBF24";
                sigReason.innerText = validation.reason;
            } else {
                // Future Implementation: Real Engine Logic
                status.innerText = "VALID";
                status.style.color = "#4ADE80";
                sigText.innerText = "DOWN"; // Placeholder
                sigText.style.color = "#FB7185";
                sigReason.innerText = "Trend & Momentum Confirmed.";
            }
            btn.disabled = false;
            btn.innerText = "START DEEP SCAN";
        }, 3000); // 3 seconds deep scan simulation
    });

    // Auto-update Asset Name on load
    setTimeout(() => {
        document.getElementById('q-asset-name').innerText = DataAdapter.getAsset();
    }, 2000);

})();
