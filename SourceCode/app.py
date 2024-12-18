from Retrieval import generate_answer, get_relevant_docs_basic
from Vector_database import get_vector_store, add_documents_to_vector_store
from QueryAnalyser import analyze_query
import logging
logging.basicConfig(level=logging.DEBUG)
user_role="Student"
# Example usage:
if __name__ == "__main__":
    # Get user query
    if user_role == "Student":
        user_query = input("Enter your query: ")
        query_filter = analyze_query(user_query)
        vc= get_vector_store("Artificial_Intelligence")
        vector_db_size = len(vc.get()['documents'])
        print('vector_db_size',vector_db_size)
        if(query_filter == "Valid"):
            # Use Basic RAG for retrieval
            retriever_type = "MultiQuery Retriever"
            # relevant_docs = get_relevant_docs_basic(user_query)
            print("hello I am before retriver")

            # Generate the final answer
            relevant_text, answer = generate_answer(user_query, retriever_type)
            print("I got the relevenay docs back in main")
            # Output resultsh
            print("\nRelevant Documents:")
            for doc in relevant_text:
                print(doc.page_content)
            print("\nGenerated Answer:")
            print(answer)
        else: 
            print(query_filter)
    elif (user_role == "Instructor"):
        pass
