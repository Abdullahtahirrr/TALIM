// src/utils/api-service.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generate chat response from TALIM bot using your RAG system
 * @param {string} userMessage - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {Object} courseContext - Information about the current course
 * @returns {Promise<Object>} - Contains answer and relevant sources
 */
export const generateChatResponse = async (userMessage, chatHistory = [], courseContext = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userMessage,
        chat_history: chatHistory,
        course_context: courseContext
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data.answer,
      relevantSources: data.relevant_text || []
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      answer: "I'm sorry, I couldn't process your request. Please check if the backend server is running and try again.",
      relevantSources: []
    };
  }
};

/**
 * Generate assessment (quiz or assignment) using your RAG system
 * @param {Object} assessmentData - Data for the assessment
 * @returns {Promise<Object>} - Contains generated assessment and relevant sources
 */
export const generateAssessment = async (assessmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      assessment: data.answer,
      relevantSources: data.relevant_text || []
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    return {
      assessment: "Failed to generate assessment. Please check if the backend server is running and try again.",
      relevantSources: []
    };
  }
};