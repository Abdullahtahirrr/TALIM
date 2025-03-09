
# routes/auth_routes.py

from flask import Blueprint, request, jsonify, redirect
from supabase import create_client
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Sign up with Supabase (this will trigger verification email)
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })
        
        # Check if user was created successfully
        if response.user:
            # Create additional user profile data if needed
            user_data = {
                'id': response.user.id,
                'display_name': data.get('displayName', email),
                'role': data.get('role', 'student'),
                'university': data.get('university', ''),
            }
            
            # Insert into profiles table
            supabase.table('profiles').insert(user_data).execute()
            
            return jsonify({
                'message': 'User created successfully. Please check your email to verify your account.',
                'user': {
                    'id': response.user.id,
                    'email': email,
                    'emailConfirmed': False
                }
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/verify', methods=['GET'])
def verify_email():
    # This endpoint handles redirects from email verification links
    token_hash = request.args.get('token_hash')
    type = request.args.get('type')
    
    if not token_hash or type != 'email':
        return jsonify({'error': 'Invalid verification link'}), 400
    
    try:
        # Redirect to frontend with the token
        # Your frontend will handle the actual verification
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/verify-email?token_hash={token_hash}&type={type}")
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# routes/auth_routes.py (add these routes to the existing file)

@auth_bp.route('/google/url', methods=['GET'])
def get_google_auth_url():
    try:
        # Get the OAuth redirect URL from Supabase
        provider = 'google'
        redirect_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        options = { 'redirectTo': f"{redirect_url}/auth/callback" }
        
        response = supabase.auth.get_url_for_provider(
            provider,
            options
        )
        
        return jsonify({'url': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/callback', methods=['POST'])
def handle_auth_callback():
    data = request.json
    
    # The frontend will send the query parameters received from the redirect
    # after Google authentication
    query_params = data.get('queryParams', {})
    
    try:
        # Exchange the code for a session
        response = supabase.auth.exchange_code_for_session(query_params)
        
        # Get user info
        user = response.user
        
        # Check if user profile exists
        profile_response = supabase.table('profiles').select('*').eq('id', user.id).execute()
        
        if not profile_response.data:
            # Create profile if it doesn't exist
            profile_data = {
                'id': user.id,
                'display_name': user.user_metadata.get('full_name', ''),
                'role': 'student',  # Default role
                'email': user.email
            }
            
            supabase.table('profiles').insert(profile_data).execute()
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.user_metadata.get('full_name', '')
            },
            'session': {
                'access_token': response.session.access_token,
                'refresh_token': response.session.refresh_token
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400