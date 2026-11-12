"""
app/llm/context_masking.py
───────────────────────────
Member 2 — Context-Aware / Task-Aware Masking Rules
─────────────────────────────────────────────────────
Defines which PII entity types must be masked for each task type.

Design principles:
  • Privacy > Convenience — when in doubt, mask it.
  • ALWAYS_MASK types (Aadhaar, PAN, GSTIN, Passport, Voter ID, credit card,
    bank account) are NEVER preserved regardless of task.
  • Rules are explicit and configurable, not AI-decided.
  • Adding a new task type: add an entry to TASK_RULES below.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, FrozenSet, Set

from app.privacy.detector import EntityType, ALWAYS_MASK


# ─────────────────────────────────────────────────────────────────────────────
# Supported task types
# ─────────────────────────────────────────────────────────────────────────────

class TaskType:
    SUMMARIZATION        = "summarization"
    EXTRACTION           = "extraction"
    SUPPORT_ANALYSIS     = "support_analysis"
    LOAN_ANALYSIS        = "loan_analysis"
    KYC_ANALYSIS         = "kyc_analysis"
    GENERAL              = "general"

ALL_TASK_TYPES: FrozenSet[str] = frozenset({
    TaskType.SUMMARIZATION,
    TaskType.EXTRACTION,
    TaskType.SUPPORT_ANALYSIS,
    TaskType.LOAN_ANALYSIS,
    TaskType.KYC_ANALYSIS,
    TaskType.GENERAL,
})


# ─────────────────────────────────────────────────────────────────────────────
# Task instructions sent to the LLM (task_type → instruction string)
# ─────────────────────────────────────────────────────────────────────────────

TASK_INSTRUCTIONS: Dict[str, str] = {
    TaskType.SUMMARIZATION: (
        "Summarise the following document in 3–5 sentences. "
        "Preserve all placeholders exactly as they appear."
    ),
    TaskType.EXTRACTION: (
        "Extract the key data fields from the following document. "
        "Return each field as 'Field: Value'. "
        "Use the placeholder tokens as the values for any personal identifiers."
    ),
    TaskType.SUPPORT_ANALYSIS: (
        "Analyse the following customer support ticket. "
        "Identify the main issue, sentiment, and suggested resolution. "
        "Preserve all placeholders exactly as they appear."
    ),
    TaskType.LOAN_ANALYSIS: (
        "Analyse the following loan application. "
        "Identify the loan amount, purpose, income, employment status, and risk factors. "
        "Do not attempt to interpret or expand any placeholder tokens."
    ),
    TaskType.KYC_ANALYSIS: (
        "Analyse the following KYC document. "
        "Identify document type, verification status, and any missing fields. "
        "Preserve all placeholder tokens — do not guess original values."
    ),
    TaskType.GENERAL: (
        "Process the following document as requested. "
        "Preserve all placeholder tokens exactly as they appear."
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# Per-task masking rules
#
# additional_mask_types: entity types to mask IN ADDITION to ALWAYS_MASK.
# preserve_types: entity types that may be kept as-is for this task.
#   (These are entity types that are NOT in ALWAYS_MASK and whose
#    information is genuinely needed for the task.)
#
# Note: ALWAYS_MASK types can NEVER appear in preserve_types.
# ─────────────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class TaskMaskingRule:
    task_type: str
    additional_mask_types: FrozenSet[str]   # mask these on top of ALWAYS_MASK
    preserve_types: FrozenSet[str]          # do NOT mask these for this task
    description: str


TASK_RULES: Dict[str, TaskMaskingRule] = {
    TaskType.SUMMARIZATION: TaskMaskingRule(
        task_type=TaskType.SUMMARIZATION,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS, EntityType.DATE_OF_BIRTH,
        }),
        preserve_types=frozenset(),   # summaries don't need any raw PII
        description="Full masking — summaries should not expose any personal data.",
    ),

    TaskType.EXTRACTION: TaskMaskingRule(
        task_type=TaskType.EXTRACTION,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS, EntityType.DATE_OF_BIRTH,
        }),
        preserve_types=frozenset(),   # return typed placeholders, not raw values
        description="All PII masked; LLM returns placeholders in extracted fields.",
    ),

    TaskType.SUPPORT_ANALYSIS: TaskMaskingRule(
        task_type=TaskType.SUPPORT_ANALYSIS,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS,
        }),
        preserve_types=frozenset(),
        description="Mask personal identifiers; preserve issue description context.",
    ),

    TaskType.LOAN_ANALYSIS: TaskMaskingRule(
        task_type=TaskType.LOAN_ANALYSIS,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS, EntityType.DATE_OF_BIRTH,
        }),
        preserve_types=frozenset({
            # Financial figures that are not PII can be preserved
            # e.g., loan amount, monthly income as numeric values
            # (no entity type for plain numbers — they won't be in the mapping)
        }),
        description=(
            "Full identity masking for loan applications. "
            "Financial figures (numbers) are not PII and are not masked."
        ),
    ),

    TaskType.KYC_ANALYSIS: TaskMaskingRule(
        task_type=TaskType.KYC_ANALYSIS,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS, EntityType.DATE_OF_BIRTH,
        }),
        preserve_types=frozenset(),
        description=(
            "Strictest masking — KYC docs contain highly sensitive identity data. "
            "All PII masked. LLM analyses document structure only."
        ),
    ),

    TaskType.GENERAL: TaskMaskingRule(
        task_type=TaskType.GENERAL,
        additional_mask_types=frozenset({
            EntityType.NAME, EntityType.EMAIL, EntityType.PHONE,
            EntityType.ADDRESS, EntityType.DATE_OF_BIRTH,
        }),
        preserve_types=frozenset(),
        description="Default full-masking rule for unrecognised task types.",
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def get_task_rule(task_type: str) -> TaskMaskingRule:
    """Return the masking rule for the given task type. Falls back to GENERAL."""
    rule = TASK_RULES.get(task_type)
    if rule is None:
        import logging
        logging.getLogger(__name__).warning(
            "Unknown task_type %r — using GENERAL masking rule.", task_type
        )
        rule = TASK_RULES[TaskType.GENERAL]
    return rule


def get_effective_mask_types(task_type: str) -> Set[str]:
    """
    Return the complete set of entity types to mask for a given task.
    Always includes ALWAYS_MASK types.
    """
    rule = get_task_rule(task_type)
    return set(ALWAYS_MASK) | set(rule.additional_mask_types)


def get_task_instruction(task_type: str) -> str:
    """Return the LLM task instruction string for the given task type."""
    return TASK_INSTRUCTIONS.get(task_type, TASK_INSTRUCTIONS[TaskType.GENERAL])
