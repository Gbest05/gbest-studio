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

            # Load initial users and projects from seed file if present
            import json
            from pathlib import Path
            seed_file = Path(__file__).resolve().parent / "seeds" / "initial_data.json"
            if seed_file.exists():
                try:
                    with open(seed_file, "r", encoding="utf-8") as f:
                        seed_data = json.load(f)

                    for u in seed_data.get("users", []):
                        conn.execute(
                            text(
                                "INSERT OR IGNORE INTO users (id, name, email, password_hash, google_id, avatar_url, provider, is_admin, is_suspended) "
                                "VALUES (:id, :name, :email, :password_hash, :google_id, :avatar_url, :provider, :is_admin, :is_suspended)"
                            ),
                            {
                                "id": u["id"],
                                "name": u["name"],
                                "email": u["email"],
                                "password_hash": u.get("password_hash"),
                                "google_id": u.get("google_id"),
                                "avatar_url": u.get("avatar_url"),
                                "provider": u.get("provider", "email"),
                                "is_admin": 1 if u.get("is_admin") else 0,
                                "is_suspended": 1 if u.get("is_suspended") else 0,
                            }
                        )

                    for p in seed_data.get("projects", []):
                        conn.execute(
                            text(
                                "INSERT OR IGNORE INTO projects (id, user_id, name, description, thumbnail_url, aspect_ratio, project_data) "
                                "VALUES (:id, :user_id, :name, :description, :thumbnail_url, :aspect_ratio, :project_data)"
                            ),
                            {
                                "id": p["id"],
                                "user_id": p.get("user_id"),
                                "name": p.get("name", "Untitled"),
                                "description": p.get("description"),
                                "thumbnail_url": p.get("thumbnail_url"),
                                "aspect_ratio": p.get("aspect_ratio", "16:9"),
                                "project_data": p.get("project_data"),
                            }
                        )
                    conn.commit()
                except Exception as ex:
                    print(f"Seed file load note: {ex}")

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

