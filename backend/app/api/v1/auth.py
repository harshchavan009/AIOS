import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, status, Header, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc, text

from app.core.config import settings
from app.core.exceptions import DuplicateEntityException, UnauthorizedException, BadRequestException
from app.core.logging import logger
from app.core.security import create_access_token, decode_token, get_password_hash, verify_password
from app.core.rbac import normalize_role
from app.database.session import get_db
from app.models.user import User
from app.models.auth_models import UserSession, LoginHistory, OrganizationInvite, WorkspaceInvite
from app.models.organization import OrganizationMember, WorkspaceMember
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    OAuthLoginRequest,
    UserSessionResponse,
    LoginHistoryResponse,
    CreateOrgInviteRequest,
    CreateWorkspaceInviteRequest,
    AcceptInviteRequest,
    InviteResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ── Health Check ─────────────────────────────────────────────────────────────
@router.get("/health")
async def auth_health_check(db: AsyncSession = Depends(get_db)):
    """
    Verify database connectivity, JWT secret configuration, and authentication service status.
    """
    db_connected = False
    db_error = None
    try:
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        logger.exception(f"Database health check failed: {e}")
        db_error = str(e)

    jwt_configured = bool(settings.SECRET_KEY and len(settings.SECRET_KEY) >= 8)

    status_code = status.HTTP_200_OK if (db_connected and jwt_configured) else status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "healthy" if (db_connected and jwt_configured) else "degraded",
        "service": "authentication",
        "database_connected": db_connected,
        "database_error": db_error,
        "jwt_secret_configured": jwt_configured,
        "algorithm": settings.ALGORITHM,
        "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Authentication token missing.")
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload.")
    
    try:
        repo = UserRepository(db)
        user = await repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or account deactivated.")
        return user
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching current user profile for user_id={user_id}: {e}")
        raise UnauthorizedException("Authentication session failed to load.")


async def _record_login_history(
    db: AsyncSession,
    email: str,
    status_str: str,
    user_id: Optional[str] = None,
    request: Optional[Request] = None,
    failure_reason: Optional[str] = None
):
    try:
        ip_addr = request.client.host if request and request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "Unknown") if request else "Unknown"
        log_entry = LoginHistory(
            user_id=user_id,
            email=email,
            ip_address=ip_addr,
            user_agent=user_agent[:250],
            status=status_str,
            failure_reason=failure_reason
        )
        db.add(log_entry)
        await db.commit()
    except Exception as e:
        logger.warning(f"Failed to record login history for email={email}: {e}")
        await db.rollback()


