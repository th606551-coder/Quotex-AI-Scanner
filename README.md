# Quotex AI Market Scanner Bot - v1.0

A highly advanced, modular, and ultra-safe AI market scanner bot designed for Quotex, built with a premium 3D Glassmorphism UI.

## 🚀 Features
* **Premium 3D UI:** Dark theme, glassmorphism, responsive design.
* **1-Minute Timeframe Analysis:** Optimized for 1m OHLC candles.
* **5-Gate Strict Validation:** 
  1. Data Integrity 2. Trend 3. Candle Confirmation 4. Momentum 5. Risk
* **Ultra-Safe Risk Engine:** Circuit breaker (Risk Lock) after 2 consecutive losses. No Martingale.
* **Local Persistence:** Trade journal and stats saved in LocalStorage.
* **Auto-Trading:** Default OFF. Built for manual strict confirmation first.

## 🛠️ Installation / Usage
1. Download or clone this repository.
2. Open `index.html` in your browser to view the UI and test the logic.
3. To use as a bookmarklet (Phase 2), the JavaScript needs to be minified and injected into the browser via a bookmark URL.

## ⚠️ Disclaimer
This is a prototype. It does not guarantee a 90% win rate. It enforces strict risk management to prevent blown accounts. DATA UNAVAILABLE or WAIT signals will appear when conditions are risky.
