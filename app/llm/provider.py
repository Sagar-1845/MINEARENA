"""
app/llm/provider.py
────────────────────
Member 2 — Configurable LLM Provider
──────────────────────────────────────
Provides a uniform interface for calling an external LLM.
Default provider: Groq (using the official groq Python SDK).

Adding a new provider:
  1. Create a subclass of `BaseLLMProvider`.
  2. Register it in `_PROVIDER_REGISTRY`.
  3. Set LLM_PROVIDER=<name> in the environment.

Security rules enforced here:
  • API key read from env — never hardcoded.
  • API key NEVER appears in logs, exceptions, or return values.
  • The outbound payload is captured and returned for audit.
  • Mock mode (LLM_MOCK_MODE=true) allows full testing without real API calls.
"""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class LLMRequest:
    """Everything sent to the LLM — only sanitized_text, never original PII."""
    sanitized_text: str
    task_instruction: str         # minimal task description
    model: str
    max_tokens: int = 1024
    temperature: float = 0.2      # low temperature for predictable output

    def to_messages(self) -> List[Dict[str, str]]:
        """Convert to the standard chat-completion messages format."""
        return [
            {
                "role": "system",
                "content": (
                    "You are a privacy-safe AI assistant. "
                    "The text you receive has already been anonymised with placeholders "
                    "such as [PERSON_1], [AADHAAR_1], [PAN_1]. "
                    "Preserve ALL placeholders exactly as they appear — do not modify, "
                    "remove, or guess their original values. "
                    "Return your response in plain text."
                ),
            },
            {
                "role": "user",
                "content": f"{self.task_instruction}\n\n---\n\n{self.sanitized_text}",
            },
        ]

    def to_audit_payload(self) -> Dict[str, Any]:
        """
        Return the exact payload that will be sent to the LLM.
        Safe to log — contains NO original PII, NO API key.
        """
        return {
            "model": self.model,
            "messages": self.to_messages(),
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }


@dataclass
class LLMResponse:
    success: bool
    content: str                      # LLM-generated text (may contain placeholders)
    model_used: str
    provider: str
    processing_time_ms: float
    outbound_payload: Dict[str, Any]  # captured for audit
    error: Optional[str] = None
    mock: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Abstract base provider
# ─────────────────────────────────────────────────────────────────────────────

class BaseLLMProvider(ABC):
    """All LLM providers must implement this interface."""

    @abstractmethod
    def call(self, request: LLMRequest) -> LLMResponse:
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...


# ─────────────────────────────────────────────────────────────────────────────
# Groq provider
# ─────────────────────────────────────────────────────────────────────────────

class GroqProvider(BaseLLMProvider):
    """
    Calls the Groq chat-completion API using the official groq Python SDK.
    Handles: timeouts, rate limits, auth errors, model-not-found.
    """

    def __init__(self, api_key: str, model: str):
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set. Add it to your .env file.")
        # Import here so the module loads even if groq is not installed
        try:
            from groq import Groq
        except ImportError as exc:
            raise ImportError("Install the groq package: pip install groq") from exc

        # Intentionally do NOT store api_key as an attribute
        # to prevent accidental serialisation or logging.
        self._client = Groq(api_key=api_key)
        self._model = model

    @property
    def provider_name(self) -> str:
        return "groq"

    def call(self, request: LLMRequest) -> LLMResponse:
        outbound = request.to_audit_payload()
        start = time.monotonic()

        try:
            response = self._client.chat.completions.create(
                model=request.model,
                messages=request.to_messages(),
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )
            elapsed = (time.monotonic() - start) * 1000
            content = response.choices[0].message.content or ""
            model_used = response.model or request.model

            logger.info(
                "Groq call succeeded: model=%s, tokens_used=%s, time=%.0fms",
                model_used,
                getattr(response.usage, "total_tokens", "?"),
                elapsed,
            )

            return LLMResponse(
                success=True,
                content=content,
                model_used=model_used,
                provider=self.provider_name,
                processing_time_ms=elapsed,
                outbound_payload=outbound,
            )

        except Exception as exc:
            elapsed = (time.monotonic() - start) * 1000
            # Sanitise the error message — remove any chance of key leakage
            error_msg = _sanitise_error(exc)
            logger.error("Groq call failed: %s (%.0fms)", error_msg, elapsed)
            return LLMResponse(
                success=False,
                content="",
                model_used=request.model,
                provider=self.provider_name,
                processing_time_ms=elapsed,
                outbound_payload=outbound,
                error=error_msg,
            )


# ─────────────────────────────────────────────────────────────────────────────
# Mock provider (for tests and offline demos)
# ─────────────────────────────────────────────────────────────────────────────

class MockLLMProvider(BaseLLMProvider):
    """
    Returns a canned response for testing without consuming API credits.
    The mock response preserves all placeholders found in the input.
    """

    @property
    def provider_name(self) -> str:
        return "mock"

    def call(self, request: LLMRequest) -> LLMResponse:
        import re
        outbound = request.to_audit_payload()
        # Echo back all placeholders so placeholder validation tests pass
        placeholders = re.findall(r"\[[A-Z_]+_\d+\]", request.sanitized_text)
        placeholder_str = ", ".join(placeholders) if placeholders else "(none)"

        mock_content = (
            f"[MOCK LLM RESPONSE]\n"
            f"Task: {request.task_instruction[:80]}\n"
            f"Placeholders preserved: {placeholder_str}\n"
            f"Summary: This document has been processed with privacy protection. "
            f"All sensitive identifiers have been replaced with typed placeholders."
        )

        return LLMResponse(
            success=True,
            content=mock_content,
            model_used="mock-model",
            provider="mock",
            processing_time_ms=1.0,
            outbound_payload=outbound,
            mock=True,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Provider factory
# ─────────────────────────────────────────────────────────────────────────────

def build_provider(settings=None) -> BaseLLMProvider:
    """
    Build and return the configured LLM provider.
    Reads settings from app.config if not provided.
    """
    if settings is None:
        from app.config import get_settings
        settings = get_settings()

    if settings.llm_mock_mode or not settings.groq_api_key:
        logger.info("LLM mock mode enabled or GROQ_API_KEY absent — using MockLLMProvider.")
        return MockLLMProvider()

    return GroqProvider(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _sanitise_error(exc: Exception) -> str:
    """
    Convert an exception to a loggable string.
    Strips any occurrence of common API key patterns so they are
    never written to logs.
    """
    import re as _re
    msg = str(exc)
    # Redact anything that looks like a Groq key (gsk_...) or Bearer token
    msg = _re.sub(r"gsk_[A-Za-z0-9]{30,}", "***REDACTED***", msg)
    msg = _re.sub(r"Bearer\s+[A-Za-z0-9\-_\.]{20,}", "Bearer ***REDACTED***", msg)
    # Classify common error types
    lower = msg.lower()
    if "authentication" in lower or "api key" in lower or "unauthorized" in lower:
        return "Authentication error — check GROQ_API_KEY in .env"
    if "rate limit" in lower or "rate_limit" in lower or "429" in lower:
        return "Rate limit exceeded — please retry after a short delay"
    if "timeout" in lower or "timed out" in lower:
        return "Request timed out — the LLM service did not respond in time"
    if "model" in lower and ("not found" in lower or "invalid" in lower or "does not exist" in lower):
        return f"Model not found — check GROQ_MODEL in .env. Detail: {msg[:120]}"
    if "connection" in lower or "network" in lower:
        return "Network error — could not reach the LLM API endpoint"
    return f"LLM provider error: {msg[:200]}"
