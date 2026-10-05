"""
api/index.py — Vercel serverless entry-point for HEALIX AI backend.

Vercel mounts this as the handler for all /api/* requests.
We re-use the same FastAPI `app` from backend/main.py by adding
the backend directory to sys.path and properly linking the api package.
"""
import sys
import os

# 1. Add backend directory to sys.path
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_backend = os.path.join(_root, "backend")

if _backend not in sys.path:
    sys.path.insert(0, _backend)

# 2. Extend api package search path so backend/api routes are discovered
_backend_api = os.path.join(_backend, "api")
if "api" in sys.modules and hasattr(sys.modules["api"], "__path__"):
    if _backend_api not in sys.modules["api"].__path__:
        sys.modules["api"].__path__.append(_backend_api)

# 3. Import and expose FastAPI app for Vercel serverless execution
from main import app  # noqa: E402
