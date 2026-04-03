from fastapi import APIRouter
from datetime import datetime
from services.signal_service import (
    generate_trading_signal, 
    save_signal_to_db,
    send_telegram_alert
)
from database import get_connection

router = APIRouter()

@router.get("/signal/{coin}")
def get_signal(coin: str):
    result = generate_trading_signal(coin=coin)

    fetched_at = datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")

    final_result = {
        **result,
        "fetched_at": fetched_at
    }

    if "error" not in final_result:
        is_new_trade = save_signal_to_db(final_result)

        if is_new_trade:
            send_telegram_alert(final_result)

    return final_result

@router.get("/history/{coin}")
def get_history(coin: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        WHERE coin_used = ?
        ORDER BY id DESC
        LIMIT 20
    """, (coin.upper(),))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

@router.get("/performance/{coin}")
def get_performance(coin: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM signal_history WHERE coin_used = ? ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    closed_trades = [row for row in rows if row["status"] in ["TARGET HIT", "STOP HIT"]]

    total = len(closed_trades)
    wins = 0
    losses = 0

    equity = 100  # start with 100 units
    equity_curve = []
    rr_values = []

    for row in closed_trades:
        entry = row["entry"]
        target = row["target"]
        stop = row["stop"]
        signal = row["signal"]

        if not entry or not target or not stop:
            continue
        
        if row["rr"]:
            rr_values.append(row["rr"])


        if row["status"] == "TARGET HIT":
            wins += 1

            if signal == "BUY":
                profit_pct = (target - entry) / entry
            else:  # SELL
                profit_pct = (entry - target) / entry

        elif row["status"] == "STOP HIT":
            losses += 1

            if signal == "BUY":
                profit_pct = (stop - entry) / entry
            else:  # SELL
                profit_pct = (entry - stop) / entry

        equity = equity * (1 + profit_pct)
        equity_curve.append(round(equity, 2))

    win_rate = (wins / total * 100) if total > 0 else 0

    total_profit = equity - 100

    avg_rr = sum(rr_values) / len(rr_values) if rr_values else 0

    return {
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": round(win_rate, 2),
        "total_profit_pct": round(total_profit, 2),
        "equity_curve": equity_curve,
        "avg_rr": round(avg_rr, 2),
    }

