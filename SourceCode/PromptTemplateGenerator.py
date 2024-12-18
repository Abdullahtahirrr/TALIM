
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
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

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



def generate_prompt_student(query, course_name, relevant_passage):
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
        - Do not start with "In the provided notes" or "According to the lecture" or related way, you can use the reference in between the answer.
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
    """
    return prompt





def generate_prompt_teacher(query, course_name, relevant_passage):
   
    # Extracting values from the query
    assessment_query = query["Assessment_type"].lower()
    lecture_name = query["lecture_name"]
    Key_Topics = query["KeyTopics"]
    num_mcqs = query["MCQS"]
    num_theoretical = query["Theortical"]
    num_numerical = query["Numerical"]
    difficulty = query["Difficulty"]
    num_versions = query["Version"]
    total_marks = query["Total_marks"]
    rubric = query["Rubric"]
    additional_requirements = query["Additional_requirements"]

    if assessment_query == "quiz":
            
            initial_prompt = f"""
            You are an assignment creation assistant for the course {course_name} on the topic of {lecture_name} with topics:{Key_Topics}.
            Please create an quiz based on the following details and maximum use the relevant passage from notes/slides for context and relevance:
            Please create a quiz based on the following details:
            - Number of MCQs: {num_mcqs}
            - Number of Theoretical Questions: {num_theoretical}
            - Number of Numerical Questions: {num_numerical}
            - Difficulty Level: {difficulty}
            - Number of Versions: {num_versions}
            - Total Marks: {total_marks}
            - Rubric: {rubric}
            - Additional Requirements: {additional_requirements}   
            - Reference: {relevant_passage}"""

            oneshot_example = f"""
            Prompt: Generate a quiz from {lecture_name} with the following details:
            Key Topics: Machine Learning Fundamentals and Advanced Techniques
            Additional Requirements: Quantitative and technical depth in assessmentDetailed Parameters:
            - Number of MCQs: 2 
            - Number of Theoretical Questions: 2
            - Number of Numerical Questions: 2
            - Difficulty Level: Medium
            - Number of Versions: 1
            - Total Marks: 35
            - Rubric: Detailed performance-based grading
            - Additional Requirements: Demonstrate deep understanding of ML techniques

            Comprehensive Quiz Example:
            MCQ Section - Quantitative Machine Learning Techniques (2 marks each):
            1. In gradient descent optimization, what does the learning rate of 0.01 specifically indicate?
            a) 1% step size in parameter adjustment
            b) 100% parameter update
            c) Constant step size regardless of gradient
            d) Random parameter perturbation
            Explanation: Quantify how 0.01 represents a 1% incremental adjustment in weight parameters during each iteration.

            2. For a neural network with 95% training accuracy but 65% validation accuracy, this most likely indicates:
            a) Perfect model performance
            b) Significant overfitting
            c) Underfitting
            d) Optimal model complexity
            Detailed Ratio Analysis: >30% performance gap suggests overfitting mechanism.

            Theoretical Questions - Deep Technical Analysis (5 marks each):
            3. Comparative Analysis of Regularization Techniques:
            - Mathematically compare L1 (Lasso) vs L2 (Ridge) regularization
            - Quantify sparsity inducement:
                * L1: Exact zero-weight elimination probability
                * L2: Weight reduction magnitude
            - Provide concrete example with numerical coefficients
            - Discuss computational complexity: O(n) vs O(n²) impact

            4. Advanced Ensemble Learning Techniques:
            - Detailed breakdown of ensemble methods:
                * Bagging: Bootstrapping variance reduction
                * Boosting: Sequential error correction
                * Stacking: Multi-layer predictive fusion
            - Quantify performance improvement:
                * Average accuracy gain
                * Variance reduction percentage
                * Computational overhead analysis
            - Provide mathematical formulation for each technique

            Numerical Questions - Computational Challenges (5 marks each):
            5. Precision Engineering Calculation:
            Neural Network Performance Metrics:
            - True Positives: 750
            - False Positives: 250
            - False Negatives: 150
            Compute and interpret:
            a) Precision = TP / (TP + FP)
            b) Recall = TP / (TP + FN)
            c) F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
            d) Provide confidence interval for each metric
            e) Discuss statistical significance of results
    
            6. Optimization Algorithm Comparative Analysis:
            Gradient Descent Variants Computation:
            - Standard GD Learning Rate: 0.01
            - Stochastic GD Batch Size: 32
            - Momentum Coefficient: 0.9
            Tasks:
            a) Calculate weight updates for different learning rates
            b) Compute convergence speed
            c) Analyze parameter sensitivity
            d) Provide computational complexity analysis 
            """
            chain_of_thought = """
            1. Question Design Strategy:
            - Align questions with key learning objectives
            - Assess multiple levels of cognitive skills
            - Ensure comprehensive coverage of course topics

            2. Difficulty Progression:
            - MCQs: Test foundational knowledge
            - Theoretical Questions: Evaluate deep understanding
            - Numerical Problems: Challenge analytical thinking

            3. Assessment Principles:
            - Balanced question distribution
            - Clear, unambiguous instructions
            - Multiple versions ( if specifed ) to ensure academic integrity like Version 1, Version 2 etc.
                       """

        # (Similar detailed approach for assignment template)
    elif assessment_query == "assignment":
            initial_prompt = f"""
            You are an assignment creation assistant for the course {course_name} on the topic of {lecture_name} with topics:{Key_Topics}.
            Please create an assignment based on the following details and maximum use the relevant passage from notes/slides for context and relevance:
            - Number of Theoretical Questions: {num_theoretical}
            - Number of Numerical Questions: {num_numerical}
            - Difficulty Level: {difficulty}
            - Number of Versions: {num_versions}
            - Total Marks: {total_marks}
            - Rubric: {rubric}
            - Additional Requirements: {additional_requirements}   
            - Reference: {relevant_passage}"""

            oneshot_example ="""
            User Query: Generate an assignment from {lecture_name} with the following details:
            Key Topics: Machine Learning Practical Applications
            Additional Requirements: Demonstrate end-to-end machine learning project implementation

            Detailed Parameters:
            - Number of Theoretical Questions: 2
            - Number of Numerical/Practical Tasks: 3
            - Difficulty Level: Advanced
            - Number of Versions: 1
            - Total Marks: 100
            - Rubric: Comprehensive project evaluation
            - Additional Requirements: Include data preprocessing, model development, and performance analysis
            - Relevant Passage: Course materials on machine learning workflow 

            Answer:

            Version 1: Advanced Machine Learning Project Assignment

            Theoretical Component (20 marks each):

            Ethical AI and Bias Analysis (20 marks) Can you conduct a comprehensive ethical audit of a machine learning system that reveals the hidden biases inherent in modern AI technologies? Develop a rigorous analysis that quantifies bias across multiple demographic attributes. Your investigation should answer: How can we mathematically measure and mitigate algorithmic discrimination? Demonstrate your approach by: Identifying and quantifying bias indices for at least three protected attributes with 95% statistical confidence. Explain the mathematical formulations behind bias measurements. Construct a detailed 10-page report that not only exposes potential biases but also provides a sophisticated mitigation strategy. How would you redesign the machine learning pipeline to ensure fairness and ethical AI deployment?
            Comparative Algorithmic Performance Analysis (20 marks) Conduct an in-depth comparative study of three advanced machine learning algorithms: Gradient Boosting Machine, Support Vector Machine with Advanced Kernels, and Deep Neural Network. Your challenge is to answer: Which algorithm truly represents the pinnacle of predictive performance across different complexity landscapes? Develop a comprehensive evaluation framework that goes beyond simple accuracy. How will you measure and compare these algorithms using multiple performance metrics? Implement cross-validation with stratified sampling and provide statistically significant evidence of each algorithm's strengths and limitations. Can you create a performance comparison matrix that reveals the nuanced capabilities of each approach?
            Practical Component (20 marks each):

            End-to-End Machine Learning Project (20 marks) Design and implement a cutting-edge machine learning solution that transforms raw, complex data into actionable insights. Your project must answer: Can you develop a machine learning system that demonstrates exceptional predictive power and technical sophistication? Tackle a real-world problem using a dataset with at least 100,000 data points and 10 complex features. How will you engineer features that unveil hidden patterns? Demonstrate your ability to implement multiple machine learning models, with a focus on ensemble methods and advanced hyperparameter optimization. Can you create a predictive system that not only performs exceptionally but also provides deep insights into its decision-making process?
            Advanced Machine Learning Pipeline Challenge (20 marks) Can you construct a machine learning pipeline that represents the pinnacle of data preprocessing and model development? Your challenge is to transform messy, real-world data into a refined, predictive system that demonstrates exceptional technical prowess. How will you tackle the most challenging aspects of data cleaning, feature engineering, and model optimization? Develop innovative techniques for handling missing data, detecting and managing outliers, and creating custom feature transformations. Implement advanced hyperparameter optimization using Bayesian techniques. Can you create a pipeline that not only processes data effectively but also provides deep insights into its own functioning?
            Innovative Modeling Research Challenge (20 marks) Propose and develop a groundbreaking machine learning solution that pushes the boundaries of current technological capabilities. Your task is to answer: Can you create an innovative approach that demonstrates true scientific and technological creativity? Design a novel machine learning method that addresses a complex, open-ended problem. How will you demonstrate both theoretical sophistication and empirical validation? Your solution will be evaluated on its originality, technical complexity, and potential real-world impact. Can you develop an approach that not only solves a challenging problem but also provides insights that could revolutionize the field of machine learning?
            Submission Requirements:
            How will you document your journey of discovery? Provide comprehensive documentation that tells the story of your technical exploration. Your submission should be a narrative of innovation, challenging existing paradigms and demonstrating deep technical understanding.

            Evaluation Criteria:
            How will your work be judged? Each component will be evaluated on:

            Technical sophistication
            Mathematical rigor
            Innovative approach
            Clarity of explanation
            Depth of analysis
            Potential real-world impact"""
            
            chain_of_thought = """
            1. Project-Based Learning Approach:
            - Simulate real-world machine learning challenges
            - Assess practical skill development
            - Encourage innovative problem-solving

            2. Comprehensive Skill Assessment:
            - Theoretical understanding
            - Practical implementation
            - Critical analysis
            - Technical documentation

            3. Learning Outcome Alignment:
            - Demonstrate course learning objectives
            - Develop end-to-end machine learning skills"""
            
    
    prompt = f"""
    {initial_prompt}
    
    One-shot Example:
    {oneshot_example}
    
    Chain of Thought:
    {chain_of_thought}

     - Multiple versions means make multiple versions of the assessment with different questions but same difficulty level and marks distribution. 
    - Keep in mind that it does not mean to just instruct the teacher with ways of varying the assessment, you must provide as much versions as asked.
    -versions can be made by switching the order of options or the options in MCQs, changing the numerical values in numerical questions, changing the theoretical questions with similar difficulty level.
    - the sum of marks of all questions in the assessment must be equal to the total marks.
    """
    return prompt

def history_prompt(chat_history, query):
    """
    Prompt for the history of the chat.
    """
    history_prompt = f"""Given a chat history and the latest user question 
    which might reference context in the chat history, formulate a standalone question 
    which can be understood without the chat history. Do NOT answer the question, 
    just reformulate it if needed and otherwise return it as is.
    Here is the history of the conversation till now:
        '{formatted_history}'
    Here is the current question: {query}
    - You must not answer the question and ONLY reformulate the query of return it as is according to need."""
    return history_prompt