
from Retrieval import generate_answer, get_relevant_docs_basic
from Vector_database import get_vector_store, add_documents_to_vector_store
from QueryAnalyser import analyze_query

# Example usage:
if __name__ == "__main__":
    # Get user query
    user_query = input("Enter your query: ")
    query_filter = analyze_query(user_query)
    if(query_filter == "Valid"):
        # Use Basic RAG for retrieval
        retriever_type = "Basic Simliarity Search"
        relevant_docs = get_relevant_docs_basic(user_query)
        

        # Generate the final answer
        relevant_text, answer = generate_answer(user_query, retriever_type)

        # Output results
        print("\nRelevant Documents:")
        for doc in relevant_text:
            print(doc.page_content)
        print("\nGenerated Answer:")
        print(answer)
    else: 
        print(query_filter)
