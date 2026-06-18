import os
from dotenv import load_dotenv

# Load environment variables from backend/.env relative to this file
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path, override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import init_db
from backend.routes import resumes, chat, jd_matcher, interview

# Create database on startup
try:
    init_db()
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")

app = FastAPI(
    title="AI Resume Interview Assistant API",
    description="Backend API for parsing, analyzing, and chat RAG indexing candidate resumes.",
    version="1.0.0"
)

# CORS configurations
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "*"                       # Allow all for development testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(resumes.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(jd_matcher.router, prefix="/api")
app.include_router(interview.router, prefix="/api")

@app.get("/")
def health_check():
    """Verify that the backend is online and running."""
    return {
        "status": "online",
        "service": "AI Resume Interview Assistant API",
        "database_connected": os.path.exists(os.path.join(os.path.dirname(__file__), "database", "resume_assistant.db"))
    }

if __name__ == "__main__":
    import uvicorn
    # Load settings from environment or fallback to defaults
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
