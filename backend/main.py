from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.signal_routes import router as signal_router
from database import init_db
from apscheduler.schedulers.background import BackgroundScheduler
from services.signal_service import run_auto_signal_scan

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    scheduler.add_job(run_auto_signal_scan, "interval", minutes=5)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Trading SaaS is running 🚀"}

app.include_router(signal_router)