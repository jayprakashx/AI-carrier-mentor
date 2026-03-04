const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  questionText: String,
  answer: String,
  timeTaken: Number, // in seconds
  audioRecording: String, // URL to audio file if any
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    overallFeedback: String
  },
  aiEvaluation: {
    clarity: Number,
    relevance: Number,
    technicalAccuracy: Number,
    communication: Number,
    examples: Number
  }
});

const mcqAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  questionText: String,
  selectedOption: Number,
  isCorrect: Boolean,
  correctOption: Number,
  timeTaken: Number
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewType: {
    type: String,
    required: true,
    enum: ['full', 'technical', 'behavioral']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  
  // Questions and Answers
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  answers: [answerSchema],
  mcqAnswers: [mcqAnswerSchema],
  aptitudeAnswers: [mcqAnswerSchema],
  
  // Settings and Configuration
  settings: {
    cameraRequired: Boolean,
    faceDetection: Boolean,
    audioRecording: Boolean,
    timeLimit: Number, // in minutes
    fullScreen: Boolean
  },
  
  // Metrics and Analytics
  metrics: {
    totalQuestions: Number,
    answeredQuestions: Number,
    timeUsed: Number, // in seconds
    faceDetectionWarnings: Number,
    tabSwitchCount: Number,
    completionRate: Number
  },
  
  // AI Evaluation Results
  evaluation: {
    totalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    sectionScores: {
      descriptive: Number,
      mcq: Number,
      aptitude: Number
    },
    detailedFeedback: Map, // questionId -> feedback object
    overallFeedback: {
      strengths: [String],
      improvements: [String],
      recommendation: String
    },
    aiAnalysis: {
      communicationSkills: Number,
      technicalKnowledge: Number,
      problemSolving: Number,
      confidenceLevel: Number
    }
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'cancelled', 'evaluated'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  evaluatedAt: Date,
  
  // Technical Metadata
  deviceInfo: {
    browser: String,
    os: String,
    screenResolution: String,
    userAgent: String
  },
  ipAddress: String
}, {
  timestamps: true
});

// Indexes for efficient querying
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ 'evaluation.totalScore': -1 });

// Virtual for interview duration
interviewSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000); // in seconds
  }
  return 0;
});

// Method to calculate scores
interviewSchema.methods.calculateScores = function() {
  let descriptiveScore = 0;
  let mcqScore = 0;
  let aptitudeScore = 0;
  
  // Calculate descriptive scores
  this.answers.forEach(answer => {
    if (answer.score) {
      descriptiveScore += answer.score;
    }
  });
  
  // Calculate MCQ scores
  this.mcqAnswers.forEach(answer => {
    if (answer.isCorrect) {
      mcqScore += 1; // 1 mark per correct MCQ
    }
  });
  
  // Calculate aptitude scores
  this.aptitudeAnswers.forEach(answer => {
    if (answer.isCorrect) {
      aptitudeScore += 2; // 2 marks per correct aptitude question
    }
  });
  
  // Calculate total score (descriptive: 70%, mcq: 15%, aptitude: 15%)
  const totalScore = (
    (descriptiveScore / (this.answers.length * 10)) * 70 + // descriptive out of 70
    (mcqScore / this.mcqAnswers.length) * 15 + // mcq out of 15
    (aptitudeScore / (this.aptitudeAnswers.length * 2)) * 15 // aptitude out of 15
  );
  
  this.evaluation.sectionScores = {
    descriptive: Math.round((descriptiveScore / (this.answers.length * 10)) * 100),
    mcq: Math.round((mcqScore / this.mcqAnswers.length) * 100),
    aptitude: Math.round((aptitudeScore / (this.aptitudeAnswers.length * 2)) * 100)
  };
  
  this.evaluation.totalScore = Math.round(totalScore);
  
  return this.evaluation.totalScore;
};

// Method to generate overall feedback
interviewSchema.methods.generateOverallFeedback = function() {
  const totalScore = this.evaluation.totalScore;
  
  let recommendation = '';
  let strengths = [];
  let improvements = [];
  
  if (totalScore >= 80) {
    recommendation = 'Excellent performance! You are well-prepared for real interviews.';
    strengths = ['Strong technical knowledge', 'Good communication skills', 'Excellent problem-solving abilities'];
  } else if (totalScore >= 60) {
    recommendation = 'Good performance. Some areas need improvement.';
    strengths = ['Solid foundation', 'Reasonable communication'];
    improvements = ['Work on technical depth', 'Practice more complex problems'];
  } else {
    recommendation = 'Needs significant improvement. Focus on fundamentals.';
    improvements = ['Strengthen basic concepts', 'Improve communication', 'Practice more mock interviews'];
  }
  
  this.evaluation.overallFeedback = {
    strengths,
    improvements,
    recommendation
  };
  
  return this.evaluation.overallFeedback;
};

// Static method to get user's interview history
interviewSchema.statics.getUserInterviews = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('questions', 'type category difficulty question')
    .select('-answers -mcqAnswers -aptitudeAnswers -deviceInfo -ipAddress');
};

module.exports = mongoose.model('Interview', interviewSchema);