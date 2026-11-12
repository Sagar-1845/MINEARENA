# ZeroLeak AI - Security & Privacy Intelligence (Member 3)

> [!NOTE]
> **Prototype Indicator**: All evaluations, risk scores, and leak detection alerts represent an **engineering indicator** for prototype validation, never an assertion of absolute security.

---

## 1. Module Overview & Integration Workflow

Member 3 inspects requests at two critical pipeline gates:
1. **Stage 1 (Pre-Payload)**: After Member 1 masks raw text, run risk scoring, injection detection, and department policy enforcement.
2. **Stage 2 (Outbound)**: After Member 2 constructs the outbound payload, run leak verification to verify zero unmasked PII reaches the external LLM.

```python
# Mounting into FastAPI (Member 1 owns app)
from fastapi import FastAPI
from security import security_router

app = FastAPI(title="ZeroLeak AI Gateway")
app.include_router(security_router)
```

---

## 2. Expected Formats

### Placeholder Tokens
The module recognizes standard placeholder notations:
- Double braces: `{{PII_NAME_1}}`, `{{PII_AADHAAR_1}}`, `{{PII_PAN_1}}`, `{{PII_PHONE_1}}`, `{{PII_EMAIL_1}}`, `{{PII_GSTIN_1}}`
- Square brackets: `[PERSON_1]`, `[AADHAAR_1]`, `[PHONE_1]`
- Angle brackets: `<MASKED_PAN_1>`, `<MASKED_NAME_1>`

### Entity Metadata
Entities passed from Member 1 must be mappings with `type` and `value` (or `raw`):
```json
[
  {"type": "NAME", "value": "Alex Doe"},
  {"type": "PAN", "value": "ABCDE1234F"},
  {"type": "PHONE", "value": "+91 9876543210"}
]
```
Supported types: `AADHAAR`, `PAN`, `GSTIN`, `PHONE`, `EMAIL`, `NAME`, `UNKNOWN`.

---

## 3. Function Signatures & Python Examples

### A. Stage 1: Pre-Payload Assessment (`evaluate_pre_payload_stage`)
```python
def evaluate_pre_payload_stage(
    masked_text: str,
    detected_entities: Sequence[Mapping[str, Any] | str] | None = None,
    policy: SecurityPolicy | None = None,
) -> PrePayloadSecurityAssessment
```

**Example Call:**
```python
from security import evaluate_pre_payload_stage, get_policy

policy = get_policy("banking")
assessment = evaluate_pre_payload_stage(
    masked_text="Verify balance for {{PII_NAME_1}} holding PAN {{PII_PAN_1}}.",
    detected_entities=[
        {"type": "NAME", "value": "Alex Doe"},
        {"type": "PAN", "value": "ABCDE1234F"},
    ],
    policy=policy,
)

if not assessment.can_proceed:
    print(f"Halted at Stage 1: {assessment.policy_result.violations}")
```

**JSON Output (`assessment.to_dict()`):**
```json
{
  "can_proceed": true,
  "risk_report": {
    "score": 46.0,
    "severity": "MEDIUM",
    "action_recommendation": "WARN",
    "factors": [
      {"name": "pii_name_count", "severity": "MEDIUM", "weight": 10.0, "description": "Presence of 1 masked NAME entity."},
      {"name": "pii_pan_count", "severity": "HIGH", "weight": 30.0, "description": "Presence of 1 masked PAN entity."},
      {"name": "pii_aggregation_diversity", "severity": "MEDIUM", "weight": 6.0, "description": "Cross-identifier correlation risk."}
    ],
    "summary": "Engineering indicator: Composite risk score is 46.00/100.0 (MEDIUM).",
    "engineering_indicator": "Engineering indicator: Calculated risk score is a heuristic for prototype evaluation."
  },
  "injection_result": {
    "is_flagged": false,
    "confidence_score": 0.0,
    "matched_indicators": [],
    "categories": [],
    "engineering_indicator": "Engineering indicator: Heuristic injection pattern detection."
  },
  "policy_result": {
    "action": "ALLOW",
    "passed": true,
    "violations": [],
    "warnings": [],
    "engineering_indicator": "Engineering indicator: Policy 'banking' evaluated."
  },
  "engineering_indicator": "Engineering indicator: Pre-payload stage finished."
}
```

---

### B. Stage 2: Pre-LLM Outbound Leak Check (`run_leak_check`)
```python
def run_leak_check(
    outbound_payload: Any,
    original_entities: Sequence[Mapping[str, Any]] | None = None,
    allowed_preserved: Sequence[str] | Set[str] | None = None,
) -> LeakCheckResult
```

