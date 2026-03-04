const express = require('express');
const router = express.Router();

// Complete questions data - 30 TOTAL QUESTIONS
const questionsData = {
  technical: [
    {
      question: "What is the Virtual DOM in React?",
      options: [
        "A direct representation of the actual DOM",
        "A lightweight copy of the real DOM for performance optimization", 
        "A 3D visualization of DOM elements",
        "A backup of the DOM structure"
      ],
      correct: 1
    },
    {
      question: "Which React hook is used for side effects?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correct: 1
    },
    {
      question: "What is the purpose of keys in React lists?",
      options: [
        "For styling elements",
        "To help React identify which items have changed",
        "To encrypt component data", 
        "To create unique CSS classes"
      ],
      correct: 1
    },
    {
      question: "What does JSX stand for?",
      options: [
        "JavaScript XML",
        "Java Syntax Extension", 
        "JavaScript Extension",
        "Java XML Syntax"
      ],
      correct: 0
    },
    {
      question: "Which method is used to update state in React?",
      options: ["setState()", "updateState()", "modifyState()", "changeState()"],
      correct: 0
    },
    {
      question: "What is the output of: console.log(typeof null)?",
      options: ["object", "null", "undefined", "string"],
      correct: 0
    },
    {
      question: "Which HTML tag is used for the largest heading?",
      options: ["<h1>", "<head>", "<heading>", "<h6>"],
      correct: 0
    },
    {
      question: "What does CSS stand for?",
      options: [
        "Computer Style Sheets",
        "Creative Style System", 
        "Cascading Style Sheets",
        "Colorful Style Sheets"
      ],
      correct: 2
    },
    {
      question: "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct: 0
    },
    {
      question: "What is closure in JavaScript?",
      options: [
        "A function that has access to variables from its outer scope",
        "A way to close browser tabs",
        "A method to hide HTML elements", 
        "A type of loop in JavaScript"
      ],
      correct: 0
    },
    {
      question: "What is the purpose of npm?",
      options: [
        "Node Package Manager for JavaScript libraries",
        "New Project Manager",
        "Network Performance Monitor", 
        "Node Program Manager"
      ],
      correct: 0
    },
    {
      question: "Which HTTP method is used for updating data?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correct: 2
    },
    {
      question: "What is a promise in JavaScript?",
      options: [
        "An object representing eventual completion of an async operation",
        "A guarantee of code execution",
        "A type of variable", 
        "A conditional statement"
      ],
      correct: 0
    },
    {
      question: "Which symbol is used for single-line comments in JavaScript?",
      options: ["//", "/*", "#", "--"],
      correct: 0
    },
    {
      question: "What is the purpose of localStorage?",
      options: [
        "To store data locally in the browser with no expiration",
        "To cache server responses",
        "To store session data", 
        "To manage CSS styles"
      ],
      correct: 0
    },
    {
      question: "What does API stand for?",
      options: [
        "Application Programming Interface", 
        "Advanced Programming Instruction",
        "Application Process Integration",
        "Automated Programming Interface"
      ],
      correct: 0
    },
    {
      question: "Which method converts JSON string to JavaScript object?",
      options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
      correct: 0
    },
    {
      question: "What is the default port for HTTP?",
      options: ["80", "443", "8080", "3000"],
      correct: 0
    },
    {
      question: "Which CSS property is used for element positioning?",
      options: ["position", "display", "float", "align"],
      correct: 0
    },
    {
      question: "What is the purpose of Git?",
      options: [
        "Version control system for tracking code changes",
        "A text editor",
        "A database management system", 
        "A web server"
      ],
      correct: 0
    }
  ],
  behavioral: [
    {
      question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
      options: [
        "I avoided difficult projects",
        "I asked for help and researched solutions", 
        "I postponed the project",
        "I delegated all difficult tasks"
      ],
      correct: 1
    },
    {
      question: "How do you handle tight deadlines and pressure at work?",
      options: [
        "I panic and rush through work",
        "I prioritize tasks and communicate with the team", 
        "I ignore deadlines",
        "I work alone without informing others"
      ],
      correct: 1
    },
    {
      question: "Describe a time you had a conflict with a team member and how you resolved it.",
      options: [
        "I avoided the person",
        "I communicated openly and found a compromise", 
        "I complained to the manager immediately",
        "I ignored the conflict"
      ],
      correct: 1
    },
    {
      question: "How do you approach learning new technologies or frameworks?",
      options: [
        "I avoid learning new things",
        "I take online courses and build practice projects", 
        "I wait for someone to teach me",
        "I only learn when forced"
      ],
      correct: 1
    },
    {
      question: "What motivates you to do your best work?",
      options: [
        "Only salary and benefits",
        "Challenging problems and learning opportunities", 
        "Avoiding criticism",
        "Competition with colleagues"
      ],
      correct: 1
    }
  ],
  aptitude: [
    {
      question: "If a train travels 120 km in 2 hours, what is its speed in km/h?",
      options: ["60 km/h", "80 km/h", "100 km/h", "120 km/h"],
      correct: 0
    },
    {
      question: "What comes next in the sequence: 2, 6, 18, 54, ?",
      options: ["108", "162", "216", "270"],
      correct: 1
    },
    {
      question: "If 5 workers complete a task in 12 days, how many days will 6 workers take?",
      options: ["8 days", "9 days", "10 days", "11 days"],
      correct: 2
    },
    {
      question: "A shirt costs $40 after a 20% discount. What was the original price?",
      options: ["$48", "$50", "$52", "$55"],
      correct: 1
    },
    {
      question: "What is 25% of 200?",
      options: ["25", "50", "75", "100"],
      correct: 1
    }
  ]
};

