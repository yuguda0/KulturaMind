"""
WSGI entry point for PythonAnywhere deployment
This file is used by PythonAnywhere to run the FastAPI application
"""

import sys
import os

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Import the FastAPI app
from api import app

# For PythonAnywhere WSGI compatibility
application = app

