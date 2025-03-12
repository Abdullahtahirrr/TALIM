from datasets import Dataset
from dotenv import load_dotenv
from ragas import evaluate
import os 
from Retrieval import generate_answer, generate_assessment



load_dotenv()
os.getenv("OPENAI_API_KEY")
os.getenv("GOOGLE_API_KEY")

retriever_type = "MultiQuery Retriever"

questions = ["What nodes does DFS expand?",
             "What is Beam Search and why is it used?",
            "How does Beam Search compare to A* in large search spaces?",
            "What is Simulated Annealing and how does it work?",
            "How does Simulated Annealing differ from Hill Climbing?",
            "What are the main components of a Decision Network?",
            # "How is Maximum Expected Utility (MEU) calculated in a Decision Network?",
            # "What is Naive Bayes and how does it work?",
            # "How does the Perceptron algorithm update weights?" 
            ]
ground_truths = [
                ["Depth-First Search (DFS) expands nodes in a LIFO (Last-In-First-Out) order, meaning it explores the deepest unexplored node first before backtracking. It expands the child nodes of the most recently discovered node until it reaches a leaf node or a node with no unexplored children. DFS is often implemented using a stack data structure to keep track of the nodes to be explored."],
                ["Beam Search is a heuristic search algorithm that retains only the most promising β nodes at each step, rather than expanding all nodes like BFS or DFS. It is used to find optimal or near-optimal solutions while consuming significantly less memory, making it particularly useful in large search spaces, such as machine translation, job scheduling, and network optimization."],
                ["Beam Search differs from A* in that it reduces memory requirements by keeping only a limited number of the best candidate nodes at each level. In contrast, A* expands all possible paths, which can lead to excessive memory usage in large search spaces like the 48-tile puzzle. A* can run out of memory, whereas Beam Search with a reasonable beam width can solve a majority of problem instances efficiently."],
                ["Simulated Annealing (SA) is an optimization technique inspired by the physical process of annealing in solids. It starts with a high 'temperature' to explore a broad solution space and gradually decreases the temperature, accepting fewer bad moves over time. This helps avoid getting stuck in local optima, allowing the algorithm to converge toward a global optimal solution."],
                ["Unlike Hill Climbing, which only moves towards better solutions and gets stuck in local optima, Simulated Annealing (SA) sometimes accepts worse solutions based on a probability determined by the Boltzmann distribution. This allows SA to escape local optima and explore the solution space more effectively, making it a global optimization technique."],
                ["A Decision Network consists of three main components: (1) **Chance Nodes**, which represent random variables and behave like Bayes' nets, (2) **Action Nodes**, which represent decisions controlled by the agent, and (3) **Utility Nodes**, which compute the expected utility based on actions and chance nodes. The goal is to select the action that maximizes the expected utility (MEU)."],
#                 ["Maximum Expected Utility (MEU) is calculated by first computing the posterior probabilities of all chance nodes given the available evidence. Then, for each possible action, the expected utility is determined using the formula: \n\nEU(a|e) = Σ P(x1, ..., xn | e) U(a, x1, ..., xn) \n\nwhere each \(x_i\) represents a possible outcome of a chance node. The action yielding the highest expected utility is chosen as the optimal decision."],
#                 ["Naive Bayes is a probabilistic classification algorithm based on Bayes' Theorem. It assumes that features are conditionally independent given the class label. The probability of a class given a feature vector is computed as: \n\nP(Y | F1, ..., Fn) ∝ P(Y) * Π P(Fi | Y)\n\nThe model is trained using Maximum Likelihood Estimation (MLE) to learn conditional probabilities, which are then used to classify new data points based on their feature values."],
#                 ["The Perceptron algorithm updates weights using the following rule: If a misclassification occurs, the weight vector is updated as: \n\nw = w + y* f(x)\n\nwhere y* is the true class label (+1 or -1) and f(x) is the feature vector of the misclassified sample. This update increases weights in the direction of correct classification, pushing the decision boundary toward a better separation of the data."]
]


# Simulate an empty list to hold answers and contexts
answers = []
context = []
references = []

# Simulate response
for query in questions:
    history=[]
    cxt, response = generate_answer(query,history, retriever_type)
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

df.to_csv("evaluation_result_ver2.csv", index=False)



