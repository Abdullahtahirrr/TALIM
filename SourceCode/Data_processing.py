import os
import time 
from PyPDF2 import PdfReader
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.document_loaders import PyPDFium2Loader
from langchain_text_splitters import RecursiveCharacterTextSplitter

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
    with open("output_pymupdf_chunk.txt", "a", encoding='utf-8') as file:  
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


pdf_files = [os.path.join("Data", file) for file in os.listdir("../Data") if file.endswith('.pdf')]


