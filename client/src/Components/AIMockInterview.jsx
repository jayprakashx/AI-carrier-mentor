import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../services/api";

// Empty question database - will be fetched from backend ONLY
const questionDatabase = {
  technical: [],
  behavioral: [],
  mcq: [],
  aptitude: []
};

const evaluationCriteria = [
  { weight: 0.3, criteria: "Clarity and structure of answer" },
  { weight: 0.25, criteria: "Relevance to the question asked" },
  { weight: 0.2, criteria: "Technical accuracy and depth" },
  { weight: 0.15, criteria: "Communication skills and confidence" },
  { weight: 0.1, criteria: "Examples and real-world application" },
];

// Enhanced siren function with better error handling
const generateSirenSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
    
    oscillator.start();
    
    return {
      stop: () => {
        try {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 100);
        } catch (error) {
          console.error('Error stopping siren:', error);
        }
      },
      audioContext
    };
  } catch (error) {
    console.error('Error creating siren sound:', error);
    return {
      stop: () => {}
    };
  }
};

// Text-to-Speech function
const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.includes('en'));
    
    if (englishVoice) {
      speech.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(speech);
    return speech;
  }
  return null;
};

// Enhanced Speech-to-Text function
const initializeSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    return null;
  }

  return SpeechRecognition;
};

// Enhanced Face Detection with better simulation
const loadFaceDetectionModel = async () => {
  try {
    let faceDetectionCount = 0;
    let lastFaceTime = Date.now();
    
    return {
      detectFaces: async (videoElement) => {
        return new Promise((resolve) => {
          if (!videoElement || videoElement.readyState !== 4) {
            faceDetectionCount = Math.max(0, faceDetectionCount - 1);
            resolve(0);
            return;
          }

          const hasVideo = videoElement.readyState === 4 && 
                         videoElement.videoWidth > 0 && 
                         videoElement.videoHeight > 0;
          
          if (!hasVideo) {
            faceDetectionCount = Math.max(0, faceDetectionCount - 1);
            resolve(0);
            return;
          }

          const faceDetected = Math.random() > 0.3;
          
          if (faceDetected) {
            faceDetectionCount = 0;
            lastFaceTime = Date.now();
            resolve(1);
          } else {
            faceDetectionCount++;
            resolve(0);
          }
        });
      },
      dispose: () => {}
    };
  } catch (error) {
    console.error('Error loading face detection model:', error);
    return null;
  }
};

