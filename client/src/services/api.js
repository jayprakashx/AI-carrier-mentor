const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🔄 API Call: ${url}`, config);
      const response = await fetch(url, config);
      
      // Check if response is OK (status 200-299)
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log(`✅ API Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error at ${endpoint}:`, error);
      
      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Test endpoint
  async test() {
    return this.request('/test');
  }

  // Questions - Main endpoint
  async getQuestions(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add all valid parameters
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';
    
    return this.request(endpoint);
  }

  // Get questions by type only
  async getQuestionsByType(type, limit = 10) {
    return this.request(`/questions?type=${type}&limit=${limit}`);
  }

  // Get sample questions (alternative endpoint)
  async getSampleQuestions() {
    return this.request('/questions/sample');
  }

  // Test questions endpoint
  async testQuestions() {
    return this.request('/questions/test');
  }

  // Get specific question type
  async getQuestionType(type, limit = null) {
    const endpoint = limit ? `/questions/type/${type}?limit=${limit}` : `/questions/type/${type}`;
    return this.request(endpoint);
  }

  // Create sample questions (for testing - if available)
  async createSampleQuestions() {
    try {
      return await this.request('/questions/sample', {
        method: 'POST'
      });
    } catch (error) {
      console.log('⚠️ Sample questions creation endpoint not available, using existing questions');
      // If endpoint doesn't exist, just return regular questions
      return this.getQuestions();
    }
  }

  // Auth - Register
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  // Auth - Login
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  // Auth - Get current user (if implemented)
  async getCurrentUser(token) {
    try {
      return await this.request('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log('⚠️ Get current user endpoint not available');
      return { success: false, message: 'Endpoint not available' };
    }
  }

  // Interviews - Submit with AI evaluation
  async submitInterview(interviewData) {
    return this.request('/interviews/submit', {
      method: 'POST',
      body: interviewData
    });
  }

  // Interviews - Simple submit (fallback)
  async submitSimpleInterview(interviewData) {
    return this.request('/interviews/simple-submit', {
      method: 'POST',
      body: interviewData
    });
  }

  // Users - Get user profile (if implemented)
  async getUserProfile(userId, token) {
    try {
      return await this.request(`/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log('⚠️ Get user profile endpoint not available');
      return { success: false, message: 'Endpoint not available' };
    }
  }

  // Utility method to check server status
  async checkServerStatus() {
    try {
      const health = await this.healthCheck();
      const test = await this.test();
      
      return {
        server: true,
        database: health.data?.database === 'Connected',
        routes: {
          health: true,
          test: true,
          questions: await this.testQuestions().then(() => true).catch(() => false),
          auth: await this.login({ email: 'test@test.com' }).then(() => true).catch(() => false)
        }
      };
    } catch (error) {
      return {
        server: false,
        database: false,
        routes: {
          health: false,
          test: false,
          questions: false,
          auth: false
        },
        error: error.message
      };
    }
  }

  // Batch operations for multiple question types
  async getMultipleQuestionTypes(types, limitPerType = 5) {
    const requests = types.map(type => 
      this.getQuestionsByType(type, limitPerType)
        .then(data => ({ type, data, success: true }))
        .catch(error => ({ type, error: error.message, success: false }))
    );
    
    return Promise.all(requests);
  }

  // Get all available question types
  async getAvailableQuestionTypes() {
    try {
      // Try to get from categories endpoint if available
      const categories = await this.request('/questions/categories/list');
      return categories;
    } catch (error) {
      // Fallback to known types
      return {
        success: true,
        data: {
          types: ['technical', 'behavioral', 'mcq', 'aptitude'],
          categories: ['react', 'javascript', 'soft-skills', 'problem-solving']
        }
      };
    }
  }
}

// Create global instance
export const apiService = new ApiService();

// Utility functions for common operations
export const apiUtils = {
  // Load questions for interview
  async loadInterviewQuestions(interviewType, difficulty = 'medium', limit = 10) {
    try {
      let questions;
      
      switch (interviewType) {
        case 'technical':
          questions = await apiService.getQuestionsByType('technical', limit);
          break;
        case 'behavioral':
          questions = await apiService.getQuestionsByType('behavioral', limit);
          break;
        case 'fullstack':
          const [tech, behavioral] = await Promise.all([
            apiService.getQuestionsByType('technical', Math.ceil(limit / 2)),
            apiService.getQuestionsByType('behavioral', Math.floor(limit / 2))
          ]);
          questions = {
            success: true,
            data: {
              technical: tech.data?.technical || [],
              behavioral: behavioral.data?.behavioral || []
            }
          };
          break;
        default:
          questions = await apiService.getQuestions({ limit });
      }
      
      return questions;
    } catch (error) {
      console.error('Error loading interview questions:', error);
      throw error;
    }
  },

  // Submit interview answers
  async submitInterviewAnswers(answers, interviewType, difficulty = 'medium') {
    const submissionData = {
      interviewType,
      difficulty,
      answers: answers.descriptive || [],
      mcqAnswers: answers.mcq || [],
      aptitudeAnswers: answers.aptitude || [],
      timestamp: new Date().toISOString()
    };

    try {
      // Try main submission first
      return await apiService.submitInterview(submissionData);
    } catch (error) {
      console.log('Main submission failed, trying simple submit...');
      // Fallback to simple submission
      return await apiService.submitSimpleInterview(submissionData);
    }
  },

  // Quick health check
  async quickHealthCheck() {
    try {
      const response = await apiService.healthCheck();
      return {
        status: 'healthy',
        server: true,
        database: response.data?.database === 'Connected',
        message: 'All systems operational'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        server: false,
        database: false,
        message: error.message
      };
    }
  }
};

export default apiService;