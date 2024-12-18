import streamlit as st
from Retrieval import generate_answer, generate_assessment
from Vector_database import get_vector_store
from QueryAnalyser import analyze_query
from collections import defaultdict
import time

# Initialize session state variables
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "user_role" not in st.session_state:
    st.session_state.user_role = "Student"  # Default to Student

# Helper function to display chat history
def display_chat(chat_history):
    for message in chat_history:
        if message["sender"] == "Human":
            with st.chat_message("Human"):
                st.write(message["message"])
        else:
            with st.chat_message("AI"):
                st.write(message["message"])

# Main Streamlit application
def main():
    st.title("AI-Enhanced Learning Platform")

    # Sidebar: User Role Selection
    st.sidebar.title("Settings")
    user_role = st.sidebar.selectbox("Select User Role", ["Student", "Instructor"])
    st.session_state.user_role = user_role

    # Student Role
    if user_role == "Student":
        st.header("Student Chatbot")
        user_query = st.chat_input("Ask a question:")
        if user_query:
            query_filter = analyze_query(user_query)
            if query_filter == "Valid":
                # vc = get_vector_store("Artificial_Intelligence")
                # vector_db_size = len(vc.get()["documents"])
                retriever_type = "MultiQuery Retriever"
                start = time.time()
                # Generate answer
                relevant_text, answer = generate_answer(user_query, st.session_state.chat_history, retriever_type)
                end = time.time()
                print(f"Time taken: {end - start:.2f} seconds")
                # Update chat history
                st.session_state.chat_history.append({"sender": "Human", "message": user_query})
                st.session_state.chat_history.append({"sender": "AI", "message": answer})

                # Display referenced documents
                with st.sidebar:
                    if retriever_type == "RAG Fusion":
                    # If retriever is RAG Fusion, relevant_text is a list of lists
                        # print(relevant_text)
                        # for i, doc_list in enumerate(relevant_text):
                        #     st.write(f"Query Variant {i + 1}:")
                        #     for doc in doc_list:
                        #         source = doc[1].get('source', 'Unknown Source') if isinstance(doc, tuple) else 'Unknown Source'
                        #         st.write(f"  - {source}")
                        for i, doc_list in enumerate(relevant_text):
                            st.write(f"Query Variant {i + 1}:")
                            # for doc_tuple in doc_list:
                        #         document = doc_tuple[0]  # Extract the dictionary containing page_content and metadata
                        #         source = document.get("metadata", {}).get("source", "Unknown Source")
                        #         content = document.get("page_content", "No Content")
                        #         st.write(f"(Source: {source})")  # Truncate content for brevity
                    else:
                        # For other retriever types, relevant_text is a single list
                        for doc in relevant_text:
                            st.write(f"- {doc.metadata.get('source', 'Unknown Source')}")

            else:
                st.session_state.chat_history.append({"sender": "AI", "message": query_filter})
        
        # Display chat
        display_chat(st.session_state.chat_history)

    # Instructor Role
    elif user_role == "Instructor":
        st.header("Instructor Dashboard")
        
        # Assessment generation options
        assessment_type = st.selectbox("Select Assessment Type", ["Quiz", "Assignment"])
        
        # Common fields for both quiz and assignment
        lecture_name = st.text_input("Lecture Name")
        key_topics = st.text_area("Key Topics")
        difficulty = st.selectbox("Difficulty Level", ["Easy", "Medium", "Hard"])
        version = st.number_input("Number of Versions", min_value=1, step=1)
        total_marks = st.number_input("Total Marks", min_value=1, step=1)
        rubric = st.selectbox("Need Rubric", ["Yes", "No"])
        additional_requirements = st.text_area("Additional Requirements")

        # Quiz-specific fields
        if assessment_type == "Quiz":
            num_mcqs = st.number_input("Number of MCQs", min_value=0, step=1)
            num_theoretical = st.number_input("Number of Theoretical Questions", min_value=0, step=1)
            num_numerical = st.number_input("Number of Numerical Questions", min_value=0, step=1)
            
            if st.button("Generate Quiz"):
                quiz_data = {
                    "Assessment_type": assessment_type,
                    "lecture_name": lecture_name,
                    "KeyTopics": key_topics,
                    "MCQS": num_mcqs,
                    "Theortical": num_theoretical,
                    "Numerical": num_numerical,
                    "Difficulty": difficulty,
                    "Version": version,
                    "Total_marks": total_marks,
                    "Rubric": rubric,
                    "Additional_requirements": additional_requirements
                }
                quiz_query = (
                    f"Generate a quiz from {lecture_name} with the following details. "
                    f"Key Topics: {key_topics}. Additional Requirements: {additional_requirements}."
                )
                retriever_type = "MultiQuery Retriever"
                relevant_text, answer = generate_assessment(quiz_query, quiz_data, retriever_type)

                # Display results
                st.subheader("Generated Quiz")
                st.write(answer)

                st.sidebar.subheader("Referenced Documents")
                for doc in relevant_text:
                    st.sidebar.write(f"- {doc.metadata.get('source', 'Unknown Source')}: Page {doc.metadata.get('page', 'Unknown')}")

        # Assignment-specific fields
        elif assessment_type == "Assignment":
            num_theoretical = st.number_input("Number of Theoretical Questions", min_value=0, step=1)
            num_numerical = st.number_input("Number of Numerical Questions", min_value=0, step=1)
            
            if st.button("Generate Assignment"):
                assignment_data = {
                    "Assessment_type": assessment_type,
                    "lecture_name": lecture_name,
                    "KeyTopics": key_topics,
                    "MCQS": "None",
                    "Theortical": num_theoretical,
                    "Numerical": num_numerical,
                    "Difficulty": difficulty,
                    "Version": version,
                    "Total_marks": total_marks,
                    "Rubric": rubric,
                    "Additional_requirements": additional_requirements
                }
                assignment_query = (
                    f"Generate an assignment from {lecture_name} with the following details. "
                    f"Key Topics: {key_topics}. Additional Requirements: {additional_requirements}."
                )
                retriever_type = "MultiQuery Retriever"
                relevant_text, answer = generate_assessment(assignment_query, assignment_data, retriever_type)

                # Display results
                st.subheader("Generated Assignment")
                st.write(answer)

                st.sidebar.subheader("Referenced Documents")
                for doc in relevant_text:
                    st.sidebar.write(f"- {doc.metadata.get('source', 'Unknown Source')}: Page {doc.metadata.get('page', 'Unknown')}")

if __name__ == "__main__":
    main()
