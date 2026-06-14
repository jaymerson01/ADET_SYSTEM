import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(override=True)
db_url = os.getenv("DATABASE_URL")
if not db_url:
    db_url = "sqlite:///./sql_app.db"

# Normalize URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

print(f"Connecting to database: {db_url}")
engine = create_engine(db_url)

with engine.connect() as conn:
    if "sqlite" in db_url:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(100)"))
            print("SQLite google_id column added.")
        except Exception as e:
            print(f"SQLite migration notice (might already exist): {e}")
    else:
        # PostgreSQL
        try:
            conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL"))
            print("Altered password_hash to nullable.")
        except Exception as e:
            print(f"Error altering password_hash: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE"))
            print("Added google_id column.")
        except Exception as e:
            print(f"Error adding google_id: {e}")
            
    try:
        conn.commit()
    except Exception:
        pass

print("Migration script execution completed.")
