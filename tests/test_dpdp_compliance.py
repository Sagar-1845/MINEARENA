"""
tests/test_dpdp_compliance.py
──────────────────────────────
Comprehensive test suite verifying the 6 DPDP compliance modules:
1. Data access, correction, erasure workflows & certificates
2. Data retention & deletion reaper
3. Personal data breach reporting (DPBI & CERT-In)
4. Grievance handling & DPO SLA tracking
5. AES-256-GCM encryption & security vault
6. Multilingual privacy notices & consent lifecycle
"""

import pytest
from app.dpdp.crypto_vault import encrypt_data, decrypt_data, generate_blind_index, zero_memory
from app.dpdp.consent_engine import get_privacy_notice, grant_consent, check_consent, withdraw_consent
from app.dpdp.rights_workflow import (
    submit_access_request,
    submit_correction_request,
    execute_erasure_request,
    list_rights_requests,
)
from app.dpdp.retention_manager import get_retention_policy, purge_expired_records
from app.dpdp.breach_manager import report_breach_incident, list_breach_incidents
from app.dpdp.grievance_officer import get_dpo_contact, submit_grievance, get_grievance_status, resolve_grievance
from app.privacy import mapping_store


# ── 1. Cryptographic Security & Vault (DPDP Sec 8(5)) ─────────────────────────

def test_aes_gcm_encryption_and_decryption():
    secret_text = "AADHAAR: 9876-5432-1098; PAN: ABCDE1234F"
    encrypted_blob = encrypt_data(secret_text)
    assert encrypted_blob != secret_text
    assert len(encrypted_blob) > 30

    decrypted = decrypt_data(encrypted_blob)
    assert decrypted == secret_text


def test_blind_indexing_determinism():
    id1 = "sagar@example.com"
    id2 = "  SAGAR@EXAMPLE.COM  "
    assert generate_blind_index(id1) == generate_blind_index(id2)


def test_encrypted_mapping_store():
    req_id = "req-test-123"
    raw_mapping = {"<AADHAAR_1>": "9876 5432 1098"}
    mapping_store.store(req_id, raw_mapping)

    retrieved = mapping_store.retrieve(req_id)
    assert retrieved == raw_mapping

    mapping_store.delete(req_id)
    assert mapping_store.retrieve(req_id) is None


# ── 2. Privacy Notice & Consent Management (DPDP Sec 5 & 6) ───────────────────

def test_statutory_privacy_notice_multilingual():
    en_notice = get_privacy_notice("en")
    assert en_notice["notice_version"] == "2.4"
    assert "India (DPDP Act 2023)" in en_notice["jurisdiction"]

    hi_notice = get_privacy_notice("hi")
    assert "डीपीडीपी" in hi_notice["jurisdiction"]

    kn_notice = get_privacy_notice("kn")
    assert "ಡಿಪಿಡಿಪಿ" in kn_notice["jurisdiction"]


def test_consent_grant_check_and_withdraw():
    user = "user_dpdp_test_1@domain.com"
    purpose = "AI_PROMPT_PROCESSING"

    # Grant
    res = grant_consent(user, purpose)
    assert res["status"] == "GRANTED"
    assert res["consent_token"].startswith("CST-")
    assert len(res["receipt_hash"]) == 64  # SHA-256

    # Check
    assert check_consent(user, purpose) is True

    # Withdraw
    w_res = withdraw_consent(user, purpose)
    assert w_res["status"] == "WITHDRAWN"
    assert check_consent(user, purpose) is False


# ── 3. Data Principal Rights: Access, Correction, Erasure (DPDP Sec 11 & 12) ───

def test_rights_access_workflow():
    user = "user_access@domain.com"
    res = submit_access_request(user, "Audit check")
    assert res["request_token"].startswith("DSR-ACC-")
    assert res["status"] == "COMPLETED"


def test_rights_correction_workflow():
    user = "user_correction@domain.com"
    res = submit_correction_request(user, "PHONE", "+91 9876543210", "Updated primary contact")
    assert res["request_token"].startswith("DSR-COR-")
    assert res["status"] == "PENDING"


def test_rights_erasure_workflow_and_certificate():
    user = "user_erasure@domain.com"
    # Ensure active consent first
    grant_consent(user, "AI_PROMPT_PROCESSING")

    res = execute_erasure_request(user, "Right to be forgotten")
    assert res["status"] == "ERASED_AND_PURGED"
    assert res["certificate_id"].startswith("CERT-DEL-")
    assert len(res["certificate_hash"]) == 64

    # Consent must now be revoked
    assert check_consent(user, "AI_PROMPT_PROCESSING") is False


# ── 4. Retention Limitations (DPDP Sec 8(7)) ──────────────────────────────────

def test_retention_policy_and_purge():
    policy = get_retention_policy()
    assert "retention_schedules" in policy
    assert policy["retention_schedules"]["ephemeral_pii_mappings"]["ttl_seconds"] == 600

    purge_res = purge_expired_records()
    assert purge_res["status"] == "COMPLETED"


# ── 5. Data Breach Reporting (DPDP Sec 8(6) & CERT-In) ────────────────────────

def test_breach_reporting_workflow():
    res = report_breach_incident(
        severity="HIGH",
        affected_categories=["AADHAAR", "PAN"],
        estimated_affected_count=42,
        root_cause="Simulated red-team penetration test vector"
    )
    assert res["incident_id"].startswith("BRC-")
    assert res["severity"] == "HIGH"
    assert res["dpbi_notice"]["filing_token"].startswith("DPBI-NOTICE-")
    assert "cert_in_notice" in res


# ── 6. Grievance Handling & DPO SLA (DPDP Sec 13) ─────────────────────────────

def test_dpo_coordinates_and_grievance_sla():
    dpo = get_dpo_contact()
    assert "dpo@zeroleak.local" in dpo["official_email"]
    assert "72-Hour" in dpo["statutory_sla"]

    g_res = submit_grievance(
        user_id="user_grievance@domain.com",
        category="CONSENT_DISPUTE",
        description="Consent was revoked but token remained in buffer.",
        priority="HIGH"
    )
    assert g_res["ticket_id"].startswith("GRV-")
    assert g_res["status"] == "ACKNOWLEDGED"
    assert "72 Hours" in g_res["sla_window"]

    # Resolution
    ticket_id = g_res["ticket_id"]
    r_res = resolve_grievance(ticket_id, "Verified token purged immediately.")
    assert r_res["status"] == "RESOLVED"
