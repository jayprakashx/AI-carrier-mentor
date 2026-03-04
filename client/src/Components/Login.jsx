import React, { useState, useEffect } from "react";

const AuthSystem = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState("signup"); // signup, verify, complete

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2}`);
    return num1 + num2;
  };

  const [captchaSolution, setCaptchaSolution] = useState(0);

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedCurrentUser = localStorage.getItem('currentUser');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
    
    // Initialize CAPTCHA
    setCaptchaSolution(generateCaptcha());
  }, []);

  // Save users and current user to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (parseInt(captchaAnswer) !== captchaSolution) {
      setError("CAPTCHA answer is incorrect");
      setCaptchaSolution(generateCaptcha());
      setCaptchaAnswer("");
      return;
    }

    if (users.find(u => u.email === email)) {
      setError("User with this email already exists");
      return;
    }

    // Simulate email verification
    setVerificationStep("verify");
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setVerificationStep("complete");
    }, 2000);
  };

  const handleVerificationComplete = (e) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      createdAt: new Date().toISOString(),
      isVerified: true,
      profile: {
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=ffffff&size=128`,
        username: `user${Date.now()}`,
        bio: "",
        location: "",
        phone: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        socialLinks: {
          linkedin: "",
          github: "",
          portfolio: ""
        },
        settings: {
          theme: "light",
          language: "english",
          privacy: "public",
          notifications: true
        }
      }
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsVerified(true);
    setVerificationStep("signup");
    
    // Reset form
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCaptchaAnswer("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (!user.isVerified) {
        setError("Please verify your email before logging in");
        return;
      }
      setCurrentUser(user);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError("Invalid email or password");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setActiveTab("profile");
    setCaptchaAnswer("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setCaptchaAnswer("");
    setVerificationStep("signup");
    setCaptchaSolution(generateCaptcha());
  };

  // Profile update functions
  const updateProfile = (updates) => {
    const updatedUser = {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        ...updates
      }
    };
    setCurrentUser(updatedUser);
    
    // Update in users array
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id ? updatedUser : user
    ));
  };

  const updateSettings = (settings) => {
    updateProfile({
      settings: {
        ...currentUser.profile.settings,
        ...settings
      }
    });
  };

  const addArrayItem = (field, item) => {
    if (item && !currentUser.profile[field].find(existing => existing.id === item.id)) {
      updateProfile({
        [field]: [...currentUser.profile[field], item]
      });
    }
  };

  const removeArrayItem = (field, itemId) => {
    updateProfile({
      [field]: currentUser.profile[field].filter(item => item.id !== itemId)
    });
  };

  const updateArrayItem = (field, itemId, updates) => {
    updateProfile({
      [field]: currentUser.profile[field].map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      currentUser.fullName,
      currentUser.profile.bio,
      currentUser.profile.location,
      currentUser.profile.skills.length > 0,
      currentUser.profile.experience.length > 0,
      currentUser.profile.education.length > 0,
      currentUser.profile.projects.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // AI Resume Score calculation
  const calculateAIResumeScore = () => {
    let score = calculateProfileCompletion();
    
    // Bonus points for complete sections
    if (currentUser.profile.skills.length >= 5) score += 10;
    if (currentUser.profile.experience.length >= 2) score += 15;
    if (currentUser.profile.education.length >= 1) score += 10;
    if (currentUser.profile.projects.length >= 3) score += 15;
    if (currentUser.profile.certifications.length >= 1) score += 5;
    
    return Math.min(score, 100);
  };

  // Profile Circle Component
  const ProfileCircle = ({ user, size = "medium" }) => {
    const sizeClasses = {
      small: "w-8 h-8 text-sm",
      medium: "w-10 h-10 text-base",
      large: "w-12 h-12 text-lg",
      xlarge: "w-16 h-16 text-xl"
    };

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-oklch(49.1% 0.27 292.581) flex items-center justify-center text-white font-semibold shadow-lg border-2 border-white`}>
        {user?.profile?.avatar ? (
          <img 
            src={user.profile.avatar} 
            alt={user.fullName} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          user?.fullName?.charAt(0)?.toUpperCase() || "U"
        )}
      </div>
    );
  };

  // If user is logged in, show dashboard
  if (currentUser) {
    return (
      <div className={`min-h-screen ${currentUser.profile.settings.theme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto p-4">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl animate-pulse">
              <div className="flex items-center">
                <span className="text-lg mr-2">✅</span>
                <span className="font-semibold">
                  Welcome back, {currentUser.fullName}!
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                <div className="relative">
                  <ProfileCircle user={currentUser} size="xlarge" />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full text-xs">
                    ✓
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
                    {currentUser.fullName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center">
                    @{currentUser.profile.username} 
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs">
                      {currentUser.profile.settings.privacy === 'public' ? 'Public' : 'Private'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {calculateAIResumeScore()}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">AI Resume Score</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105 flex items-center space-x-2"
                >
                  <ProfileCircle user={currentUser} size="small" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {calculateProfileCompletion()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-oklch(49.1% 0.27 292.581) h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
                <nav className="space-y-2">
                  {[
                    { id: "profile", label: " Basic Profile", icon: "👤" },
                    { id: "resume", label: " Resume Builder", icon: "💼" },
                    { id: "skills", label: " Skills & Expertise", icon: "🚀" },
                    { id: "experience", label: " Experience", icon: "📈" },
                    { id: "education", label: " Education", icon: "🎓" },
                    { id: "projects", label: " Projects", icon: "📁" },
                    { id: "certifications", label: " Certifications", icon: "🏆" },
                    { id: "settings", label: " Settings", icon: "⚙️" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-blue-500 to-oklch(49.1% 0.27 292.581) text-white shadow-lg' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-oklch(49.1% 0.27 292.581) rounded-2xl text-white">
                  <h3 className="font-semibold mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Skills</span>
                      <span className="font-bold">{currentUser.profile.skills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects</span>
                      <span className="font-bold">{currentUser.profile.projects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience</span>
                      <span className="font-bold">{currentUser.profile.experience.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
                        Basic Profile
                      </h2>
                      <button className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition">
                        Save Changes
                      </button>
                    </div>
                    
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-8">
                      <div className="relative">
                        <ProfileCircle user={currentUser} size="xlarge" />
                        <button className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg">
                          📷
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          Profile Picture
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Upload a professional photo for better recognition
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          id="avatar-upload"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                updateProfile({ avatar: e.target.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="avatar-upload"
                          className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition cursor-pointer"
                        >
                          Change Avatar
                        </label>
                      </div>
                    </div>

                    {/* Personal Information Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={currentUser.fullName}
                          onChange={(e) => {
                            const updatedUser = { ...currentUser, fullName: e.target.value };
                            setCurrentUser(updatedUser);
                            setUsers(prev => prev.map(user => 
                              user.id === currentUser.id ? updatedUser : user
                            ));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={currentUser.profile.username}
                          onChange={(e) => updateProfile({ username: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={currentUser.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={currentUser.profile.phone}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Bio / About *
                        </label>
                        <textarea
                          value={currentUser.profile.bio}
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                          placeholder="Tell us about yourself, your professional background, and career goals..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={currentUser.profile.location}
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Social Links</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {Object.entries(currentUser.profile.socialLinks).map(([platform, url]) => (
                          <div key={platform}>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
                              {platform} URL
                            </label>
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => updateProfile({
                                socialLinks: {
                                  ...currentUser.profile.socialLinks,
                                  [platform]: e.target.value
                                }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                              placeholder={`https://${platform}.com/yourusername`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === "skills" && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
                        Skills & Expertise
                      </h2>
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold">
                        {currentUser.profile.skills.length} Skills
                      </span>
                    </div>
                    
                    {/* Add Skill */}
                    <div className="bg-gradient-to-r from-blue-50 to-oklch(49.1% 0.27 292.581)/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Skill</h3>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          id="newSkill"
                          placeholder="Enter a skill (e.g., React, Python, UI/UX Design, Project Management)"
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById('newSkill');
                            const skill = input.value.trim();
                            if (skill) {
                              addArrayItem('skills', { id: Date.now(), name: skill, category: 'technical' });
                              input.value = '';
                            }
                          }}
                          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg hover:shadow-xl"
                        >
                          Add Skill
                        </button>
                      </div>
                    </div>

                    {/* Skills Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentUser.profile.skills.map((skill) => (
                        <div key={skill.id} className="bg-gradient-to-r from-blue-500 to-oklch(49.1% 0.27 292.581) text-white p-4 rounded-2xl flex justify-between items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <div>
                            <span className="font-semibold">{skill.name}</span>
                            <span className="block text-blue-100 text-sm mt-1">{skill.category}</span>
                          </div>
                          <button
                            onClick={() => removeArrayItem('skills', skill.id)}
                            className="text-white hover:text-red-200 transition text-xl font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {currentUser.profile.skills.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold mb-2">No skills added yet</h3>
                        <p>Start by adding your first skill to boost your resume!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resume Tab */}
                {activeTab === "resume" && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
                        AI Resume Builder
                      </h2>
                      <button className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg hover:shadow-xl">
                        📄 Download Resume (PDF)
                      </button>
                    </div>
                    
                    {/* AI Resume Score */}
                    <div className="bg-gradient-to-r from-blue-500 to-oklch(49.1% 0.27 292.581) text-white rounded-2xl p-8 mb-8">
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3">AI Resume Score</h3>
                          <p className="text-blue-100 mb-4">
                            Your resume strength based on profile completeness, skills, and experience
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl font-bold">{calculateAIResumeScore()}/100</div>
                            <div className="flex-1 bg-blue-400/30 rounded-full h-3">
                              <div 
                                className="bg-white h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${calculateAIResumeScore()}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-6xl mt-4 md:mt-0">📊</div>
                      </div>
                    </div>

                    {/* Resume Preview Sections */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Experience Preview */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                          💼 Work Experience
                          <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                            {currentUser.profile.experience.length}
                          </span>
                        </h3>
                        {currentUser.profile.experience.slice(0, 2).map((exp) => (
                          <div key={exp.id} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 last:border-0">
                            <h4 className="font-semibold text-gray-800 dark:text-white">{exp.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{exp.company} • {exp.period}</p>
                          </div>
                        ))}
                        <button 
                          onClick={() => setActiveTab('experience')}
                          className="text-blue-500 hover:text-blue-600 transition font-semibold"
                        >
                          + Add Experience
                        </button>
                      </div>

                      {/* Education Preview */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                          🎓 Education
                          <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                            {currentUser.profile.education.length}
                          </span>
                        </h3>
                        {currentUser.profile.education.slice(0, 2).map((edu) => (
                          <div key={edu.id} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 last:border-0">
                            <h4 className="font-semibold text-gray-800 dark:text-white">{edu.degree}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{edu.school} • {edu.year}</p>
                          </div>
                        ))}
                        <button 
                          onClick={() => setActiveTab('education')}
                          className="text-blue-500 hover:text-blue-600 transition font-semibold"
                        >
                          + Add Education
                        </button>
                      </div>
                    </div>

                    {/* Skills Preview */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.profile.skills.slice(0, 8).map((skill) => (
                          <span key={skill.id} className="bg-gradient-to-r from-blue-500 to-oklch(49.1% 0.27 292.581) text-white px-3 py-2 rounded-xl text-sm font-medium">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === "experience" && (
                  <ExperienceManager 
                    experience={currentUser.profile.experience}
                    onAdd={(exp) => addArrayItem('experience', { ...exp, id: Date.now() })}
                    onRemove={(id) => removeArrayItem('experience', id)}
                    onUpdate={(id, updates) => updateArrayItem('experience', id, updates)}
                  />
                )}

                {/* Education Tab */}
                {activeTab === "education" && (
                  <EducationManager 
                    education={currentUser.profile.education}
                    onAdd={(edu) => addArrayItem('education', { ...edu, id: Date.now() })}
                    onRemove={(id) => removeArrayItem('education', id)}
                    onUpdate={(id, updates) => updateArrayItem('education', id, updates)}
                  />
                )}

                {/* Projects Tab */}
                {activeTab === "projects" && (
                  <ProjectsManager 
                    projects={currentUser.profile.projects}
                    onAdd={(project) => addArrayItem('projects', { ...project, id: Date.now() })}
                    onRemove={(id) => removeArrayItem('projects', id)}
                    onUpdate={(id, updates) => updateArrayItem('projects', id, updates)}
                  />
                )}

                {/* Certifications Tab */}
                {activeTab === "certifications" && (
                  <CertificationsManager 
                    certifications={currentUser.profile.certifications}
                    onAdd={(cert) => addArrayItem('certifications', { ...cert, id: Date.now() })}
                    onRemove={(id) => removeArrayItem('certifications', id)}
                    onUpdate={(id, updates) => updateArrayItem('certifications', id, updates)}
                  />
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
                      Account Settings
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Theme Preference */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Theme Preference</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'light', label: '☀️ Light', description: 'Clean and bright' },
                            { id: 'dark', label: '🌙 Dark', description: 'Easy on the eyes' }
                          ].map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => updateSettings({ theme: theme.id })}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                currentUser.profile.settings.theme === theme.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                              }`}
                            >
                              <div className="font-semibold">{theme.label}</div>
                              <div className="text-sm opacity-75">{theme.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language Preference */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Language</h3>
                        <select
                          value={currentUser.profile.settings.language}
                          onChange={(e) => updateSettings({ language: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-600 dark:text-white"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>

                      {/* Privacy Settings */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Privacy Settings</h3>
                        <select
                          value={currentUser.profile.settings.privacy}
                          onChange={(e) => updateSettings({ privacy: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 dark:bg-gray-600 dark:text-white"
                        >
                          <option value="public">Public - Anyone can view my profile</option>
                          <option value="private">Private - Only I can view my profile</option>
                        </select>
                      </div>

                      {/* Notifications */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notifications</h3>
                        <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-xl">
                          <input
                            type="checkbox"
                            checked={currentUser.profile.settings.notifications}
                            onChange={(e) => updateSettings({ notifications: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Enable email notifications</span>
                        </label>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Security</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 transition">
                          <div className="font-semibold text-gray-800 dark:text-white">Change Password</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Update your password regularly</div>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 transition">
                          <div className="font-semibold text-gray-800 dark:text-white">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication Forms
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-oklch(49.1% 0.27 292.581) p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Email Verification Steps */}
        {verificationStep === "verify" && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl text-white">✉️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-white/80">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-white/60 text-sm mt-2">
              Click the link in your email to continue registration
            </p>
          </div>
        )}

        {verificationStep === "complete" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-white/80">Now set your password to complete registration</p>
            </div>

            <form onSubmit={handleVerificationComplete} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                  placeholder="Enter your password"
                />
                <p className="text-white/60 text-sm mt-2">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Complete Registration
              </button>
            </form>
          </div>
        )}

        {/* Regular Login/Signup */}
        {verificationStep === "signup" && (
          <>
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-400 text-green-100 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🎉</span>
                  <span className="font-semibold">
                    {isLogin ? "Welcome back!" : "Verification email sent!"}
                  </span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">
                  {isLogin ? "🔐" : "👤"}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-white/80 mt-2">
                {isLogin ? "Sign in to your account" : "Join us today"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-xl animate-shake">
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-white font-semibold mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                  placeholder="your@email.com"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-white font-semibold mb-3">
                    CAPTCHA: {captchaQuestion} = ?
                  </label>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                    placeholder="Enter the answer"
                  />
                </div>
              )}

              {(isLogin || verificationStep === "complete") && (
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all duration-300 text-white placeholder-white/60"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                {isLogin && currentUser && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span>{isLogin ? "Sign In" : "Sign Up & Verify Email"}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-white font-semibold hover:text-gray-200 transition-colors duration-300 underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Demo Users Info */}
            {users.length > 0 && isLogin && (
              <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
                <h4 className="text-sm font-semibold text-white mb-2">Demo Accounts:</h4>
                <div className="text-xs text-white/80 space-y-1">
                  {users.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.email}</span>
                      <span>- password: {user.password.replace(/./g, '*')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Component for Experience Management
const ExperienceManager = ({ experience, onAdd, onRemove, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    period: '',
    description: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ title: '', company: '', period: '', description: '', location: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
          Work Experience
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg"
        >
          + Add Experience
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Experience' : 'Add New Experience'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Period (e.g., 2020 - Present)"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition">
                {editingId ? 'Update' : 'Add'} Experience
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{exp.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.period}</p>
                {exp.location && <p className="text-gray-500 dark:text-gray-400 text-sm">{exp.location}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(exp.id);
                    setFormData(exp);
                  }}
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(exp.id)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
          </div>
        ))}
      </div>

      {experience.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold mb-2">No experience added yet</h3>
          <p>Add your work experience to build a stronger resume</p>
        </div>
      )}
    </div>
  );
};

// Similar components for Education, Projects, Certifications...
const EducationManager = ({ education, onAdd, onRemove, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    degree: '',
    school: '',
    year: '',
    grade: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ degree: '', school: '', year: '', grade: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
          Education
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg"
        >
          + Add Education
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Education' : 'Add New Education'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="School/University"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Year (e.g., 2018-2022)"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Grade/GPA"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition">
                {editingId ? 'Update' : 'Add'} Education
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{edu.degree}</h3>
                <p className="text-gray-600 dark:text-gray-300">{edu.school} • {edu.year}</p>
                {edu.grade && <p className="text-gray-500 dark:text-gray-400 text-sm">Grade: {edu.grade}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(edu.id);
                    setFormData(edu);
                  }}
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(edu.id)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            {edu.description && <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>}
          </div>
        ))}
      </div>

      {education.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold mb-2">No education added yet</h3>
          <p>Add your educational background to complete your profile</p>
        </div>
      )}
    </div>
  );
};

const ProjectsManager = ({ projects, onAdd, onRemove, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technologies: '',
    link: '',
    period: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim())
    };
    if (editingId) {
      onUpdate(editingId, projectData);
      setEditingId(null);
    } else {
      onAdd(projectData);
    }
    setFormData({ name: '', description: '', technologies: '', link: '', period: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
          Projects & Portfolio
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg"
        >
          + Add Project
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Project' : 'Add New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Technologies (comma separated)"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Project Link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Project Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition">
                {editingId ? 'Update' : 'Add'} Project
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{project.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(project.id);
                    setFormData({
                      ...project,
                      technologies: project.technologies.join(', ')
                    });
                  }}
                  className="text-blue-500 hover:text-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(project.id)}
                  className="text-red-500 hover:text-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
            {project.period && <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{project.period}</p>}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, index) => (
                <span key={index} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition text-sm">
                View Project →
              </a>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold mb-2">No projects added yet</h3>
          <p>Showcase your work by adding your projects and portfolio items</p>
        </div>
      )}
    </div>
  );
};

const CertificationsManager = ({ certifications, onAdd, onRemove, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', issuer: '', date: '', link: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-oklch(49.1% 0.27 292.581) bg-clip-text text-transparent">
          Certifications & Achievements
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-semibold shadow-lg"
        >
          + Add Certification
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Certification' : 'Add New Certification'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Certification Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Date (e.g., June 2023)"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Credential Link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition">
                {editingId ? 'Update' : 'Add'} Certification
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {certifications.map((cert) => (
          <div key={cert.id} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{cert.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{cert.issuer}</p>
                {cert.date && <p className="text-gray-500 dark:text-gray-400 text-sm">{cert.date}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(cert.id);
                    setFormData(cert);
                  }}
                  className="text-blue-500 hover:text-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(cert.id)}
                  className="text-red-500 hover:text-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            {cert.link && (
              <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition text-sm">
                View Credential →
              </a>
            )}
          </div>
        ))}
      </div>

      {certifications.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">No certifications added yet</h3>
          <p>Add your certifications and achievements to showcase your expertise</p>
        </div>
      )}
    </div>
  );
};

export default AuthSystem;