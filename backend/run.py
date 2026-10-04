"""
Run script for the FastAPI backend server.
"""

import uvicorn
import os
import sys

# Ensure current directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting AI Software Engineering Assistant backend on {host}:{port}...")
    uvicorn.run("backend.api.app:app", host=host, port=port, reload=False)
