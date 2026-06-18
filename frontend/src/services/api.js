import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/resumes/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  getResume: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};

export const chatService = {
  sendMessage: async (resumeId, message, conversationId = null) => {
    const response = await api.post(`/resumes/${resumeId}/chat`, {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  },

  getMessages: async (resumeId, conversationId) => {
    const response = await api.get(`/resumes/${resumeId}/conversations/${conversationId}/messages`);
    return response.data;
  },

  listConversations: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/conversations`);
    return response.data;
  },
};

export const jdService = {
  matchJD: async (resumeId, jdText) => {
    const response = await api.post(`/resumes/${resumeId}/match-jd`, {
      jd_text: jdText,
    });
    return response.data;
  },

  getMatches: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/matches`);
    return response.data;
  },
};

export const interviewService = {
  getQuestions: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/interview-questions`);
    return response.data;
  },
};

export default api;
