from datetime import timedelta
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import DuplicateEntityException, UnauthorizedException
from app.core.security import create_access_token, decode_token, get_password_hash, verify_password
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse

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
    """Authenticate user credentials and issue JWT access token."""
    repo = UserRepository(db)
    user = await repo.get_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedException("Incorrect email or password.")
    
    access_token = create_access_token(
        subject=user.id,
        claims={"email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/token", response_model=TokenResponse)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """OAuth2 compatible form endpoint."""
    return await login(UserLogin(email=form_data.username, password=form_data.password), db)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get currently authenticated user profile."""
    return current_user
