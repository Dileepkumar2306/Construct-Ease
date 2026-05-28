import sys
import os

# Add python-backup directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-backup'))

# Import Flask app instance from python-backup/app.py
from app import app

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, port=8000)
