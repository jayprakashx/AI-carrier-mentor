const express = require('express');
const { body, validationResult } = require('express-validator');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// AI Evaluation Simulation (Replace with actual AI service)
const evaluateAnswerWithAI = async (question, answer) => {
  // Simulate AI evaluation - Replace this with actual AI service call
  return new Promise((resolve) => {
    setTimeout(() => {
      const scores = {
        clarity: Math.random() * 3 + 7, // 7-10
        relevance: Math.random() * 3 + 7,
        technicalAccuracy: Math.random() * 3 + 7,
        communication: Math.random() * 3 + 7,
        examples: Math.random() * 3 + 7
      };

      const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
      
      const feedback = {
        strengths: [
          'Good structure and organization',
          'Relevant examples provided',
          'Clear communication'
        ],
        improvements: [
          'Could provide more technical depth',
          'Consider adding more real-world examples',
          'Work on time management'
        ],
        overallFeedback: 'Solid answer with good fundamentals. Consider diving deeper into technical aspects.'
      };

      resolve({
        score: Math.round(overallScore * 10) / 10,
        feedback,
        aiEvaluation: scores
      });
    }, 1000);
  });
};

// @desc    Start new interview
// @route   POST /api/interviews/start
// @access  Private
router.post('/start', protect, [
  body('interviewType')
    .isIn(['full', 'technical', 'behavioral'])
    .withMessage('Invalid interview type'),
  
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { interviewType, difficulty, settings = {} } = req.body;

    // Determine question counts based on interview type
    let questionFilters = {};
    let questionCounts = {};

    if (interviewType === 'full') {
      questionCounts = {
        technical: 5,
        behavioral: 5,
        mcq: 5,
        aptitude: 5
      };
    } else if (interviewType === 'technical') {
      questionCounts = {
        technical: 10,
        mcq: 5,
        aptitude: 5
      };
    } else if (interviewType === 'behavioral') {
      questionCounts = {
        behavioral: 10,
        mcq: 5,
        aptitude: 5
      };
    }

    // Get questions for each type
    const allQuestions = [];
    
    for (const [type, count] of Object.entries(questionCounts)) {
      const questions = await Question.getRandomQuestions({ 
        type, 
        difficulty 
      }, count);
      allQuestions.push(...questions);
    }

    if (allQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for the selected criteria'
      });
    }

    // Extract question IDs
    const questionIds = allQuestions.map(q => q._id);

    // Create interview
    const interview = await Interview.create({
      user: req.user.id,
      interviewType,
      difficulty,
      questions: questionIds,
      settings: {
        cameraRequired: settings.cameraRequired || true,
        faceDetection: settings.faceDetection || true,
        audioRecording: settings.audioRecording || false,
        timeLimit: settings.timeLimit || 45,
        fullScreen: settings.fullScreen || true,
        ...settings
      },
      metrics: {
        totalQuestions: allQuestions.length,
        answeredQuestions: 0,
        timeUsed: 0,
        faceDetectionWarnings: 0,
        tabSwitchCount: 0,
        completionRate: 0
      },
      deviceInfo: req.body.deviceInfo || {},
      ipAddress: req.ip
    });

    // Populate questions for response
    await interview.populate('questions', 'type category difficulty question options');

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      data: interview
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting interview',
      error: error.message
    });
  }
});

