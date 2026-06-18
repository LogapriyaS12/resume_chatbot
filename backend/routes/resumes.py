import os
import json
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from backend.database.connection import get_db
from backend.services.pdf_extractor import extract_text_from_pdf, PDFExtractionError
from backend.services.analyzer import analyze_resume_text
from backend.services.ats_analyzer import analyze_ats_compatibility
from backend.rag.vector_store import create_and_save_vector_store, delete_vector_store
from backend.models.schemas import ResumeUploadResponse, ResumeAnalysis

router = APIRouter(prefix="/resumes", tags=["Resumes"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(file: UploadFile = File(...)):
    """
    Uploads a resume PDF, extracts text, performs structured details extraction, 
    evaluates ATS compatibility, and stores it in the database and vector store.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    # Generate unique filename to avoid collision
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil_copy = file.file.read()
            buffer.write(shutil_copy)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    try:
        # 1. Extract text from PDF
        text = extract_text_from_pdf(file_path)
        
        # 2. Extract structured analysis via Gemini
        parsed_data = analyze_resume_text(text)
        
        # 3. Analyze ATS compatibility
        ats_analysis = analyze_ats_compatibility(text)
        
        # 4. Save to Database
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO resumes (filename, filepath, extracted_text, parsed_data, ats_analysis)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    file.filename,
                    file_path,
                    text,
                    json.dumps(parsed_data.model_dump()),
                    json.dumps(ats_analysis)
                )
            )
            resume_id = cursor.lastrowid
            
        # 5. Create Vector Index for RAG
        try:
            create_and_save_vector_store(resume_id, text)
        except Exception as e:
            # Cleanup DB and file if indexing fails to avoid orphan records
            with get_db() as conn:
                conn.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Vector indexing failed: {str(e)}")
            
        # 6. Prepare Response
        return {
            "id": resume_id,
            "filename": file.filename,
            "parsed_data": parsed_data,
            "ats_analysis": ats_analysis,
            "created_at": str(uuid.uuid4()) # Placeholder, SQLite created_at handles database level timestamp
        }
        
    except PDFExtractionError as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.get("", response_model=list)
def list_resumes():
    """Returns a list of all uploaded resumes."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, created_at FROM resumes ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.get("/{resume_id}")
def get_resume(resume_id: int):
    """Retrieves resume details and analysis by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    resume_dict = dict(row)
    resume_dict["parsed_data"] = json.loads(resume_dict["parsed_data"])
    resume_dict["ats_analysis"] = json.loads(resume_dict["ats_analysis"])
    return resume_dict

@router.delete("/{resume_id}")
def delete_resume_endpoint(resume_id: int):
    """Deletes a resume, its PDF file, and its vector index."""
    # Retrieve file path first
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filepath FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")
        
    file_path = row["filepath"]
    
    # 1. Delete DB records (Cascade will take care of conversations/messages/matches)
    with get_db() as conn:
        conn.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        
    # 2. Delete PDF file
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting PDF file: {e}")
            
    # 3. Delete Vector Store index
    try:
        delete_vector_store(resume_id)
    except Exception as e:
        print(f"Error deleting vector store: {e}")
        
    return {"message": "Resume and all associated data deleted successfully."}
