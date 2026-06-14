import os
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["google_auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

@router.get("/google/login")
def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID is not configured in backend environment."
        )
    
    # Construct the authorization URL
    params = {
        "response_type": "code",
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "state": "google_oauth_flow_state",
        "access_type": "offline",
        "prompt": "select_account"
    }
    
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
def google_callback(
    code: str = Query(...),
    state: str | None = Query(None),
    db: Session = Depends(get_db)
):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth credentials are not fully configured in backend environment."
        )
        
    # 1. Exchange auth code for access token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    try:
        with httpx.Client() as client:
            token_response = client.post(token_url, data=token_data)
            
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange code: {token_response.text}"
            )
            
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access token not returned by Google."
            )
            
        # 2. Get user info
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        with httpx.Client() as client:
            userinfo_response = client.get(userinfo_url, headers=headers)
            
        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch user profile: {userinfo_response.text}"
            )
            
        userinfo = userinfo_response.json()
        google_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incomplete user profile returned by Google."
            )
            
        # 3. Database matching logic
        # Check if user exists by google_id or email
        user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
        
        if user:
            # User exists. Update google_id if not set.
            if not user.google_id:
                user.google_id = google_id
                db.commit()
                db.refresh(user)
        else:
            # Create a new user
            user = User(
                name=name or "Google User",
                email=email,
                google_id=google_id,
                password_hash=None, # Nullable password hash
                course=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # 4. Generate standard JWT access token
        jwt_token = create_access_token(str(user.id))
        
        # 5. Redirect back to frontend dashboard with JWT token
        frontend_redirect_url = f"{FRONTEND_URL}/dashboard?token={jwt_token}"
        return RedirectResponse(url=frontend_redirect_url)
        
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error communicating with Google: {str(exc)}"
        )
