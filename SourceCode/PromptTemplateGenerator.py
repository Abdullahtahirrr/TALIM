
#  prompt = (
#       """ You are a helpful expert of {course_name}
#           You will be shown the user's question, and the relevant information contained in either notes and lectures.
#           Answer the user's question using only this relevant information . Try to build a good answer uing this information.
#           Give Precise answer according to User's Instruction, like if user wants explaination then provide explaination.
#           If User want an answer in one or two lines then give answer accordingly.
#           QUESTION: '{query}'\n"
#           REFERENCE : '{relevant_passage}"""
#     )

import re

def extract_intent(query):
    keywords_to_intents = {
        "summarize": ["summarize", "overview", "summary", "keypoints"],
        "example": ["example", "illustrate", "demonstrate"],
        "explain": ["explain", "describe", "elaborate", "detail", "what is", "how does"]
    }

    print("hello, I am query analyzer",query)

    # Convert the query to lowercase and split into words
    query_words = query.lower().split()

    for intent, keywords in keywords_to_intents.items():
        for keyword in keywords:
            # Check if the keyword is in any of the query words
            if any(keyword in word for word in query_words):
                return intent

    return "general"  # Default intent



def generate_prompt_student(query,formatted_history, course_name, relevant_passage):
    """
    Generates a tailored prompt for student queries based on the detected intent.
    Each intent has its own specific initial prompt, one-shot example, and chain-of-thought reasoning.
    """
    # Extract intent from the query
    intent = extract_intent(query)
    print('intent',intent)

    if intent == "explain" :
        # Initial Prompt for "Explain"
        initial_prompt = f"""
        You are an expert tutor for the course '{course_name}'.
        Your job is to explain concepts in a clear and detailed manner, ensuring the student understands the topic.
        Use the provided relevant passage to craft your explanation. If additional context is needed and not present in the passage, you can use your own knowledge but mention this to the student.
        - Do not start with "In the provided notes" or "According to the lecture" or "According to the provided" or related way, you can use the reference in between the answer.
        - If you feel the query might lead to follow-up questions asked by the student from the REFERENCE only add a sentence involving any topic/followup, 'Do you need more information ? I am here to help, feel free to ask again. ( This is optional)'
        
        """

        # One-shot Example for "Explain"
        oneshot_example = """
        User Query: "Explain how neural networks are modeled after the human brain."
        Answer: "Neural networks mimic the structure of the human brain. They consist of artificial neurons connected by synapses. Each neuron processes inputs, applies an activation function, and produces outputs. This allows networks to learn and solve complex tasks like image recognition."
        """

        # Chain of Thought for "Explain"
        chain_of_thought = """
        - Identify the key concept(s) from the query.
        - Break the concept into smaller, logical components.
        - Try to use and related the relevant passage to the explanation.
        - Use examples from relevant passage if mentioned else make one to clarify the explanation.
        - Ensure the explanation is detailed yet easy to understand.
        """

    elif intent == "summarize":
        # Initial Prompt for "Summarize"
        initial_prompt = f"""
        You are a summarization expert for the course '{course_name}'.
        Your task is to condense the relevant passage into its key points while maintaining accuracy.
        Ensure the summary is concise and easy to understand, highlighting the main ideas.
        """

        # One-shot Example for "Summarize"
        oneshot_example = """
        User Query: "Summarize the key points of supervised learning topic starting page 8."
        Answer: "The summary for supervised learning starting from page 8 is as below \n Supervised learning is a machine learning approach where models are trained using labeled data to map inputs to outputs. It includes tasks like classification and regression, aiming to minimize errors through optimization. Common algorithms include Linear Regression, SVMs, and Neural Networks. Applications range from spam detection to medical diagnosis. However, it requires large labeled datasets and can face challenges like overfitting."
        """

        # Chain of Thought for "Summarize"
        chain_of_thought = """
        - Read the relevant passage thoroughly.
        - Identify the main ideas or key points.
        - Remove minor or irrelevant details.
        - Condense the information into a concise summary around 10 to 20 percent of the original length.
        """

    elif intent == "example":
        # Initial Prompt for "Example"
        initial_prompt = f"""
        You are an expert assistant for the course '{course_name}'.
        Your role is to provide relevant examples to clarify concepts based on the provided passage.
        If no examples are available in the passage, create one based on your knowledge and try to link it to the reference text.
        """

        # One-shot Example for "Example"
        oneshot_example = """
        User Query: "Provide an example of overfitting in machine learning."
        Answer: "Overfitting happens when a model performs excellently on training data but poorly on test data. For instance, a model that memorizes training examples but fails to generalize is overfitting. A simple intuition is a student who memorizes practice questions but struggles with new exam questions.Example A real-world example of overfitting can be seen in credit scoring models used by banks.In this scenario, a machine learning model is trained to predict whether a loan applicant will default based on features like income, credit history, and loan amount. If the model is too complex, such as a deep neural network, it may learn to fit the training data perfectly, including irrelevant details or noise. This results in high accuracy on the training set but poor performance on new, unseen data (test set), as the model fails to generalize."
        """

        # Chain of Thought for "Example"
        chain_of_thought = """
        - Look for examples in the relevant passage.
        - If none are found, create a plausible example based on your knowledge.
        - Ensure the example aligns with the query and effectively clarifies the concept.
        """

    else:  # General intent
        # Initial Prompt for "General"
        initial_prompt = f"""
        You are a knowledgeable assistant for the course '{course_name}'.
        Your task is to provide accurate and comprehensive answers to students' queries.
        
        Use the relevant passage for context. If no relevant information is available, respond based on your general knowledge but mention this to the student.
        - Do not start with "In the provided notes" or "According to the lecture" or related way, you can use the reference in between the answer.
         - If you feel the query might lead to follow-up questions asked by the student from the REFERENCE only add a sentence involving any topic/followup, 'Do you need more information ? I am here to help, feel free to ask again. ( This is optional)'
        """

        # One-shot Example for "General"
        oneshot_example = """
        User Query: "What is artificial intelligence?"
        Answer: "Artificial intelligence refers to the simulation of human intelligence in machines, enabling them to perform tasks like decision-making, problem-solving, and natural language processing. Would you like me to tell you how NLP is involved in AI mentioned in your notes/slides"
        """

        # Chain of Thought for "General"
        chain_of_thought = """
        - Analyze the query to understand its requirements.
        - Try to always use the relevant passage ( reference ) or your own knowledge to provide an accurate response.
        - Ensure the response is comprehensive and aligned with the course content.
        - If the query is vague, ask for clarification or provide a general overview.
        - If you feel the query might lead to follow-up questions asked by the student from the REFERENCE only add a sentence involving any topic/followup, 'Do you need more information ? I am here to help, feel free to ask again. ( This is optional with 50 percent chance)'
        """

    # Combine all components into the final prompt
    prompt = f"""
    {initial_prompt}
    
    One-shot Example:
    {oneshot_example}
    
    Chain of Thought:
    {chain_of_thought}
    
    QUESTION: '{query}'
    REFERENCE: '{relevant_passage}'
    Here is the history of the conversation till now:
        '{formatted_history}'
    """
    return prompt



