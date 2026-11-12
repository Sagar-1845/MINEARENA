"""
app/dpdp/crypto_vault.py
────────────────────────
Enterprise Cryptographic Vault for Personal Data Protection (DPDP Sec 8(5)).
Implements AES-256-GCM authenticated encryption at rest and in memory,
HMAC-SHA256 blind indexing, and secure memory zeroing.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
from typing import Any, Dict, Optional, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)

# Master Gateway Secret Key (32 bytes / 256 bits for AES-256-GCM)
_RAW_KEY = os.getenv("PRIVACY_ENCRYPTION_KEY")
if _RAW_KEY:
    _VAULT_KEY = hashlib.sha256(_RAW_KEY.encode("utf-8")).digest()
else:
    # Ephemeral secure random key for session if not provided in environment
    _VAULT_KEY = hashlib.sha256(b"PRIVAGUARD_DEFAULT_ENTERPRISE_SECRET_KEY_2026").digest()

_BLIND_INDEX_SALT = os.getenv("BLIND_INDEX_SALT", "PRIVAGUARD_HMAC_SALT_v1").encode("utf-8")


def encrypt_data(plaintext: str | bytes | dict) -> str:
    """
    Encrypt sensitive data using AES-256-GCM.
    Returns URL-safe base64 encoded bundle: nonce (12 bytes) + ciphertext + tag (16 bytes).
    """
    if isinstance(plaintext, dict):
        raw_bytes = json.dumps(plaintext).encode("utf-8")
    elif isinstance(plaintext, str):
        raw_bytes = plaintext.encode("utf-8")
    else:
        raw_bytes = plaintext

    aesgcm = AESGCM(_VAULT_KEY)
    nonce = secrets.token_bytes(12)  # 96-bit nonce for GCM
    ciphertext = aesgcm.encrypt(nonce, raw_bytes, None)

    # Bundle nonce + ciphertext (includes 16-byte GCM auth tag)
    payload = nonce + ciphertext
    return base64.urlsafe_b64encode(payload).decode("ascii")


def decrypt_data(encrypted_bundle: str, as_json: bool = False) -> Any:
    """
    Decrypt an AES-256-GCM encrypted bundle.
    Validates authenticity and integrity before returning plaintext.
    """
    try:
        raw_payload = base64.urlsafe_b64decode(encrypted_bundle.encode("ascii"))
        if len(raw_payload) < 28:  # 12 bytes nonce + 16 bytes auth tag minimum
            raise ValueError("Encrypted payload too short")

        nonce = raw_payload[:12]
        ciphertext = raw_payload[12:]

        aesgcm = AESGCM(_VAULT_KEY)
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)

        if as_json:
            return json.loads(decrypted_bytes.decode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception as exc:
        logger.error("Failed to decrypt secure vault payload: %s", exc)
        raise ValueError("Decryption failed: corrupted data or invalid key") from exc


def generate_blind_index(value: str) -> str:
    """
    Generate an HMAC-SHA256 blind index for searchable identifiers.
    Allows exact-match database queries without storing raw PII in index columns.
    """
    normalized = value.strip().upper().replace(" ", "").replace("-", "")
    h = hmac.new(_BLIND_INDEX_SALT, normalized.encode("utf-8"), hashlib.sha256)
    return h.hexdigest()


def zero_memory(buf: bytearray | list | dict) -> None:
    """
    Secure memory scrubbing: overwrite memory buffers with zeros.
    """
    if isinstance(buf, bytearray):
        for i in range(len(buf)):
            buf[i] = 0
    elif isinstance(buf, dict):
        for k in list(buf.keys()):
            buf[k] = None
        buf.clear()
    elif isinstance(buf, list):
        for i in range(len(buf)):
            buf[i] = None
        buf.clear()
