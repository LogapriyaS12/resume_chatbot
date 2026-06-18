from pydantic import BaseModel, Field
from typing import List, Optional

class PersonalDetails(BaseModel):
    name: str = Field(default="", description="The candidate's full name.")
    email: Optional[str] = Field(default=None, description="The candidate's email address.")
    phone: Optional[str] = Field(default=None, description="The candidate's phone number.")
    location: Optional[str] = Field(default=None, description="The candidate's location (city, state/country).")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL.")
    github: Optional[str] = Field(default=None, description="GitHub profile URL.")
    website: Optional[str] = Field(default=None, description="Personal website or portfolio URL.")

class EducationDetails(BaseModel):
    institution: str = Field(default="", description="Name of the school, university, or college.")
    degree: Optional[str] = Field(default=None, description="Degree obtained (e.g., Bachelor of Science, Master's).")
    major: Optional[str] = Field(default=None, description="Field of study / Major.")
    start_date: Optional[str] = Field(default=None, description="Start date of education.")
    end_date: Optional[str] = Field(default=None, description="End date or expected graduation date.")
    grade: Optional[str] = Field(default=None, description="GPA, percentage, or classification.")

class WorkExperience(BaseModel):
    job_title: str = Field(default="", description="Job title or role.")
    company: str = Field(default="", description="Name of the company or organization.")
    location: Optional[str] = Field(default=None, description="Work location.")
    start_date: Optional[str] = Field(default=None, description="Start date.")
    end_date: Optional[str] = Field(default=None, description="End date (or 'Present').")
    description: List[str] = Field(default_factory=list, description="Key duties and achievements.")

class ProjectDetails(BaseModel):
    title: str = Field(default="", description="Title of the project.")
    description: str = Field(default="", description="Brief description of the project and its goals.")
    technologies: List[str] = Field(default_factory=list, description="Technologies, programming languages, and tools used.")
    link: Optional[str] = Field(default=None, description="URL to the project codebase or live version.")

class Skills(BaseModel):
    technical: List[str] = Field(default_factory=list, description="Technical skills including programming languages, frameworks, tools, database, etc.")
    soft: List[str] = Field(default_factory=list, description="Soft skills (e.g., leadership, communication, problem solving).")

class ResumeAnalysis(BaseModel):
    personal_details: PersonalDetails = Field(default_factory=PersonalDetails)
    education: List[EducationDetails] = Field(default_factory=list)
    experience: List[WorkExperience] = Field(default_factory=list, description="List of work experience or internships.")
    projects: List[ProjectDetails] = Field(default_factory=list)
    skills: Skills = Field(default_factory=Skills)
    professional_summary: str = Field(default="", description="A cohesive professional summary of the candidate's profile.")

# API Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    history: List[dict]

class JDMatchRequest(BaseModel):
    jd_text: str

class JDMatchResponse(BaseModel):
    match_percentage: int
    missing_skills: List[str]
    improvements: List[str]

class QuestionGeneratorResponse(BaseModel):
    technical: List[dict] = Field(..., description="List of technical questions with answers.")
    hr: List[dict] = Field(..., description="List of HR questions with answers.")
    project_based: List[dict] = Field(..., description="List of project-based questions with answers.")
    coding: List[dict] = Field(..., description="List of coding questions with solutions.")

class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    parsed_data: ResumeAnalysis
    ats_analysis: dict
    created_at: str
