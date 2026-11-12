"""
app/privacy/mapping_store.py
─────────────────────────────
Cryptographically Secured In-Memory & Enclave Mapping Store (DPDP Sec 8(5)).
Stores placeholder→original mappings encrypted with AES-256-GCM.
Mappings are decrypted ONLY momentarily for restoration and then zeroed out.
"""

from __future__ import annotations

import logging
import time
import threading
from typing import Dict, Optional

from app.dpdp.crypto_vault import encrypt_data, decrypt_data, zero_memory

logger = logging.getLogger(__name__)

_DEFAULT_TTL = 600  # 10 minutes maximum under DPDP retention policy

# Internal storage: request_id → {encrypted_mapping, expires_at}
_store: Dict[str, dict] = {}
_lock = threading.Lock()


def store(request_id: str, mapping: Dict[str, str], ttl_seconds: int = _DEFAULT_TTL) -> None:
    """
    Persist an AES-256-GCM encrypted placeholder mapping for a request.
    The raw mapping is encrypted immediately; the plaintext buffer is discarded.
    """
    encrypted_blob = encrypt_data(mapping)
    with _lock:
        _store[request_id] = {
            "enc_mapping": encrypted_blob,
            "expires_at": time.time() + min(ttl_seconds, _DEFAULT_TTL),
        }
    logger.debug("Stored AES-256-GCM encrypted mapping for request_id=%s (%d placeholders)", request_id, len(mapping))
    _cleanup()


def retrieve(request_id: str) -> Optional[Dict[str, str]]:
    """
    Retrieve and decrypt the mapping for a request using AES-256-GCM.
    Returns None if the request_id is unknown or the mapping has expired.
    """
    with _lock:
        entry = _store.get(request_id)
        if entry is None:
            logger.warning("No mapping found for request_id=%s", request_id)
            return None
        if time.time() > entry["expires_at"]:
            del _store[request_id]
            logger.warning("Mapping expired for request_id=%s", request_id)
            return None

        # Decrypt momentarily
        decrypted_dict = decrypt_data(entry["enc_mapping"], as_json=True)
        return decrypted_dict


def delete(request_id: str) -> None:
    """Remove and securely zero the mapping after restoration is complete."""
    with _lock:
        entry = _store.pop(request_id, None)
        if entry:
            entry["enc_mapping"] = None
    logger.debug("Securely purged mapping for request_id=%s", request_id)


def _cleanup() -> None:
    """Remove expired entries and zero memory buffers."""
    now = time.time()
    with _lock:
        expired = [rid for rid, entry in _store.items() if now > entry["expires_at"]]
        for rid in expired:
            entry = _store.pop(rid, None)
            if entry:
                entry["enc_mapping"] = None
            logger.debug("Auto-cleaned expired encrypted mapping request_id=%s", rid)
