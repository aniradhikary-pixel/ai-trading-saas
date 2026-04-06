import os
import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()

def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")

    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row,
        sslmode="require"
    )

def init_db():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS signal_history (
                    id SERIAL PRIMARY KEY,
                    requested_coin TEXT,
                    coin_used TEXT,
                    symbol TEXT,
                    interval TEXT,
                    strategy TEXT,
                    current_price DOUBLE PRECISION,
                    signal TEXT,
                    ema_fast DOUBLE PRECISION,
                    ema_slow DOUBLE PRECISION,
                    ema200 DOUBLE PRECISION,
                    rr DOUBLE PRECISION,
                    stop_pct DOUBLE PRECISION,
                    entry DOUBLE PRECISION,
                    stop DOUBLE PRECISION,
                    target DOUBLE PRECISION,
                    status TEXT,
                    confidence TEXT,
                    signal_time BIGINT,
                    signal_time_readable TEXT,
                    candles_ago INTEGER,
                    fetched_at TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS subscribers (
                    id SERIAL PRIMARY KEY,
                    telegram_chat_id TEXT UNIQUE,
                    telegram_username TEXT,
                    full_name TEXT,
                    plan TEXT DEFAULT 'free',
                    is_active INTEGER DEFAULT 1,
                    created_at TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS leads (
                    id SERIAL PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    plan_interest TEXT DEFAULT 'free',
                    source TEXT DEFAULT 'website',
                    created_at TEXT
                )
            """)

        conn.commit()