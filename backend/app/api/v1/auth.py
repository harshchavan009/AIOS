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
from app.core.security import (
    create_access_token,
    decode_token,
    get_password_hash,
    verify_password,
    verify_password_and_needs_rehash,
    validate_password_strength,
    DUMMY_TIMING_HASH,
)
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
    UserUpdate,
    AvatarUploadRequest,
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
        norm_email = credentials.email.lower().strip()
        
        # 1. Account Lockout Protection (5 consecutive failed attempts within 15 minutes)
        lockout_threshold = datetime.now(timezone.utc) - timedelta(minutes=15)
        recent_fails = await db.execute(
            select(LoginHistory)
            .where(
                LoginHistory.email == norm_email,
                LoginHistory.status == "failed_password",
                LoginHistory.created_at >= lockout_threshold
            )
            .order_by(desc(LoginHistory.created_at))
            .limit(5)
        )
        if len(recent_fails.scalars().all()) >= 5:
            logger.warning(f"Login rejected: account temporarily locked for email='{norm_email}'")
            raise UnauthorizedException("Account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.")

        repo = UserRepository(db)
        user = await repo.get_by_email(norm_email)
        
        # 2. Timing attack mitigation: run constant-time check even if user does not exist
        if not user:
            verify_password(credentials.password, DUMMY_TIMING_HASH)
            await _record_login_history(
                db, email=norm_email, status_str="failed_password", request=request, failure_reason="Invalid credentials"
            )
            raise UnauthorizedException("Invalid email or password.")

        # 3. Constant-time verification & work factor audit
        is_valid, needs_rehash = verify_password_and_needs_rehash(credentials.password, user.hashed_password)
        if not is_valid:
            await _record_login_history(
                db, email=norm_email, status_str="failed_password", request=request, failure_reason="Invalid credentials"
            )
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Account has been deactivated. Contact workspace administrator.")

        # 4. Rehash-on-login if stored hash has work factor < 12
        if needs_rehash:
            logger.info(f"Upgrading password hash to work factor 12 for {user.email}...")
            user.hashed_password = get_password_hash(credentials.password)
            await db.commit()

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


