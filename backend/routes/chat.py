import uuid
from fastapi import APIRouter, HTTPException
from backend.database.connection import get_db
from backend.rag.pipeline import query_resume_rag
from backend.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/resumes", tags=["Chat"])

@router.post("/{resume_id}/chat", response_model=ChatResponse)
def chat_with_resume(resume_id: int, request: ChatRequest):
    """
    Continues or starts a conversation about a specific resume using RAG.
    """
    conversation_id = request.conversation_id
    
    # 1. Validate that resume exists
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM resumes WHERE id = ?", (resume_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Resume not found.")
            
    # 2. Start or retrieve conversation
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        with get_db() as conn:
            conn.execute(
                "INSERT INTO conversations (id, resume_id) VALUES (?, ?)",
                (conversation_id, resume_id)
            )
    else:
        # Check if conversation exists
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM conversations WHERE id = ? AND resume_id = ?", (conversation_id, resume_id))
            if not cursor.fetchone():
                # If conversation ID provided but doesn't exist, create it
                conn.execute(
                    "INSERT INTO conversations (id, resume_id) VALUES (?, ?)",
                    (conversation_id, resume_id)
                )
                
    # 3. Retrieve history
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        history = [dict(row) for row in cursor.fetchall()]
        
    # 4. Query RAG pipeline
    answer = query_resume_rag(resume_id, request.message, history)
    
    # 5. Save new messages to DB
    with get_db() as conn:
        conn.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)",
            (conversation_id, request.message)
        )
        conn.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
            (conversation_id, answer)
        )
        
    # 6. Retrieve updated history to return
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        updated_history = [dict(row) for row in cursor.fetchall()]
        
    return {
        "answer": answer,
        "conversation_id": conversation_id,
        "history": updated_history
    }

@router.get("/{resume_id}/conversations/{conversation_id}/messages")
def get_conversation_messages(resume_id: int, conversation_id: str):
    """Retrieves all chat messages for a specific conversation."""
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify conversation belongs to resume
        cursor.execute("SELECT id FROM conversations WHERE id = ? AND resume_id = ?", (conversation_id, resume_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Conversation not found or doesn't belong to this resume.")
            
        cursor.execute(
            "SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (conversation_id,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.get("/{resume_id}/conversations")
def list_resume_conversations(resume_id: int):
    """Lists all chat sessions associated with a resume."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, created_at FROM conversations WHERE resume_id = ? ORDER BY created_at DESC", (resume_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
