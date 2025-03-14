import os
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
from dotenv import load_dotenv
from Data_processing import process_pdf_v4,process_pdf_v3,semantic_chunking_process,recursive_chunking_process
load_dotenv()
os.getenv("GOOGLE_API_KEY")
# Get the absolute path to your existing database
SOURCE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(SOURCE_DIR)
DB_PATH = os.path.join(PARENT_DIR, "database")

""" Explore embeddign """
embeddings = GoogleGenerativeAIEmbeddings(model = "models/text-embedding-004")
course_name = "Artificial_Intelligence"

def get_vector_store(course_name):
    collection_name = course_name
    vector_store = Chroma(collection_name=collection_name,
                          embedding_function=embeddings, 
                          persist_directory=DB_PATH,
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
def save_embeddings(pdf_docs, base_course_name):
    """
    Save embeddings for all variations (recursive and semantic chunking) in separate Chroma collections.
    
    Args:
        pdf_docs (list): List of file paths to the PDF documents.
        base_course_name (str): Base name of the course (e.g., "Artificial_Intelligence").
    """
    course_name = "Artificial_Intelligence"
    # Process semantic chunking and save embeddings in Chroma
    semantic_chunks = semantic_chunking_process(pdf_docs)
    add_documents_to_vector_store(semantic_chunks, course_name)


# # # Example usage:
# pdf_docs = [os.path.join("Data", file) for file in os.listdir("Data") if file.endswith('.pdf')]
# base_course_name = "Artificial_Intelligence"
# save_embeddings_for_all_variations(pdf_docs, base_course_name)
# #     add_documents_to_vector_store(semantic_chunks, f"{base_course_name}_semantic_chunks")



__all__ = [
    "get_vector_store",
    "add_documents_to_vector_store",
]