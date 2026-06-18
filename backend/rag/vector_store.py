import os
import shutil
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Directory to store local FAISS indexes
VECTORSTORES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vectorstores")
os.makedirs(VECTORSTORES_DIR, exist_ok=True)

def get_embeddings_model():
    """Initializes and returns the Google GenAI Embeddings model."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=api_key
    )

def create_and_save_vector_store(resume_id: int, text: str):
    """
    Chunks the resume text, generates embeddings, builds a FAISS index,
    and saves it to disk under the resume-specific path.
    
    Args:
        resume_id (int): The database ID of the resume.
        text (str): The raw text extracted from the resume.
    """
    # 1. Chunk the text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120,
        length_function=len
    )
    docs = text_splitter.create_documents(
        texts=[text],
        metadatas=[{"resume_id": resume_id}]
    )
    
    if not docs:
        raise ValueError("No text chunks created. Resume text might be too short.")
        
    # 2. Initialize Embeddings and FAISS
    embeddings = get_embeddings_model()
    db = FAISS.from_documents(docs, embeddings)
    
    # 3. Save index to disk
    store_path = os.path.join(VECTORSTORES_DIR, f"resume_{resume_id}_faiss")
    db.save_local(store_path)
    print(f"FAISS index saved successfully for resume {resume_id} at {store_path}")

def load_vector_store(resume_id: int) -> FAISS:
    """
    Loads the FAISS index for a specific resume from disk.
    
    Args:
        resume_id (int): The database ID of the resume.
        
    Returns:
        FAISS: The loaded FAISS vector store.
    """
    store_path = os.path.join(VECTORSTORES_DIR, f"resume_{resume_id}_faiss")
    if not os.path.exists(store_path):
        raise FileNotFoundError(f"Vector store index not found for resume ID {resume_id} at {store_path}")
        
    embeddings = get_embeddings_model()
    # Allow dangerous deserialization because we are loading locally generated and saved FAISS indices
    return FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)

def delete_vector_store(resume_id: int):
    """
    Deletes the FAISS index files for a specific resume from disk.
    
    Args:
        resume_id (int): The database ID of the resume.
    """
    store_path = os.path.join(VECTORSTORES_DIR, f"resume_{resume_id}_faiss")
    if os.path.exists(store_path):
        shutil.rmtree(store_path)
        print(f"FAISS index deleted for resume {resume_id} at {store_path}")
