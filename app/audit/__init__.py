"""
app/audit/__init__.py
─────────────────────
Member 3 Integration Layer — Audit & Leak Detection Module

This package is the integration point for Member 3's leak checker
and advanced audit logging capabilities.
"""
from app.audit.leak_checker import check_for_leaks, LeakCheckResult

__all__ = ["check_for_leaks", "LeakCheckResult"]
