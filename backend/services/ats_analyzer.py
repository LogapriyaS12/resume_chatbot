import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List

class ATSReport(BaseModel):
    score: int = Field(..., description="An ATS score out of 100 based on standard formatting, readability, keywords, and density.")
    missing_keywords: List[str] = Field(..., description="Keywords or skills that are missing but highly relevant for the candidate's role/industry.")
    suggestions: List[str] = Field(..., description="Actionable recommendations to improve the resume's ATS parseability and content.")

def analyze_ats_compatibility(text: str) -> dict:
    """
    Analyzes a resume's text content for ATS compatibility.
    
    Args:
        text (str): The raw text of the resume.
        
    Returns:
        dict: A dictionary containing:
            - score (int)
            - missing_keywords (list of str)
            - suggestions (list of str)
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please update the .env file.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.2
    )
    
    system_instruction = (
        "You are an advanced Applicant Tracking System (ATS) optimization engine.\n"
        "Analyze the provided resume text and generate a structured compatibility report.\n"
        "Your report must include an overall ATS score (0-100), a list of critical missing keywords "
        "relevant to the candidate's domain, and actionable improvement recommendations (e.g., formatting, action verbs, layout, etc.)."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", "Here is the candidate's resume text:\n\n{text}")
    ])
    
    try:
        structured_llm = llm.with_structured_output(ATSReport)
        chain = prompt | structured_llm
        report = chain.invoke({"text": text})
        return report.model_dump()
    except Exception as e:
        print(f"ATS analysis error: {e}. Running fallback JSON query.")
        
        # Fallback query
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\nReturn raw JSON matching fields: 'score' (int), 'missing_keywords' (array of strings), and 'suggestions' (array of strings)."),
            ("human", "Resume text:\n\n{text}")
        ])
        
        chain = fallback_prompt | llm
        response = chain.invoke({"text": text})
        
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        return json.loads(content)