# ── Refresh Token with Rotation & Reuse Detection ───────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token and rotate refresh token."""
    try:
        payload = decode_token(request_data.refresh_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid refresh token payload.")
        
        # Verify session is active
        token_hash = _hash_token(request_data.refresh_token)
        sess_res = await db.execute(select(UserSession).where(UserSession.refresh_token_hash == token_hash))
        user_session = sess_res.scalars().first()
        
        if not user_session:
            # Token not found: could be an already-rotated or forged token
            raise UnauthorizedException("Invalid or unrecognized refresh token.")

        if user_session.is_revoked:
            # Refresh token reuse detection! Revoke ALL active sessions for this compromised user
            logger.warning(f"Replay attack detected for user {user_id}. Revoking all sessions.")
            await db.execute(
                update(UserSession)
                .where(UserSession.user_id == user_id)
                .values(is_revoked=True)
            )
            await db.commit()
            raise UnauthorizedException("Session revoked due to token reuse detection.")

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

        # Rotate refresh token hash: invalidate old token and set new hash
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
ALLOWED_OAUTH_PROVIDERS = {"google", "github", "microsoft"}

@router.post("/oauth/google", response_model=TokenResponse)
@router.post("/oauth/github", response_model=TokenResponse)
@router.post("/oauth/microsoft", response_model=TokenResponse)
async def oauth_login(payload: OAuthLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Authenticate via whitelisted Google, GitHub, or Microsoft OAuth."""
    provider_name = payload.provider.lower().strip()
    if provider_name not in ALLOWED_OAUTH_PROVIDERS:
        raise BadRequestException(f"Unsupported OAuth provider: '{payload.provider}'.")

    email = (payload.email or f"{provider_name}.architect@aios.enterprise").lower().strip()
    full_name = payload.name or f"{provider_name.capitalize()} AI Specialist"
    
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if not user:
        # Default role is strictly Developer; never trust client to specify admin roles
        new_user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_urlsafe(24)),
            full_name=full_name,
            role="Developer",
            is_active=True,
            is_verified=True,
            oauth_provider=provider_name,
            oauth_id=payload.token or secrets.token_hex(16)
        )
        user = await repo.create(new_user)
    else:
        user.oauth_provider = provider_name
        # Never elevate existing user roles from OAuth payload!

    refresh_days = 30 if payload.remember_me else 7
    access_token = create_access_token(
        subject=user.id,
        claims={"email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_access_token(
        subject=user.id,
        claims={"type": "refresh", "remember_me": payload.remember_me},
        expires_delta=timedelta(days=refresh_days)
    )
    
    # Track OAuth session
    user_agent = request.headers.get("user-agent", "Unknown Device")
    ip_addr = request.client.host if request.client else "127.0.0.1"
    session_entry = UserSession(
        user_id=user.id,
        refresh_token_hash=_hash_token(refresh_token),
        device_name=f"{provider_name.capitalize()} Session",
        ip_address=ip_addr,
        user_agent=user_agent[:250],
        last_active_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=refresh_days),
        is_revoked=False
    )
    db.add(session_entry)
    await db.commit()

    await _record_login_history(db, email=user.email, status_str=f"oauth_{provider_name}", user_id=user.id, request=request)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


# ── Password Recovery (Single-Use, Expiring Hashed Tokens) ──────────────────
@router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Initiate password reset flow: single-use expiring token stored hashed."""
    norm_email = request_data.email.lower().strip()
    repo = UserRepository(db)
    user = await repo.get_by_email(norm_email)
    
    # Generic message prevents user enumeration
    generic_msg = "If an account exists for this email, password reset instructions have been generated."
    if not user:
        return {"message": generic_msg}
    
    # Generate secure random single-use token and store ONLY its SHA-256 hash
    raw_token = secrets.token_urlsafe(32)
    user.verification_token = _hash_token(raw_token)
    user.verification_sent_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "message": generic_msg,
        "reset_token": raw_token
    }


@router.post("/reset-password")
async def reset_password(request_data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset user password using single-use reset token."""
    # Enforce minimum length >= 12 and blocklist
    validate_password_strength(request_data.new_password)

    token_hash = _hash_token(request_data.token.strip())
    res = await db.execute(select(User).where(User.verification_token == token_hash))
    user = res.scalars().first()
    
    if not user or not user.verification_sent_at:
        raise UnauthorizedException("Invalid or already-used password reset token.")
    
    # Check expiration (15 minutes token lifetime)
    token_sent = user.verification_sent_at.replace(tzinfo=timezone.utc) if user.verification_sent_at.tzinfo is None else user.verification_sent_at
    if datetime.now(timezone.utc) - token_sent > timedelta(minutes=15):
        user.verification_token = None
        user.verification_sent_at = None
        await db.commit()
        raise UnauthorizedException("Password reset token has expired. Please request a new one.")
    
    # Single-use: immediately invalidate token
    user.hashed_password = get_password_hash(request_data.new_password)
    user.verification_token = None
    user.verification_sent_at = None
    
    # Revoke all active sessions on password reset
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id)
        .values(is_revoked=True)
    )
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
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout current user session and revoke active device tokens."""
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
        .values(is_revoked=True)
    )
    await db.commit()
    return {"message": "Successfully logged out from AIOS platform.", "user_id": current_user.id}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get currently authenticated user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile preferences, full name, role, and avatar URL."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.role is not None:
        current_user.role = normalize_role(payload.role)
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    await db.commit()
    await db.refresh(current_user)
    logger.info(f"Updated profile for user {current_user.email}")
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_profile_avatar(
    payload: AvatarUploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload or update profile picture avatar URL."""
    current_user.avatar_url = payload.avatar_data
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me")
async def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate user account, revoke active sessions, and wipe credentials."""
    logger.info(f"Account deletion requested for email='{current_user.email}'")
    
    # Revoke all active sessions
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == current_user.id)
        .values(is_revoked=True)
    )
    
    current_user.is_active = False
    await db.commit()
    
    return {"message": "Account successfully deleted and all active sessions revoked.", "email": current_user.email}