def generate_prompt_teacher(course_name, intent, relevant_passage=None, **kwargs):
    """
    Generates a prompt for teacher tasks like creating quizzes or assignments.
    Includes an initial prompt, one-shot example, and chain-of-thought guidance.
    """
    # Define templates for teacher tasks
    teacher_templates = {
        "quiz": """
        You are a quiz creation assistant for {course_name}.
        Create a quiz based on the following parameters:
        - Number of questions: {num_questions}
        - Question type(s): {question_types}
        - Difficulty level: {difficulty_level}
        - Topic(s): {topics}
        REFERENCE: '{relevant_passage}'
        """,
        "assignment": """
        You are an assignment creation assistant for {course_name}.
        Design an assignment based on the following details:
        - Number of tasks: {num_tasks}
        - Type: {assignment_type}
        - Grading criteria: {grading_criteria}
        - Topic(s): {topics}
        REFERENCE: '{relevant_passage}'
        """
    }

    # Define chain-of-thought guidance
    chain_of_thought_teacher = {
        "quiz": "Identify key concepts from the topic and structure questions around them. Ensure a mix of question types to test understanding comprehensively.",
        "assignment": "Design tasks that progressively challenge the student. Include clear instructions and ensure alignment with the grading criteria."
    }

    # Define one-shot examples
    oneshot_examples_teacher = {
        "quiz": """
        Parameters:
        - Number of questions: 5
        - Question type(s): Multiple Choice, Short Answer
        - Difficulty level: Moderate
        - Topic(s): Neural Networks

        Quiz:
        1. What is the purpose of an activation function in a neural network?
        2. Explain the concept of forward propagation.
        3. What is a common use case for recurrent neural networks?
        """,
        "assignment": """
        Parameters:
        - Number of tasks: 3
        - Type: Practical
        - Grading criteria: 50% implementation, 30% results, 20% report
        - Topic(s): Naive Bayes Classifier

        Assignment:
        Task 1: Implement a Naive Bayes classifier for sentiment analysis.
        Task 2: Test the classifier on a given dataset and report the accuracy.
        Task 3: Write a report explaining the implementation and results.
        """
    }

    # Generate the final prompt
    intent_template = teacher_templates.get(intent, "")
    prompt = f"""
    {intent_template.format(course_name=course_name, relevant_passage=relevant_passage, **kwargs)}
    
    One-shot Example:
    {oneshot_examples_teacher[intent]}
    
    Chain of Thought:
    {chain_of_thought_teacher[intent]}
    """
    return prompt

# query = "Explain how overfitting affects machine learning models."
# course_name = "Artificial Intelligence"
# relevant_passage = "Overfitting occurs when a model performs well on training data but poorly on test data."
# prompt_student = generate_prompt_student(query, course_name, relevant_passage)
# print(prompt_student)

# course_name = "Artificial Intelligence"
# intent = "quiz"
# kwargs = {
#     "num_questions": 5,
#     "question_types": "Multiple Choice, Short Answer",
#     "difficulty_level": "Moderate",
#     "topics": "Neural Networks",
#     "relevant_passage": "Content on Neural Networks from lecture notes."
# }
# prompt_teacher = generate_prompt_teacher(course_name, intent, **kwargs)
# print(prompt_teacher)
