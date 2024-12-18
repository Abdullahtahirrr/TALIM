# from Retrieval import generate_answer, get_relevant_docs_basic
# from Vector_database import get_vector_store, add_documents_to_vector_store
# from QueryAnalyser import analyze_query
# import logging
# import time
# # logging.basicConfig(level=logging.DEBUG)/
# user_role="Student"
# # Example usage:
# if __name__ == "__main__":
#     # Get user query
#     if user_role == "Student":
#         user_query = input("Enter your query: ")
#         query_filter = analyze_query(user_query)
#         vc= get_vector_store("Artificial_Intelligence")
#         vector_db_size = len(vc.get()['documents'])
#         print('vector_db_size',vector_db_size)
#         if(query_filter == "Valid"):
#             # Use Basic RAG for retrieval
#             retriever_type = "RAG Fusion"

#             start=time.time()
#             # Generate the final answer
#             relevant_text, answer = generate_answer(user_query, retriever_type)
#             # Output resultsh
#             print('time taken: ', time.time()-start)
#             print("\nRelevant Documents:")
#             # for doc in relevant_text:
#             #     print(doc.page_content)
#             print("\nGenerated Answer:")
#             print(answer)
#         else: 
#             print(query_filter)
#     elif (user_role == "Instructor"):
#         pass
import streamlit as st
from collections import defaultdict
from Retrieval import generate_answer  # Assuming this function handles query processing
from Vector_database import get_vector_store
from QueryAnalyser import analyze_query

# Initialize session state variables
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "user_role" not in st.session_state:
    st.session_state.user_role = "Student"  # Default to Student

# Helper function to display chat
def display_chat(chat_history):
    for message in chat_history:
        if message["sender"] == "Human":
            with st.chat_message("Human"):
                st.write(message["message"])
        else:
            with st.chat_message("AI"):
                st.write(message["message"])

# Helper function for quiz and assignment popups
def generate_popup(title, button_label, input_fields):
    with st.form(title):
        inputs = {}
        for field_name, options in input_fields.items():
            if options["type"] == "dropdown":
                inputs[field_name] = st.selectbox(field_name, options["options"])
            elif options["type"] == "text":
                inputs[field_name] = st.text_input(field_name)
            elif options["type"] == "number":
                inputs[field_name] = st.number_input(field_name, min_value=1, step=1)
        submitted = st.form_submit_button(button_label)
        if submitted:
            st.success(f"{title} submitted with details: {inputs}")
            return inputs
    return None

# Main app logic
def main():
    st.title("Chat Application")

    # Sidebar to choose user role
    st.sidebar.title("Settings")
    user_role = st.sidebar.selectbox("Select User Role", ["Student", "Teacher"])
    st.session_state.user_role = user_role

    # Chat interface
    if user_role == "Student":
        st.header("Student Chatbot")
        user_query = st.chat_input("Ask a question:")
        if user_query:
            # Analyze query and generate response
            query_filter = analyze_query(user_query)
            if query_filter == "Valid":
                _ , response = generate_answer(user_query,st.session_state.chat_history, retriever_type="RAG Fusion")
                # Update chat history
                st.session_state.chat_history.append({"sender": "Human", "message": user_query})
                st.session_state.chat_history.append({"sender": "AI", "message": response})
            else:
                response = query_filter
                st.session_state.chat_history.append({"sender": "AI", "message": response})
        display_chat(st.session_state.chat_history)

    elif user_role == "Teacher":
        st.header("Teacher Dashboard")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Generate Quiz"):
                popup_inputs = generate_popup(
                    title="Quiz Details",
                    button_label="Generate Quiz",
                    input_fields={
                        "Difficulty": {"type": "dropdown", "options": ["Easy", "Medium", "Hard"]},
                        "Number of Questions": {"type": "number"},
                        "Topic": {"type": "text"},
                        "Lecture Number": {"type": "number"},
                        "Total Marks": {"type": "number"},
                    },
                )
                if popup_inputs:
                    st.write(f"Quiz generated with details: {popup_inputs}")

        with col2:
            if st.button("Generate Assignment"):
                popup_inputs = generate_popup(
                    title="Assignment Details",
                    button_label="Generate Assignment",
                    input_fields={
                        "Difficulty": {"type": "dropdown", "options": ["Easy", "Medium", "Hard"]},
                        "Topic": {"type": "text"},
                        "Lecture Number": {"type": "number"},
                        "Total Marks": {"type": "number"},
                    },
                )
                if popup_inputs:
                    st.write(f"Assignment generated with details: {popup_inputs}")

        # Teacher's chat interface
        user_query = st.chat_input("Ask a question or give instructions:")
        if user_query:
            response, _ = generate_answer(user_query, retriever_type="Basic Similarity Search")
            # Update chat history
            st.session_state.chat_history.append({"sender": "Human", "message": user_query})
            st.session_state.chat_history.append({"sender": "AI", "message": response})
        display_chat(st.session_state.chat_history)

if __name__ == "__main__":
    main()