**Example Call:**
```python
from security import run_leak_check

outbound = {
    "model": "gemini-1.5-pro",
    "messages": [
        {"role": "user", "content": "Query account for {{PII_NAME_1}}. Support hotline: +91 98765 43210"}
    ]
}

result = run_leak_check(
    outbound_payload=outbound,
    original_entities=[{"type": "NAME", "value": "Alex Doe"}],
    allowed_preserved=["+91 98765 43210"],  # Corporate hotline allowed
)

if result.has_leak:
    raise RuntimeError(f"Halted at Stage 2: {result.summary}")
```

**JSON Output (`result.to_dict()`):**
```json
{
  "has_leak": false,
  "leak_count": 0,
  "leaked_items": [],
  "summary": "Engineering indicator: Pre-LLM leak check passed. No unmasked sensitive PII detected.",
  "engineering_indicator": "Engineering indicator: Pattern and entity-origin verification completed."
}
```

---

### C. Department Policy Resolution (`get_policy`)
```python
def get_policy(department: str | None = None) -> SecurityPolicy
```
- **Policy Selection Logic**: Looks up `department.strip().lower()` in `security/policies.json`.
- **Preconfigured Departments**:
  - `banking`: `max_allowed_risk_score=50.0`, `blocked_pii_types=["AADHAAR"]`, `always_mask=["PAN", "AADHAAR", "PHONE", "EMAIL", "GSTIN"]`.
  - `hr`: `max_allowed_risk_score=60.0`, `blocked_pii_types=[]`, `always_mask=["NAME", "PHONE", "EMAIL", "AADHAAR"]`.
  - `healthcare`: `max_allowed_risk_score=45.0`, `blocked_pii_types=["AADHAAR"]`, `always_mask=["NAME", "AADHAAR", "PHONE", "EMAIL"]`.
  - `default`: `max_allowed_risk_score=65.0`, `blocked_pii_types=[]`.
- **Fallback**: If `department` is `None`, empty, or unrecognized, automatically falls back to `"default"`.

---

### D. Synthetic Canary Verification (`run_canary`)
```python
def run_canary(skip_masking: bool = False) -> CanaryResult
```
- `skip_masking=False`: Runs synthetic tokens through stub masking and verifies clean passage (`passed=True`).
- `skip_masking=True`: Simulates masking failure and verifies the leak detector halts transmission (`passed=False`).

---

## 4. How `allowed_preserved` Works

`allowed_preserved` accepts strings intentionally permitted to remain unmasked in the outbound payload (e.g. public customer support hotlines, corporate support emails, or authorized names).
- Matching is normalized: ignores casing, spaces, and hyphens.
- Values in `allowed_preserved` are excluded from regex and entity origin leak checks.
- If an unmasked PII matches an entry in `allowed_preserved`, `has_leak` remains `False`.

---

## 5. REST API Endpoints (Prefix `/security`)

| Method | Path | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/security/canary?skip_masking=false` | None | Runs synthetic canary pipeline verification. |
| `GET` | `/security/policies` | None | Retrieves all department policy definitions. |
| `PUT` | `/security/policies/{dept}` | `UpdatePolicyRequest` | Updates and persists a department policy. |
| `POST` | `/security/evaluate` | `{"masked_text", "entities", "department"}` | Runs pre-payload Stage 1 assessment. |
| `POST` | `/security/leak-check` | `{"outbound_payload", "entities", "allowed_preserved"}` | Runs pre-LLM Stage 2 leak check. |

*Note: Raw PII values are never reflected in response bodies or log output.*

---

## 6. Known Limitations Summary

*(Full details in [`security/KNOWN_LIMITATIONS.md`](file:///c:/Users/sagar/Downloads/minearena/security/KNOWN_LIMITATIONS.md))*

1. **Base64 & Hex Strings**: Not decoded during pre-outbound regex scans to prevent false alarms on bearer tokens and image assets (prompt injection cues are caught at Stage 1).
2. **Cryptographic Ciphers (ROT13)**: Arbitrary byte shifts without a key cannot be deterministically detected without high false-positive rates.
3. **Spelled-Out Numbers**: Written words like *"nine eight seven..."* are not converted to digits to avoid blocking legitimate business quantities or dates.
4. **Binary / Media Streams**: Text and JSON inspection only; binary/image files require upstream OCR.
