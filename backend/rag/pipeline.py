import os
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from backend.rag.vector_store import load_vector_store

def query_resume_rag(resume_id: int, query: str, chat_history: Optional[List[dict]] = None) -> str:
    """
    Retrieves relevant resume chunks and queries Gemini to answer questions about the candidate.
    
    Args:
        resume_id (int): The database ID of the resume.
        query (str): The user's question.
        chat_history (list): Optional list of historical chat messages: [{"role": "user"|"assistant", "content": str}].
        
    Returns:
        str: The generated answer.
    """
    # 1. Load the vector store
    try:
        db = load_vector_store(resume_id)
    except FileNotFoundError:
        return "Error: Resume indexing was not completed. Please try re-uploading the resume."
        
    # 2. Retrieve relevant chunks
    # Retrieve top 4 relevant chunks
    docs = db.similarity_search(query, k=4)
    context = "\n---\n".join([doc.page_content for doc in docs])
    
    # 3. Build prompt template
    system_prompt = (
        "You are an AI Resume Interview Assistant. Your job is to answer questions about the candidate "
        "strictly based on their resume content provided in the CONTEXT below.\n\n"
        "Strict Guidelines:\n"
        "1. Rely ONLY on the facts directly mentioned in the CONTEXT. Do not extrapolate, assume, or hallucinate.\n"
        "2. If the context does not contain the answer, reply: 'I cannot find that information in the candidate's resume.' "
        "Do not try to make up or guess any details.\n"
        "3. Keep your answers clear, professional, and well-structured. Use markdown formatting and bullet points where helpful.\n"
        "4. Do not answer questions unrelated to the candidate or their resume content.\n\n"
        "CONTEXT:\n"
        "{context}"
    )
    
    # Assemble messages including chat history for context continuity
    messages = [
        ("system", system_prompt)
    ]
    
    if chat_history:
        # Keep only the last 6 messages to avoid bloating the context window
        recent_history = chat_history[-6:]
        for msg in recent_history:
            role = "human" if msg["role"] == "user" else "ai"
            messages.append((role, msg["content"]))
            
    messages.append(("human", "{query}"))
    
    prompt_template = ChatPromptTemplate.from_messages(messages)
    
    # 4. Invoke LLM
    api_key = os.getenv("GEMINI_API_KEY")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.1
    )
    
    chain = prompt_template | llm
    
    try:
        response = chain.invoke({
            "context": context,
            "query": query
        })
        return response.content.strip()
    except Exception as e:
        return f"An error occurred while generating the response: {str(e)}"
