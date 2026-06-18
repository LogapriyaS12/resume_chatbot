-- Database Schema for AI Resume Interview Assistant

-- Table to store uploaded resumes and their analyses
CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    parsed_data TEXT, -- JSON containing structured candidate details
    ats_analysis TEXT, -- JSON containing ATS score, missing keywords, suggestions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store chat conversations associated with resumes
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY, -- UUID string
    resume_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Table to store individual chat messages in a conversation
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Table to store Job Description matches
CREATE TABLE IF NOT EXISTS jd_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    jd_text TEXT NOT NULL,
    match_percentage INTEGER NOT NULL,
    missing_skills TEXT, -- JSON array of strings
    improvements TEXT, -- JSON array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);
