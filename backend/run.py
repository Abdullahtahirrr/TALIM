#!/usr/bin/env python3
"""
Simple script to run the TALIM API with proper path configuration
"""
import os
import sys
from api import app

if __name__ == "__main__":
    # Configure port and host
    port = int(os.environ.get('PORT',5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    print(f"Starting TALIM API on {host}:{port} (debug={debug})")
    print(f"API endpoints:")
    print(f"  - Chat: http://{host}:{port}/api/chat")
    print(f"  - Assessment: http://{host}:{port}/api/assessment")
    print(f"  - Health check: http://{host}:{port}/api/health")
    
    # Run the Flask app
    app.run(host=host, port=port, debug=debug)