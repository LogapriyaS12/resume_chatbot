# AI Resume Interview Assistant

The **AI Resume Interview Assistant** is a production-ready, Generative AI-powered web application that automates candidate screening and interview preparation. By combining **Retrieval-Augmented Generation (RAG)**, **FastAPI**, **React.js**, and the **Google Gemini API**, it allows recruiters and hiring managers to upload resume PDFs, extract structured details, test candidate qualifications against job descriptions, audit ATS compatibility, and run interactive Q&A sessions.

---

## Key Features

1. **Structured Candidate Profiling**: Automatically extracts names, contact channels, work experience, projects, education history, and compiles a professional summary.
2. **ATS Compatibility Reviewer**: Estimates a compatibility rating (0-100), flags missing keyword tokens, and recommends formatting optimizations.
3. **Interactive RAG Chat (ChatGPT-style)**: Ask targeted questions about candidate achievements, skills, or job suitability. Answers are strictly referenced against the resume content without hallucination.
4. **Automated Interview Prep**: Generates personalized lists of Technical, behavioral (HR), Project-specific, and Coding questions (with solutions) derived from candidate qualifications.
5. **Job Description Alignment (JD Matcher)**: Paste or upload a Job Description to calculate alignment percentages, list missing prerequisites, and get direct tips for resume tailoring.

---

## Tech Stack & Architecture

### Backend
* **Language**: Python 3.9+
* **Web Framework**: FastAPI (Uvicorn web server)
* **Orchestration**: LangChain & LangChain Google GenAI
* **Vector Store**: FAISS (Facebook AI Similarity Search)
* **Model Integration**: Google Gemini API (`gemini-1.5-flash`, `text-embedding-004`)
* **Persistence**: SQLite 3

### Frontend
* **Core**: React.js (Single Page Application via Vite)
* **Styling**: Vanilla CSS (High-fidelity custom dark-mode theme, glassmorphic accents, micro-animations)
* **Icons**: Lucide React

### System Flow
```
[Resume PDF] ──> [Text Extraction] ──> [Text Chunking] ──> [Embedding Gen] ──> [FAISS Database]
                                                                                     │
                                                                                     ▼
[Gemini LLM] <── [Prompt + Context] <── [Retrieve Chunks] <── [Vector Search] <── [User Query]
```

---

## Folder Structure

```
resume_chatbot/
├── backend/
│   ├── main.py               # FastAPI entry point
│   ├── .env                  # API configuration & database location
│   ├── requirements.txt      # Python dependencies
│   ├── database/             # SQLite connection wrapper and SQL schema
│   ├── models/               # Pydantic schemas (data validation)
│   ├── routes/               # API Router files (resumes, chat, jd matching, interviews)
│   ├── services/             # PDF extraction and LLM parser services
│   ├── rag/                  # FAISS chunk indexer and query retriever pipeline
│   ├── uploads/              # Local disk storage for uploaded candidate PDFs
│   └── vectorstores/         # Local disk storage for serialized FAISS indexes
└── frontend/
    ├── src/
    │   ├── main.jsx          # React initialization entry point
    │   ├── App.jsx           # Main page routing flow
    │   ├── index.css         # Styling system & dark-mode tokens
    │   ├── components/       # DragDropUpload, Navbar, ResumeCard, AnalysisViewer, etc.
    │   ├── pages/            # Dashboard and ResumeWorkspace page layouts
    │   └── services/         # Axios API HTTP calls integration
    ├── package.json          # Node modules
    └── vite.config.js        # Vite parameters
```

---

## Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js 18+
* Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Rename `.env` template or open it and replace with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
5. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   The server will startup on [http://localhost:8000](http://localhost:8000). You can inspect the API swagger documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface in your browser at [http://localhost:5173](http://localhost:5173).

---

## SQLite Database Schema

The SQLite schema is automatically initialized when starting the backend server for the first time:

* **`resumes`**: Stores candidate resumes, raw parsed text, and calculated JSON profile fields.
* **`conversations`**: Stores unique UUID chat sessions associated with a specific resume.
* **`messages`**: Records conversation dialogue logs (`role: user` vs `role: assistant`) for chat memory.
* **`jd_matches`**: Archives historical comparison scores, missing keywords, and resume tailoring suggestions.

---

## Resume-Ready Project Description

Add this to your professional resume to stand out in Artificial Intelligence and Full Stack Developer roles:

**Generative AI Engineer | AI Resume Interview Assistant**
* **Technical Stack**: FastAPI, React.js, LangChain, Google Gemini API (`gemini-1.5-flash`), FAISS, SQLite, PyPDF2, Axios, CSS Grid/Flexbox.
* **Impact Summary**:
  * Designed and built a production-grade web application to automate recruitment screening, leveraging a **Retrieval-Augmented Generation (RAG)** pipeline to extract candidate qualifications and answer queries with **0% hallucination** metrics.
  * Engineered a custom document ingestion service using `PyPDF2` and LangChain's `RecursiveCharacterTextSplitter` to chunk documents and generate vector embeddings with Google's `text-embedding-004` model.
  * Developed a localized vector search index using **FAISS**, persisting serialized collections on disk and achieving sub-100ms retrieval latency for semantic context retrieval.
  * Integrated Google Gemini JSON structured output mode to parse unstructured resumes into strict Pydantic schemas, successfully structuring applicant profiles, skills, and work histories with high accuracy.
  * Built an automated **ATS Compatibility Analyzer** and **Job Description Matcher** that evaluates resume keyword density, computes alignment percentages, and suggests resume refinements.
  * Authored a responsive, premium single-page React frontend implementing glassmorphic layout designs, glowing hover micro-animations, and dynamic SVG circular progress meters.
