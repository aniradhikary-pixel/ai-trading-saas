from fastapi import APIRouter
from datetime import datetime
from services.signal_service import (
    generate_trading_signal, 
    save_signal_to_db,
    send_telegram_alert_to_user,
    broadcast_signal
    )
from database import get_connection
from fastapi import Request
from services.signal_service import add_subscriber, send_welcome_message


router = APIRouter()

@router.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    data = await request.json()

    message = data.get("message", {})
    chat = message.get("chat", {})
    text = message.get("text", "")

    chat_id = chat.get("id")
    username = chat.get("username")

    full_name = " ".join(filter(None, [
        chat.get("first_name"),
        chat.get("last_name")
    ]))

    # 👉 When user starts bot
    if text == "/start" and chat_id:
        add_subscriber(chat_id, username, full_name)
        send_welcome_message(chat_id)

    return {"ok": True}

@router.get("/signal/{coin}")
def get_signal(coin: str):
    result = generate_trading_signal(coin=coin)

    fetched_at = datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")

    final_result = {
        **result,
        "fetched_at": fetched_at
    }

    if "error" not in final_result:
        save_signal_to_db(final_result)

    return final_result

@router.get("/latest-signal/{coin}")
def get_latest_signal(coin: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        WHERE coin_used = ?
        ORDER BY id DESC
        LIMIT 1
    """, (coin.upper(),))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else {}

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

@router.get("/history")
def get_history_all():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        ORDER BY id DESC
        LIMIT 50
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

def calculate_performance(rows, coin_label="ALL"):
    closed_trades = [
        row for row in rows
        if row["status"] in ["TARGET HIT", "STOP HIT"]
    ]

    total = len(closed_trades)
    wins = 0
    losses = 0

    equity = 100.0
    equity_curve = []
    rr_values = []

    for row in closed_trades:
        entry = row["entry"]
        target = row["target"]
        stop = row["stop"]
        signal = row["signal"]
        status = row["status"]
        rr = row["rr"]

        if entry is None or target is None or stop is None or signal is None:
            continue

        if rr is not None:
            rr_values.append(rr)

        profit_pct = 0.0

        if status == "TARGET HIT":
            wins += 1
            if signal == "BUY":
                profit_pct = (target - entry) / entry
            elif signal == "SELL":
                profit_pct = (entry - target) / entry

        elif status == "STOP HIT":
            losses += 1
            if signal == "BUY":
                profit_pct = (stop - entry) / entry
            elif signal == "SELL":
                profit_pct = (entry - stop) / entry

        equity = equity * (1 + profit_pct)
        equity_curve.append(round(equity, 2))

    win_rate = (wins / total * 100) if total > 0 else 0
    total_profit = equity - 100
    avg_rr = sum(rr_values) / len(rr_values) if rr_values else 0

    return {
        "coin": coin_label,
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": round(win_rate, 2),
        "total_profit_pct": round(total_profit, 2),
        "equity_curve": equity_curve,
        "avg_rr": round(avg_rr, 2),
    }


@router.get("/performance")
def get_overall_performance():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        ORDER BY id ASC
    """)

    rows = cursor.fetchall()
    conn.close()

    return calculate_performance(rows, coin_label="ALL")


@router.get("/performance/{coin}")
def get_performance(coin: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM signal_history
        WHERE coin_used = ?
        ORDER BY id ASC
    """, (coin.upper(),))

    rows = cursor.fetchall()
    conn.close()

    return calculate_performance(rows, coin_label=coin.upper())