from datasets import Dataset
from dotenv import load_dotenv
from ragas import evaluate
import os 
from VTA_rag import generate_answer



load_dotenv()
os.getenv("OPENAI_API_KEY")
os.getenv("GOOGLE_API_KEY")

retriever_type = "Basic Simliarity Search"

questions = ["What nodes does DFS expand?",
             "What is the summary of lecture 1 of AI?"]
ground_truths = [["Depth-First Search (DFS) expands nodes by exploring some leftmost prefix of the search tree. It proceeds by going deep along each branch of the tree before backtracking. This means that it could potentially process the entire tree if necessary. DFS continues expanding deeper nodes until it either finds a solution or reaches a dead end, then it backtracks to explore other branches.In terms of space complexity, DFS only needs to store the siblings along the current path from the root to the deepest node, making it efficient in terms of memory usage​"],
                ["In the first lecture of the Artificial Intelligence course, held on September 10th, 2024, the key focus was on introducing the foundational concepts of AI. The lecture began by defining AI as the capability of machines to perform tasks that typically require human intelligence, such as learning, reasoning, and problem-solving. It highlighted how AI systems learn from their environment and make decisions to maximize their chances of success. A comparison between Artificial Intelligence (AI) and Human Intelligence (HI) was also discussed, emphasizing that AI is more suited for repetitive, data-driven tasks, while human intelligence is better for handling creative, emotional, and complex problems. The lecture further explored various application areas of AI, including music generation, business automation, avatar creation, branding, sales, marketing, image editing, and productivity tools. Additionally, tools that assist with chatbot development, coding, website building, video generation, and search engine optimization (SEO) were introduced, showcasing how AI is transforming industries and enhancing productivity across multiple domains. This comprehensive introduction set the stage for deeper exploration of AI's capabilities in future lectures"]]

# Simulate an empty list to hold answers and contexts
answers = []
context = []
references = []

# Simulate response
for query in questions:
    cxt, response = generate_answer(query,retriever_type)
    answers.append(response)
    context.append([doc.page_content for doc in cxt])
    references.append(ground_truths[questions.index(query)][0])


# Convert to dictionary format for creating the dataset
data = {
    "question": questions,
    "answer": answers,  # Ensure answers are strings
    "contexts": context,
    "ground_truths": ground_truths,
    "reference": references
}


# Convert the dictionary into a Dataset object
dataset = Dataset.from_dict(data)

from ragas.metrics import (
    answer_relevancy,
    faithfulness,
    context_recall,
    context_precision,
    answer_correctness,
    answer_similarity
)

result = evaluate(
    dataset = dataset,
    metrics=[
        context_precision,
        context_recall,
        faithfulness,
        answer_relevancy,
        answer_correctness,
        answer_similarity
    ],
)

df = result.to_pandas()

df.to_csv("evaluation_result.csv", index=False)



