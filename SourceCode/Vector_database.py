import os
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
from dotenv import load_dotenv
from Data_processing import process_pdf_v4,process_pdf_v3,semantic_chunking_process,recursive_chunking_process
load_dotenv()
os.getenv("GOOGLE_API_KEY")

""" Explore embeddign """
embeddings = GoogleGenerativeAIEmbeddings(model = "models/text-embedding-004")


def get_vector_store(course_name):
    collection_name = course_name
    vector_store = Chroma( collection_name=collection_name,
                          embedding_function=embeddings, 
                          persist_directory="../database",
                          create_collection_if_not_exists=True
                            )
    return vector_store

def add_documents_to_vector_store(data, course_name):
    vector_store = get_vector_store(course_name)
    vector_store.add_documents(documents=data)


# course_name = "Artifical_Intelligence"
# pdf_files = [os.path.join("Data", file) for file in os.listdir("..\Data") if file.endswith('.pdf')]
# # data = process_pdf_v4(pdf_files)
# print('pdf_files',pdf_files)
# data  = process_pdf_v3(pdf_files)


# vs = get_vector_store(data, course_name)
# print('vs', vs)
# Exported functions
def save_embeddings_for_all_variations(pdf_docs, base_course_name):
    """
    Save embeddings for all variations (recursive and semantic chunking) in separate Chroma collections.
    
    Args:
        pdf_docs (list): List of file paths to the PDF documents.
        base_course_name (str): Base name of the course (e.g., "Artificial_Intelligence").
    """
    # Process semantic chunking and save embeddings in Chroma
    semantic_chunks = semantic_chunking_process(pdf_docs)
    add_documents_to_vector_store(semantic_chunks, f"{base_course_name}_semantic_chunks")

    # Process recursive chunking and save embeddings for each variation in Chroma
    recursive_chunks_with_metadata = recursive_chunking_process(pdf_docs)
    # variation_count = 2  # You can adjust this number if you have more variations
    for variation_key, chunks in recursive_chunks_with_metadata.items():
        # Use variation_key to create a unique collection name
        collection_name = f"{base_course_name}_recursive_{variation_key}"
        add_documents_to_vector_store(chunks, collection_name)
        # variation_count += 1

# # Example usage:
# pdf_docs = [os.path.join("Data", file) for file in os.listdir("..\Data") if file.endswith('.pdf')]
# base_course_name = "Artificial_Intelligence"
# save_embeddings_for_all_variations(pdf_docs, base_course_name)


__all__ = [
    "get_vector_store",
    "add_documents_to_vector_store",
]