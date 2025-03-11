from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client globally
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def create_app():
    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Import and register blueprints
    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    # Root route for testing
    @app.route('/')
    def index():
        return jsonify({'message': 'TALIM API is running'}), 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)