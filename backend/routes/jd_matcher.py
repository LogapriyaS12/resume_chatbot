import os
import json
from fastapi import APIRouter, HTTPException
from backend.database.connection import get_db
from backend.models.schemas import JDMatchRequest, JDMatchResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter(prefix="/resumes", tags=["Job Matching"])

@router.post("/{resume_id}/match-jd", response_model=JDMatchResponse)
def match_job_description(resume_id: int, request: JDMatchRequest):
    """
    Compares the candidate's resume against a provided job description,
    returning a match percentage, missing skills, and improvement recommendations.
    """
    # 1. Retrieve the resume text from database
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, extracted_text FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    resume_text = row["extracted_text"]
    jd_text = request.jd_text
    
    # 2. Analyze using Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on the server.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.2
    )
    
    system_instruction = (
        "You are an expert technical recruiter and resume matching assistant.\n"
        "Your task is to compare the candidate's resume with the Job Description (JD) provided.\n"
        "Analyze the alignment, calculate a match percentage (0 to 100) based on skills, experience, and role responsibilities.\n"
        "Identify key missing skills/keywords from the JD that are not present in the candidate's resume.\n"
        "Provide concrete, actionable suggestions for improving the resume to better align with the JD.\n"
        "Return structured output in JSON format with fields:\n"
        "- match_percentage: integer (0-100)\n"
        "- missing_skills: list of strings\n"
        "- improvements: list of strings"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", "Candidate's Resume:\n\n{resume_text}\n\nJob Description:\n\n{jd_text}")
    ])
    
    try:
        # Request structured JSON format from Gemini
        structured_llm = llm.with_structured_output(JDMatchResponse)
        chain = prompt | structured_llm
        match_result = chain.invoke({
            "resume_text": resume_text,
            "jd_text": jd_text
        })
        result_dict = match_result.model_dump()
    except Exception as e:
        print(f"JD matching structured error: {e}. Executing fallback JSON query.")
        
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\nReturn ONLY valid raw JSON with keys: match_percentage, missing_skills, improvements."),
            ("human", "Resume:\n{resume_text}\n\nJD:\n{jd_text}")
        ])
        
        chain = fallback_prompt | llm
        response = chain.invoke({
            "resume_text": resume_text,
            "jd_text": jd_text
        })
        
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        result_dict = json.loads(content)
        
    # 3. Store match result in SQLite
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO jd_matches (resume_id, jd_text, match_percentage, missing_skills, improvements)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                resume_id,
                jd_text,
                result_dict["match_percentage"],
                json.dumps(result_dict["missing_skills"]),
                json.dumps(result_dict["improvements"])
            )
        )
        
    return result_dict

@router.get("/{resume_id}/matches")
def get_resume_matches(resume_id: int):
    """Retrieves all past Job Description matches for a resume."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, match_percentage, missing_skills, improvements, created_at FROM jd_matches WHERE resume_id = ? ORDER BY created_at DESC",
            (resume_id,)
        )
        rows = cursor.fetchall()
        
    results = []
    for row in rows:
        item = dict(row)
        item["missing_skills"] = json.loads(item["missing_skills"])
        item["improvements"] = json.loads(item["improvements"])
        results.append(item)
    return results