export default function AIMockInterview() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [cameraError, setCameraError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [cameraRequired, setCameraRequired] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [networkWarning, setNetworkWarning] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interviewMode, setInterviewMode] = useState("text");
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(true);
  const [faceVisible, setFaceVisible] = useState(true);
  const [faceWarning, setFaceWarning] = useState(false);
  const [faceDetectionCount, setFaceDetectionCount] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [interviewType, setInterviewType] = useState("full");
  const [currentSection, setCurrentSection] = useState("descriptive");
  const [backendConnected, setBackendConnected] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [submissionError, setSubmissionError] = useState("");
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [aptitudeQuestions, setAptitudeQuestions] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sirenRef = useRef(null);
  const fullscreenRef = useRef(null);
  const sirenIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const lastFaceDetectionTime = useRef(Date.now());
  const networkCheckIntervalRef = useRef(null);

  // Backend Health Check
  useEffect(() => {
    checkBackendConnection();
    
    const handleOnline = () => {
      setNetworkStatus('online');
      setNetworkWarning(false);
      stopSiren();
      checkBackendConnection();
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      setNetworkWarning(true);
      startSiren();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    networkCheckIntervalRef.current = setInterval(() => {
      checkNetworkQuality();
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
      }
    };
  }, []);

  const checkNetworkQuality = async () => {
    if (!navigator.onLine) {
      setNetworkWarning(true);
      startSiren();
      return;
    }

    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
      });
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      
      if (responseTime > 2000) {
        setNetworkWarning(true);
        startSiren();
      } else {
        setNetworkWarning(false);
        stopSiren();
      }
    } catch (error) {
      setNetworkWarning(true);
      startSiren();
    }
  };

  // BACKEND ONLY - No local fallback
  const checkBackendConnection = async () => {
    try {
      const health = await apiService.healthCheck();
      setServerHealth(health);
      setBackendConnected(true);
      setNetworkWarning(false);
      console.log('✅ Backend connected successfully');
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendConnected(false);
      setNetworkWarning(true);
    }
  };

  // Load questions from backend - CORRECTED VERSION
  const loadQuestionsFromBackend = async () => {
    setLoadingQuestions(true);
    setQuestionsError("");
    try {
      console.log('📥 Loading questions from backend...');
      
      const response = await apiService.getQuestions({
        type: interviewType,
        difficulty: difficulty
      });
      
      console.log('✅ Backend response:', response);
      
      if (response.success && response.data) {
        console.log('📝 Questions data received:', response.data);
        
        // CLEAR existing questions first
        questionDatabase.technical = [];
        questionDatabase.behavioral = [];
        questionDatabase.mcq = [];
        questionDatabase.aptitude = [];
        
        // Update question database with backend data
        if (response.data.technical) {
          questionDatabase.technical = Array.isArray(response.data.technical) 
            ? response.data.technical 
            : [];
        }
        if (response.data.behavioral) {
          questionDatabase.behavioral = Array.isArray(response.data.behavioral) 
            ? response.data.behavioral 
            : [];
        }
        if (response.data.mcq) {
          questionDatabase.mcq = Array.isArray(response.data.mcq) 
            ? response.data.mcq 
            : [];
          setMcqQuestions(questionDatabase.mcq);
        }
        if (response.data.aptitude) {
          questionDatabase.aptitude = Array.isArray(response.data.aptitude) 
            ? response.data.aptitude 
            : [];
          setAptitudeQuestions(questionDatabase.aptitude);
        }
        
        console.log('✅ Updated question database counts:', {
          technical: questionDatabase.technical.length,
          behavioral: questionDatabase.behavioral.length,
          mcq: questionDatabase.mcq.length,
          aptitude: questionDatabase.aptitude.length
        });
        
        // Check if we have enough questions
        const totalQuestions = 
          questionDatabase.technical.length + 
          questionDatabase.behavioral.length + 
          questionDatabase.mcq.length + 
          questionDatabase.aptitude.length;
          
        if (totalQuestions === 0) {
          setQuestionsError("No questions available from backend. Please try again.");
          return;
        }
        
        setQuestionsLoaded(true);
        console.log('🎉 Questions loaded successfully from backend');
        
      } else {
        throw new Error('No valid questions data in response');
      }
    } catch (error) {
      console.error('❌ Failed to load questions from backend:', error);
      setQuestionsError("Failed to load questions from backend. Please check if backend is running.");
      setSubmissionError("Failed to load questions. Please check backend connection.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Initialize questions when interview starts
  useEffect(() => {
    if (interviewStarted && backendConnected && !questionsLoaded) {
      loadQuestionsFromBackend();
    }
  }, [interviewStarted, backendConnected]);

  // Initialize questions based on interview type after loading
  useEffect(() => {
    if (interviewStarted && questionsLoaded) {
      const selectedQuestions = selectQuestions();
      setCurrentQuestions(selectedQuestions);
      setUserAnswers(Array(selectedQuestions.length).fill(""));
      console.log('🎯 Current questions set:', selectedQuestions.length);
    }
  }, [interviewStarted, questionsLoaded, interviewType]);

  const selectQuestions = () => {
    const questions = [];
    
    if (interviewType === "full") {
      // Take 5 technical and 5 behavioral questions
      const techQuestions = getRandomQuestions(questionDatabase.technical, 5);
      const behavioralQuestions = getRandomQuestions(questionDatabase.behavioral, 5);
      questions.push(...techQuestions, ...behavioralQuestions);
    } else if (interviewType === "technical") {
      questions.push(...getRandomQuestions(questionDatabase.technical, 10));
    } else if (interviewType === "behavioral") {
      questions.push(...getRandomQuestions(questionDatabase.behavioral, 10));
    }
    
    console.log(`🎯 Selected ${questions.length} questions for ${interviewType} interview`);
    return questions;
  };

  const getRandomQuestions = (questionArray, count) => {
    if (!questionArray || questionArray.length === 0) {
      console.warn('No questions available in array');
      return [];
    }
    
    const shuffled = [...questionArray].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, questionArray.length));
    console.log(`📝 Selected ${selected.length} from ${questionArray.length} available questions`);
    return selected;
  };

  // Enhanced Face detection effect
  useEffect(() => {
    if (faceDetectionEnabled && cameraEnabled && interviewStarted && !interviewFinished) {
      startFaceDetection();
    } else {
      stopFaceDetection();
    }

    return () => {
      stopFaceDetection();
    };
  }, [faceDetectionEnabled, cameraEnabled, interviewStarted, interviewFinished]);

  const startFaceDetection = async () => {
    const model = await loadFaceDetectionModel();
    if (!model) {
      console.warn('Face detection model not available');
      return;
    }

    faceDetectionRef.current = model;
    
    faceCheckIntervalRef.current = setInterval(async () => {
      if (videoRef.current && faceDetectionRef.current) {
        try {
          const faceCount = await faceDetectionRef.current.detectFaces(videoRef.current);
          const currentTime = Date.now();
          lastFaceDetectionTime.current = currentTime;
          
          if (faceCount === 0) {
            setFaceDetectionCount(prev => {
              const newCount = prev + 1;
              if (newCount >= 3) {
                setFaceVisible(false);
                setFaceWarning(true);
                startSiren();
              }
              return newCount;
            });
          } else {
            setFaceDetectionCount(0);
            setFaceVisible(true);
            setFaceWarning(false);
            stopSiren();
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }, 2000);
  };

  const stopFaceDetection = () => {
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
      faceCheckIntervalRef.current = null;
    }
    if (faceDetectionRef.current) {
      faceDetectionRef.current.dispose();
      faceDetectionRef.current = null;
    }
    setFaceWarning(false);
    stopSiren();
  };

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = initializeSpeechRecognition();
    setSpeechSupported(!!SpeechRecognition);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!interviewStarted || interviewFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, interviewFinished]);

  // Camera setup effect
  useEffect(() => {
    if (cameraEnabled && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraEnabled]);

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" 
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera started successfully');
          setFaceVisible(true);
        };

        videoRef.current.onerror = () => {
          setCameraError("Camera stream error");
          setCameraEnabled(false);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions and make sure your camera is connected.");
      setCameraEnabled(false);
      setFaceVisible(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceVisible(false);
  };

  const startAudioRecording = async () => {
    try {
      setAudioError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      audioStreamRef.current = stream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setAudioError("Could not access microphone. Please check permissions.");
      setAudioEnabled(false);
    }
  };

  const stopAudioRecording = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      audioStreamRef.current = null;
    }
  };

  const startSiren = () => {
    if (!sirenPlaying) {
      try {
        stopSiren();
        const sirenSound = generateSirenSound();
        sirenRef.current = sirenSound;
        setSirenPlaying(true);
        
        sirenIntervalRef.current = setInterval(() => {
          if (sirenRef.current) {
            sirenRef.current.stop();
          }
          const newSiren = generateSirenSound();
          sirenRef.current = newSiren;
        }, 1200);
      } catch (error) {
        console.error("Error starting siren:", error);
      }
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    
    if (sirenRef.current) {
      try {
        sirenRef.current.stop();
        sirenRef.current = null;
      } catch (error) {
        console.error("Error stopping siren:", error);
      }
    }
    
    setSirenPlaying(false);
  };

  // FIXED: Fullscreen functions without errors
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreenMode(true);
      }
    } catch (err) {
      console.log('Fullscreen not available');
    }
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setFullscreenMode(false);
    } catch (err) {
      // Silently catch errors
    }
  };

  // Enhanced fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleStartInterview = async () => {
    if (!backendConnected) {
      setSubmissionError("Cannot start interview: Backend is not connected");
      return;
    }

    await enterFullscreen();
    setInterviewStarted(true);
    setTimeLeft(45 * 60);
    setCurrentSection("descriptive");
    
    if (interviewMode === "audio") {
      await startAudioRecording();
    }
  };

  const handleAnswerChange = (answer) => {
    if (cameraRequired && !cameraEnabled) {
      return;
    }

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
    
    if (answer.trim() !== "") {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
    } else {
      setAnsweredQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestion);
        return newSet;
      });
    }
  };

  const handleMcqAnswer = (questionIndex, answerIndex) => {
    const newAnswers = { ...mcqAnswers, [questionIndex]: answerIndex };
    setMcqAnswers(newAnswers);
    
    // Update answered questions
    setAnsweredQuestions(prev => new Set(prev).add(`mcq-${questionIndex}`));
  };

  const handleAptitudeAnswer = (questionIndex, answerIndex) => {
    const newAnswers = { ...aptitudeAnswers, [questionIndex]: answerIndex };
    setAptitudeAnswers(newAnswers);
    
    // Update answered questions
    setAnsweredQuestions(prev => new Set(prev).add(`aptitude-${questionIndex}`));
  };

  const handleNextSection = () => {
    if (currentSection === "descriptive" && interviewType === "full") {
      setCurrentSection("mcq");
      setCurrentQuestion(0);
    } else if (currentSection === "mcq") {
      setCurrentSection("aptitude");
      setCurrentQuestion(0);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection === "aptitude") {
      setCurrentSection("mcq");
      setCurrentQuestion(0);
    } else if (currentSection === "mcq") {
      setCurrentSection("descriptive");
      setCurrentQuestion(0);
    }
  };

  // FIXED: Submit function with proper answer tracking
  const handleSubmitAnswers = async () => {
    // Check if any questions are answered
    const hasDescriptiveAnswers = userAnswers.some(answer => answer && answer.trim() !== "");
    const hasMcqAnswers = Object.keys(mcqAnswers).length > 0;
    const hasAptitudeAnswers = Object.keys(aptitudeAnswers).length > 0;

    if (!hasDescriptiveAnswers && !hasMcqAnswers && !hasAptitudeAnswers) {
      setShowSubmitWarning(true);
      return;
    }

    if (!backendConnected) {
      setSubmissionError("Cannot submit: Backend is not connected");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      // Prepare interview data for backend - FIXED data structure
      const interviewData = {
        type: interviewType,
        difficulty: difficulty,
        descriptiveAnswers: userAnswers.map((answer, index) => ({
          questionId: index,
          question: extractQuestionText(currentQuestions[index]),
          answer: answer,
          timeTaken: 0
        })).filter(item => item.answer && item.answer.trim() !== ""),
        mcqAnswers: Object.entries(mcqAnswers).map(([qIndex, answer]) => ({
          questionId: parseInt(qIndex),
          question: extractQuestionText(mcqQuestions[parseInt(qIndex)]),
          selectedOption: answer,
          correctAnswer: mcqQuestions[parseInt(qIndex)]?.correct,
          isCorrect: answer === mcqQuestions[parseInt(qIndex)]?.correct
        })),
        aptitudeAnswers: Object.entries(aptitudeAnswers).map(([qIndex, answer]) => ({
          questionId: parseInt(qIndex),
          question: extractQuestionText(aptitudeQuestions[parseInt(qIndex)]),
          selectedOption: answer,
          correctAnswer: aptitudeQuestions[parseInt(qIndex)]?.correct,
          isCorrect: answer === aptitudeQuestions[parseInt(qIndex)]?.correct
        })),
        settings: {
          cameraRequired: cameraRequired,
          faceDetection: faceDetectionEnabled,
          audioRecording: audioEnabled,
          timeUsed: 45 * 60 - timeLeft
        },
        metrics: {
          faceDetectionWarnings: faceDetectionCount,
          totalDescriptiveQuestions: currentQuestions.length,
          totalMcqQuestions: mcqQuestions.length,
          totalAptitudeQuestions: aptitudeQuestions.length,
          answeredDescriptive: userAnswers.filter(answer => answer && answer.trim() !== "").length,
          answeredMcq: Object.keys(mcqAnswers).length,
          answeredAptitude: Object.keys(aptitudeAnswers).length
        }
      };

      console.log('📤 Submitting to backend...', interviewData);

      // BACKEND ONLY - No fallback
      const result = await apiService.submitInterview(interviewData);
      
      console.log('✅ Backend response:', result);

      if (result.success) {
        setTotalScore(result.data?.totalScore || result.totalScore || 0);
        setQuestionFeedback(result.data?.detailedFeedback || result.detailedFeedback || {});
        setInterviewFinished(true);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('❌ Interview submission failed:', error);
      setSubmissionError(`Submission failed: ${error.message}. Please check your backend connection.`);
    } finally {
      setIsSubmitting(false);
      cleanupInterview();
    }
  };

  const cleanupInterview = () => {
    stopCamera();
    stopAudioRecording();
    stopSiren();
    stopListening();
    stopFaceDetection();
    exitFullscreen();
  };

  const handleAutoSubmit = async () => {
    await handleSubmitAnswers();
  };

  // Text-to-Speech for AI Interviewer
  const speakQuestion = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    let question = "";
    if (currentSection === "descriptive") {
      question = extractQuestionText(currentQuestions[currentQuestion]) || "";
    } else if (currentSection === "mcq") {
      question = extractQuestionText(mcqQuestions[currentQuestion]) || "";
    } else if (currentSection === "aptitude") {
      question = extractQuestionText(aptitudeQuestions[currentQuestion]) || "";
    }
    
    if (!question) {
      setIsSpeaking(false);
      return;
    }
    
    const speech = speakText(question);
    
    if (speech) {
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => {
        setIsSpeaking(false);
        console.error('Speech synthesis failed');
      };
    } else {
      setIsSpeaking(false);
    }
  };

  // Enhanced Speech-to-Text for answers
  const startListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!speechSupported) {
      setAudioError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = initializeSpeechRecognition();
    if (!SpeechRecognition) {
      setAudioError("Speech recognition not available");
      return;
    }

    setIsListening(true);
    setAudioError("");
    setInterimTranscript("");

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setAudioError("");
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (finalTranscript) {
          const currentAnswer = userAnswers[currentQuestion] || '';
          const newAnswer = currentAnswer + finalTranscript;
          handleAnswerChange(newAnswer);
          setInterimTranscript("");
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setAudioError("No speech detected. Please speak clearly into the microphone.");
            break;
          case 'audio-capture':
            setAudioError("No microphone found. Please check your microphone connection.");
            break;
          case 'not-allowed':
            setAudioError("Microphone permission denied. Please allow microphone access.");
            break;
          case 'network':
            setAudioError("Network error occurred. Please check your internet connection.");
            break;
          default:
            setAudioError(`Speech recognition error: ${event.error}`);
        }
        
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening && !audioError.includes('not-allowed') && !audioError.includes('audio-capture')) {
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting recognition:', error);
                setIsListening(false);
              }
            }
          }, 100);
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setAudioError("Failed to start speech recognition. Please try again.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetInterview = () => {
    cleanupInterview();
    setInterviewStarted(false);
    setCameraEnabled(false);
    setAudioEnabled(false);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setMcqAnswers({});
    setAptitudeAnswers({});
    setTimeLeft(45 * 60);
    setInterviewFinished(false);
    setTotalScore(0);
    setAnsweredQuestions(new Set());
    setCameraError("");
    setAudioError("");
    setCameraRequired(true);
    setFullscreenMode(false);
    setNetworkWarning(false);
    setShowSubmitWarning(false);
    setQuestionFeedback({});
    setIsSpeaking(false);
    setIsListening(false);
    setShowHint(false);
    setInterimTranscript("");
    setFaceDetectionEnabled(true);
    setFaceVisible(true);
    setFaceWarning(false);
    setFaceDetectionCount(0);
    setCurrentQuestions([]);
    setMcqQuestions([]);
    setAptitudeQuestions([]);
    setCurrentSection("descriptive");
    setSubmissionError("");
    setQuestionsLoaded(false);
    setLoadingQuestions(false);
    setQuestionsError("");
  };

  const handleSkipCamera = () => {
    setCameraRequired(false);
    setCameraEnabled(false);
    setFaceDetectionEnabled(false);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const retryLoadQuestions = () => {
    setQuestionsLoaded(false);
    loadQuestionsFromBackend();
  };

  // FIXED: Extract question text properly from objects
  const extractQuestionText = (question) => {
    if (!question) return "Question not available";
    if (typeof question === 'string') return question;
    if (typeof question === 'object' && question !== null) {
      return question.question || question.text || question.title || JSON.stringify(question);
    }
    return "Question not available";
  };

  // FIXED: Render current question based on section - properly extract text
  const renderCurrentQuestion = () => {
    if (!questionsLoaded) {
      return "Loading questions from backend...";
    }

    let question;
    if (currentSection === "descriptive") {
      question = currentQuestions[currentQuestion];
    } else if (currentSection === "mcq") {
      question = mcqQuestions[currentQuestion];
    } else if (currentSection === "aptitude") {
      question = aptitudeQuestions[currentQuestion];
    }

    return extractQuestionText(question);
  };

  const getCurrentOptions = () => {
    if (currentSection === "mcq") {
      const mcqQuestion = mcqQuestions[currentQuestion];
      return mcqQuestion?.options || [];
    } else if (currentSection === "aptitude") {
      const aptitudeQuestion = aptitudeQuestions[currentQuestion];
      return aptitudeQuestion?.options || [];
    }
    return [];
  };

  const getCurrentAnswer = () => {
    if (currentSection === "descriptive") {
      return userAnswers[currentQuestion] || "";
    } else if (currentSection === "mcq") {
      return mcqAnswers[currentQuestion];
    } else if (currentSection === "aptitude") {
      return aptitudeAnswers[currentQuestion];
    }
    return "";
  };

  const handleOptionSelect = (optionIndex) => {
    if (currentSection === "mcq") {
      handleMcqAnswer(currentQuestion, optionIndex);
    } else if (currentSection === "aptitude") {
      handleAptitudeAnswer(currentQuestion, optionIndex);
    }
  };

  const getTotalQuestionsInSection = () => {
    if (currentSection === "descriptive") return currentQuestions.length;
    if (currentSection === "mcq") return mcqQuestions.length;
    if (currentSection === "aptitude") return aptitudeQuestions.length;
    return 0;
  };

  // Prevent accidental navigation away from the interview
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (interviewStarted && !interviewFinished) {
        event.preventDefault();
        event.returnValue = 'Your interview progress will be lost if you leave this page. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStarted, interviewFinished]);

  const hasPassed = totalScore >= 60;
  const isInteractionBlocked = cameraRequired && !cameraEnabled;

  if (interviewFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">🎯</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Interview Results
            </h1>
            <div className={`mb-4 p-3 rounded-lg ${
              backendConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {backendConnected ? '✅ Evaluated by Backend AI' : '❌ Backend Evaluation Failed'}
            </div>
          </div>

          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-4 ${
              hasPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalScore}/100
            </div>
            <div className={`text-2xl font-semibold mb-2 ${
              hasPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {hasPassed ? '🎉 Congratulations! You Passed!' : '❌ Needs Improvement'}
            </div>
            <p className="text-gray-600">
              {hasPassed 
                ? 'Great job! Your interview performance was impressive.'
                : `You scored ${totalScore}/100. The passing score is 60/100. Keep practicing!`
              }
            </p>
          </div>

          {/* Detailed Feedback Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Feedback</h3>
            <div className="space-y-4">
              {Object.keys(questionFeedback).length > 0 ? (
                Object.entries(questionFeedback).map(([questionIndex, feedback]) => (
                  <div key={questionIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-700">Question {parseInt(questionIndex) + 1}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feedback.score >= 7 ? 'bg-green-100 text-green-800' : 
                        feedback.score >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        Score: {feedback.score?.toFixed(1) || '0'}/10
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {feedback.suggestions?.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          {suggestion}
                        </li>
                      )) || <li>No specific feedback available</li>}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No detailed feedback available
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluation Criteria</h3>
            <div className="space-y-4">
              {evaluationCriteria.map((criteria, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">{criteria.criteria}</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round(criteria.weight * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${criteria.weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submissionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600">{submissionError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={resetInterview}
              className="py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
            >
              Retake Interview
            </button>
            <button
              onClick={() => window.print()}
              className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Mock Interview
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Practice your interview skills with our AI-powered mock interview platform
          </p>
          
          {/* Backend Status */}
          <div className={`mb-6 p-4 rounded-xl ${
            backendConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`font-semibold ${backendConnected ? 'text-green-700' : 'text-red-700'}`}>
                {backendConnected ? '✅ Backend Connected' : '❌ Backend Offline - Interview will fail without backend'}
              </span>
            </div>
          </div>
          
          {/* Interview Settings */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Interview Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                <select 
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full">Full Stack (10 Q + 5 MCQs + 5 Aptitude)</option>
                  <option value="technical">Technical Only (10 Questions)</option>
                  <option value="behavioral">Behavioral Only (10 Questions)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer Mode</label>
                <select 
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text Answers</option>
                  <option value="audio" disabled={!speechSupported}>
                    Voice Answers {!speechSupported && '(Not Supported)'}
                  </option>
                </select>
                {!speechSupported && (
                  <p className="text-sm text-red-600 mt-1">
                    Voice answers require Chrome or Edge browser
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Interview Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold text-gray-900">
                  {interviewType === "full" ? "20" : "10"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">45 minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-gray-600">Passing Score</span>
                <span className="font-semibold text-gray-900">60/100</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Evaluation</span>
                <span className="font-semibold text-gray-900">Backend AI System</span>
              </div>
            </div>
          </div>

          {!backendConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-yellow-700 text-sm">
                ⚠️ Backend is not connected. Interview submission will fail. Please ensure backend is running on port 5000.
              </p>
            </div>
          )}

          <button
            onClick={handleStartInterview}
            disabled={!backendConnected}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {backendConnected ? 'Start Interview' : 'Backend Not Connected'}
          </button>
        </div>
      </div>
    );
  }

  // Show loading/error state when questions are not loaded
  if (!questionsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            {loadingQuestions ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-2xl">📝</span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {loadingQuestions ? 'Loading Questions...' : 'Questions Not Available'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {loadingQuestions 
              ? 'Please wait while we load questions from the backend...'
              : questionsError || 'Unable to load questions from the backend.'
            }
          </p>

          {!loadingQuestions && (
            <div className="space-y-4">
              <button
                onClick={retryLoadQuestions}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Retry Loading Questions
              </button>
              <button
                onClick={resetInterview}
                className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" ref={fullscreenRef}>
      
      {/* Backend Status Indicator */}
      <div className="fixed top-4 left-4 z-40">
        <div className={`px-3 py-2 rounded-lg shadow-lg ${
          backendConnected 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {backendConnected ? '✅ Backend Connected' : '❌ Backend Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Status Indicator */}
      {networkWarning && (
        <div className="fixed top-4 right-4 z-40 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚨 Poor Network Connection</span>
          </div>
        </div>
      )}

      {/* Questions Loaded Indicator */}
      {questionsLoaded && (
        <div className="fixed top-16 left-4 z-40 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm">✅ Questions Loaded</span>
          </div>
        </div>
      )}

      {/* Face Warning Modal */}
      {faceWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Face Not Detected!</h3>
              <p className="text-gray-600 mb-6">
                Please arrange your face properly in front of the camera. The interview cannot continue until your face is visible.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setFaceWarning(false);
                    stopSiren();
                  }}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  I Understand - Continue Anyway
                </button>
                <button
                  onClick={() => {
                    setFaceDetectionEnabled(false);
                    setFaceWarning(false);
                    stopSiren();
                  }}
                  className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Disable Face Detection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Please Answer Questions</h3>
              <p className="text-gray-600 mb-6">
                You need to answer at least one question before submitting the interview.
              </p>
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Continue Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face Detection Status */}
      {faceDetectionEnabled && (
        <div className={`fixed top-16 left-4 z-40 px-4 py-2 rounded-lg shadow-lg ${
          faceVisible ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{faceVisible ? '✅ Face Detected' : '🚨 No Face Detected'}</span>
          </div>
        </div>
      )}

      {/* Siren Status */}
      {sirenPlaying && (
        <div className="fixed top-16 right-4 z-40 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚨 SIREN ACTIVE - CHECK YOUR SETUP</span>
          </div>
        </div>
      )}

      {/* Camera Required Overlay */}
      {isInteractionBlocked && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-30 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📹</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Camera Required</h3>
            <p className="text-gray-600 mb-6">
              You must enable camera to continue with the interview.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setCameraEnabled(true)}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Enable Camera
              </button>
              <button
                onClick={handleSkipCamera}
                className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Skip Camera
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Mock Interview</h1>
                <p className="text-gray-600 text-sm">
                  {backendConnected ? '✅ Cloud AI Evaluation' : '⚠️ Local Evaluation'}
                  {sirenPlaying ? " • 🚨 NETWORK ISSUE DETECTED" : ""}
                  {faceWarning ? " • 🚨 FACE NOT DETECTED" : ""}
                  {questionsLoaded ? " • ✅ Questions Loaded" : ""}
                </p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
              <div className={`text-2xl font-bold ${
                timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        {interviewType === "full" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrentSection("descriptive")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentSection === "descriptive" 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Descriptive ({currentQuestions.length})
                </button>
                <button
                  onClick={() => setCurrentSection("mcq")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentSection === "mcq" 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  MCQs ({mcqQuestions.length})
                </button>
                <button
                  onClick={() => setCurrentSection("aptitude")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentSection === "aptitude" 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Aptitude ({aptitudeQuestions.length})
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Section</div>
                <div className="text-lg font-bold text-blue-600 capitalize">
                  {currentSection}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera and Audio Toggle */}
            {(!cameraEnabled || !audioEnabled) && !cameraRequired && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enable Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!cameraEnabled && (
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">📹</span>
                        </div>
                        <button
                          onClick={() => setCameraEnabled(true)}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200"
                        >
                          Enable Camera
                        </button>
                      </div>
                    )}
                    {interviewMode === "audio" && !audioEnabled && (
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">🎤</span>
                        </div>
                        <button
                          onClick={() => setAudioEnabled(true)}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200"
                        >
                          Enable Microphone
                        </button>
                      </div>
                    )}
                  </div>
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <p className="text-red-600 text-sm">{cameraError}</p>
                    </div>
                  )}
                  {audioError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <p className="text-red-600 text-sm">{audioError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentSection === "descriptive" ? "Descriptive" : 
                     currentSection === "mcq" ? "Multiple Choice" : "Aptitude"} Question {currentQuestion + 1} of {getTotalQuestionsInSection()}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {currentSection === "descriptive" ? "10 marks each" : 
                     currentSection === "mcq" ? "1 mark each" : "2 marks each"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentSection === "descriptive" ? "10 marks" : 
                     currentSection === "mcq" ? "1 mark" : "2 marks"}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {difficulty}
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  {renderCurrentQuestion()}
                </p>
              </div>

              {/* Question Controls */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={speakQuestion}
                  disabled={isInteractionBlocked || !renderCurrentQuestion()}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isSpeaking 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } ${isInteractionBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{isSpeaking ? '🛑 Stop' : '🔊 Listen'}</span>
                </button>

                <button
                  onClick={toggleHint}
                  disabled={isInteractionBlocked || currentSection !== "descriptive"}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    showHint 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  } ${isInteractionBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{showHint ? '🙈 Hide Hint' : '💡 Show Hint'}</span>
                </button>

                {interviewMode === "audio" && currentSection === "descriptive" && (
                  <button
                    onClick={startListening}
                    disabled={isInteractionBlocked || !audioEnabled || !speechSupported}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } ${isInteractionBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{isListening ? '🛑 Stop' : '🎤 Speak'}</span>
                  </button>
                )}
              </div>

              {/* Hint Section */}
              {showHint && currentSection === "descriptive" && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Hint</h4>
                  <p className="text-yellow-700 text-sm">
                    Focus on providing specific examples and structuring your answer clearly.
                  </p>
                </div>
              )}
            </div>

            {/* Answer Section */}
            {currentSection === "descriptive" ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Your Answer {interviewMode === "audio" && "(Voice Input Available)"}
                </label>
                
                {/* Real-time speech recognition feedback */}
                {isListening && interimTranscript && (
                  <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Listening:</strong> {interimTranscript}
                    </p>
                  </div>
                )}

                <textarea
                  className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4 transition-all duration-200 ${
                    isInteractionBlocked 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                  rows={8}
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={
                    isInteractionBlocked 
                      ? "Please enable camera to start answering questions..." 
                      : interviewMode === "audio" 
                      ? "Type your answer or use the microphone button to speak your answer..."
                      : "Type your detailed answer here... The more specific and structured your answer, the better your score will be."
                  }
                  disabled={isInteractionBlocked}
                />
              </div>
            ) : (
              /* MCQ/Aptitude Options */
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Select Your Answer
                </label>
                <div className="space-y-3">
                  {getCurrentOptions().map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        getCurrentAnswer() === index
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          getCurrentAnswer() === index
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {getCurrentAnswer() === index && (
                            <span className="text-xs">✓</span>
                          )}
                        </div>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Navigation Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  {currentSection === "descriptive" ? (
                    <>
                      {getCurrentAnswer().length} characters • 
                      {answeredQuestions.has(currentQuestion) ? ' ✅ Answered' : ' ❌ Not answered'}
                    </>
                  ) : currentSection === "mcq" ? (
                    <>
                      {getCurrentAnswer() !== undefined ? ' ✅ Answered' : ' ❌ Not answered'}
                    </>
                  ) : (
                    <>
                      {getCurrentAnswer() !== undefined ? ' ✅ Answered' : ' ❌ Not answered'}
                    </>
                  )}
                  {sirenPlaying && ' 🚨 Siren Active'}
                  {isListening && ' 🎤 Listening...'}
                  {!faceVisible && faceDetectionEnabled && ' 👁️ Face Detection Issue'}
                </div>
                <div className="flex gap-2">
                  {currentQuestion > 0 && (
                    <button
                      onClick={() => {
                        setCurrentQuestion(prev => prev - 1);
                        setShowHint(false);
                        stopListening();
                      }}
                      disabled={isInteractionBlocked}
                      className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                  )}
                  
                  {interviewType === "full" && currentSection !== "descriptive" && currentQuestion === 0 && (
                    <button
                      onClick={handlePreviousSection}
                      disabled={isInteractionBlocked}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous Section
                    </button>
                  )}
                  
                  {currentQuestion < getTotalQuestionsInSection() - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentQuestion(prev => prev + 1);
                        setShowHint(false);
                        stopListening();
                      }}
                      disabled={isInteractionBlocked}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Question
                    </button>
                  ) : interviewType === "full" && currentSection !== "aptitude" ? (
                    <button
                      onClick={handleNextSection}
                      disabled={isInteractionBlocked}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Section
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAnswers}
                      disabled={isSubmitting || isInteractionBlocked}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        'Submit Answers'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Audio Error Display */}
              {audioError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{audioError}</p>
                  {audioError.includes('no-speech') && (
                    <p className="text-sm text-red-600 mt-1">
                      Tips: Speak clearly and ensure your microphone is working properly.
                    </p>
                  )}
                </div>
              )}

              {/* Speech Recognition Tips */}
              {interviewMode === "audio" && !isListening && currentSection === "descriptive" && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Tip:</strong> Click the microphone button and speak clearly. The speech recognition works best in Chrome/Edge browsers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Camera Feed */}
            {cameraEnabled && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Feed</h3>
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                    ● Recording
                  </div>
                  {faceDetectionEnabled && (
                    <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${
                      faceVisible ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {faceVisible ? '👁️ Face Detected' : '🚨 No Face'}
                    </div>
                  )}
                  {fullscreenMode && (
                    <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ⛔ Fullscreen
                    </div>
                  )}
                  {sirenPlaying && (
                    <div className="absolute bottom-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                      🚨 Siren Active
                    </div>
                  )}
                </div>
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-red-600 text-sm">{cameraError}</p>
                  </div>
                )}
                <button
                  onClick={() => setCameraEnabled(false)}
                  className="w-full mt-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Disable Camera
                </button>
              </div>
            )}

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Section Progress</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {currentQuestion + 1}/{getTotalQuestionsInSection()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / getTotalQuestionsInSection()) * 100}%` }}
                    />
                  </div>
                </div>

                {interviewType === "full" && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Descriptive</span>
                        <span className="text-sm font-semibold text-green-600">
                          {userAnswers.filter(answer => answer && answer.trim() !== "").length}/{currentQuestions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(userAnswers.filter(answer => answer && answer.trim() !== "").length / currentQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">MCQs</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {Object.keys(mcqAnswers).length}/{mcqQuestions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(mcqAnswers).length / mcqQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Aptitude</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {Object.keys(aptitudeAnswers).length}/{aptitudeQuestions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(aptitudeAnswers).length / aptitudeQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Time Used</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatTime(45 * 60 - timeLeft)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((45 * 60 - timeLeft) / (45 * 60)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: getTotalQuestionsInSection() }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestion(index);
                      setShowHint(false);
                      stopListening();
                    }}
                    disabled={isInteractionBlocked}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white shadow-md'
                        : (currentSection === "descriptive" && userAnswers[index] && userAnswers[index].trim() !== "") ||
                          (currentSection === "mcq" && mcqAnswers[index] !== undefined) ||
                          (currentSection === "aptitude" && aptitudeAnswers[index] !== undefined)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${isInteractionBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* End Test Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <button
                onClick={handleSubmitAnswers}
                disabled={isSubmitting}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ending Test...
                  </span>
                ) : (
                  'End Test & Submit Answers'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Once you end the test, you cannot return to the interview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}