"""
Test script to simulate production environment locally.
Run with: python test_prod.py
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    # Set production environment variables
    os.environ["ENVIRONMENT"] = "production"
    os.environ["FRONTEND_URL"] = "https://alexandrias-journal.onrender.com"
    
    # Run server on a different port to not conflict with development
    uvicorn.run(app, host="0.0.0.0", port=8001)
