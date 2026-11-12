# Known Limitations - ZeroLeak AI Pre-LLM Leak Checker

This document outlines specific adversarial evasion techniques, obfuscation strategies, and payload formats that the `run_leak_check` pre-LLM leak checker intentionally does not handle, along with the engineering and architectural rationale for each decision.

> [!NOTE]
> Prototype disclaimer: Security and privacy scoring represents heuristic evaluations for prototype verification. This assessment is an engineering indicator, never an assertion of absolute security.

---

## 1. Base64 and Raw Hex Encoding

- **Attacker Method**: Encoding sensitive identifiers into base64 (e.g. `QUJDREUxMjM0Rg==` for a PAN) or hexadecimal byte strings (`41424344453132333446`).
- **Why Not Handled in Pre-LLM Leak Checker**:
  - **False Positive Overhead**: High-performance LLM gateway requests routinely carry base64-encoded binary assets, image chunks, authentication bearer tokens, CSRF tokens, cryptographic nonces, and serialized JSON embeddings. Recursively decoding every base64-like token across multi-megabyte payloads introduces unacceptable latency and causes false positive rejections of legitimate application tokens.
  - **Pipeline Separation**: Prompts that instruct an LLM to decode and execute base64 commands are detected and blocked earlier in **Stage 1** via heuristic prompt injection scanning (`security/injection_detection.py`), rather than decoding all data at the outbound boundary.

---

## 2. Cryptographic and Substitution Ciphers (ROT13, Caesar, Vigenère)

- **Attacker Method**: Shifting character bytes using simple alphabetic ciphers (e.g. ROT13 `NOPQR6789S` for `ABCDE1234F`) or user-defined substitution keys.
- **Why Not Handled**:
  - **Key Space Uncertainty**: Without a pre-shared key or prior declaration of the shift offset, a static regular-expression scanner cannot distinguish random ciphertext or foreign words from an encrypted identity number without testing all permutation keys, which leads to massive false positives across standard multilingual prose.

---

## 3. Spelled-Out Numbers and Phonetic Euphemisms

- **Attacker Method**: Spanning numbers as spelled-out English or vernacular words (e.g. `"nine eight seven six five four three two one zero"` or `"aadhaar number one two three four five six seven eight nine zero one two"`).
- **Why Not Handled**:
  - **Semantic Ambiguity**: Normal business conversations frequently discuss quantities, measurements, dates, currency, statistics, and item tallies using written numbers. Aggressively converting all spelled-out number words into contiguous digits would inadvertently flag benign commercial statements as leaked national IDs.
  - **Appropriate Boundary**: Semantic entity extraction is the responsibility of Member 1's upstream NLP detection model, not the lightweight pre-outbound regex scanner.

---

## 4. Multi-Modal, Audio, and Binary Payloads

- **Attacker Method**: Hiding PII inside binary attachments, audio spectrograms, image metadata (EXIF), or embedded raster images.
- **Why Not Handled**:
  - **Scope**: The ZeroLeak AI prototype gateway is architected for textual and structured JSON messages. Binary, raster, and audio data streams require specialized optical character recognition (OCR) and speech-to-text parsers that exceed the lightweight, dependency-free mandate of this module.

---

## 5. Non-Verbatim Semantic Paraphrasing

- **Attacker Method**: Paraphrasing identity without using formal identifiers (e.g., *"the chief tax officer of ABC Corp who lives at 12 Elm Street and was born on 14 March 1985"*).
- **Why Not Handled**:
  - **Deterministic Regex Limits**: Syntactic leak checking verifies structured identifiers (Aadhaar, PAN, GSTIN, Phone, Email) and exact masked tokens. Semantic re-identification through biographical correlation requires knowledge graph linkage rather than local pre-dispatch text matching.
