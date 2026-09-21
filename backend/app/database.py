from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.config import settings

engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.SYNC_DATABASE_URL else {}
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = {row[1] for row in result} if result else set()
            if existing_cols:
                if "google_id" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                if "avatar_url" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
                if "provider" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email'"))
                conn.commit()
    except Exception as e:
        print(f"Database migration note: {e}")

