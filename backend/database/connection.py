import os
import sqlite3
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables relative to this file's directory (backend/.env)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path, override=True)

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "resume_assistant.db")
DB_PATH = os.getenv("DATABASE_URL", DEFAULT_DB_PATH)

# Ensure the database directory exists
db_dir = os.path.dirname(DB_PATH)
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

def get_db_connection():
    """Create a raw database connection with row factory configured and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    """Context manager for database connections, ensuring proper commit/rollback and closing."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_db():
    """Initialize the database tables if they do not exist."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if not os.path.exists(schema_path):
        raise FileNotFoundError(f"Schema file not found at {schema_path}")
    
    with open(schema_path, "r") as f:
        schema_sql = f.read()
        
    with get_db() as conn:
        conn.executescript(schema_sql)
    print(f"Database initialized at: {DB_PATH}")

if __name__ == "__main__":
    init_db()