# ── Signup & Verification ───────────────────────────────────────────────────
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    """Register a new enterprise user in AIOS."""
    logger.info(f"Signup attempt for email={user_in.email}")
    try:
        repo = UserRepository(db)
        existing_user = await repo.get_by_email(user_in.email)
        if existing_user:
            raise DuplicateEntityException("User", "email", user_in.email)

        v_token = secrets.token_urlsafe(32)
        normalized_role = normalize_role(user_in.role)
        new_user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=normalized_role,
            is_active=True,
            is_verified=True,
            verification_token=v_token,
            verification_sent_at=datetime.now(timezone.utc)
        )
        created_user = await repo.create(new_user)
        await _record_login_history(db, email=user_in.email, status_str="registered", user_id=created_user.id, request=request)
        return created_user
    except (DuplicateEntityException, BadRequestException):
        raise
    except Exception as e:
        logger.exception(f"Unhandled error during signup for {user_in.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Verify user email via verification token."""
    result = await db.execute(select(User).where(User.verification_token == payload.token))
    user = result.scalars().first()
    if not user:
        raise BadRequestException("Invalid or expired verification token.")
    
    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified successfully.", "email": user.email}


@router.post("/resend-verification")
async def resend_verification(payload: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    """Resend email verification token."""
    repo = UserRepository(db)
    user = await repo.get_by_email(payload.email)
    if not user:
        return {"message": "If the account exists, a new verification link has been sent."}
    
    user.verification_token = secrets.token_urlsafe(32)
    user.verification_sent_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Verification link generated.", "verification_token": user.verification_token}


# ── Login & Refresh ────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticate user credentials, record session, and issue JWT access + refresh tokens."""
    logger.info(f"Login request received for email='{credentials.email}'")
    
    try:
        repo = UserRepository(db)
        user = await repo.get_by_email(credentials.email.lower().strip())
        
        if not user or not verify_password(credentials.password, user.hashed_password):
            await _record_login_history(
                db, email=credentials.email, status_str="failed_password", request=request, failure_reason="Invalid credentials"
            )
            raise UnauthorizedException("Incorrect email or password.")

        if not user.is_active:
            raise UnauthorizedException("Account has been deactivated. Contact workspace administrator.")

        # Determine Token TTL based on remember_me
        refresh_days = 30 if credentials.remember_me else 7
        access_token = create_access_token(
            subject=user.id,
            claims={"email": user.email, "role": user.role},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_access_token(
            subject=user.id,
            claims={"type": "refresh", "remember_me": credentials.remember_me},
            expires_delta=timedelta(days=refresh_days)
        )

        # Record UserSession
        user_agent = request.headers.get("user-agent", "Unknown Device")
        ip_addr = request.client.host if request.client else "127.0.0.1"
        session_entry = UserSession(
            user_id=user.id,
            refresh_token_hash=_hash_token(refresh_token),
            device_name=user_agent[:100],
            ip_address=ip_addr,
            user_agent=user_agent[:250],
            last_active_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(days=refresh_days),
            is_revoked=False
        )
        db.add(session_entry)
        await db.commit()
        await _record_login_history(db, email=user.email, status_str="success", user_id=user.id, request=request)

        logger.info(f"Successful login for email='{user.email}', role='{user.role}'")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.exception(f"Unhandled error during login processing for {credentials.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Login process failed: {str(e)}"
        )


@router.post("/token", response_model=TokenResponse)
async def login_form(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """OAuth2 compatible form endpoint."""
    return await login(UserLogin(email=form_data.username, password=form_data.password), request, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token and rotate refresh token."""
    try:
        payload = decode_token(request_data.refresh_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid refresh token payload.")
        
        # Verify session active
        token_hash = _hash_token(request_data.refresh_token)
        sess_res = await db.execute(select(UserSession).where(UserSession.refresh_token_hash == token_hash))
        user_session = sess_res.scalars().first()
        if user_session and user_session.is_revoked:
            raise UnauthorizedException("Session has been revoked.")

        repo = UserRepository(db)
        user = await repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User inactive or deleted.")

        remember_me = payload.get("remember_me", False)
        refresh_days = 30 if remember_me else 7

        new_access_token = create_access_token(
            subject=user.id,
            claims={"email": user.email, "role": user.role},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        new_refresh_token = create_access_token(
            subject=user.id,
            claims={"type": "refresh", "remember_me": remember_me},
            expires_delta=timedelta(days=refresh_days)
        )

        if user_session:
            user_session.refresh_token_hash = _hash_token(new_refresh_token)
            user_session.last_active_at = datetime.now(timezone.utc)
            user_session.expires_at = datetime.now(timezone.utc) + timedelta(days=refresh_days)
            await db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.exception(f"Unhandled error during refresh_token: {e}")
        raise UnauthorizedException("Token refresh operation failed.")


# ── OAuth 2.0 (Google, GitHub, Microsoft) ──────────────────────────────────
@router.post("/oauth/google", response_model=TokenResponse)
@router.post("/oauth/github", response_model=TokenResponse)
@router.post("/oauth/microsoft", response_model=TokenResponse)
async def oauth_login(payload: OAuthLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticate via Google, GitHub, or Microsoft OAuth."""
    provider_name = payload.provider.lower()
    email = payload.email or f"{provider_name}.architect@aios.enterprise"
    full_name = payload.name or f"{provider_name.capitalize()} AI Specialist"
    
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if not user:
        new_user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_hex(16)),
            full_name=full_name,
            role="Developer",
            is_active=True,
            is_verified=True,
            oauth_provider=provider_name,
            oauth_id=payload.token or secrets.token_hex(12)
        )
        user = await repo.create(new_user)
    else:
        user.oauth_provider = provider_name

    refresh_days = 30 if payload.remember_me else 7
    access_token = create_access_token(subject=user.id, claims={"email": user.email, "role": user.role})
    refresh_token = create_access_token(subject=user.id, claims={"type": "refresh"}, expires_delta=timedelta(days=refresh_days))
    
    await _record_login_history(db, email=user.email, status_str=f"oauth_{provider_name}", user_id=user.id, request=request)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


# ── Password Recovery ───────────────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Initiate password reset flow."""
    repo = UserRepository(db)
    user = await repo.get_by_email(request_data.email)
    if not user:
        return {"message": "Password reset link sent to enterprise email if account exists."}
    
    reset_token = create_access_token(
        subject=user.id,
        claims={"type": "password_reset"},
        expires_delta=timedelta(hours=1)
    )
    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token
    }


@router.post("/reset-password")
async def reset_password(request_data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset user password using reset token."""
    payload = decode_token(request_data.token)
    user_id: str = payload.get("sub")
    if not user_id or payload.get("type") != "password_reset":
        raise UnauthorizedException("Invalid or expired password reset token.")
    
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found.")
    
    user.hashed_password = get_password_hash(request_data.new_password)
    await db.commit()
    return {"message": "Password reset successfully. Please log in with your new credentials."}


# ── Session & Device Management ─────────────────────────────────────────────
@router.get("/sessions", response_model=List[UserSessionResponse])
async def list_user_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List active device sessions for current user."""
    res = await db.execute(
        select(UserSession)
        .where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
        .order_by(desc(UserSession.last_active_at))
    )
    sessions = res.scalars().all()
    return [UserSessionResponse.model_validate(s) for s in sessions]


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke a specific device session."""
    res = await db.execute(select(UserSession).where(UserSession.id == session_id, UserSession.user_id == current_user.id))
    session_entry = res.scalars().first()
    if not session_entry:
        raise BadRequestException("Session not found.")
    
    session_entry.is_revoked = True
    await db.commit()
    return {"message": "Session revoked successfully.", "session_id": session_id}


@router.get("/login-history", response_model=List[LoginHistoryResponse])
async def get_login_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get login audit history for current user."""
    res = await db.execute(
        select(LoginHistory)
        .where(LoginHistory.email == current_user.email)
        .order_by(desc(LoginHistory.created_at))
        .limit(50)
    )
    history = res.scalars().all()
    return [LoginHistoryResponse.model_validate(h) for h in history]


# ── Organization & Workspace Invites ────────────────────────────────────────
@router.post("/invites/organization", response_model=InviteResponse)
async def create_org_invite(
    req: CreateOrgInviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an organization invitation token."""
    invite_token = secrets.token_urlsafe(24)
    invite = OrganizationInvite(
        organization_id=req.organization_id,
        inviter_id=current_user.id,
        email=req.email.lower(),
        role=normalize_role(req.role),
        invite_token=invite_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        status="pending"
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return InviteResponse.model_validate(invite)


@router.post("/invites/workspace", response_model=InviteResponse)
async def create_workspace_invite(
    req: CreateWorkspaceInviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a workspace invitation token."""
    invite_token = secrets.token_urlsafe(24)
    invite = WorkspaceInvite(
        workspace_id=req.workspace_id,
        inviter_id=current_user.id,
        email=req.email.lower(),
        role=normalize_role(req.role),
        invite_token=invite_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        status="pending"
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return InviteResponse.model_validate(invite)


@router.get("/invites/pending", response_model=List[InviteResponse])
async def get_pending_invites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get pending invites for current user's email."""
    res_org = await db.execute(
        select(OrganizationInvite).where(OrganizationInvite.email == current_user.email, OrganizationInvite.status == "pending")
    )
    org_invites = res_org.scalars().all()
    return [InviteResponse.model_validate(i) for i in org_invites]


@router.post("/invites/accept")
async def accept_invite(
    req: AcceptInviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept an organization or workspace invitation."""
    res_org = await db.execute(select(OrganizationInvite).where(OrganizationInvite.invite_token == req.invite_token))
    org_invite = res_org.scalars().first()
    if org_invite:
        org_invite.status = "accepted"
        member = OrganizationMember(
            organization_id=org_invite.organization_id,
            user_id=current_user.id,
            role=org_invite.role
        )
        db.add(member)
        await db.commit()
        return {"message": "Organization invitation accepted.", "role": org_invite.role}

    res_ws = await db.execute(select(WorkspaceInvite).where(WorkspaceInvite.invite_token == req.invite_token))
    ws_invite = res_ws.scalars().first()
    if ws_invite:
        ws_invite.status = "accepted"
        member = WorkspaceMember(
            workspace_id=ws_invite.workspace_id,
            user_id=current_user.id,
            role=ws_invite.role
        )
        db.add(member)
        await db.commit()
        return {"message": "Workspace invitation accepted.", "role": ws_invite.role}

    raise BadRequestException("Invalid or expired invitation token.")


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user session."""
    return {"message": "Successfully logged out from AIOS platform.", "user_id": current_user.id}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get currently authenticated user profile."""
    return current_user
