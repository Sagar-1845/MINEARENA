"""
app/dpdp/consent_engine.py
──────────────────────────
Complete DPDP Privacy Notice & Consent Management Engine (DPDP Act Sec 5 & 6).
Handles notice distribution, affirmative consent capture, cryptographic consent
receipt generation, consent status checks, and instant withdrawal workflows.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.dpdp.crypto_vault import encrypt_data, decrypt_data, generate_blind_index

DB_PATH = Path("privacy_vault.db")

# ─────────────────────────────────────────────────────────────────────────────
# DPDP STATUTORY PRIVACY NOTICES (Multilingual: EN, HI, KN)
# ─────────────────────────────────────────────────────────────────────────────

STATUTORY_PRIVACY_NOTICES = {
    "en": {
        "notice_version": "2.4",
        "jurisdiction": "India (DPDP Act 2023)",
        "data_fiduciary": "ZeroLeak AI Enterprise Gateway (BIET Davangere)",
        "purposes": [
            {
                "id": "AI_PROMPT_PROCESSING",
                "name": "Local De-Identification for LLM Forwarding",
                "description": (
                    "To detect, mask, and redact sensitive identifiers (Aadhaar, PAN, "
                    "GSTIN, Voter ID, Passport, Phone, Email) locally before sending queries "
                    "to external AI models."
                ),
                "data_categories": [
                    "Aadhaar Number",
                    "PAN Card ID",
                    "GSTIN Identifier",
                    "Passport Number",
                    "Voter ID",
                    "Phone Number",
                    "Email Address"
                ],
                "retention_period": "Max 10 minutes in encrypted memory; immediate erasure post-reinsertion",
                "third_party_sharing": "None. Only sanitized placeholders (e.g. <PERSON_1>) are forwarded to LLMs."
            }
        ],
        "user_rights": [
            "Right to access summary of personal data and processing activities (Sec 11)",
            "Right to correction and erasure of personal data (Sec 12)",
            "Right to withdraw consent at any time without detriment (Sec 6(4))",
            "Right of grievance redressal with designated DPO (Sec 13)"
        ],
        "grievance_officer": {
            "name": "Data Protection Officer",
            "email": "dpo@zeroleak.local",
            "sla": "72 Hours Statutory Response Window"
        }
    },
    "hi": {
        "notice_version": "2.4",
        "jurisdiction": "भारत (डीपीडीपी अधिनियम 2023)",
        "data_fiduciary": "ज़ीरोलीक एआई एंटरप्राइज गेटवे (बीआईईटी दावणगेरे)",
        "purposes": [
            {
                "id": "AI_PROMPT_PROCESSING",
                "name": "एलएलएम फॉरवर्डिंग के लिए स्थानीय वि-पहचान",
                "description": "बाहरी एआई मॉडल को प्रॉम्प्ट भेजने से पहले आधार, पैन, फोन और ईमेल जैसी संवेदनशील जानकारी को स्थानीय रूप से मास्क करना।"
            }
        ]
    },
    "kn": {
        "notice_version": "2.4",
        "jurisdiction": "ಭಾರತ (ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ 2023)",
        "data_fiduciary": "ಝೀರೋಲೀಕ್ ಎಐ ಎಂಟರ್‌ಪ್ರೈಸ್ ಗೇಟ್‌ವೇ (ಬಿಐಇಟಿ ದಾವಣಗೆರೆ)",
        "purposes": [
            {
                "id": "AI_PROMPT_PROCESSING",
                "name": "ಎಲ್ಎಲ್ಎಂ ಸಂಸ್ಕರಣೆಗೆ ಮುನ್ನ ಸ್ಥಳೀಯ ಅನಾಮಧೇಯಕರಣ",
                "description": "ಬಾಹ್ಯ ಎಐ ಮಾದರಿಗಳಿಗೆ ಕಳುಹಿಸುವ ಮೊದಲು ಆಧಾರ್, ಪ್ಯಾನ್, ಫೋನ್ ಮತ್ತು ಇಮೇಲ್ ವಿವರಗಳನ್ನು ಗುರುತು ಮರೆಮಾಚುವುದು."
            }
        ]
    }
}


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_consent_tables():
    """Initialise SQLite tables for consent records and consent receipts."""
    conn = _get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS consents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                consent_token TEXT UNIQUE NOT NULL,
                user_id_blind TEXT NOT NULL,
                user_id_enc TEXT NOT NULL,
                purpose TEXT NOT NULL,
                status TEXT NOT NULL,
                notice_version TEXT NOT NULL,
                receipt_hash TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_consent_user ON consents(user_id_blind, purpose);")
    conn.close()


def get_privacy_notice(lang: str = "en") -> Dict[str, Any]:
    """Retrieve the official DPDP statutory privacy notice in requested language."""
    return STATUTORY_PRIVACY_NOTICES.get(lang.lower(), STATUTORY_PRIVACY_NOTICES["en"])


def grant_consent(
    user_id: str,
    purpose: str,
    notice_version: str = "2.4",
    notice_acknowledged: bool = True
) -> Dict[str, Any]:
    """
    Grant explicit, informed, affirmative consent under DPDP Sec 6.
    Generates a cryptographically verifiable Consent Receipt.
    """
    if not notice_acknowledged:
        raise ValueError("Consent requires explicit acknowledgment of the statutory Privacy Notice.")

    allowed = {"AI_PROMPT_PROCESSING"}
    if purpose not in allowed:
        raise ValueError(f"Purpose '{purpose}' is not authorized. Allowed: {allowed}")

    now = datetime.now(timezone.utc).isoformat()
    consent_token = f"CST-{uuid4().hex[:12].upper()}"
    user_id_blind = generate_blind_index(user_id)
    user_id_enc = encrypt_data(user_id)

    # Generate Cryptographic Consent Receipt Digest
    receipt_payload = {
        "consent_token": consent_token,
        "user_id_blind": user_id_blind,
        "purpose": purpose,
        "notice_version": notice_version,
        "timestamp": now,
        "statutory_act": "DPDP Act 2023 Section 6"
    }
    receipt_hash = hashlib.sha256(json.dumps(receipt_payload, sort_keys=True).encode("utf-8")).hexdigest()

    conn = _get_db()
    with conn:
        conn.execute("""
            INSERT INTO consents (
                consent_token, user_id_blind, user_id_enc, purpose,
                status, notice_version, receipt_hash, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            consent_token, user_id_blind, user_id_enc, purpose,
            "GRANTED", notice_version, receipt_hash, now, now
        ))
    conn.close()

    return {
        "consent_token": consent_token,
        "status": "GRANTED",
        "purpose": purpose,
        "notice_version": notice_version,
        "receipt_hash": receipt_hash,
        "created_at": now,
        "message": "Affirmative consent recorded under DPDP Act 2023."
    }


