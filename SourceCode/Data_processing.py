import os
import time 
from PyPDF2 import PdfReader
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.document_loaders import PyPDFium2Loader
from langchain_experimental.text_splitter import SemanticChunker
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.schema import Document



os.getenv("GOOGLE_API_KEY")


"""
Approach 1: Use PDF reader and ignore the images using PDFLoader
Approach 2 : Use such loaders that offer OCR capabilities
Approach 3: Use of Hybrid approach, where we extrct text using text extractions and use CLIP for embedding

"""

def process_pdfs_v1(pdf_docs):
    """Extracts text from PDF documents and writes to a text file with chunk of 2000"""
    data = []
    instructor_name = "Dr. Seemab Latif"
    
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        text = "".join([page.extract_text() for page in pdf_reader.pages])

       
        file_name = os.path.basename(pdf)  


      
        chunk_size = 2000
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            data.append({"file_name": file_name, "Instructor_name": instructor_name, "text": chunk})

    with open("output_pdfreader.txt", "w", encoding='utf-8') as file:  # 'w' to overwrite the file or 'a' to append
       file.write(str(data))


def process_pdf_v2():
    """ 
    returns document object
    with images bool set as False , meta data= {slide name, pageno, pagecontent={only text,no images}}
    with image bool set as True, Value miss match error occurs
    """
    directory_path = ("Data")
    loader = PyPDFDirectoryLoader(path=directory_path,extract_images=True)
    docs = loader.load()
    with open("output.txt", "w", encoding='utf-8') as file:  # 'w' to overwrite the file or 'a' to append
       file.write(str(docs))

def process_pdf_v3(pdf_docs):
    start_time = time.time()
    """ Text spliter and Chunking overlap and size"""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size= 1000 ,chunk_overlap=100)
    """
    Problem is that it is computationally expensive and slow
    for 3 slides: in 564.89 seconds.
    for 3 slides with chunking: 528.98 seconds
    """
    with open("Loaders_result/output_pymupdf_chunk.txt", "w", encoding='utf-8') as file:  
        for pdf in pdf_docs:
            full_path = os.path.join(os.path.dirname(__file__), '..', pdf)
            full_path = os.path.abspath(full_path)
            print(f"Full path of {pdf}: {full_path}")

   

            loader = PyMuPDFLoader(file_path=full_path, extract_images=True)
            docs = loader.load_and_split(text_splitter=text_splitter)
            for doc in docs:
                doc.metadata["Instructor_name"] = "Dr. Seemab Latif"
            file.write(str(docs))  
            file.write("\n")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Processed {pdf} in {elapsed_time:.2f} seconds.")
    return docs
    

def process_pdf_v4(pdf_docs):
    start_time = time.time()

    """
    Problem is that it is compuatationally expensive and slow
    for 3 slides:in 638.71 seconds.
    """
    with open("output_pdfiumtry.txt", "a", encoding='utf-8') as file: 
        for pdf in pdf_docs:
            loader = PyPDFium2Loader(file_path=pdf, extract_images=True)
            docs = loader.load()
            file.write(str(docs)) 
            file.write("\n")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Processed {pdf} in {elapsed_time:.2f} seconds.")
    return docs

def semantic_chunking_process(pdf_docs):
    """
    Processes a list of PDFs using semantic chunking for meaningful splits.
    
    Args:
        pdf_docs (list): List of file paths to the PDF documents.
    
    Returns:
        list: A list of semantic chunks.
    """
    start_time = time.time()

    # Initialize SemanticChunker with an embeddings model
    embed_model = GoogleGenerativeAIEmbeddings(model = "models/text-embedding-004")
    semantic_chunker = SemanticChunker(
        embeddings=embed_model,
        breakpoint_threshold_type="percentile",
        min_chunk_size=300
    )
    semantic_chunks_with_metadata = []


    output_path = "SourceCode\Loaders_result\semantic_chunk_output_combinednext2.txt"
    with open(output_path, "w", encoding='utf-8') as file:
        # Iterate over each PDF in the input list
        for pdf in pdf_docs:
            full_path = os.path.join(os.path.dirname(__file__), '..', pdf)
            full_path = os.path.abspath(full_path)
            print(f"Processing file: {full_path}")

            # Ensure the file exists
            if not os.path.exists(full_path):
                print(f"File not found: {full_path}")
                continue

            # Load the PDF document
            loader = PyPDFium2Loader(file_path=full_path, extract_images=True)
            documents = loader.load()

            # Process the document for semantic chunks
            for doc in documents:
                # Use the loader's metadata
                doc_metadata = doc.metadata or {}
                semantic_chunks = semantic_chunker.create_documents([doc.page_content])
                for chunk_id, chunk in enumerate(semantic_chunks):
                    metadata = {
                        "Instructor" : 'Seemab Latif',
                        "Title": 'Artificial Intelligence',
                        "Course_category": 'Engineering',
        
                        **doc_metadata, 
                    }
                    chunk_data = Document(page_content=chunk.page_content, metadata=metadata)
                    semantic_chunks_with_metadata.append(chunk_data)
            
                    file.write(f"Metadata: {metadata}\n")
                    file.write(f"Content: {chunk.page_content}\n\n")

    end_time = time.time()
    print(f"Processed PDFs and created semantic chunks in {end_time - start_time:.2f} seconds.")
    print(f"Semantic chunks with metadata saved to {output_path}")

    return semantic_chunks_with_metadata


