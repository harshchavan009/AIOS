from typing import Generic, List, Optional, Type, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic Clean Architecture Repository for async CRUD operations."""

    def __init__(self, model: Type[ModelType], db_session: AsyncSession):
        self.model = model
        self.db = db_session

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await self.db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, obj_in: ModelType) -> ModelType:
        self.db.add(obj_in)
        await self.db.flush()
        await self.db.refresh(obj_in)
        return obj_in

    async def update(self, db_obj: ModelType) -> ModelType:
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj

    async def delete(self, id: str) -> bool:
        obj = await self.get_by_id(id)
        if obj:
            await self.db.delete(obj)
            await self.db.flush()
            return True
        return False