// @desc    Submit interview answers
// @route   POST /api/interviews/:id/submit
// @access  Private
router.post('/:id/submit', protect, [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  
  body('mcqAnswers')
    .optional()
    .isArray()
    .withMessage('MCQ answers must be an array'),
  
  body('aptitudeAnswers')
    .optional()
    .isArray()
    .withMessage('Aptitude answers must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const interview = await Interview.findById(req.params.id)
      .populate('questions')
      .populate('user');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user owns the interview
    if (interview.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this interview'
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview already completed'
      });
    }

    const { answers, mcqAnswers = [], aptitudeAnswers = [], metrics = {}, settings = {} } = req.body;

    // Process descriptive answers with AI evaluation
    const processedAnswers = [];
    const detailedFeedback = new Map();

    for (let i = 0; i < answers.length; i++) {
      const answerData = answers[i];
      const question = interview.questions.find(q => 
        q._id.toString() === answerData.questionId
      );

      if (question && answerData.answer.trim()) {
        // Evaluate answer with AI
        const evaluation = await evaluateAnswerWithAI(question, answerData.answer);

        const answerObj = {
          questionId: question._id,
          questionText: question.question,
          answer: answerData.answer,
          timeTaken: answerData.timeTaken || 0,
          audioRecording: answerData.audioRecording,
          score: evaluation.score,
          feedback: evaluation.feedback,
          aiEvaluation: evaluation.aiEvaluation
        };

        processedAnswers.push(answerObj);
        
        // Store detailed feedback
        detailedFeedback.set(i.toString(), {
          score: evaluation.score,
          suggestions: [
            ...evaluation.feedback.strengths,
            ...evaluation.feedback.improvements
          ],
          aiScores: evaluation.aiEvaluation
        });
      }
    }

    // Process MCQ answers
    const processedMcqAnswers = mcqAnswers.map(mcq => {
      const question = interview.questions.find(q => 
        q._id.toString() === mcq.questionId
      );
      
      if (question && question.options) {
        const correctOption = question.options.findIndex(opt => opt.isCorrect);
        return {
          questionId: question._id,
          questionText: question.question,
          selectedOption: mcq.selectedOption,
          isCorrect: mcq.selectedOption === correctOption,
          correctOption: correctOption,
          timeTaken: mcq.timeTaken || 0
        };
      }
      return null;
    }).filter(Boolean);

    // Process aptitude answers (similar to MCQ)
    const processedAptitudeAnswers = aptitudeAnswers.map(aptitude => {
      const question = interview.questions.find(q => 
        q._id.toString() === aptitude.questionId
      );
      
      if (question && question.options) {
        const correctOption = question.options.findIndex(opt => opt.isCorrect);
        return {
          questionId: question._id,
          questionText: question.question,
          selectedOption: aptitude.selectedOption,
          isCorrect: aptitude.selectedOption === correctOption,
          correctOption: correctOption,
          timeTaken: aptitude.timeTaken || 0
        };
      }
      return null;
    }).filter(Boolean);

    // Update interview
    interview.answers = processedAnswers;
    interview.mcqAnswers = processedMcqAnswers;
    interview.aptitudeAnswers = processedAptitudeAnswers;
    interview.metrics = { ...interview.metrics, ...metrics };
    interview.settings = { ...interview.settings, ...settings };
    interview.status = 'completed';
    interview.completedAt = new Date();
    
    // Calculate scores
    interview.calculateScores();
    interview.generateOverallFeedback();
    interview.evaluation.detailedFeedback = Object.fromEntries(detailedFeedback);
    interview.evaluatedAt = new Date();

    await interview.save();

    // Update user stats
    const timeSpent = Math.round(interview.duration / 60); // in minutes
    interview.user.updateInterviewStats(interview.evaluation.totalScore, timeSpent);
    await interview.user.save();

    res.status(200).json({
      success: true,
      message: 'Interview submitted successfully',
      data: {
        interviewId: interview._id,
        totalScore: interview.evaluation.totalScore,
        sectionScores: interview.evaluation.sectionScores,
        detailedFeedback: interview.evaluation.detailedFeedback,
        overallFeedback: interview.evaluation.overallFeedback,
        aiAnalysis: interview.evaluation.aiAnalysis
      }
    });
  } catch (error) {
    console.error('Submit interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting interview',
      error: error.message
    });
  }
});

// @desc    Get user's interview history
// @route   GET /api/interviews/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const interviews = await Interview.getUserInterviews(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('Get interview history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview history',
      error: error.message
    });
  }
});

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('questions')
      .populate('user', 'name email profile');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user owns the interview
    if (interview.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this interview'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview',
      error: error.message
    });
  }
});

// @desc    Get interview analytics
// @route   GET /api/interviews/analytics/overview
// @access  Private
router.get('/analytics/overview', protect, async (req, res) => {
  try {
    const userStats = await User.findById(req.user.id).select('interviewStats');
    
    const recentInterviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('interviewType difficulty evaluation.totalScore completedAt');

    const scoreProgress = await Interview.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $sort: { completedAt: 1 } },
      { $project: { 
          date: '$completedAt', 
          score: '$evaluation.totalScore',
          interviewType: 1 
        } 
      },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats: userStats.interviewStats,
        recentInterviews,
        scoreProgress,
        improvementAreas: [
          'Technical Depth',
          'Communication Skills',
          'Problem Solving',
          'Time Management'
        ]
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

module.exports = router;