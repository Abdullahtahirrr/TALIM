from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure path to find your existing modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sourcecode_dir = os.path.join(parent_dir, 'SourceCode')

# Add both parent and sourcecode directories to path
sys.path.append(parent_dir)
sys.path.append(sourcecode_dir)

# Import your existing RAG modules
from SourceCode.Retrieval import generate_answer, generate_assessment
from SourceCode.QueryAnalyser import analyze_query

app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint for student chat interface that directly uses your RAG system
    """
    try:
        data = request.json
        user_query = data.get('query', '')
        chat_history = data.get('chat_history', [])
        
        print(f"Received chat request: {user_query}")
        
        # Analyze query for validity using your existing function
        query_filter = analyze_query(user_query)
        
        if query_filter == "Valid":
            # Use the specified retriever (or default to MultiQuery)
            retriever_type = "MultiQuery Retriever"
            start = time.time()
            
            # Generate answer using your existing RAG system
            relevant_text, answer = generate_answer(user_query, chat_history, retriever_type)
            
            end = time.time()
            print(f"Time taken: {end - start:.2f} seconds")
            
            # Format relevant text for frontend
            formatted_sources = []
            for doc in relevant_text:
                if hasattr(doc, 'metadata'):
                    formatted_sources.append({
                        'page_content': doc.page_content,
                        'metadata': doc.metadata
                    })
            
            return jsonify({
                'answer': answer,
                'relevant_text': formatted_sources
            })
        else:
            return jsonify({
                'answer': query_filter,
                'relevant_text': []
            })
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'answer': f"An error occurred: {str(e)}",
            'relevant_text': []
        }), 500

@app.route('/api/assessment', methods=['POST'])
def assessment():
    """
    Endpoint for generating assignments and quizzes using your RAG system
    """
    try:
        data = request.json
        assessment_type = data.get('Assessment_type', '')
        lecture_name = data.get('lecture_name', '')
        key_topics = data.get('KeyTopics', '')
        
        print(f"Received assessment request: {assessment_type} for {lecture_name}")
        
        # Validate required fields
        if not assessment_type or not lecture_name or not key_topics:
            return jsonify({
                'answer': "Missing required fields",
                'relevant_text': []
            }), 400
            
        # Build query for assessment generator
        if assessment_type.lower() == 'quiz':
            query = f"Generate a quiz from {lecture_name} with the following details. Key Topics: {key_topics}."
        else:
            query = f"Generate an assignment from {lecture_name} with the following details. Key Topics: {key_topics}."
        
        # Use the specified retriever
        retriever_type = "MultiQuery Retriever"
        
        # Generate assessment using your existing RAG system
        relevant_text, answer = generate_assessment(query, data, retriever_type)
        
        # Format relevant text for frontend
        formatted_sources = []
        for doc in relevant_text:
            if hasattr(doc, 'metadata'):
                formatted_sources.append({
                    'page_content': doc.page_content,
                    'metadata': doc.metadata
                })
        
        return jsonify({
            'answer': answer,
            'relevant_text': formatted_sources
        })
            
    except Exception as e:
        print(f"Error in assessment endpoint: {str(e)}")
        return jsonify({
            'answer': f"An error occurred: {str(e)}",
            'relevant_text': []
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the API is running
    """
    return jsonify({
        'status': 'ok',
        'message': 'TALIM API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    print(f"Starting TALIM API on {host}:{port} (debug={debug})")
    print(f"Using RAG modules from: {sourcecode_dir}")
    
    app.run(host=host, port=port, debug=debug)