# ZEROLEAK AI (MINEARENA) — Enterprise Privacy Firewall

> **Tagline**: *PRIVACY. PROTECTED. INTELLIGENCE. UNLEASHED.*

ZEROLEAK AI is an on-premises, DPDP-ready sovereign privacy firewall for enterprise Large Language Models (LLMs). It intercepts sensitive inputs, applies zero-persistence pseudonymization across Indian identifiers (Aadhaar, PAN, GSTIN, Voter ID, Passport, Phone, Email), and forwards only sanitized placeholders to foundation models, reinserting the original values in real time within your sovereign boundary.

---

## Visual & Technical Identity

- **Palette**: Midnight navy (`#050a1c` to `#0a1f3d`), Electric Blue (`#3b82f6`), Cyan highlights (`#37d3fc`), Saffron accent (`#ff9933`).
- **Aesthetic**: Premium cinematic 3D scrollytelling powered by React Three Fiber, Three.js shaders, Lenis smooth scrolling, and GSAP ScrollTrigger.
- **Statutory Alignment**: Digital Personal Data Protection (DPDP) Act 2023, CERT-In Cyber Security Directions.

---

## Architecture & Subsystems

1. **Member 1 & 2 — Sovereign De-Identification & Reinsertion Engine**:
   - Tokenization with bidirectional cryptographic mapping.
   - Zero-cloud persistence with ephemeral enclave TTL reaper.
   - Dynamic prompt reconstitution.

2. **Member 3 — Security & Privacy Intelligence**:
   - Outbound leak checker with strict zero-tolerance regex & entropy guards.
   - Prompt injection and jailbreak vector scanning.
   - Contextual risk scoring and department compliance policy enforcement.
   - Canary validation runner with synthetic test vectors.

3. **DPDP Act 2023 Statutory Modules**:
   - **Crypto Vault** (`app/dpdp/crypto_vault.py`): AES-256-GCM authenticated encryption, blind indexing with HMAC-SHA256.
   - **Consent Engine** (`app/dpdp/consent_engine.py`): Multilingual notices (English, Hindi, Kannada) and cryptographic consent receipts.
   - **Data Principal Rights** (`app/dpdp/rights_workflow.py`): Summary access, correction, and verifiable erasure (`CERT-DEL-*`).
   - **Retention Manager** (`app/dpdp/retention_manager.py`): Automated reaper with 10-minute ephemeral mapping TTL.
   - **Incident & Breach Protocol** (`app/dpdp/breach_manager.py`): DPBI statutory filings and CERT-In 6-hour reporting.
   - **Grievance Redressal** (`app/dpdp/grievance_officer.py`): Statutory DPO coordinates (`dpo@zeroleak.local`) with 72-hour SLA tracking.

---

## Getting Started

### Backend
```powershell
# Run with virtual environment
& ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
Swagger UI documentation available at: `http://127.0.0.1:8001/docs`

### Frontend
```powershell
npm run dev
```
Interactive application available at: `http://127.0.0.1:3000/`

### Automated Verification
```powershell
& ".venv\Scripts\python.exe" -m pytest tests/test_dpdp_compliance.py tests/test_api.py
npm run build
```

---

*Attribution: MineArena 1.0 | Code Commit | BIET Davangere*
