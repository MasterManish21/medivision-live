import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * POST /predict
 * Sends an image file to the Flask backend and returns the AI diagnosis result.
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<{disease: string, confidence: number, category: string}>}
 */
export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * GET /health
 * Check backend health status.
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * GET /diseases
 * Fetch list of all diseases from backend.
 */
export const fetchDiseases = async () => {
  const response = await api.get('/diseases');
  return response.data;
};

/**
 * POST /chat
 * Send a message to the AI chatbot (with session persistence and optional analysis context).
 * @param {string} message                 - The message from the user
 * @param {string} sessionId               - Optional session ID for conversation continuity
 * @param {Record<string, any>|null} analysisContext - Optional latest dashboard analysis summary
 */
export const chatMessage = async (message, sessionId = 'default', analysisContext = null) => {
  const response = await api.post('/chat', {
    message,
    session_id: sessionId,
    analysis_context: analysisContext,
  });
  return response.data;
};

/**
 * POST /symptom-check
 * NLP-based symptom triage and risk assessment.
 * @param {string} symptoms - Plain-text description of symptoms
 */
export const checkSymptoms = async (symptoms) => {
  const response = await api.post('/symptom-check', { symptoms });
  return response.data;
};

export default api;
