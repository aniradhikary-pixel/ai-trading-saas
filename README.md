# 🚀 AI Crypto Trading SaaS

## 📌 Overview

This project is a full-stack AI-powered crypto trading signal dashboard.

It generates **real-time trading signals** using technical indicators (EMA crossover + trend filter) based on live Binance market data.

The system is designed as a **scalable SaaS product foundation**.

---

## 🧱 Tech Stack

### Backend

* **FastAPI (Python)**
* Pandas (data processing)
* Requests (Binance API)

### Frontend

* **React (Node.js)**
* Recharts (price visualization)

### Data Source

* Binance Public API

---

## 📁 Project Structure

```
ai-trading-saas/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   │   └── signal_routes.py
│   ├── services/
│   │   └── signal_service.py
│
├── frontend/
│   ├── src/
│   │   └── App.js
│
└── README.md
```

---

## ⚙️ Core Strategy

### 📊 EMA Crossover + Trend Filter

The system uses:

* Fast EMA (short-term trend)
* Slow EMA (medium-term trend)
* EMA200 (long-term trend filter)

---

### 📈 BUY Conditions

* EMA Fast crosses above EMA Slow
* Price is above EMA200

---

### 📉 SELL Conditions

* EMA Fast crosses below EMA Slow
* Price is below EMA200

---

## 🧠 Coin-Specific Optimization

Each coin uses optimized parameters based on backtesting:

| Coin | Timeframe | EMA     | RR  | Stop   |
| ---- | --------- | ------- | --- | ------ |
| BTC  | 4h        | 20 / 50 | 2–3 | 1–1.5% |
| ETH  | 1h        | 9 / 50  | 3   | 1.5%   |
| SOL  | 1h        | 20 / 50 | 3   | 1.5%   |

---

## 🔁 Signal Logic Upgrade

### ✅ Last Active Signal (Important)

Instead of only checking the latest candle:

* The system scans past candles
* Finds the **most recent valid crossover**
* Returns that signal

---

## 📊 Output Fields

The backend returns:

* `signal` → BUY / SELL / HOLD
* `entry` → entry price
* `stop` → stop-loss level
* `target` → target price
* `status` → trade condition
* `confidence` → signal strength
* `ema_fast`, `ema_slow`, `ema200`
* `interval` → timeframe
* `signal_time` → when signal occurred
* `candles_ago` → how recent
* `recent_prices` → last 20 prices (for chart)

---

## 📌 Trade Status Logic

| Status     | Meaning               |
| ---------- | --------------------- |
| ACTIVE     | Trade still valid     |
| STOP HIT   | Stop-loss already hit |
| TARGET HIT | Target achieved       |
| NO SIGNAL  | No valid setup        |

---

## 📊 Confidence Logic

Based on EMA gap:

* HIGH → strong trend
* MEDIUM → moderate
* LOW → weak / noisy

---

## 🖥️ Frontend Features

* Coin selector (BTC / ETH / SOL)
* Live signal display
* Entry / Stop / Target
* EMA values
* Status + Confidence
* Strategy explanation
* Signal timestamp
* Responsive UI dashboard
* Price chart (last 20 candles)

---

## 📉 Chart

Uses:

* Recharts
* Data: `recent_prices`

---

## ⚠️ Current Issue

* Chart is not rendering correctly in frontend

---

## 🚀 How to Run

### Backend

```bash
cd backend
uvicorn main:app --reload
```

Runs on:

```
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on:

```
http://localhost:3000
```

---

## 🔮 Future Improvements

* Fix chart rendering
* Add signal history tracking
* Add PnL tracking
* Add alerts (Telegram / Email)
* Add authentication (SaaS users)
* Deploy:

  * Backend → Render / Railway
  * Frontend → Vercel

---

## 💡 Key Achievement

This project includes:

* Full-stack architecture
* Real-time market data integration
* Backtested strategy
* Dynamic signal engine
* Product-ready dashboard

---

## 🧠 Notes

* Strategy is validated with backtesting
* Includes fee-adjusted results
* Multi-asset support implemented

---

## 🎯 Goal

Convert this system into:

👉 **AI-powered Crypto Trading SaaS Product**
