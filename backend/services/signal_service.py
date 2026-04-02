import requests
import pandas as pd
from database import get_connection
from datetime import datetime
TELEGRAM_BOT_TOKEN = "8583692312:AAGNR-BPMggnNCRcVhFexKybXnh7KuCpe6M"
TELEGRAM_CHAT_ID = "808324636"

BASE_URL = "https://data-api.binance.vision"

COIN_CONFIG = {
    "BTC": {
        "symbol": "BTCUSDT",
        "interval": "4h",
        "ema_fast": 20,
        "ema_slow": 50,
        "rr": 2.0,
        "stop_pct": 0.015,
    },
    "ETH": {
        "symbol": "ETHUSDT",
        "interval": "1h",
        "ema_fast": 9,
        "ema_slow": 50,
        "rr": 3.0,
        "stop_pct": 0.015,
    },
    "SOL": {
        "symbol": "SOLUSDT",
        "interval": "1h",
        "ema_fast": 20,
        "ema_slow": 50,
        "rr": 3.0,
        "stop_pct": 0.015,
    },
}

from database import get_connection


def save_signal_to_db(signal_data: dict):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        WHERE coin_used = ?
        ORDER BY id DESC
        LIMIT 1
    """, (signal_data.get("coin_used"),))

    last_row = cursor.fetchone()

    same_trade = False

    if last_row:
        same_trade = (
            last_row["signal"] == signal_data.get("signal")
            and last_row["signal_time"] == signal_data.get("signal_time")
            and last_row["coin_used"] == signal_data.get("coin_used")
        )

    if same_trade:
        cursor.execute("""
            UPDATE signal_history
            SET requested_coin = ?,
                symbol = ?,
                interval = ?,
                strategy = ?,
                current_price = ?,
                ema_fast = ?,
                ema_slow = ?,
                ema200 = ?,
                rr = ?,
                stop_pct = ?,
                entry = ?,
                stop = ?,
                target = ?,
                status = ?,
                confidence = ?,
                candles_ago = ?,
                fetched_at = ?
            WHERE id = ?
        """, (
            signal_data.get("requested_coin"),
            signal_data.get("symbol"),
            signal_data.get("interval"),
            signal_data.get("strategy"),
            signal_data.get("current_price"),
            signal_data.get("ema_fast"),
            signal_data.get("ema_slow"),
            signal_data.get("ema200"),
            signal_data.get("rr"),
            signal_data.get("stop_pct"),
            signal_data.get("entry"),
            signal_data.get("stop"),
            signal_data.get("target"),
            signal_data.get("status"),
            signal_data.get("confidence"),
            signal_data.get("candles_ago"),
            signal_data.get("fetched_at"),
            last_row["id"],
        ))
    else:
        cursor.execute("""
            INSERT INTO signal_history (
                requested_coin, coin_used, symbol, interval, strategy,
                current_price, signal, ema_fast, ema_slow, ema200,
                rr, stop_pct, entry, stop, target,
                status, confidence, signal_time, candles_ago, fetched_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            signal_data.get("requested_coin"),
            signal_data.get("coin_used"),
            signal_data.get("symbol"),
            signal_data.get("interval"),
            signal_data.get("strategy"),
            signal_data.get("current_price"),
            signal_data.get("signal"),
            signal_data.get("ema_fast"),
            signal_data.get("ema_slow"),
            signal_data.get("ema200"),
            signal_data.get("rr"),
            signal_data.get("stop_pct"),
            signal_data.get("entry"),
            signal_data.get("stop"),
            signal_data.get("target"),
            signal_data.get("status"),
            signal_data.get("confidence"),
            signal_data.get("signal_time"),
            signal_data.get("candles_ago"),
            signal_data.get("fetched_at"),
        ))

    conn.commit()
    conn.close()

def send_telegram_alert(signal_data: dict):
    try:
        raw_time = signal_data.get("signal_time")

        # Convert timestamp
        if raw_time:
            readable_time = datetime.fromtimestamp(raw_time / 1000).strftime("%d/%m/%Y, %I:%M %p")
        else:
            readable_time = "N/A"

        message = f"""
🚨 New Trade Signal

Coin: {signal_data.get("coin_used")}
Signal: {signal_data.get("signal")}
Interval: {signal_data.get("interval")}
Entry: {signal_data.get("entry")}
Stop: {signal_data.get("stop")}
Target: {signal_data.get("target")}
Status: {signal_data.get("status")}
Confidence: {signal_data.get("confidence")}
Signal Time: {readable_time}
"""

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message
        }

        response = requests.post(url, data=payload, timeout=10)
        return response.json()

    except Exception as e:
        print("Telegram alert error:", e)
        return None
    
