const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Common fields for all question types
  type: {
    type: String,
    required: true,
    enum: ['technical', 'behavioral', 'mcq', 'aptitude']
  },
  category: {
    type: String,
    required: true,
    enum: ['javascript', 'react', 'nodejs', 'html', 'css', 'soft-skills', 'problem-solving', 'logical-reasoning']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  
  // Fields for MCQ and Aptitude questions
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  
  // Fields for descriptive questions
  expectedAnswer: {
    type: String,
    trim: true
  },
  evaluationCriteria: [{
    criterion: String,
    weight: Number, // 0-1
    description: String
  }],
  
  // Fields for technical questions
  codeSnippet: String,
  programmingLanguage: String,
  
  // Metadata
  timeLimit: {
    type: Number, // in seconds
    default: 180
  },
  marks: {
    type: Number,
    default: 10
  },
  hints: [String],
  
  // Admin and moderation fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ type: 1, category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });

// Static method to get random questions
questionSchema.statics.getRandomQuestions = async function(filters = {}, limit = 10) {
  const matchStage = { isActive: true };
  
  if (filters.type) matchStage.type = filters.type;
  if (filters.category) matchStage.category = filters.category;
  if (filters.difficulty) matchStage.difficulty = filters.difficulty;
  if (filters.tags) matchStage.tags = { $in: filters.tags };
  
  const pipeline = [
    { $match: matchStage },
    { $sample: { size: limit } },
    { $project: { 
        type: 1,
        category: 1,
        difficulty: 1,
        question: 1,
        description: 1,
        options: 1,
        expectedAnswer: 1,
        evaluationCriteria: 1,
        codeSnippet: 1,
        programmingLanguage: 1,
        timeLimit: 1,
        marks: 1,
        hints: 1,
        tags: 1
      } 
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Method to increment usage count
questionSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to add rating
questionSchema.methods.addRating = async function(userId, rating, feedback = '') {
  // Remove existing rating from same user
  this.ratings = this.ratings.filter(r => r.user.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({
    user: userId,
    rating,
    feedback
  });
  
  // Calculate new average
  const totalRatings = this.ratings.length;
  const sumRatings = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
  
  return await this.save();
};

// Static method to create sample questions
questionSchema.statics.createSampleQuestions = async function(adminUserId) {
  const sampleQuestions = [
    // Technical Questions
    {
      type: 'technical',
      category: 'react',
      difficulty: 'medium',
      question: 'Explain the Virtual DOM in React and how it improves performance.',
      description: 'Explain the concept and benefits of Virtual DOM',
      expectedAnswer: 'Virtual DOM is a lightweight copy of the real DOM. React uses it to improve performance by minimizing direct DOM manipulation through diffing and reconciliation algorithms.',
      evaluationCriteria: [
        { criterion: 'Technical Accuracy', weight: 0.4, description: 'Correct explanation of Virtual DOM' },
        { criterion: 'Performance Benefits', weight: 0.3, description: 'Clear explanation of performance improvements' },
        { criterion: 'Examples', weight: 0.2, description: 'Relevant examples provided' },
        { criterion: 'Clarity', weight: 0.1, description: 'Clear and structured answer' }
      ],
      marks: 10,
      tags: ['react', 'virtual-dom', 'performance'],
      createdBy: adminUserId
    },
    {
      type: 'technical',
      category: 'react',
      difficulty: 'medium',
      question: 'What are React Hooks and why were they introduced?',
      description: 'Explain React Hooks and their purpose',
      expectedAnswer: 'Hooks are functions that let you use state and other React features without writing classes. They were introduced to solve problems with complex components, reuse stateful logic, and avoid confusing classes.',
      evaluationCriteria: [
        { criterion: 'Definition', weight: 0.3, description: 'Clear definition of Hooks' },
        { criterion: 'Benefits', weight: 0.4, description: 'Explanation of why Hooks were introduced' },
        { criterion: 'Examples', weight: 0.2, description: 'Mention of common Hooks' },
        { criterion: 'Use Cases', weight: 0.1, description: 'Appropriate use cases' }
      ],
      marks: 10,
      tags: ['react', 'hooks', 'functional-components'],
      createdBy: adminUserId
    },
    {
      type: 'technical',
      category: 'javascript',
      difficulty: 'easy',
      question: 'What is the difference between let, const, and var in JavaScript?',
      description: 'Compare variable declaration types in JavaScript',
      expectedAnswer: 'var is function-scoped and can be redeclared. let and const are block-scoped. let can be reassigned but not redeclared in same scope. const cannot be reassigned or redeclared.',
      marks: 10,
      tags: ['javascript', 'variables', 'es6'],
      createdBy: adminUserId
    },

    // Behavioral Questions
    {
      type: 'behavioral',
      category: 'soft-skills',
      difficulty: 'easy',
      question: 'Tell me about yourself and your background.',
      description: 'Standard introduction question',
      expectedAnswer: 'A structured answer covering education, experience, skills, and career goals in 2-3 minutes.',
      evaluationCriteria: [
        { criterion: 'Structure', weight: 0.3, description: 'Well-organized response' },
        { criterion: 'Relevance', weight: 0.3, description: 'Relevant information for the role' },
        { criterion: 'Clarity', weight: 0.2, description: 'Clear communication' },
        { criterion: 'Confidence', weight: 0.2, description: 'Confident delivery' }
      ],
      marks: 10,
      tags: ['introduction', 'background', 'personal'],
      createdBy: adminUserId
    },
    {
      type: 'behavioral',
      category: 'soft-skills',
      difficulty: 'medium',
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      description: 'Behavioral question about problem-solving',
      expectedAnswer: 'Use STAR method: Situation, Task, Action, Result. Describe specific challenge, your role, actions taken, and positive outcomes.',
      marks: 10,
      tags: ['problem-solving', 'challenges', 'teamwork'],
      createdBy: adminUserId
    },

    // MCQ Questions
    {
      type: 'mcq',
      category: 'javascript',
      difficulty: 'easy',
      question: 'What is the output of: console.log(typeof null)?',
      options: [
        { text: 'object', isCorrect: true },
        { text: 'null', isCorrect: false },
        { text: 'undefined', isCorrect: false },
        { text: 'string', isCorrect: false }
      ],
      description: 'JavaScript type checking question',
      marks: 1,
      tags: ['javascript', 'types', 'typeof'],
      createdBy: adminUserId
    },
    {
      type: 'mcq',
      category: 'react',
      difficulty: 'easy',
      question: 'Which React hook is used for side effects?',
      options: [
        { text: 'useState', isCorrect: false },
        { text: 'useEffect', isCorrect: true },
        { text: 'useContext', isCorrect: false },
        { text: 'useReducer', isCorrect: false }
      ],
      description: 'React Hooks knowledge',
      marks: 1,
      tags: ['react', 'hooks', 'useEffect'],
      createdBy: adminUserId
    },
    {
      type: 'mcq',
      category: 'html',
      difficulty: 'easy',
      question: 'Which HTML tag is used for the largest heading?',
      options: [
        { text: '<h1>', isCorrect: true },
        { text: '<head>', isCorrect: false },
        { text: '<heading>', isCorrect: false },
        { text: '<h6>', isCorrect: false }
      ],
      marks: 1,
      tags: ['html', 'headings'],
      createdBy: adminUserId
    },

    // Aptitude Questions
    {
      type: 'aptitude',
      category: 'problem-solving',
      difficulty: 'easy',
      question: 'If a train travels 120 km in 2 hours, what is its speed in km/h?',
      options: [
        { text: '60 km/h', isCorrect: true },
        { text: '80 km/h', isCorrect: false },
        { text: '100 km/h', isCorrect: false },
        { text: '120 km/h', isCorrect: false }
      ],
      description: 'Basic speed calculation',
      marks: 2,
      tags: ['speed', 'distance', 'time'],
      createdBy: adminUserId
    },
    {
      type: 'aptitude',
      category: 'logical-reasoning',
      difficulty: 'medium',
      question: 'What comes next in the sequence: 2, 6, 18, 54, ?',
      options: [
        { text: '108', isCorrect: false },
        { text: '162', isCorrect: true },
        { text: '216', isCorrect: false },
        { text: '270', isCorrect: false }
      ],
      description: 'Number sequence pattern recognition',
      marks: 2,
      tags: ['sequence', 'pattern', 'multiplication'],
      createdBy: adminUserId
    }
  ];

  // Add more questions to reach at least 20
  const additionalQuestions = [
    // More Technical
    {
      type: 'technical',
      category: 'react',
      difficulty: 'medium',
      question: 'What is the difference between state and props in React?',
      description: 'Compare state and props',
      expectedAnswer: 'Props are passed to component (immutable), state is managed within component (mutable). Props flow down, state can be updated with setState.',
      marks: 10,
      tags: ['react', 'state', 'props'],
      createdBy: adminUserId
    },
    {
      type: 'technical',
      category: 'nodejs',
      difficulty: 'medium',
      question: 'What is the event loop in Node.js?',
      description: 'Explain Node.js event loop mechanism',
      expectedAnswer: 'The event loop allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel when possible.',
      marks: 10,
      tags: ['nodejs', 'event-loop', 'asynchronous'],
      createdBy: adminUserId
    },

    // More Behavioral
    {
      type: 'behavioral',
      category: 'soft-skills',
      difficulty: 'medium',
      question: 'How do you handle tight deadlines and pressure at work?',
      description: 'Stress management question',
      expectedAnswer: 'Discuss prioritization, time management, communication with team, and maintaining quality under pressure.',
      marks: 10,
      tags: ['time-management', 'stress', 'deadlines'],
      createdBy: adminUserId
    },
    {
      type: 'behavioral',
      category: 'soft-skills',
      difficulty: 'hard',
      question: 'Describe a time you had a conflict with a team member and how you resolved it.',
      description: 'Conflict resolution scenario',
      expectedAnswer: 'Describe specific situation, focus on communication, understanding perspectives, and finding mutually acceptable solution.',
      marks: 10,
      tags: ['conflict-resolution', 'teamwork', 'communication'],
      createdBy: adminUserId
    },

    // More MCQ
    {
      type: 'mcq',
      category: 'css',
      difficulty: 'easy',
      question: 'What does CSS stand for?',
      options: [
        { text: 'Computer Style Sheets', isCorrect: false },
        { text: 'Creative Style System', isCorrect: false },
        { text: 'Cascading Style Sheets', isCorrect: true },
        { text: 'Colorful Style Sheets', isCorrect: false }
      ],
      marks: 1,
      tags: ['css', 'basics'],
      createdBy: adminUserId
    },
    {
      type: 'mcq',
      category: 'javascript',
      difficulty: 'medium',
      question: 'Which method is used to add an element to the end of an array?',
      options: [
        { text: 'push()', isCorrect: true },
        { text: 'pop()', isCorrect: false },
        { text: 'shift()', isCorrect: false },
        { text: 'unshift()', isCorrect: false }
      ],
      marks: 1,
      tags: ['javascript', 'arrays', 'methods'],
      createdBy: adminUserId
    },

    // More Aptitude
    {
      type: 'aptitude',
      category: 'problem-solving',
      difficulty: 'medium',
      question: 'If 5 workers complete a task in 12 days, how many days will 6 workers take?',
      options: [
        { text: '8 days', isCorrect: false },
        { text: '9 days', isCorrect: false },
        { text: '10 days', isCorrect: true },
        { text: '11 days', isCorrect: false }
      ],
      marks: 2,
      tags: ['work', 'time', 'workers'],
      createdBy: adminUserId
    },
    {
      type: 'aptitude',
      category: 'problem-solving',
      difficulty: 'easy',
      question: 'A shirt costs $40 after a 20% discount. What was the original price?',
      options: [
        { text: '$48', isCorrect: false },
        { text: '$50', isCorrect: true },
        { text: '$52', isCorrect: false },
        { text: '$55', isCorrect: false }
      ],
      marks: 2,
      tags: ['percentage', 'discount', 'price'],
      createdBy: adminUserId
    }
  ];

  const allQuestions = [...sampleQuestions, ...additionalQuestions];
  
  try {
    // Clear existing questions
    await this.deleteMany({});
    
    // Insert new questions
    await this.insertMany(allQuestions);
    
    console.log(`✅ Created ${allQuestions.length} sample questions`);
    return allQuestions;
  } catch (error) {
    console.error('Error creating sample questions:', error);
    throw error;
  }
};

module.exports = mongoose.model('Question', questionSchema);