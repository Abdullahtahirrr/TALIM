from Retrieval import generate_answer, generate_assessment
from Vector_database import get_vector_store, add_documents_to_vector_store
from QueryAnalyser import analyze_query
import logging
import time
# logging.basicConfig(level=logging.DEBUG)/
user_role="Student"
# Example usage:
if __name__ == "__main__":
    # Get user query
    if user_role == "Student":
        user_query = input("Enter your query: ")
        query_filter = analyze_query(user_query)
        vc= get_vector_store("Artificial_Intelligence")
        vector_db_size = len(vc.get()['documents'])
        print('vector_db_size',vector_db_size)
        if(query_filter == "Valid"):
            # Use Basic RAG for retrieval
            retriever_type = "RAG Fusion"

            start=time.time()
            # Generate the final answer
            relevant_text, answer = generate_answer(user_query, retriever_type)
            # Output resultsh
            print('time taken: ', time.time()-start)
            print("\nRelevant Documents:")
            # for doc in relevant_text:
            #     print(doc.page_content)
            print("\nGenerated Answer:")
            print(answer)
        else: 
            print(query_filter)
    elif (user_role == "Instructor"):
        assessment_query = "Quiz"
        if  assessment_query == "Quiz":
            # Get user query
            lecture_name = input("Enter Lecture Name")
            KeyTopics = input("Key Topics")
            MCQS = input("Number of MCQS")
            Theortical = input("Number of Theortical")
            Numerical = input("Number of Numerical")
            Difficulty = input("Difficulty Level")
            Version = input("Number of Version")
            Total_marks = input("Total Marks")
            Rubric = input("Need Rubric (yes, no)")
            Additional_requirements = input("Any Additional Requirements")
            quiz_data= {
                "Assessment_type": assessment_query,
                "lecture_name": lecture_name,
                "KeyTopics": KeyTopics,
                "MCQS": MCQS,
                "Theortical": Theortical,
                "Numerical": Numerical,
                "Difficulty": Difficulty,
                "Version": Version,
                "Total_marks": Total_marks,
                "Rubric": Rubric,
                "Additional_requirements": Additional_requirements
            }  
           
            quiz_query = f"Generate a quiz from {lecture_name} with the following details with Key Topics {KeyTopics}  and Additional Requirements: {Additional_requirements}"
            
            retriever_type = "MultiQuery Retriever"
            relevant_text, answer = generate_assessment(quiz_query, quiz_data, retriever_type)
            print("I got the relevenay docs back in main")
            # Output resultsh
            print("\nRelevant Documents:")
            for doc in relevant_text:
                print(doc.page_content)
            print("\nGenerated Answer:")
            print(answer)
                  
    
        elif assessment_query == "Assignment": 
            # Get user query
            lecture_name = input("Enter Lecture Name")
            KeyTopics = input("Key Topics")
            Theortical = input("Number of Theortical")
            Numerical = input("Number of Numerical")
            Difficulty = input("Difficulty Level")
            Version = input("Number of Version")
            Total_marks = input("Total Marks")
            Rubric = input("Need Rubric (yes, no)")
            Additional_requirements = input("Any Additional Requirements")

            assignment_data= {
                "Assessment_type": assessment_query,
                "lecture_name": lecture_name,
                "KeyTopics": KeyTopics,
                "MCQS": "None",
                "Theortical": Theortical,
                "Numerical": Numerical,
                "Difficulty": Difficulty,
                "Version": Version,
                "Total_marks": Total_marks,
                "Rubric": Rubric,
                "Additional_requirements": Additional_requirements
            } 
            assignment_query = f"Generate a assignment from {lecture_name} with the following details with Key Topics {KeyTopics}  and Additional Requirements: {Additional_requirements}"
            retriever_type = "MultiQuery Retriever"
            relevant_text, answer = generate_assessment(assessment_query,assignment_data, retriever_type)
            print("I got the relevenay docs back in main")
            # Output resultsh
            print("\nRelevant Documents:")
            for doc in relevant_text:
                print(doc.page_content)
            print("\nGenerated Answer:")
            print(answer)
               

        

        
        
