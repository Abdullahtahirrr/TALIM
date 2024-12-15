import os
from json import dumps, loads
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.retrievers.multi_query import MultiQueryRetriever
from dotenv import load_dotenv
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
import pandas as pd
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from QueryAnalyser import generate_prompt
from Vector_database import get_vector_store


load_dotenv()
os.getenv("GOOGLE_API_KEY")
course_name = "Artifical_Intelligence"


llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.1,
    max_tokens=None,
    timeout=None,
    max_retries=5,)


def generate_subquestions(question: str):
   
    # Define the system message for task instructions
    system_message = SystemMessage(content="""
    You are an expert in talent acquisition. Separate this job description into 3-4 more focused aspects for efficient resume retrieval. 
    Make sure every single relevant aspect of the query is covered in at least one query. You may choose to remove irrelevant information 
    that doesn't contribute to finding resumes such as the expected salary of the job, the ID of the job, the duration of the contract, etc.
    Only use the information provided in the initial query. Do not make up any requirements of your own. 
    Put each result in one line, separated by a linebreak.
    """)

    # Provide an example for the model
    oneshot_example = HumanMessage(content="""
      Generate 3 to 4 sub-queries based on this initial job description:

      Wordpress Developer
      We are looking to hire a skilled WordPress Developer to design and implement attractive and functional websites and Portals for our Business and Clients. You will be responsible for both back-end and front-end development including the implementation of WordPress themes and plugins as well as site integration and security updates.
      To ensure success as a WordPress Developer, you should have in-depth knowledge of front-end programming languages, a good eye for aesthetics, and strong content management skills. Ultimately, a top-class WordPress Developer can create attractive, user-friendly websites that perfectly meet the design and functionality specifications of the client.
      WordPress Developer Responsibilities:
      Meeting with clients to discuss website design and function.
      Designing and building the website front-end.
      Creating the website architecture.
      Designing and managing the website back-end including database and server integration.
      Generating WordPress themes and plugins.
      Conducting website performance tests.
      Troubleshooting content issues.
      Conducting WordPress training with the client.
      Monitoring the performance of the live website.
      WordPress Developer Requirements:
      Bachelors degree in Computer Science or a similar field.
      Proven work experience as a WordPress Developer.
      Knowledge of front-end technologies including CSS3, JavaScript, HTML5, and jQuery.
      Knowledge of code versioning tools including Git, Mercurial, and SVN.
      Experience working with debugging tools such as Chrome Inspector and Firebug.
      Good understanding of website architecture and aesthetics.
      Ability to project manage.
      Good communication skills.
      Contract length: 12 months
      Expected Start Date: 9/11/2020
      Job Types: Full-time, Contract
      Salary: 12,004.00 - 38,614.00 per month
      Schedule:
      Flexible shift
      Experience:
      Wordpress: 3 years (Required)
      web designing: 2 years (Required)
      total work: 3 years (Required)
      Education:
      Bachelor's (Preferred)
      Work Remotely:
      Yes
    """)
    oneshot_response = AIMessage(content="""
    1. WordPress Developer Skills:
       - WordPress, front-end technologies (CSS3, JavaScript, HTML5, jQuery), debugging tools (Chrome Inspector, Firebug), code versioning tools (Git, Mercurial, SVN).
       - Required experience: 3 years in WordPress, 2 years in web designing.

    2. WordPress Developer Responsibilities:
       - Meeting with clients for website design discussions.
       - Designing website front-end and architecture.
       - Managing website back-end including database and server integration.
       - Generating WordPress themes and plugins.
       - Conducting website performance tests and troubleshooting content issues.
       - Conducting WordPress training with clients and monitoring live website performance.

    3. WordPress Developer Other Requirements:
       - Education requirement: Bachelor's degree in Computer Science or similar field.
       - Proven work experience as a WordPress Developer.
       - Good understanding of website architecture and aesthetics.
       - Ability to project manage and strong communication skills.

    4. Skills and Qualifications:
       - Degree in Computer Science or related field.
       - Proven experience in WordPress development.
       - Proficiency in front-end technologies and debugging tools.
       - Familiarity with code versioning tools.
       - Strong communication and project management abilities.
    """)

    # User message with the job description
    user_message = HumanMessage(content=f"""
    Generate 3 to 4 sub-queries based on this initial job description: 
    {question}
    """)


    response = llm.invoke([system_message, oneshot_example, oneshot_response, user_message])

    subquestions = response.content.split("\n")
    return subquestions

