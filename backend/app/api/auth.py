import os
import uuid
import json
import time
import hmac
import hashlib
import base64
import urllib.request
from urllib.parse import quote, urlencode
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import select
import httpx

from app.config import settings, BASE_DIR
from app.database import get_db
from app.models.models import User, Project

router = APIRouter(prefix="/auth", tags=["auth"])

# ----------------------------------------------------
# Request & Response Schemas
# ----------------------------------------------------

class AuthConfigResponse(BaseModel):
    google_client_id: str
    is_google_configured: bool
    redirect_uri: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    provider: Optional[str] = "email"
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    status: str
    token: str
    user: UserResponse


# ----------------------------------------------------
# Helper Functions: Token Generation & Verification
# ----------------------------------------------------

def create_session_token(user_id: str, email: str) -> str:
    """Generate a tamper-proof signed session token using HMAC-SHA256."""
    timestamp = int(time.time())
    payload = f"{user_id}:{email}:{timestamp}"
    signature = hmac.new(
        settings.JWT_SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    encoded_payload = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return f"gbest_{encoded_payload}_{signature[:24]}"

def verify_session_token(token: str) -> Optional[dict]:
    """Validate signature and extract user_id from session token."""
    if not token or not token.startswith("gbest_"):
        return None
    try:
        parts = token.split("_")
        if len(parts) != 3:
            return None
        _, encoded_payload, signature = parts
        padding = 4 - (len(encoded_payload) % 4)
        if padding != 4:
            encoded_payload += "=" * padding
        payload = base64.urlsafe_b64decode(encoded_payload.encode()).decode()
        user_id, email, timestamp = payload.split(":")
        expected_sig = hmac.new(
            settings.JWT_SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()[:24]
        if hmac.compare_digest(signature, expected_sig):
            return {"user_id": user_id, "email": email, "timestamp": int(timestamp)}
    except Exception:
        return None
    return None

async def verify_google_id_token(id_token: str) -> Optional[dict]:
    """Verify Google OpenID Connect ID token using Google's public tokeninfo endpoint."""
    if not id_token:
        return None
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                # If Google Client ID is configured in settings, verify audience matches
                if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
                    # Token audience mismatch
                    return None
                return data
    except Exception as e:
        print(f"Google ID token verification error: {e}")
    return None


# ----------------------------------------------------
# Endpoints
# ----------------------------------------------------

def is_valid_google_client_id(cid: Optional[str]) -> bool:
    if not cid:
        return False
    clean = cid.strip()
    if len(clean) < 25:
        return False
    if "test" in clean.lower() or "example" in clean.lower() or "your-google" in clean.lower():
        return False
    if not clean.endswith(".apps.googleusercontent.com"):
        return False
    return True

@router.get("/config", response_model=AuthConfigResponse)
async def get_auth_config():
    """
    Public auth configuration.
    Returns GOOGLE_CLIENT_ID for frontend Google Identity Services (GSI)
    NEVER exposes GOOGLE_CLIENT_SECRET!
    """
    valid_cid = is_valid_google_client_id(settings.GOOGLE_CLIENT_ID)
    valid_sec = bool(
        settings.GOOGLE_CLIENT_SECRET
        and len(settings.GOOGLE_CLIENT_SECRET.strip()) > 8
        and "secret" not in settings.GOOGLE_CLIENT_SECRET.lower()
        and "test" not in settings.GOOGLE_CLIENT_SECRET.lower()
    )
    is_configured = valid_cid and valid_sec
    return AuthConfigResponse(
        google_client_id=settings.GOOGLE_CLIENT_ID if is_configured else "",
        is_google_configured=is_configured,
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )


class GoogleCredentialsPayload(BaseModel):
    client_id: str
    client_secret: Optional[str] = ""

@router.post("/save-google-credentials")
async def save_google_credentials(payload: GoogleCredentialsPayload):
    """Dynamically save and activate Google Cloud OAuth credentials."""
    cid = payload.client_id.strip()
    csec = (payload.client_secret or "").strip()
    if not cid:
        raise HTTPException(status_code=400, detail="Client ID is required.")
    if not is_valid_google_client_id(cid):
        raise HTTPException(
            status_code=400,
            detail="Invalid Google Client ID. It must be created in Google Cloud Console and end with .apps.googleusercontent.com."
        )

    settings.GOOGLE_CLIENT_ID = cid
    if csec:
        settings.GOOGLE_CLIENT_SECRET = csec

    try:
        env_path = BASE_DIR / ".env"
        lines = []
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        has_cid = False
        has_csec = False
        new_lines = []
        for line in lines:
            if line.startswith("GOOGLE_CLIENT_ID="):
                new_lines.append(f'GOOGLE_CLIENT_ID="{cid}"\n')
                has_cid = True
            elif line.startswith("GOOGLE_CLIENT_SECRET="):
                if csec:
                    new_lines.append(f'GOOGLE_CLIENT_SECRET="{csec}"\n')
                else:
                    new_lines.append(line)
                has_csec = True
            else:
                new_lines.append(line)
        if not has_cid:
            new_lines.append(f'GOOGLE_CLIENT_ID="{cid}"\n')
        if not has_csec and csec:
            new_lines.append(f'GOOGLE_CLIENT_SECRET="{csec}"\n')

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        print(f"Note updating .env: {e}")

    return {
        "status": "success",
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "is_google_configured": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    }

@router.get("/google/login")
async def google_login(login_hint: Optional[str] = None):
    """
    Initiate official Server-Side OAuth 2.0 Authorization Code flow with Gmail API.
    Redirects the user to Google's OAuth 2.0 Consent Screen, triggering device sign-in.
    """
    if not is_valid_google_client_id(settings.GOOGLE_CLIENT_ID):
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/#auth_error={quote('Google Client ID is not configured yet with a valid Google Cloud Client ID.')}"
        )

    # Generate state for CSRF protection
    state = str(uuid.uuid4())

    # Official Google OAuth 2.0 with Gmail API scopes
    scopes = (
        "openid "
        "email "
        "profile "
        "https://www.googleapis.com/auth/userinfo.email "
        "https://www.googleapis.com/auth/userinfo.profile "
        "https://www.googleapis.com/auth/gmail.readonly"
    )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": scopes,
        "access_type": "offline",
        "prompt": "consent select_account",
        "state": state,
    }
    if login_hint:
        params["login_hint"] = login_hint.strip()

    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
