from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.signal_routes import router as signal_router
from database import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def home():
    return {"message": "AI Trading SaaS is running 🚀"}

app.include_router(signal_router)