def recursive_chunking_process(pdf_docs):
    """
    Processes a list of PDFs using recursive chunking for meaningful splits with four variations of chunk sizes and overlap.
    
    Args:
        pdf_docs (list): List of file paths to the PDF documents.
    
    Returns:
        dict: A dictionary with variations as keys and their corresponding chunk data as values.
    """
    start_time = time.time()

    # Define variations of RecursiveCharacterTextSplitter configurations
    chunking_variations = [
        {"chunk_size": 500, "chunk_overlap": 100, "output_file": "Loaders_result/recursive_chunk_500_100.txt"},
        {"chunk_size": 500, "chunk_overlap": 0, "output_file": "Loaders_result/recursive_chunk_500_0.txt"},
        {"chunk_size": 1000, "chunk_overlap": 100, "output_file": "Loaders_result/recursive_chunk_1000_100.txt"},
        {"chunk_size": 1000, "chunk_overlap": 0, "output_file": "Loaders_result/recursive_chunk_1000_0.txt"}
    ]
    
    # Dictionary to hold results for each variation
    all_variations_results = {}

    # Iterate over each variation
    for variation in chunking_variations:
        chunk_size = variation["chunk_size"]
        chunk_overlap = variation["chunk_overlap"]
        output_path = variation["output_file"]

        # Initialize the RecursiveCharacterTextSplitter for the current variation
        recursive_data_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            is_separator_regex=False
        )

        # List to store chunks with metadata for the current variation
        recursive_chunks_with_metadata = []

        # Open the output file for writing the results of the current variation
        with open(output_path, "w", encoding='utf-8') as file:
            # Iterate over each PDF in the input list
            for pdf in pdf_docs:
                full_path = os.path.join(os.path.dirname(__file__), '..', pdf)
                full_path = os.path.abspath(full_path)
                print(f"Processing file: {full_path}")

                # Ensure the file exists
                if not os.path.exists(full_path):
                    print(f"File not found: {full_path}")
                    continue

                # Load the PDF document
                loader = PyPDFium2Loader(file_path=full_path, extract_images=True)
                documents = loader.load()

                # Process the document for chunks
                for doc in documents:
                    # Use the loader's metadata
                    doc_metadata = doc.metadata or {}
                    recursive_chunks = recursive_data_splitter.create_documents([doc.page_content])
                    for chunk_id, chunk in enumerate(recursive_chunks):
                        # Create a Document-like object (or modify as needed)
                        metadata = {
                            "Instructor": 'Seemab Latif',
                            **doc_metadata,
                        }
                        chunk_data = Document(page_content=chunk.page_content, metadata=metadata)
                        recursive_chunks_with_metadata.append(chunk_data)
        
                    # for chunk_id, chunk in enumerate(recursive_chunks):
                    #     # Combine metadata from the loader with chunk-specific data
                       
                    #     # Append chunk and metadata to the results
                    #     recursive_chunks_with_metadata.append({
                    #         "metadata": metadata,
                    #         "content": chunk.page_content
                    #     })
                        # Write metadata and chunk content to the output file
                        file.write(f"Metadata: {metadata}\n")
                        file.write(f"Content: {chunk.page_content}\n\n")

        # Store the results for the current variation
        all_variations_results[f"{chunk_size}_{chunk_overlap}"] = recursive_chunks_with_metadata
        print(f"Processed PDFs and created recursive chunks version in {time.time() - start_time:.2f} seconds.")


    end_time = time.time()
    print(f"Processed PDFs and created recursive chunks in {end_time - start_time:.2f} seconds.")

    # Return the results of all variations
    return all_variations_results


# pdf_files = [os.path.join("Data", file) for file in os.listdir("..\Data") if file.endswith('.pdf')]

# course_name = "Artifical_Intelligence"
# # pdf_files = [os.path.join("Data", file) for file in os.listdir("..\Data") if file.endswith('.pdf')]
# data = recursive_chunking_process(pdf_files)
# print('pdf_files',pdf_files)
