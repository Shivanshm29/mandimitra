import os
import sys

# Ensure api directory is on sys.path so 'app' resolves
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.main import app
