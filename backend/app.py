from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Test route
@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({
        "message": "Backend is running!",
        "status": "success"
    })

# Test Supabase connection
@app.route('/api/supabase-test', methods=['GET'])
def test_supabase():
    try:
        # Try to get a count of profiles
        response = supabase.table('profiles').select('count', count='exact').execute()
        return jsonify({
            "message": "Supabase connection successful!",
            "profile_count": response.count,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "message": f"Error connecting to Supabase: {str(e)}",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)