def check_consent(user_id: str, purpose: str) -> bool:
    """Check if the user has an active, non-withdrawn consent grant."""
    user_id_blind = generate_blind_index(user_id)
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT status FROM consents
        WHERE user_id_blind = ? AND purpose = ?
        ORDER BY id DESC LIMIT 1
    """, (user_id_blind, purpose))
    row = cursor.fetchone()
    conn.close()
    return bool(row and row["status"] == "GRANTED")


def withdraw_consent(user_id: str, purpose: str) -> Dict[str, Any]:
    """
    Instantly withdraw consent under DPDP Sec 6(4).
    Invalidates the consent grant and logs the withdrawal timestamp.
    """
    user_id_blind = generate_blind_index(user_id)
    now = datetime.now(timezone.utc).isoformat()
    conn = _get_db()
    with conn:
        cur = conn.execute("""
            UPDATE consents
            SET status = 'WITHDRAWN', updated_at = ?
            WHERE id = (
                SELECT id FROM consents
                WHERE user_id_blind = ? AND purpose = ? AND status = 'GRANTED'
                ORDER BY id DESC LIMIT 1
            )
        """, (now, user_id_blind, purpose))
        affected = cur.rowcount
    conn.close()

    if affected == 0:
        raise ValueError("No active consent record found to withdraw.")

    return {
        "status": "WITHDRAWN",
        "user_id": user_id,
        "purpose": purpose,
        "withdrawn_at": now,
        "message": "Consent successfully revoked. Associated ephemeral mappings are scheduled for immediate erasure."
    }


# Initialise on load
init_consent_tables()
