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
    role = data.get('role', 'student')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Check if email already exists in profiles table
        existing_profile = supabase.table('profiles').select('*').eq('email', email).execute()
        
        if existing_profile.data and len(existing_profile.data) > 0:
            return jsonify({'error': 'Email already registered. Please sign in or use a different email.'}), 400
        
        # Sign up with Supabase (this will trigger verification email)
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })
        
        # Check if user was created successfully
        if response.user:
            # Create initial profile with basic data
            user_data = {
                'id': response.user.id,
                'first_name': data.get('firstName', ''),
                'last_name': data.get('lastName', ''),
                'email': email,
                'role': role,
                'email_verified': False  # Track verification status
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
            # Create profile for Google user if it doesn't exist
            profile_data = {
                'id': user.id,
                'first_name': user.user_metadata.get('full_name', '').split(' ')[0] if user.user_metadata.get('full_name') else '',
                'last_name': ' '.join(user.user_metadata.get('full_name', '').split(' ')[1:]) if user.user_metadata.get('full_name') else '',
                'email': user.email,
                'role': 'student',  # Default role
                'email_verified': True  # Google users are already verified
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

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        # Resend verification email
        response = supabase.auth.resend_signup_email(email)
        
        return jsonify({
            'message': 'Verification email has been resent. Please check your inbox.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