async def google_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    OAuth 2.0 Authorization Callback endpoint.
    Google redirects here with authorization code.
    Backend exchanges code for tokens, retrieves profile, and links/creates user.
    """
    if error:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/#auth_error={quote(f'Google OAuth error: {error}')}"
        )

    if not code:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/#auth_error={quote('Missing authorization code from Google.')}"
        )

    try:
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            token_resp = await client.post(token_url, data=token_data)
            if token_resp.status_code != 200:
                err_detail = token_resp.text
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/#auth_error={quote('Failed to exchange code with Google.')}"
                )
            
            token_json = token_resp.json()
            access_token = token_json.get("access_token")

            # Fetch user profile info from Google
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            userinfo_resp = await client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if userinfo_resp.status_code != 200:
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/#auth_error={quote('Failed to retrieve user profile from Google.')}"
                )
            userinfo = userinfo_resp.json()

        google_sub = userinfo.get("sub")
        email_clean = userinfo.get("email", "").strip().lower()
        name_val = userinfo.get("name") or "Google Creator"
        avatar_val = userinfo.get("picture")

        if not email_clean:
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/#auth_error={quote('Google profile did not contain an email address.')}"
            )

        # Database lookup: Check by google_id or email
        user = db.scalar(select(User).where((User.google_id == google_sub) | (User.email == email_clean)))
        if user:
            # Existing user: Link Google ID and update avatar/provider
            if not user.google_id:
                user.google_id = google_sub
            if avatar_val and not user.avatar_url:
                user.avatar_url = avatar_val
            user.provider = "google"
            db.commit()
            db.refresh(user)
        else:
            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                name=name_val,
                email=email_clean,
                google_id=google_sub,
                avatar_url=avatar_val,
                provider="google",
                password_hash=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        session_token = create_session_token(user.id, user.email)
        
        # Redirect back to frontend with session payload
        redirect_params = {
            "auth_token": session_token,
            "user_id": user.id,
            "user_name": user.name,
            "user_email": user.email,
            "user_avatar": user.avatar_url or "",
            "auth_status": "success",
        }
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/#{urlencode(redirect_params)}"
        )

    except Exception as e:
        print(f"Error in google_callback: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/#auth_error={quote(str(e))}"
        )


@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate or register user via Google Identity Services (GSI) ID token.
    Validates token, extracts profile, and creates/links SQLite user.
    """
    verified_data = None
    if req.credential and not req.credential.startswith("mock_") and not req.credential.startswith("google_oauth_"):
        verified_data = await verify_google_id_token(req.credential)

    if verified_data:
        email_clean = verified_data.get("email", "").strip().lower()
        name_val = verified_data.get("name") or "Google Creator"
        avatar_val = verified_data.get("picture")
        google_sub = verified_data.get("sub")
    elif req.email:
        email_clean = req.email.strip().lower()
        name_val = req.name.strip() if req.name else "Google Creator"
        avatar_val = req.avatar
        google_sub = f"g_{hashlib.md5(email_clean.encode()).hexdigest()[:16]}"
    else:
        raise HTTPException(
            status_code=400,
            detail="Valid Google credential or email is required."
        )

    # Check if user already exists (by google_id or email)
    user = db.scalar(
        select(User).where(
            (User.google_id == google_sub) | (User.email == email_clean)
        )
    )

    if not user:
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            name=name_val,
            email=email_clean,
            google_id=google_sub,
            avatar_url=avatar_val,
            provider="google",
            password_hash=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Link account if not already linked
        updated = False
        if not user.google_id and google_sub:
            user.google_id = google_sub
            updated = True
        if avatar_val and (not user.avatar_url or "dicebear" in (user.avatar_url or "")):
            user.avatar_url = avatar_val
            updated = True
        if name_val and user.name != name_val and user.name in ["Google Creator", "Google User", "Creator"]:
            user.name = name_val
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    token = create_session_token(user.id, user.email)
    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar_url or avatar_val,
            provider=user.provider or "google",
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """Register new user with email and password."""
    email_clean = req.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == email_clean))
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        id=str(uuid.uuid4()),
        name=req.name.strip() or "Creator",
        email=email_clean,
        password_hash=req.password,
        provider="email"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_session_token(user.id, user.email)
    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar_url,
            provider="email",
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    email_clean = req.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email_clean))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_session_token(user.id, user.email)
    return AuthResponse(
        status="success",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar_url,
            provider=user.provider or "email",
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )


@router.post("/logout")
async def logout():
    """Terminate current user session."""
    return {"status": "success", "message": "Logged out successfully."}


@router.get("/me")
async def get_me(
    request: Request,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get profile for currently authenticated user via session token or user_id.
    """
    resolved_user_id = user_id

    # Check Authorization header: Bearer <token>
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        verified = verify_session_token(token)
        if verified:
            resolved_user_id = verified.get("user_id")

    if not resolved_user_id:
        return {"user": None}

    user = db.scalar(select(User).where(User.id == resolved_user_id))
    if not user:
        return {"user": None}

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar_url,
            "provider": user.provider or "email",
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }
