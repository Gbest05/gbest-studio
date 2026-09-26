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
    import app.models.models
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            # Check users table
            result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = {row[1] for row in result} if result else set()
            if existing_cols:
                if "google_id" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                if "avatar_url" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
                if "provider" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email'"))
                if "is_admin" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                if "is_suspended" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT 0"))
                conn.commit()

            # Check projects table for user_id
            proj_result = conn.execute(text("PRAGMA table_info(projects)")).fetchall()
            existing_proj_cols = {row[1] for row in proj_result} if proj_result else set()
            if existing_proj_cols and "user_id" not in existing_proj_cols:
                conn.execute(text("ALTER TABLE projects ADD COLUMN user_id VARCHAR(36)"))
                conn.commit()

            # Seed default administrator if missing
            admin_check = conn.execute(text("SELECT count(*) FROM users WHERE is_admin = 1")).scalar()
            if not admin_check or admin_check == 0:
                print("Seeding default administrator into database...")
                conn.execute(
                    text(
                        "INSERT OR REPLACE INTO users (id, name, email, password_hash, is_admin, provider, is_suspended) "
                        "VALUES (:id, :name, :email, :password_hash, 1, 'email', 0)"
                    ),
                    {
                        "id": "1ec0a5a4-89c4-48b4-868e-cdbe3e50bd3e",
                        "name": "Gbest_techworld",
                        "email": "princegbest555@gmail.com",
                        "password_hash": "79f60f937dd78353845cec515f9a77348c5a25b4cbc8c4afea454856093d3c21"
                    }
                )
                conn.execute(
                    text(
                        "INSERT OR IGNORE INTO users (id, name, email, password_hash, is_admin, provider, is_suspended) "
                        "VALUES (:id, :name, :email, :password_hash, 0, 'email', 0)"
                    ),
                    {
                        "id": "3e9afd32-84e1-4074-8df0-e49e85343acd",
                        "name": "Alade Gbolahan",
                        "email": "aladegbolahan28@gmail.com",
                        "password_hash": "79f60f937dd78353845cec515f9a77348c5a25b4cbc8c4afea454856093d3c21"
                    }
                )
                conn.commit()
                print("Admin user seeded successfully.")

            # If ADMIN_PASSWORD env var is supplied on Render, update the admin password hash
            admin_pwd = getattr(settings, "ADMIN_PASSWORD", "").strip()
            if admin_pwd:
                from app.api.auth import hash_password
                new_pwd_hash = hash_password(admin_pwd)
                target_email = (getattr(settings, "ADMIN_EMAIL", "") or "princegbest555@gmail.com").strip().lower()
                conn.execute(
                    text(
                        "UPDATE users SET password_hash = :hash, is_admin = 1 WHERE email = :email"
                    ),
                    {"hash": new_pwd_hash, "email": target_email}
                )
                conn.commit()
                print(f"Updated password for {target_email} from ADMIN_PASSWORD environment variable.")
    except Exception as e:
        print(f"Database migration note: {e}")

