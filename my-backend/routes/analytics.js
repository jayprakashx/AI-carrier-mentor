const express = require('express');
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user analytics
router.get('/user-stats', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id });
    
    const stats = {
      totalInterviews: interviews.length,
      averageScore: 0,
      bestScore: 0,
      completionRate: 0,
      categoryPerformance: {},
      difficultyPerformance: {}
    };
    
    if (interviews.length > 0) {
      const completedInterviews = interviews.filter(i => i.status === 'evaluated');
      stats.averageScore = completedInterviews.reduce((sum, i) => 
        sum + (i.metrics.totalScore || 0), 0) / completedInterviews.length;
      stats.bestScore = Math.max(...completedInterviews.map(i => i.metrics.totalScore || 0));
      stats.completionRate = (completedInterviews.length / interviews.length) * 100;
      
      // Category performance
      const categories = ['technical', 'behavioral', 'mcq', 'aptitude'];
      categories.forEach(category => {
        const categoryInterviews = completedInterviews.filter(i => i.type.includes(category));
        if (categoryInterviews.length > 0) {
          stats.categoryPerformance[category] = categoryInterviews.reduce((sum, i) => 
            sum + (i.metrics.totalScore || 0), 0) / categoryInterviews.length;
        }
      });
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Get progress over time
router.get('/progress', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      userId: req.user.id,
      status: 'evaluated'
    }).sort({ completedAt: 1 });
    
    const progress = interviews.map(interview => ({
      date: interview.completedAt,
      score: interview.metrics.totalScore,
      type: interview.type
    }));
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
});

module.exports = router;