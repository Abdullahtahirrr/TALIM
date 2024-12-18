from Vector_database import get_vector_store
# Check if Chroma is saving the embeddings correctly
base_course_name = "Artificial_Intelligence"

vector_store = get_vector_store(f"{base_course_name}_semantic_chunks")
print(f"Chroma vector store for semantic chunks: {vector_store}")

print("Hello World")