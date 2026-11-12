"""
app/dpdp/grievance_officer.py
─────────────────────────────
Grievance Redressal Mechanism & Data Protection Officer Contact (DPDP Act Sec 13).
Maintains statutory DPO contact coordinates, ticket lifecycle, 72-hour SLA tracking,
and escalation paths to the Data Protection Board of India (DPBI).
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.dpdp.crypto_vault import encrypt_data, decrypt_data, generate_blind_index

DB_PATH = Path("privacy_vault.db")

STATUTORY_DPO_CONTACT = {
    "jurisdiction": "India DPDP Act 2023 Sec 13",
    "officer_title": "Data Protection Officer & Chief Grievance Redressal Lead",
    "fiduciary_name": "ZeroLeak AI Enterprise Gateway",
    "institution": "Bapuji Institute of Engineering and Technology (BIET Davangere)",
    "official_email": "dpo@zeroleak.local",
    "grievance_email": "grievance@zeroleak.local",
    "telephone": "+91-8192-223344",
    "physical_address": (
        "Enterprise Security Enclave, Innovation & Tech Transfer Tower, "
        "BIET Campus, Davangere, Karnataka 577004, India"
    ),
    "working_hours": "09:00 - 18:00 IST (Monday - Saturday)",
    "statutory_sla": "72-Hour Response & Redressal Window (DPDP Sec 13)",
    "statutory_escalation": "Data Protection Board of India (DPBI) at https://dpbi.gov.in"
}


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_grievance_tables():
    """Initialise SQLite tables for grievances and DPO resolutions."""
    conn = _get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS grievances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id TEXT UNIQUE NOT NULL,
                user_id_blind TEXT NOT NULL,
                user_id_enc TEXT NOT NULL,
                category TEXT NOT NULL,
                description_enc TEXT NOT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                sla_deadline TEXT NOT NULL,
                resolution_notes TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
    conn.close()


def get_dpo_contact() -> Dict[str, Any]:
    """Retrieve official Data Protection Officer and Grievance Officer details."""
    return STATUTORY_DPO_CONTACT


def submit_grievance(
    user_id: str,
    category: str,
    description: str,
    priority: str = "NORMAL"
) -> Dict[str, Any]:
    """
    File a formal privacy grievance under DPDP Sec 13.
    Assigns ticket tracking ID and calculates strict 72-hour statutory response deadline.
    """
    valid_categories = {
        "CONSENT_DISPUTE",
        "UNAUTHORIZED_PROCESSING",
        "LEAKAGE_COMPLAINT",
        "ERASURE_DELAY",
        "ACCESS_CORRECTION_ISSUE",
        "GENERAL"
    }
    cat_norm = category.upper()
    if cat_norm not in valid_categories:
        cat_norm = "GENERAL"

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    # 72 hours SLA in seconds = 72 * 3600 = 259200
    sla_deadline = datetime.fromtimestamp(now.timestamp() + 259200, tz=timezone.utc).isoformat()

    ticket_id = f"GRV-{now.strftime('%Y%m%d')}-{uuid4().hex[:6].upper()}"
    user_id_blind = generate_blind_index(user_id)
    user_id_enc = encrypt_data(user_id)
    desc_enc = encrypt_data(description)

    conn = _get_db()
    with conn:
        conn.execute("""
            INSERT INTO grievances (
                ticket_id, user_id_blind, user_id_enc, category,
                description_enc, status, priority, sla_deadline,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ticket_id, user_id_blind, user_id_enc, cat_norm,
            desc_enc, "ACKNOWLEDGED", priority.upper(), sla_deadline,
            now_iso, now_iso
        ))
    conn.close()

    return {
        "ticket_id": ticket_id,
        "category": cat_norm,
        "status": "ACKNOWLEDGED",
        "priority": priority.upper(),
        "created_at": now_iso,
        "sla_deadline": sla_deadline,
        "sla_window": "72 Hours Statutory Clock Active",
        "assigned_officer": STATUTORY_DPO_CONTACT["officer_title"],
        "dpo_contact_email": STATUTORY_DPO_CONTACT["official_email"],
        "message": "Grievance lodged under DPDP Sec 13. Ticket assigned to designated Data Protection Officer."
    }


def get_grievance_status(ticket_id: str) -> Dict[str, Any]:
    """Check status, resolution notes, and SLA progress of a grievance ticket."""
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ticket_id, category, status, priority, sla_deadline,
               resolution_notes, created_at, updated_at
        FROM grievances WHERE ticket_id = ?
    """, (ticket_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise ValueError(f"Grievance ticket '{ticket_id}' not found.")

    d = dict(row)
    return d


def resolve_grievance(ticket_id: str, resolution_notes: str, status: str = "RESOLVED") -> Dict[str, Any]:
    """Admin / DPO resolution update for grievance ticket."""
    now_iso = datetime.now(timezone.utc).isoformat()
    conn = _get_db()
    with conn:
        cur = conn.execute("""
            UPDATE grievances
            SET status = ?, resolution_notes = ?, updated_at = ?
            WHERE ticket_id = ?
        """, (status.upper(), resolution_notes, now_iso, ticket_id))
        affected = cur.rowcount
    conn.close()

    if affected == 0:
        raise ValueError(f"Grievance ticket '{ticket_id}' not found.")

    return {
        "ticket_id": ticket_id,
        "status": status.upper(),
        "resolution_notes": resolution_notes,
        "resolved_at": now_iso
    }


# Initialise on load
init_grievance_tables()
