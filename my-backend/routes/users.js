const express = require('express');
const User = require('../models/User');
const Interview = require('../models/Interview');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent interviews
    const recentInterviews = await Interview.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('interviewType difficulty evaluation.totalScore completedAt status');

    res.status(200).json({
      success: true,
      data: {
        user: user.fullProfile,
        recentInterviews
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('interviewStats');
    
    const totalInterviews = await Interview.countDocuments({ 
      user: req.user.id, 
      status: 'completed' 
    });
    
    const recentInterviews = await Interview.find({ 
      user: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('interviewType difficulty evaluation.totalScore completedAt');

    const averageScore = user.interviewStats.averageScore;
    const bestScore = user.interviewStats.bestScore;
    const totalTime = user.interviewStats.totalTimeSpent;

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        averageScore: Math.round(averageScore),
        bestScore,
        totalTime,
        recentInterviews,
        progress: Math.min((totalInterviews / 20) * 100, 100) // Progress towards 20 interviews
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;