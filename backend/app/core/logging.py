import logging
import json
import sys
from datetime import datetime, timezone


import re

SECRET_PATTERNS = [
    re.compile(r'(Bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+', re.IGNORECASE),
    re.compile(r'((?:api[_-]?key|secret|password|access_token|refresh_token)["\']?\s*[:=]\s*["\'])([^"\']{4})[^"\']*(["\'])', re.IGNORECASE),
    re.compile(r'(sk-[a-zA-Z0-9]{4})[a-zA-Z0-9]{15,}', re.IGNORECASE),
    re.compile(r'(AIza[0-9A-Za-z-_]{4})[0-9A-Za-z-_]{15,}', re.IGNORECASE),
    re.compile(r'(ghp_[a-zA-Z0-9]{4})[a-zA-Z0-9]{15,}', re.IGNORECASE),
]

def redact_sensitive_data(text: str) -> str:
    if not isinstance(text, str):
        return text
    text = SECRET_PATTERNS[0].sub(r'\1[REDACTED_JWT]', text)
    text = SECRET_PATTERNS[1].sub(r'\1\2****\3', text)
    text = SECRET_PATTERNS[2].sub(r'\1****', text)
    text = SECRET_PATTERNS[3].sub(r'\1****', text)
    text = SECRET_PATTERNS[4].sub(r'\1****', text)
    return text


class JSONFormatter(logging.Formatter):
    """
    Production-grade structured JSON log formatter for AIOS backend with secret redaction.
    """
    def format(self, record: logging.LogRecord) -> str:
        raw_msg = record.getMessage()
        sanitized_msg = redact_sensitive_data(raw_msg)
        log_object = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": sanitized_msg,
            "module": record.module,
            "funcName": record.funcName,
            "lineNo": record.lineno,
        }
        if record.exc_info:
            formatted_exc = self.formatException(record.exc_info)
            log_object["exception"] = redact_sensitive_data(formatted_exc)
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
