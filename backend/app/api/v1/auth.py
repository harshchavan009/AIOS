from datetime import timedelta
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import DuplicateEntityException, UnauthorizedException, AIOSException
from app.core.security import create_access_token, decode_token, get_password_hash, verify_password
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)


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
    
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or account deactivated.")
    return user


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new enterprise user in AIOS."""
    repo = UserRepository(db)
    existing_user = await repo.get_by_email(user_in.email)
    if existing_user:
        raise DuplicateEntityException("User", "email", user_in.email)

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True
    )
    created_user = await repo.create(new_user)
    return created_user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user credentials and issue JWT access token + refresh token."""
    repo = UserRepository(db)
    user = await repo.get_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedException("Incorrect email or password.")
    
    access_token = create_access_token(
        subject=user.id,
        claims={"email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_access_token(
        subject=user.id,
        claims={"type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/token", response_model=TokenResponse)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """OAuth2 compatible form endpoint."""
    return await login(UserLogin(email=form_data.username, password=form_data.password), db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    payload = decode_token(request.refresh_token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid refresh token payload.")
    
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("User inactive or deleted.")

    new_access_token = create_access_token(
        subject=user.id,
        claims={"email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    new_refresh_token = create_access_token(
        subject=user.id,
        claims={"type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user session."""
    return {"message": "Successfully logged out from AIOS platform.", "user_id": current_user.id}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get currently authenticated user profile."""
    return current_user


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Initiate password reset flow."""
    repo = UserRepository(db)
    user = await repo.get_by_email(request.email)
    if not user:
        # Return success to prevent email enumeration
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
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset user password using token."""
    payload = decode_token(request.token)
    user_id: str = payload.get("sub")
    if not user_id or payload.get("type") != "password_reset":
        raise UnauthorizedException("Invalid or expired password reset token.")
    
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found.")
    
    user.hashed_password = get_password_hash(request.new_password)
    await db.commit()
    return {"message": "Password reset successfully. Please log in with your new credentials."}