def get_subquestion_docs(subquestions):
    relevant_docs = []
    for subquestion in subquestions:
        relevant_docs.append(get_relevant_docs_basic(subquestion))
    return relevant_docs


def reciprocal_rank_fusion(results, k=60):
    fused_scores = {}
    for docs in results:
        for rank, doc in enumerate(docs):
            doc_dict = {
                "page_content": doc.page_content,
                "metadata": doc.metadata,
            }
            doc_str = dumps(doc_dict)  
            if doc_str not in fused_scores:
                fused_scores[doc_str] = 0
            fused_scores[doc_str] += 1 / (rank + k)
    
    # Rerank documents based on their scores
    reranked_results = [
        (loads(doc),score, f"This value {score} refers to the document's relevance based on its rank across multiple subqueries.")
        for doc, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return reranked_results


def get_relevant_docs_RAGFusion(user_query):
    subquestions = generate_subquestions(user_query)
    print(subquestions)
    relevant_docs = get_subquestion_docs(subquestions)
    print(relevant_docs)
    results = reciprocal_rank_fusion(relevant_docs)
    print(results)
    return results



def get_relevant_docs_basic(user_query):
    vectordb = get_vector_store(course_name)
    retriever = vectordb.as_retriever(score_threshold=0.5)
    relevant_docs = retriever.invoke(user_query)
    return relevant_docs



def get_relevant_docs_with_multi_query(user_query):
    vectordb = get_vector_store(course_name)
    retriever = MultiQueryRetriever.from_llm(retriever=vectordb.as_retriever(score_threshold=0.5), llm=llm)
    relevant_docs = retriever.invoke(user_query)
    return relevant_docs

def get_relevant_docs_with_ensemble(user_query):
    vectordb = get_vector_store(course_name)
    multi_query_retriever = MultiQueryRetriever.from_llm(retriever=vectordb.as_retriever(score_threshold=0.5), llm=llm)
    cosine_retriever = vectordb.as_retriever(score_threshold=0.5)
    # bm25_retriever = BM25Retriever.from_documents(
    #     data, 
    #     k=5
    # )
    ensemble_retriever = EnsembleRetriever(retrievers=[cosine_retriever, multi_query_retriever], weights=[0.5, 0.5])
    relevant_docs = ensemble_retriever.invoke(user_query)
    return relevant_docs



def generate_response(user_prompt):
    answer = llm.invoke(user_prompt)
    return answer.content

def get_relevant_docs_by_selection(retriever_type, user_query):
    if retriever_type == "Basic Simliarity Search":
        return get_relevant_docs_basic(user_query)
    elif retriever_type == "MultiQuery Retriever":
        return get_relevant_docs_with_multi_query(user_query)
    elif retriever_type == "Ensemble Retriever":
        return get_relevant_docs_with_ensemble(user_query)
    elif retriever_type == "RAG Fusion":
        return get_relevant_docs_RAGFusion(user_query)
    else:
        return get_relevant_docs_basic(user_query)
    

def generate_answer(query, retriever_type):
    load_dotenv()
    relevant_text = get_relevant_docs_by_selection(retriever_type, query)
    # text = " \n".join([doc.page_content for doc in relevant_text])
    prompt = generate_prompt(query, relevant_passage=relevant_text)
    # print(prompt)
    answer = generate_response(prompt)
    return relevant_text, answer