import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from backend.models.schemas import ResumeAnalysis

def analyze_resume_text(text: str) -> ResumeAnalysis:
    """
    Analyzes the extracted resume text and structures it into a ResumeAnalysis model
    using the Gemini API and LangChain's structured output capability.
    
    Args:
        text (str): The raw text of the resume.
        
    Returns:
        ResumeAnalysis: The structured candidate details.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please update the .env file in the backend folder.")
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.1
    )
    
    system_instruction = (
        "You are an expert ATS (Applicant Tracking System) and Resume Parser.\n"
        "Analyze the provided resume text and extract all candidate details structured "
        "exactly into the requested schema.\n"
        "Ensure dates are clean, and descriptions are parsed as a list of bullet points.\n"
        "If a certain section is missing, return empty lists or empty strings, do not hallucinate."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", "Here is the candidate's resume text:\n\n{text}")
    ])
    
    try:
        # Utilize LangChain's structured output binding
        structured_llm = llm.with_structured_output(ResumeAnalysis)
        chain = prompt | structured_llm
        analysis = chain.invoke({"text": text})
        return analysis
    except Exception as e:
        print(f"Error in structured LLM execution: {e}. Attempting JSON parsing fallback.")
        
        # Fallback using prompt instructions and manual JSON validation
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction + "\nOutput raw JSON matches the ResumeAnalysis structure. No markdown formatting, just pure JSON."),
            ("human", "Resume text:\n\n{text}")
        ])
        
        chain = fallback_prompt | llm
        response = chain.invoke({"text": text})
        
        content = response.content.strip()
        # Strip markdown code blocks if any
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        data = json.loads(content)
        return ResumeAnalysis(**data)
