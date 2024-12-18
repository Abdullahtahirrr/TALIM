import os
from json import dumps, loads
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.retrievers.multi_query import MultiQueryRetriever
from dotenv import load_dotenv
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
import pandas as pd
from langchain.chains import HypotheticalDocumentEmbedder, LLMChain
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from QueryAnalyser import generate_prompt
from Vector_database import get_vector_store
from langchain.chains.query_constructor.schema import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.prompts.chat import SystemMessagePromptTemplate, ChatPromptTemplate

"""
Other techniques :
Self Query : use of meta data 
Hyde document embedding: get hypotheical answer before searching
Parent Document: docs-> parent docs -> multiple child doc
Self RAG
X -> GraphRAG: Knowledge Bases

"""
load_dotenv()
os.getenv("GOOGLE_API_KEY")
# course_name = "Artificial_Intelligence_semantic_chunks"
# course_name = "Artificial_Intelligence_semantic_chunks"
# course_name = "Artificial_Intelligence_semantic_chunks"
# course_name = "Artificial_Intelligence_semantic_chunks"
# course_name = "Artificial_Intelligence_recursive_1000_0"
# course_name = "Artificial_Intelligence_recursive_1000_100"
# course_name = "Artificial_Intelligence_recursive_500_0"
course_name = "Artificial_Intelligence_recursive_500_100"


llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.1,
    max_tokens=None,
    timeout=None,
    max_retries=5,)


def generate_subquestions(question: str):
    """
    Generate 3-4 sub-questions based on an educational query.
    This function takes a complex query or question related to educational content 
    and breaks it down into more specific and manageable sub-questions.
    """

    # Define the system message for task instructions
    system_message = SystemMessage(content="""
    You are an educational assistant specializing in helping students understand complex topics.
    Break this question or query into 3-4 sub-questions that focus on specific aspects of the topic.
    Ensure every aspect of the query is covered in at least one sub-question. 
    Avoid adding unrelated sub-questions or making assumptions outside the context provided in the query.
    Put each result on a new line, separated by a linebreak.
    In case, subquestioning isnt possible, make similar or related versions of the query.                               
                                   
    """)

        # Provide an example for the model
    oneshot_example = HumanMessage(content="""
        Generate 3 to 4 sub-questions based on this initial educational query:

        "Explain the Beam Search algorithm in AI, focusing on its working mechanism, applications, and limitations."
    """)
    oneshot_response = AIMessage(content="""
        1. What is the working mechanism of the Beam Search algorithm?
        2. How does the Beam Search algorithm compare to A* and BFS in terms of memory efficiency and completeness?
        3. What are the key applications of Beam Search in AI, such as machine translation or job scheduling?
        4. What are the limitations of Beam Search, and how do heuristic accuracy and beam width impact its performance?
    """)

    # User message with the educational query
    user_message = HumanMessage(content=f"""
    Generate 3 to 4 sub-questions based on this initial query: 
    {question}
    """)

    # Get response from the language model
    response = llm.invoke([system_message, oneshot_example, oneshot_response, user_message])

    # Split the response into sub-questions
    subquestions = response.content.strip().split("\n")
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
 
def get_hypo_doc(query):
    template = """Imagine you are an subject expert on the topic: '{query}'
    Your response should be comprehensive and include all key points that would be found in the top search result."""

    system_message_prompt = SystemMessagePromptTemplate.from_template(template = template)
    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])
    messages = chat_prompt.format_prompt(query = query).to_messages()
    response =  llm.invoke(messages)
    hypo_doc = response.content
    return hypo_doc

def get_relevant_docs_Hyde(user_query):
    vectordb = get_vector_store(course_name)
    hypo_doc = get_hypo_doc(user_query)
    # normally in hyde we dont use the query again but i did add
    query = user_query + hypo_doc
    # here currenlty using basic similarity search , could use other too
    retriever = vectordb.as_retriever(score_threshold=0.5)
    relevant_docs = retriever.invoke(query)
    return relevant_docs

def get_relevant_docs_basic(user_query):
    vectordb = get_vector_store(course_name)
    print('vectordb=',vectordb)
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

def get_relevant_docs_with_self_query(user_query):
    vectordb = get_vector_store(course_name)
    metadata_field_info = [
    AttributeInfo(
        name="source",
        description="The source file from which the content is extracted, typically the name of the lecture note or slide deck.",
        type="string",
    ),
    AttributeInfo(
        name="file_path",
        description="The file path where the lecture material is stored.",
        type="string",
    ),
    AttributeInfo(
        name="page",
        description="The page number in the lecture material where the content is located.",
        type="integer",
    ),
    AttributeInfo(
        name="total_pages",
        description="The total number of pages in the lecture material.",
        type="integer",
    ),
    AttributeInfo(
        name="title",
        description="The title of the lecture or course, as extracted from the document metadata.",
        type="string",
    ),
    AttributeInfo(
        name="author",
        description="The author or lecturer associated with the lecture material.",
        type="string",
    )
]

    document_content_description = "Detailed content extracted from lecture notes or slides, including titles, topics, and key points discussed in the lecture."

    retriever = SelfQueryRetriever.from_llm(
                llm,
                vectordb,
                document_content_description,
                metadata_field_info,
            )
    relevant_docs = retriever.invoke(user_query)

           
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
    elif retriever_type == "Self Query":
        return get_relevant_docs_RAGFusion(user_query)
    else:
        return get_relevant_docs_basic(user_query)
    
'''
Hard coded arguments for generate prompt
'''
def generate_answer(query, retriever_type):
    # load_dotenv()
    relevant_text = get_relevant_docs_by_selection(retriever_type, query)
    # text = " \n".join([doc.page_content for doc in relevant_text])
    # user_role, intent, query, course_name, relevant_passage,
    print('rt=',relevant_text)
    prompt = generate_prompt('student', 'explain' ,query,'Artificial_Intelligence_semantic_chunks',relevant_passage=relevant_text)
    print('prompt=',prompt)
    answer = generate_response(prompt)
    return relevant_text, answer


# Exported functions
__all__ = [
    "generate_subquestions",
    "get_relevant_docs_basic",
    "generate_answer",
]
