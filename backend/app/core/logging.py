import logging
import json
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """
    Production-grade structured JSON log formatter for AIOS backend.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_object = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "lineNo": record.lineno,
        }
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "correlation_id"):
            log_object["correlation_id"] = getattr(record, "correlation_id")
        return json.dumps(log_object)


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("aios")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger


logger = setup_logging()
