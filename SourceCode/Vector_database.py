import os
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4
from dotenv import load_dotenv
from Data_processing import process_pdf_v4
load_dotenv()
os.getenv("GOOGLE_API_KEY")

embeddings = GoogleGenerativeAIEmbeddings(model = "models/embedding-001")


def get_vector_store(course_name):
    collection_name = course_name
    vector_store = Chroma( collection_name=collection_name,
                          embedding_function=embeddings, 
                          persist_directory="database",
                          create_collection_if_not_exists=True
                            )
    return vector_store

def add_documents_to_vector_store(data):
    vector_store = get_vector_store(course_name)
    vector_store.add_documents(documents=data)


course_name = "Artifical_Intelligence"
pdf_files = [os.path.join("Data", file) for file in os.listdir("Data") if file.endswith('.pdf')]
data = process_pdf_v4(pdf_files)


get_vector_store(data, course_name)
