 
#  prompt = (
#       """ You are a helpful expert of {course_name}
#           You will be shown the user's question, and the relevant information contained in either notes and lectures.
#           Answer the user's question using only this relevant information . Try to build a good answer uing this information.If no information or example is provided then mention and respond using your own data

#           Give Precise answer according to User's Instruction, like if user wants explaination then provide explaination.
#           If User want an answer in one or two lines then give answer accordingly.
#           QUESTION: '{query}'\n"
#           REFERENCE : '{relevant_passage}"""
# Never generate quiz and assignments. Out of scope 
#     )

def generate_prompt(user_role, intent, query, course_name, relevant_passage, **kwargs):
    """
    Generates a prompt template based on user role, intent, and query details.
    """
    if user_role == "student":
        # Define student-specific templates
        student_templates = {
            "explain": """
                You are a knowledgeable assistant for {course_name}.
                Answer the following query by providing a detailed explanation using the relevant information from the provided notes or lectures.
                QUESTION: '{query}'
                REFERENCE: '{relevant_passage}'
            """,
            "summarize": """
                You are a summarization expert for {course_name}.
                Summarize the key points of the following query based on the provided material. Keep your answer concise and to the point.
                QUESTION: '{query}'
                REFERENCE: '{relevant_passage}'
            """,
            "example": """
                You are a subject expert for {course_name}.
                Provide a relevant example for the following query based on the given material. If no specific example is available, create a general one that fits the topic.
                QUESTION: '{query}'
                REFERENCE: '{relevant_passage}'
            """,
            "general": """
                You are an expert for {course_name}.
                Use the following material to answer the user's question. If no information is provided, respond based on your general knowledge of the topic.
                QUESTION: '{query}'
                REFERENCE: '{relevant_passage}'
            """
        }
        # Return appropriate template
        return student_templates.get(intent, student_templates["general"]).format(
            course_name=course_name, query=query, relevant_passage=relevant_passage
        )
    
    elif user_role == "teacher":
        # Define teacher-specific templates
        teacher_templates = {
            "quiz": """
                You are a quiz creation assistant for {course_name}.
                Create a quiz based on the provided material. Include the following parameters:
                - Number of questions: {num_questions}
                - Question type(s): {question_types}
                - Difficulty level: {difficulty_level}
                - Topic(s): {topics}
                REFERENCE: '{relevant_passage}'
            """,
            "assignment": """
                You are an assignment creation assistant for {course_name}.
                Design an assignment based on the following parameters:
                - Number of tasks: {num_tasks}
                - Type: {assignment_type}
                - Grading criteria: {grading_criteria}
                - Topic(s): {topics}
                REFERENCE: '{relevant_passage}'
            """
        }
        # Return appropriate template
        return teacher_templates.get(intent, "").format(
            course_name=course_name, 
            relevant_passage=relevant_passage, 
            **kwargs
        )

# Example Usage
role = "student"
intent = "explain"
query = "Explain the working of neural networks."
course_name = "Artificial Intelligence"
relevant_passage = "Neural networks are modeled after the human brain..."
prompt = generate_prompt(role, intent, query, course_name, relevant_passage)
print(prompt)
