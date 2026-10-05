"""
api/index.py — Vercel serverless entry-point for HEALIX AI backend.

Vercel mounts this as the handler for all /api/* requests.
We re-use the same FastAPI `app` from backend/main.py by adding
the backend directory to sys.path.
"""
import sys
import os

# Make all backend modules importable from this file's location
_backend = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, os.path.abspath(_backend))

# Now import the FastAPI app
from main import app  # noqa: E402  (must come after sys.path)
