from fastapi import APIRouter
from datetime import datetime
from services.signal_service import generate_trading_signal

router = APIRouter()

@router.get("/signal/{coin}")
def get_signal(coin: str):
    result = generate_trading_signal(coin=coin)

    return {
        **result,
        "fetched_at": datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")
    }
    