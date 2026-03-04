import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  X,
  AlertCircle,
  Star,
  Target,
  Zap,
  Download,
  Edit,
  Shield,
  Clock,
  BarChart3,
  Search,
  Eye,
  FileCheck,
  Award,
  TrendingUp,
  FileDown,
  Calendar,
  User
} from 'lucide-react';

// ATS Checker Main Component
const ATSChecker = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Simulated ATS analysis results
  const simulateATSAnalysis = () => {
    return {
      score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
      strengths: [
        'Clear contact information',
        'Professional summary present',
        'Relevant skills section',
        'Good use of action verbs',
        'Appropriate length'
      ],
      improvements: [
        'Missing quantifiable achievements',
        'Could use more industry keywords',
        'Formatting issues detected',
        'Skills not optimized for ATS',
        'Work experience gaps need explanation'
      ],
      keywordAnalysis: {
        missing: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        found: ['HTML', 'CSS', 'Git', 'Teamwork', 'Communication'],
        suggested: ['Frontend Development', 'Web Applications', 'REST APIs', 'Database Management']
      },
      formatScore: 85,
      contentScore: 72,
      keywordScore: 68,
      overallRating: 'Good',
      analysisDate: new Date().toLocaleDateString(),
      recommendations: [
        'Add 3-5 quantifiable achievements with metrics',
        'Include 5-7 more industry-specific keywords',
        'Optimize section headings for ATS parsing',
        'Remove any graphics or images',
        'Ensure consistent formatting throughout'
      ]
    };
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setFileName(file.name);
    
    // Simulate upload and analysis progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Simulate analysis completion
          setTimeout(() => {
            const results = simulateATSAnalysis();
            setAnalysisResults(results);
            setAtsScore(results.score);
            setIsUploading(false);
            setCurrentStep(2);
          }, 1000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const retryAnalysis = () => {
    setCurrentStep(1);
    setAtsScore(0);
    setAnalysisResults(null);
    setFileName('');
  };

  // Generate and download detailed PDF report
  const downloadDetailedReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      // Create a comprehensive report object
      const reportData = {
        fileName: fileName,
        analysisDate: analysisResults.analysisDate,
        overallScore: analysisResults.score,
        detailedScores: {
          format: analysisResults.formatScore,
          content: analysisResults.contentScore,
          keywords: analysisResults.keywordScore
        },
        strengths: analysisResults.strengths,
        improvements: analysisResults.improvements,
        keywordAnalysis: analysisResults.keywordAnalysis,
        recommendations: analysisResults.recommendations,
        overallRating: analysisResults.overallRating
      };

      // Create a blob with the report data (in real implementation, this would be a PDF)
      const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      // Create download link
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Report_${fileName.replace(/\.[^/.]+$/, "")}_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsGeneratingReport(false);
    }, 2000);
  };

  // Score display component with animation
  const ScoreDisplay = ({ score }) => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative w-48 h-48 mx-auto mb-8"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className={`text-5xl font-bold ${
            score >= 80 ? 'text-green-600' :
            score >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {score}
          </div>
          <div className="text-gray-600 text-sm mt-2">ATS Score</div>
          <div className={`text-sm font-semibold ${
            score >= 80 ? 'text-green-600' :
            score >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </motion.div>
      </div>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={
            score >= 80 ? '#10b981' :
            score >= 60 ? '#f59e0b' : '#ef4444'
          }
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: '0 283' }}
          animate={{ strokeDasharray: `${(score / 100) * 283} 283` }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FileCheck className="text-white" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              AI Resume ATS Checker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get your resume ATS-ready with our intelligent analysis. 
            Optimize for applicant tracking systems and land more interviews.
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & Results */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              
              {/* Progress Steps */}
              <div className="flex border-b border-gray-200">
                <div className={`flex-1 py-4 text-center font-semibold ${
                  currentStep === 1 ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Resume
                  </div>
                </div>
                <div className={`flex-1 py-4 text-center font-semibold ${
                  currentStep === 2 ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 size={20} />
                    ATS Analysis
                  </div>
                </div>
              </div>

              {/* Step 1: Upload Resume */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Upload Your Resume
                      </h2>
                      <p className="text-gray-600">
                        Get instant ATS compatibility analysis and improvement suggestions
                      </p>
                    </div>

                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer mb-6
                        ${isDragOver 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-indigo-400'
                        }
                        ${isUploading ? 'pointer-events-none opacity-70' : ''}
                      `}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => document.getElementById('resume-file').click()}
                    >
                      {isUploading ? (
                        <div className="space-y-6">
                          <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-3 text-lg">
                              Analyzing Your Resume...
                            </p>
                            <p className="text-gray-600 mb-4">
                              AI is scanning for ATS compatibility and optimization opportunities
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              {uploadProgress}% Complete
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <Upload className="text-indigo-600" size={32} />
                          </div>
                          <p className="text-gray-900 font-semibold text-xl mb-3">
                            Drop your resume here
                          </p>
                          <p className="text-gray-600 text-lg mb-4">
                            or click to browse files
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports PDF, DOC, DOCX • Max 5MB
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* Features List */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Shield className="text-green-500" size={20} />
                        <span>Secure & confidential analysis</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Zap className="text-yellow-500" size={20} />
                        <span>Instant ATS compatibility check</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Target className="text-blue-500" size={20} />
                        <span>Keyword optimization tips</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileDown className="text-purple-500" size={20} />
                        <span>Download detailed PDF report</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Analysis Results */}
                {currentStep === 2 && analysisResults && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ATS Analysis Complete
                      </h2>
                      <p className="text-gray-600">
                        Your resume analysis for <span className="font-semibold">{fileName}</span>
                      </p>
                    </div>

                    {/* Score Display */}
                    <ScoreDisplay score={atsScore} />

                    {/* Detailed Scores */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{analysisResults.formatScore}%</div>
                        <div className="text-sm text-gray-600">Format Score</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{analysisResults.contentScore}%</div>
                        <div className="text-sm text-gray-600">Content Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{analysisResults.keywordScore}%</div>
                        <div className="text-sm text-gray-600">Keyword Score</div>
                      </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Strengths */}
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-green-600 mb-4">
                          <CheckCircle size={20} />
                          Strengths
                        </h3>
                        <div className="space-y-3">
                          {analysisResults.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="text-green-500" size={16} />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-600 mb-4">
                          <AlertCircle size={20} />
                          Areas to Improve
                        </h3>
                        <div className="space-y-3">
                          {analysisResults.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                              <AlertCircle className="text-orange-500" size={16} />
                              <span className="text-sm">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Keyword Analysis */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <Search size={20} />
                        Keyword Analysis
                      </h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">Keywords Found</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywordAnalysis.found.map((keyword, index) => (
                              <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">Missing Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywordAnalysis.missing.map((keyword, index) => (
                              <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">Suggested Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywordAnalysis.suggested.map((keyword, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Recommendations */}
                    <div className="mt-8 p-6 bg-indigo-50 rounded-xl">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-900 mb-4">
                        <Target size={20} />
                        Actionable Recommendations
                      </h3>
                      <div className="space-y-3">
                        {analysisResults.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Generation Section */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-900 mb-4">
                        <FileDown size={20} />
                        Download Detailed Report
                      </h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Get a comprehensive PDF report with all analysis details, actionable insights, 
                        and step-by-step improvement guide.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Analysis date: {analysisResults.analysisDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Personalized recommendations</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={retryAnalysis}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition"
                        >
                          Analyze Another Resume
                        </button>
                        <button 
                          onClick={downloadDetailedReport}
                          disabled={isGeneratingReport}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isGeneratingReport ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating Report...
                            </>
                          ) : (
                            <>
                              <Download size={20} />
                              Download Detailed Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column - Tips & Information */}
          <div className="space-y-6">
            {/* ATS Tips Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Award className="text-indigo-600" size={20} />
                ATS Optimization Tips
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Use standard section headings (Experience, Education, Skills)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Include relevant keywords from job descriptions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Avoid images, tables, and complex formatting</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Use common fonts (Arial, Calibri, Times New Roman)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Save as PDF for best compatibility</span>
                </div>
              </div>
            </motion.div>

            {/* Why ATS Matters */}
            <motion.div
              className="bg-indigo-600 rounded-2xl shadow-xl p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Eye size={20} />
                Why ATS Matters
              </h3>
              <div className="space-y-3 text-sm text-indigo-100">
                <p>✅ 75% of resumes are rejected by ATS before human review</p>
                <p>✅ ATS-friendly resumes get 40% more interviews</p>
                <p>✅ Proper keywords can increase visibility by 60%</p>
                <p>✅ Optimized formatting ensures your resume gets read</p>
              </div>
            </motion.div>

            {/* Report Features */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <FileDown className="text-green-600" size={20} />
                Detailed Report Includes
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Complete ATS score breakdown</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Keyword analysis and suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Step-by-step improvement guide</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Industry-specific recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>ATS optimization checklist</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSChecker;