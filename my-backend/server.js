const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interview', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

connectDB();

// Import your route files
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const interviewRoutes = require('./routes/interviews');
const userRoutes = require('./routes/users');

// Use your routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);
app.use("/api/chat", require("./routes/chat"));


// Health Check Route
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called from origin:', req.headers.origin);
  res.status(200).json({
    success: true,
    message: '🚀 AI Mock Interview Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: process.env.PORT,
    routes: [
      '/api/health',
      '/api/test',
      '/api/auth/register',
      '/api/auth/login',
      '/api/questions',
      '/api/questions/sample',
      '/api/interviews/submit',
      '/api/interviews/simple-submit'
    ]
  });
});

// Test route - No database required
app.get('/api/test', (req, res) => {
  console.log('✅ Test route called from origin:', req.headers.origin);
  res.json({
    success: true,
    message: 'Backend test route working! CORS is fixed!',
    data: {
      technical: [
        "Explain the Virtual DOM in React and how it improves performance.",
        "What are React Hooks and why were they introduced?",
        "Difference between state and props in React.",
        "How does React's diffing algorithm work?",
        "What are Higher-Order Components in React?"
      ],
      behavioral: [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and weaknesses?",
        "Describe a challenging project you worked on.",
        "Where do you see yourself in 5 years professionally?",
        "How do you handle tight deadlines and pressure at work?"
      ],
      mcq: [
        {
          question: "What is the output of: console.log(typeof null)?",
          options: ["object", "null", "undefined", "string"],
          correct: 0
        },
        {
          question: "Which React hook is used for side effects?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correct: 1
        }
      ],
      aptitude: [
        {
          question: "If a train travels 120 km in 2 hours, what is its speed in km/h?",
          options: ["60 km/h", "80 km/h", "100 km/h", "120 km/h"],
          correct: 0
        }
      ]
    }
  });
});

// Simple interview submission (No database required)
app.post('/api/interviews/simple-submit', (req, res) => {
  console.log('📤 Interview submission received from origin:', req.headers.origin);
  console.log('Submission data:', {
    interviewType: req.body.interviewType,
    difficulty: req.body.difficulty,
    answersCount: req.body.answers?.length,
    mcqCount: req.body.mcqAnswers?.length,
    aptitudeCount: req.body.aptitudeAnswers?.length
  });

  // Simulate AI processing
  setTimeout(() => {
    const totalScore = Math.floor(Math.random() * 30) + 70; // 70-100
    
    res.json({
      success: true,
      totalScore: totalScore,
      sectionScores: {
        descriptive: Math.floor(Math.random() * 30) + 70,
        mcq: Math.floor(Math.random() * 30) + 70,
        aptitude: Math.floor(Math.random() * 30) + 70
      },
      detailedFeedback: {
        "0": { 
          score: 8.5, 
          suggestions: [
            "Good answer structure and clarity",
            "Provided relevant examples", 
            "Could add more technical depth"
          ] 
        },
        "1": { 
          score: 7.2, 
          suggestions: [
            "Clear communication",
            "Good problem-solving approach",
            "Consider more real-world applications"
          ] 
        }
      },
      overallFeedback: {
        strengths: [
          "Excellent communication skills",
          "Strong technical foundation", 
          "Good problem-solving approach"
        ],
        improvements: [
          "Work on time management",
          "Practice more complex scenarios",
          "Improve technical depth in some areas"
        ],
        recommendation: "Great performance! With more practice, you'll be interview-ready."
      },
      message: 'Interview evaluated successfully by AI system'
    });
  }, 1500);
});

// Auth test endpoints
app.post('/api/auth/register', (req, res) => {
  console.log('👤 Registration attempt from origin:', req.headers.origin);
  console.log('User data:', { name: req.body.name, email: req.body.email });
  
  // Simulate user registration
  setTimeout(() => {
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: '123456',
        name: req.body.name,
        email: req.body.email,
        role: 'user'
      },
      token: 'mock_jwt_token_here'
    });
  }, 1000);
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt from origin:', req.headers.origin);
  console.log('Login data:', { email: req.body.email });
  
  // Simulate user login
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '123456',
        name: 'Test User',
        email: req.body.email,
        role: 'user'
      },
      token: 'mock_jwt_token_here'
    });
  }, 1000);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 Handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/test',
      'GET /api/questions',
      'GET /api/questions/sample',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/interviews/simple-submit'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 AI Mock Interview Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test Route: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Questions Route: http://localhost:${PORT}/api/questions`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📝 Available Routes:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/questions`);
  console.log(`   GET  /api/questions/sample`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/interviews/simple-submit`);
});