from langchain.prompts import PromptTemplate
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os 
load_dotenv()
os.getenv("GOOGLE_API_KEY")

course_name = "Artifical_Intelligence"


llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.1,
    max_tokens=None,
    timeout=None,
    max_retries=5,)

def analyze_query_for_context(query: str):

    """
    Analyzes the user's query to determine if it requires image/graph context.
    Returns "yes" or "no" based on the analysis.
    """


    # Define the system instruction
    system_message = SystemMessage(content="""
    You are an expert query analyzer for a Retrieval-Augmented Generation (RAG) system.
    Your task is to determine whether a user's query states direct usage of visual context such as images, graphs, or diagrams
    to answer. You should only return "yes" or "no" based on whether the query requires such context. If the query is asking to explain a slide or page, that is a no. 
    Moreover if the user query states to generate quiz or assignment, That is a yes as well. One last thing,if it is a invalid or random text, that is a yes as well.
                                   
    You can only respond with one word "yes" or "no".
                                   
    """)
    
    # Define examples to guide the model
    examples = [
        {
            "query": "What does the graph represent?",
            "response": "yes"
        },
        {
            "query": "explain slide 3",
            "response": "no"
        },
        {
            "query": "explain page 3",
            "response": "no"
        },
        {
            "query": "Explain the relationship between artificial intelligence and machine learning.",
            "response": "no"
        },
        {
            "query": "Describe the image.",
            "response": "yes"
        },
        {
            "query": "explain the example in the the second slide.",
            "response": "no"
        },
        {
            "query": "explain the example teacher explained in the lecture.",
            "response": "no"
        },
        {
            "query": "What is meant by supervised learning?",
            "response": "no"
        },
        {
            "query": "Make me quiz of the topic: AI?",
            "response": "yes"
        },
         {
            "query": "Generate quiz of the topic: AI?",
            "response": "yes"
        },
         {
            "query": "Generate me a assignment to practice on topic \"Naive Bayes\"? ",
            "response": "yes"
        },


    ]

    # Build the prompt
    examples_prompt = "\n".join(
        [f"User Query: {ex['query']}\nAnswer: {ex['response']}" for ex in examples]
    )
    user_message = f"User Query: {query}\nAnswer:"

    prompt = f"""
    {system_message.content}

    Examples:
    {examples_prompt}

    Now analyze the following query and provide an answer:
    {user_message}
    """

    # Call the LLM and return the result
    response = llm.invoke(prompt)
    return response.content 

def analyze_query(query: str):
    """
    Main function to analyze the query and take appropriate action.
    """
    # Step 1: Analyze the query
    image_context_required = analyze_query_for_context(query)
    print("hello, I am query analyzer")
    # Step 2: Handle based on the response
    if image_context_required == "yes\n":
        return "Sorry, This query cannot be processed as it is beyond my scope. Try me with a different question :) ."
    elif image_context_required == "no\n":
        # Respond to the user politely
        return "Valid"
    # else:
    #     return "Error: Could not analyze the query properly."



