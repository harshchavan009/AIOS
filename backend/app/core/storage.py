import os
import re
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

class FileStorageService:
    """
    Production-safe document storage abstraction supporting:
    1. Local persistent disk storage with path traversal protection
    2. S3 / MinIO compatible object storage
    """
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE.lower()
        self.local_dir = os.path.abspath(settings.STORAGE_LOCAL_DIR)
        os.makedirs(self.local_dir, exist_ok=True)
        self.minio_client = None

        if self.storage_type in ("s3", "minio"):
            try:
                from minio import Minio
                self.minio_client = Minio(
                    settings.MINIO_ENDPOINT,
                    access_key=settings.MINIO_ACCESS_KEY,
                    secret_key=settings.MINIO_SECRET_KEY,
                    secure=False if "localhost" in settings.MINIO_ENDPOINT else True
                )
                if not self.minio_client.bucket_exists(settings.MINIO_BUCKET_DOCUMENTS):
                    self.minio_client.make_bucket(settings.MINIO_BUCKET_DOCUMENTS)
                logger.info(f"Initialized MinIO / S3 storage on bucket '{settings.MINIO_BUCKET_DOCUMENTS}'.")
            except Exception as e:
                logger.warning(f"Failed to connect to MinIO / S3 storage: {e}. Falling back to local disk storage.")
                self.storage_type = "local"

    def _sanitize_filename(self, filename: str) -> str:
        """Strip directory traversal elements and unsafe characters."""
        base = os.path.basename(filename)
        cleaned = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', base)
        return cleaned or "unnamed_document"

    async def save_file(self, filename: str, content: bytes) -> str:
        safe_name = self._sanitize_filename(filename)

        if self.storage_type in ("s3", "minio") and self.minio_client:
            import io
            data_stream = io.BytesIO(content)
            self.minio_client.put_object(
                settings.MINIO_BUCKET_DOCUMENTS,
                safe_name,
                data_stream,
                length=len(content)
            )
            return f"s3://{settings.MINIO_BUCKET_DOCUMENTS}/{safe_name}"

        # Local filesystem storage
        target_path = os.path.join(self.local_dir, safe_name)
        with open(target_path, "wb") as f:
            f.write(content)
        return target_path

    def get_file_content(self, filename: str) -> Optional[bytes]:
        safe_name = self._sanitize_filename(filename)

        if self.storage_type in ("s3", "minio") and self.minio_client:
            try:
                response = self.minio_client.get_object(settings.MINIO_BUCKET_DOCUMENTS, safe_name)
                return response.read()
            except Exception as e:
                logger.error(f"Error fetching from S3: {e}")
                return None

        target_path = os.path.join(self.local_dir, safe_name)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            with open(target_path, "rb") as f:
                return f.read()
        return None


storage_service = FileStorageService()
