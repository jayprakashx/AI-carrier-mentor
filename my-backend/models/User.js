const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    bio: String,
    skills: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },
    resume: String,
    profilePicture: String
  },
  interviewStats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 } // in minutes
  },
  preferences: {
    interviewTypes: [String],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update interview stats method
userSchema.methods.updateInterviewStats = function(newScore, timeSpent) {
  this.interviewStats.totalInterviews += 1;
  this.interviewStats.totalTimeSpent += timeSpent;
  
  // Update average score
  const totalScore = (this.interviewStats.averageScore * (this.interviewStats.totalInterviews - 1)) + newScore;
  this.interviewStats.averageScore = totalScore / this.interviewStats.totalInterviews;
  
  // Update best score
  if (newScore > this.interviewStats.bestScore) {
    this.interviewStats.bestScore = newScore;
  }
};

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profile: this.profile,
    interviewStats: this.interviewStats,
    preferences: this.preferences,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

module.exports = mongoose.model('User', userSchema);