// Calculate total questions
const totalQuestions = Object.values(questionsData).reduce((sum, arr) => sum + arr.length, 0);
console.log(`📊 Questions module loaded: ${totalQuestions} total questions`);

// ✅ MAIN ENDPOINT: Get all questions
router.get('/', async (req, res) => {
  try {
    const { type, limit } = req.query;
    
    console.log('📝 Questions requested:', { type, limit, from: req.headers.origin });
    
    let responseData = {};
    
    if (type && questionsData[type]) {
      // Return specific type
      const questions = questionsData[type];
      responseData[type] = limit ? questions.slice(0, parseInt(limit)) : questions;
    } else {
      // Return all types
      responseData = { ...questionsData };
    }
    
    const totalCount = Object.values(responseData).reduce((sum, arr) => sum + arr.length, 0);
    
    console.log(`✅ Sending ${totalCount} questions to ${req.headers.origin}`);
    
    res.status(200).json({
      success: true,
      count: totalCount,
      data: responseData,
      summary: {
        technical: responseData.technical?.length || 0,
        behavioral: responseData.behavioral?.length || 0, 
        aptitude: responseData.aptitude?.length || 0,
        total: totalCount
      },
      message: `${totalCount} questions loaded successfully`
    });
    
  } catch (error) {
    console.error('❌ Get questions error:', error);
    
    // Fallback response
    res.status(200).json({
      success: true,
      count: totalQuestions,
      data: questionsData,
      message: "Fallback: Questions sent successfully"
    });
  }
});

// ✅ Get questions by type
router.get('/type/:type', (req, res) => {
  const { type } = req.params;
  const { limit } = req.query;
  
  console.log(`📝 ${type} questions requested from:`, req.headers.origin);
  
  if (!questionsData[type]) {
    return res.status(404).json({
      success: false,
      message: `Question type '${type}' not found. Available: technical, behavioral, aptitude`
    });
  }
  
  const questions = questionsData[type];
  const limitedQuestions = limit ? questions.slice(0, parseInt(limit)) : questions;
  
  res.json({
    success: true,
    count: limitedQuestions.length,
    data: limitedQuestions,
    message: `${limitedQuestions.length} ${type} questions sent`
  });
});

// ✅ Get all combined MCQ questions
router.get('/mcq', (req, res) => {
  try {
    const { limit } = req.query;
    
    console.log('🎯 All MCQ questions requested from:', req.headers.origin);
    
    // Combine all questions
    const allMCQ = [
      ...questionsData.technical,
      ...questionsData.behavioral,
      ...questionsData.aptitude
    ];
    
    const limitedMCQ = limit ? allMCQ.slice(0, parseInt(limit)) : allMCQ;
    
    res.json({
      success: true,
      count: limitedMCQ.length,
      data: limitedMCQ,
      summary: {
        technical: questionsData.technical.length,
        behavioral: questionsData.behavioral.length,
        aptitude: questionsData.aptitude.length,
        total: limitedMCQ.length
      },
      message: `Combined ${limitedMCQ.length} MCQ questions`
    });
    
  } catch (error) {
    console.error('MCQ questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching MCQ questions'
    });
  }
});

// ✅ Health check for questions route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Questions route is working!',
    stats: {
      totalQuestions: totalQuestions,
      technical: questionsData.technical.length,
      behavioral: questionsData.behavioral.length,
      aptitude: questionsData.aptitude.length
    },
    availableEndpoints: [
      'GET /api/questions',
      'GET /api/questions/mcq', 
      'GET /api/questions/type/:type',
      'GET /api/questions/health',
      'GET /api/questions/test'
    ]
  });
});

// ✅ Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Questions test endpoint working!',
    sample: {
      technical: [questionsData.technical[0]],
      behavioral: [questionsData.behavioral[0]],
      aptitude: [questionsData.aptitude[0]]
    }
  });
});

// ✅ Get sample questions
router.get('/sample', (req, res) => {
  console.log('📝 Sample questions requested from:', req.headers.origin);
  
  const sampleData = {
    technical: questionsData.technical.slice(0, 2),
    behavioral: questionsData.behavioral.slice(0, 2),
    aptitude: questionsData.aptitude.slice(0, 2)
  };
  
  res.json({
    success: true,
    count: 6,
    data: sampleData,
    message: "6 sample questions sent"
  });
});

module.exports = router;