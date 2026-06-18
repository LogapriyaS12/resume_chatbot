import os
import json

from fastapi import APIRouter, HTTPException
from backend.database.connection import get_db
from backend.models.schemas import QuestionGeneratorResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter(prefix="/resumes", tags=["Interviews"])

@router.get("/{resume_id}/interview-questions", response_model=QuestionGeneratorResponse)
def generate_interview_questions(resume_id: int):
    """
    Generates a structured set of interview questions (Technical, HR, Project-Based, and Coding)
    specifically tailored to the candidate's resume.
    """
    # 1. Retrieve the resume text
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, extracted_text FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    resume_text = row["extracted_text"]
    
    # 2. Query Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on the server.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.3
    )
    
    system_instruction = (
        "You are an expert interviewer and technical recruiter.\n"
        "Generate a highly tailored set of interview questions and answers/solutions for the candidate based on their resume.\n"
        "Generate:\n"
        "- 4 Technical Questions: testing their core tech skills and tools, with standard answers.\n"
        "- 3 HR Questions: standard behavioral questions tailored to their work history or profile, with expected answers.\n"
        "- 3 Project-Based Questions: deep dives into the projects listed in the resume, with sample answers.\n"
        "- 2 Coding Questions: appropriate coding tasks (e.g. data structures, algorithms, or practical implementation) relevant to the candidate's language stack, including clear code solutions.\n"
        "Ensure all questions are directly derived from or relevant to the resume.\n"
        "Return structured output in JSON matching the schema."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", "Candidate's Resume:\n\n{resume_text}")
    ])
    
    try:
        structured_llm = llm.with_structured_output(QuestionGeneratorResponse)
        chain = prompt | structured_llm
        response = chain.invoke({"resume_text": resume_text})
        return response
    except Exception as e:
        print(f"Interview questions generation error: {e}. Executing fallback JSON query.")
        
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\nReturn ONLY valid raw JSON with keys: technical, hr, project_based, coding. "
             "Each element in technical, hr, and project_based must have keys 'question' and 'answer'. "
             "Each element in coding must have keys 'question' and 'solution'."),
            ("human", "Resume:\n{resume_text}")
        ])
        
        chain = fallback_prompt | llm
        response = chain.invoke({"resume_text": resume_text})
        
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        return json.loads(content)
