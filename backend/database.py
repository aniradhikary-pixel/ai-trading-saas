import sqlite3

DB_NAME = "signals.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Existing table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signal_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requested_coin TEXT,
            coin_used TEXT,
            symbol TEXT,
            interval TEXT,
            strategy TEXT,
            current_price REAL,
            signal TEXT,
            ema_fast REAL,
            ema_slow REAL,
            ema200 REAL,
            rr REAL,
            stop_pct REAL,
            entry REAL,
            stop REAL,
            target REAL,
            status TEXT,
            confidence TEXT,
            signal_time INTEGER,
            candles_ago INTEGER,
            fetched_at TEXT
        )
    """)

    # 🔥 NEW TABLE (IMPORTANT)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_chat_id TEXT UNIQUE,
            telegram_username TEXT,
            full_name TEXT,
            plan TEXT DEFAULT 'free',
            is_active INTEGER DEFAULT 1,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()