def get_klines(symbol: str, interval: str, limit: int = 300) -> pd.DataFrame:
    url = f"{BASE_URL}/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit,
    }

    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()

    df = pd.DataFrame(
        data,
        columns=[
            "time",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "close_time",
            "quote_asset_volume",
            "num_trades",
            "taker_buy_base",
            "taker_buy_quote",
            "ignore",
        ],
    )

    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df[["time", "open", "high", "low", "close", "volume"]].copy()


def prepare_indicators(df: pd.DataFrame, ema_fast: int, ema_slow: int) -> pd.DataFrame:
    out = df.copy()
    out["ema_fast"] = out["close"].ewm(span=ema_fast).mean()
    out["ema_slow"] = out["close"].ewm(span=ema_slow).mean()
    out["ema200"] = out["close"].ewm(span=200).mean()
    return out


def normalize_coin(user_input: str) -> str:
    coin = user_input.strip().upper()
    if coin in COIN_CONFIG:
        return coin
    return "BTC"


def generate_trading_signal(coin: str = "BTC") -> dict:
    try:
        coin_key = normalize_coin(coin)
        config = COIN_CONFIG[coin_key]

        symbol = config["symbol"]
        interval = config["interval"]
        ema_fast = config["ema_fast"]
        ema_slow = config["ema_slow"]
        rr = config["rr"]
        stop_pct = config["stop_pct"]

        df = get_klines(symbol=symbol, interval=interval, limit=300)
        df = prepare_indicators(df, ema_fast=ema_fast, ema_slow=ema_slow)

        if len(df) < 210:
            return {"error": "Not enough market data returned."}

        signal = "HOLD"
        entry = None
        stop = None
        target = None
        signal_time = None
        candles_ago = None
        signal_index = None

        # search backward for the most recent valid crossover
        for i in range(len(df) - 1, 1, -1):
            prev_row = df.iloc[i - 1]
            row = df.iloc[i]

            # BUY
            if (
                prev_row["ema_fast"] < prev_row["ema_slow"]
                and row["ema_fast"] > row["ema_slow"]
                and row["close"] > row["ema200"]
            ):
                signal = "BUY"
                entry = float(row["close"])
                stop = entry * (1 - stop_pct)
                risk = entry - stop
                target = entry + (risk * rr)
                signal_time = row["time"]
                candles_ago = len(df) - 1 - i
                signal_index = i
                break

            # SELL
            elif (
                prev_row["ema_fast"] > prev_row["ema_slow"]
                and row["ema_fast"] < row["ema_slow"]
                and row["close"] < row["ema200"]
            ):
                signal = "SELL"
                entry = float(row["close"])
                stop = entry * (1 + stop_pct)
                risk = stop - entry
                target = entry - (risk * rr)
                signal_time = row["time"]
                candles_ago = len(df) - 1 - i
                signal_index = i
                break

        latest_row = df.iloc[-1]
        recent_prices = [round(x, 4) for x in df["close"].tail(20).tolist()]

        status = "NO SIGNAL"
        confidence = "LOW"

        if signal in ["BUY", "SELL"] and signal_index is not None:
            status = "ACTIVE"
            post_signal_df = df.iloc[signal_index + 1:].copy()

            for _, future_row in post_signal_df.iterrows():
                candle_high = float(future_row["high"])
                candle_low = float(future_row["low"])

                if signal == "BUY":
                    if candle_low <= stop:
                        status = "STOP HIT"
                        break
                    if candle_high >= target:
                        status = "TARGET HIT"
                        break

                elif signal == "SELL":
                    if candle_high >= stop:
                        status = "STOP HIT"
                        break
                    if candle_low <= target:
                        status = "TARGET HIT"
                        break

            ema_gap_pct = (
                abs(float(latest_row["ema_fast"]) - float(latest_row["ema_slow"]))
                / float(latest_row["close"])
                * 100
            )

            if ema_gap_pct >= 1.0:
                confidence = "HIGH"
            elif ema_gap_pct >= 0.4:
                confidence = "MEDIUM"
            else:
                confidence = "LOW"
                
        return {
            "requested_coin": coin.upper(),
            "coin_used": coin_key,
            "symbol": symbol,
            "interval": interval,
            "strategy": f"EMA{ema_fast}/{ema_slow} crossover + EMA200 trend filter",
            "current_price": round(float(latest_row["close"]), 4),
            "signal": signal,
            "ema_fast": round(float(latest_row["ema_fast"]), 4),
            "ema_slow": round(float(latest_row["ema_slow"]), 4),
            "ema200": round(float(latest_row["ema200"]), 4),
            "rr": rr,
            "stop_pct": stop_pct,
            "entry": round(entry, 4) if entry is not None else None,
            "stop": round(stop, 4) if stop is not None else None,
            "target": round(target, 4) if target is not None else None,
            "status": status,
            "confidence": confidence,
            "signal_time": int(signal_time) if signal_time is not None else None,
            "candles_ago": candles_ago,
            "recent_prices": recent_prices,
        }

    except Exception as e:
        return {"error": str(e)}