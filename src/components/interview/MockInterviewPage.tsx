import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { 
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  InsertChart as InsertChartIcon,
  VolumeUp as VolumeUpIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  InterviewAnalysisResult,
  saveInterviewAttempt,
  generateShareLink,
  generateAdaptiveFollowUp,
} from '../../services/interviewService';
import { initSpeechRecognition } from '../../services/azureSpeechService';
import { analyzeTranscript } from '../../services/clientAnalysisService';
import { useRecentActivity } from '../../contexts/RecentActivityContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateInterviewReportPdf } from '../../utils/pdfReport';
import { useNotification } from '../../contexts/NotificationContext';
import InterviewHistory from './InterviewHistory';
import {
  QUESTION_BANKS,
  getQuestionBank,
  getQuestionsForDifficulty,
  DIFFICULTY_LEVELS,
  InterviewDifficulty,
} from '../../constants/interviewQuestionBanks';

// Interview feedback component
const InterviewFeedback: React.FC<{
  analysis: InterviewAnalysisResult | null;
  transcript: string;
  question?: string;
  interviewId?: number | null;
  isAuthenticated?: boolean;
  onRestart?: () => void;
  onFollowUpGenerated?: (followUp: string) => void;
}> = ({ analysis, transcript, question, interviewId, isAuthenticated, onRestart, onFollowUpGenerated }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { notify } = useNotification();
  const [shareUrl, setShareUrl] = useState<string>('');
  const [sharing, setSharing] = useState(false);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  const handleDownloadReport = () => {
    if (!analysis) return;
    generateInterviewReportPdf(analysis, transcript);
    notify('Report downloaded', 'success');
  };

  const handleShare = async () => {
    if (!interviewId) return;
    setSharing(true);
    try {
      const token = await generateShareLink(interviewId);
      const url = `${window.location.origin}/shared-interview/${token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      notify('Shareable link copied to clipboard', 'success');
    } catch (err) {
      console.error('Error generating share link:', err);
      notify('Failed to generate a shareable link.', 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!question || !transcript) return;
    setGeneratingFollowUp(true);
    try {
      const followUp = await generateAdaptiveFollowUp(question, transcript);
      if (followUp) {
        onFollowUpGenerated?.(followUp);
        notify('Follow-up question added — answer it next!', 'success');
      } else {
        notify('Could not generate a follow-up question right now.', 'error');
      }
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  useEffect(() => {
    // Create an audio element when the component mounts
    audioRef.current = new Audio();
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Get the audio URL from the global state
      // This assumes audioUrl is available in the parent component
      const audioElement = document.querySelector('audio');
      if (audioElement && audioElement.src) {
        audioRef.current.src = audioElement.src;
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // When audio ends, reset playing state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to render a metric with a linear progress
  const renderMetric = (label: string, value: number) => {
    // Generate a suggestion based on the metric and score
    const getSuggestion = (metricLabel: string, score: number) => {
      const suggestions = {
        Clarity: {
          low: "Try to structure your answers with clear beginning, middle, and end points. Use simpler language when explaining complex concepts.",
          medium: "Your clarity is decent, but consider organizing your thoughts before speaking. Use more transition words to connect ideas.",
          high: "Excellent clarity in your responses. Continue using concise language and well-structured answers."
        },
        Confidence: {
          low: "Practice speaking with a stronger, more assertive tone. Minimize hesitation words and maintain eye contact.",
          medium: "Your confidence is building. Reduce filler words like 'um' and 'uh', and speak at a steady pace to appear more confident.",
          high: "Great confidence level. Your authoritative tone and steady pace project strong expertise."
        },
        Relevance: {
          low: "Focus more on directly answering the question asked. Use the STAR method to structure relevant experiences.",
          medium: "Your answers are generally on topic. Try to align your examples more closely with the specific question being asked.",
          high: "Excellent job keeping responses relevant to the questions. Your examples are well-targeted to the interviewer's needs."
        },
        "Speaking Pace": {
          low: "Your speaking pace is too fast or too slow. Aim for a moderate pace of about 150 words per minute for better comprehension.",
          medium: "Your pace is generally good but varies at times. Practice maintaining a consistent speaking speed throughout your answers.",
          high: "Great speaking pace. You maintain a comfortable rhythm that's easy to follow."
        },
        Volume: {
          low: "Your voice is too quiet or uneven. Practice speaking at a consistent, moderate volume that projects confidence.",
          medium: "Your volume is generally good but fluctuates at times. Focus on maintaining a steady volume throughout your answers.",
          high: "Excellent volume control. You speak clearly and confidently without being too loud or too soft."
        }
      };
      
      const metricKey = metricLabel as keyof typeof suggestions;
      
      if (suggestions[metricKey]) {
        if (score < 60) return suggestions[metricKey].low;
        if (score < 80) return suggestions[metricKey].medium;
        return suggestions[metricKey].high;
      }
      
      return "";
    };
    
    const suggestion = getSuggestion(label, value);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="body2" fontWeight="bold">{value}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={value} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundImage: 
                value > 80 ? 'linear-gradient(90deg, #4caf50, #8bc34a)' :
                value > 60 ? 'linear-gradient(90deg, #ffeb3b, #ffc107)' :
                'linear-gradient(90deg, #ff9800, #f44336)',
            } 
          }}
        />
        {suggestion && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
            {suggestion}
          </Typography>
        )}
      </Box>
    );
  };

  // If we don't have analysis or transcript, show empty state
  if (!transcript) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 0 }}>
            Feedback & Analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 40px)' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <InsertChartIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Interview Data Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start an interview session to receive AI-powered feedback on your performance.
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // If we have a transcript but no analysis, show that it's ready for analysis
  if (transcript && !analysis) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 0 }}>
            Interview Transcript
          </Typography>
        </Box>
        
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Your Response:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {transcript}
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Click "Analyze Interview" to get AI feedback on your response
          </Typography>
        </Box>
      </Paper>
    );
  }

  // If we have analysis data, show the full feedback
  if (analysis) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 0 }}>
            Feedback & Analysis
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Overall Score:
            </Typography>
            <Chip
              label={`${analysis.content_analysis.overall_score}/100`}
              color={analysis.content_analysis.overall_score > 70 ? "success" : "warning"}
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
              sx={{ ml: 2 }}
            >
              Download PDF
            </Button>
            {isAuthenticated && interviewId && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleShare}
                disabled={sharing}
                sx={{ ml: 1 }}
              >
                {sharing ? 'Sharing…' : 'Share with mentor'}
              </Button>
            )}
            {question && transcript && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateFollowUp}
                disabled={generatingFollowUp}
                sx={{ ml: 1 }}
              >
                {generatingFollowUp ? 'Thinking…' : 'Ask a follow-up'}
              </Button>
            )}
          </Box>
        </Box>

        {shareUrl && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShareUrl('')}>
            Shareable link (copied to clipboard): {shareUrl}
          </Alert>
        )}

        {/* Audio Playback Controls */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Interview Playback
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VolumeUpIcon color="primary" sx={{ mr: 2 }} />
              <Typography variant="body2">
                Interview Recording
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              onClick={togglePlayback}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </Paper>
        </Box>

        {/* Performance Metrics */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Performance Metrics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            {renderMetric('Clarity', analysis.content_analysis.clarity_score)}
            {renderMetric('Relevance', analysis.content_analysis.relevance_score)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderMetric('Speaking Pace', analysis.audio_analysis.pace_score)}
            {renderMetric('Volume', analysis.audio_analysis.volume_score)}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Keyword Matches */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Keyword Matches
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            These keywords from the job description appeared in your answers:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.content_analysis.keywords.length > 0 ? (
              analysis.content_analysis.keywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: 1.5, 
                    fontWeight: 'medium',
                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No matching keywords found. Try including more relevant terminology.
              </Typography>
            )}
          </Box>
          
          {analysis.content_analysis.missing_keywords.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Consider including these keywords in your answer:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {analysis.content_analysis.missing_keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    color="warning"
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderRadius: 1.5,
                      bgcolor: 'rgba(237, 108, 2, 0.08)'
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Improvement Suggestions */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Suggestions for Improvement
        </Typography>
        <List dense>
          {analysis.feedback.suggestions.map((suggestion, index) => (
            <ListItem key={index} sx={{ px: 0, pb: 0.5 }}>
              <ListItemText 
                primary={suggestion}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  sx: index === 0 ? { fontWeight: 'medium' } : {} // Highlight first suggestion 
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }
  
  return null;
};

const MockInterviewPage: React.FC = () => {
  // State for recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  // State for transcript
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechRecognitionControls, setSpeechRecognitionControls] = useState<any>(null);
  
  // State for custom job title and questions
  const [questionBankId, setQuestionBankId] = useState<string>('general');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('mid');
  const [questions, setQuestions] = useState<string[]>(
    getQuestionsForDifficulty('general', 'mid').length > 0
      ? getQuestionsForDifficulty('general', 'mid')
      : [
          'Tell me about yourself.',
          'How do you approach debugging a complex issue?',
          'What are your greatest strengths?'
        ]
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showQuestionDialog, setShowQuestionDialog] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // State for analysis
  const [analysisResult, setAnalysisResult] = useState<InterviewAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Refs for recording
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const speechRecognitionRef = useRef<{
    startRecognition: () => void;
    stopRecognition: () => void;
  } | null>(null);
  
  const { addActivity } = useRecentActivity();
  const { isAuthenticated } = useAuth();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Groups every question answered during this page visit into one "full
  // session" for a combined report, and tracks the id of the most recently
  // saved attempt (needed to generate its shareable link).
  const sessionIdRef = useRef<string>(
    (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `session-${Date.now()}`
  );
  const [savedInterviewId, setSavedInterviewId] = useState<number | null>(null);
  const [sessionAttempts, setSessionAttempts] = useState<{ question: string; score: number }[]>([]);

  // Initialize component
  useEffect(() => {
    // Ensure current question index is valid on component mount
    if (currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(0);
    }
    // Intentionally runs once on mount only, to validate the initial index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Clean up on unmount. Reading ref.current at cleanup time (rather than
  // capturing it earlier) is intentional here — we want whatever timer/
  // recognizer is live at unmount, not a stale snapshot from effect setup
  // time (these refs are populated later, when recording actually starts).
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(timerRef.current);
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      // Stop speech recognition if active
      if (speechRecognitionRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        speechRecognitionRef.current.stopRecognition();
      }
    };
  }, [audioUrl]);
  
  // Handle starting the recording with Azure Speech SDK
  const handleStartRecording = async () => {
    try {
      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Media devices not supported in this browser');
        return;
      }

      // Reset state before starting new recording
      setTranscript('');
      setInterimTranscript('');
      setIsRecording(true);
      setError('');
      setAudioBlob(null);
      setAudioUrl('');
      setAnalysisResult(null);
      
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      });
      
      // Initialize Speech Recognition
      try {
        const controls = await initSpeechRecognition(
          // Interim results handler
          (text) => {
            setInterimTranscript(text);
          },
          // Final results handler
          (text) => {
            setTranscript((prevTranscript) => {
              // Add a space if needed before appending new text
              const separator = prevTranscript && !prevTranscript.endsWith(' ') ? ' ' : '';
              return prevTranscript + separator + text;
            });
            setInterimTranscript('');
          },
          // Error handler
          (error) => {
            // Don't show Azure initialization errors to the user
            // since we have fallback mechanisms
            if (!error.includes('Failed to initialize') && 
                !error.includes('Speech recognition unavailable')) {
              setError(error);
            } else {
              console.warn(error);
            }
          }
        );
        
        setSpeechRecognitionControls(controls);
        
        // Start speech recognition if we have controls
        if (controls) {
          controls.startRecognition();
        } else {
          console.warn('Speech recognition controls undefined');
        }
      } catch (speechError) {
        console.error('Error initializing speech recognition:', speechError);
        // Continue with recording even if speech recognition fails
        // We'll analyze the audio later
      }
      
      // Start recording and timer
      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);
      
      const startTime = Date.now();
      startTimeRef.current = startTime;
      const timer = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(seconds);
      }, 1000);
      
      setTimerInterval(timer);
      
      // Add activity when recording starts
      addActivity(
        'interview',
        `Started Interview: Question ${currentQuestionIndex + 1}`
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setError(
          "We need microphone access to record your answer. Please allow microphone permissions for this site in your browser, then try again."
        );
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setError("We couldn't find a microphone. Please connect one and try again.");
      } else {
        setError("Something went wrong starting the recording. Please check your microphone and try again.");
      }
    }
  };

  // Handle stopping the recording
  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks in the stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Stop speech recognition if available
      if (speechRecognitionControls) {
        try {
          speechRecognitionControls.stopRecognition();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
      
      // Clear the timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      // Add activity when recording stops
      const duration = recordingDuration || 0;
      addActivity(
        'interview',
        `Completed Interview Recording (${duration}s)`
      );
    }
  };
  
  // Handle analyzing the interview
  const handleAnalyzeInterview = async () => {
    if (!audioBlob && !transcript) {
      setError('No recording to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Use client-side analysis instead of API
      const result = await analyzeTranscript(
        transcript,
        questions[currentQuestionIndex]
      );

      setAnalysisResult(result);

      // Add activity when interview is analyzed
      const score = result?.content_analysis?.overall_score;
      addActivity(
        'interview',
        `Interview Analyzed: Score ${score ?? 'N/A'}`,
        typeof score === 'number' ? score : undefined
      );

      if (isAuthenticated && typeof score === 'number') {
        const saved = await saveInterviewAttempt({
          title: questions[currentQuestionIndex],
          transcript,
          duration: recordingDuration || 0,
          overall_score: score,
          audio_analysis: result.audio_analysis,
          content_analysis: result.content_analysis,
          feedback: result.feedback,
          difficulty,
          question_text: questions[currentQuestionIndex],
          session_id: sessionIdRef.current,
        });
        setSavedInterviewId(saved?.id ?? null);
        setSessionAttempts((prev) => [...prev, { question: questions[currentQuestionIndex], score }]);
        setHistoryRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error('Error analyzing interview:', error);
      setError("We couldn't analyze your answer just now. Please try again in a moment.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };
  
  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  // Handle adding a new question
  const handleAddQuestion = () => {
    if (newQuestion.trim() && questions.length < 10) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
      setShowQuestionDialog(false);
      // Move to the newly added question
      setCurrentQuestionIndex(questions.length);
    }
  };
  
  // Handle updating an existing question
  const handleUpdateQuestion = () => {
    if (newQuestion.trim()) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = newQuestion.trim();
      setQuestions(updatedQuestions);
      setNewQuestion('');
      setShowQuestionDialog(false);
      setEditMode(false);
    }
  };
  
  // Open dialog to add a new question
  const openAddQuestionDialog = () => {
    setNewQuestion('');
    setEditMode(false);
    setShowQuestionDialog(true);
  };
  
  // Open dialog to edit the current question
  const openEditQuestionDialog = () => {
    setNewQuestion(questions[currentQuestionIndex]);
    setEditMode(true);
    setShowQuestionDialog(true);
  };

  // Swap in a role-specific set of practice questions
  const handleQuestionBankChange = (bankId: string) => {
    const bank = getQuestionBank(bankId);
    if (!bank) return;
    setQuestionBankId(bankId);
    setQuestions(bank.questionsByDifficulty[difficulty]);
    setCurrentQuestionIndex(0);
  };

  // Swap the active question set's difficulty while keeping the same category
  const handleDifficultyChange = (newDifficulty: InterviewDifficulty) => {
    setDifficulty(newDifficulty);
    setQuestions(getQuestionsForDifficulty(questionBankId, newDifficulty));
    setCurrentQuestionIndex(0);
  };
  
  // Handle restarting the interview
  const handleRestartInterview = () => {
    // Reset all state related to recording and analysis
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
    setAudioBlob(null);
    setAudioUrl('');
    setAnalysisResult(null);
    setError('');
    setSavedInterviewId(null);
  };

  // A generated adaptive follow-up gets appended to the question list and
  // becomes the next question to answer, keeping the same recording flow.
  const handleFollowUpGenerated = (followUp: string) => {
    setQuestions((prev) => [...prev, followUp]);
    setCurrentQuestionIndex(questions.length);
    handleRestartInterview();
  };
  
  // Which step to highlight: pick a question -> record -> review feedback
  const activeStep = analysisResult ? 2 : (audioBlob || isRecording) ? 1 : 0;
  const steps = ['Pick a question', 'Record your answer', 'Review your feedback'];

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Pick a question below, click the microphone to record your spoken answer, then get instant
          AI feedback on your clarity, pacing, and how well you covered the key points.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Practice Interview
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="question-bank-label">Question category</InputLabel>
                  <Select
                    labelId="question-bank-label"
                    label="Question category"
                    value={questionBankId}
                    disabled={isRecording}
                    onChange={(e: SelectChangeEvent) => handleQuestionBankChange(e.target.value)}
                  >
                    {QUESTION_BANKS.map((bank) => (
                      <MenuItem key={bank.id} value={bank.id}>{bank.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="difficulty-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    label="Difficulty"
                    value={difficulty}
                    disabled={isRecording}
                    onChange={(e: SelectChangeEvent) => handleDifficultyChange(e.target.value as InterviewDifficulty)}
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <Tooltip key={level.id} title={level.description} placement="right">
                        <MenuItem value={level.id}>{level.label}</MenuItem>
                      </Tooltip>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'background.default', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Question {currentQuestionIndex + 1} of {questions.length}:
                  </Typography>
                  <Box>
                    <Tooltip title="Edit this question">
                      <IconButton
                        size="small"
                        onClick={openEditQuestionDialog}
                        disabled={isRecording}
                        sx={{ mr: 1 }}
                        aria-label="Edit this question"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {questions.length < 10 && (
                      <Tooltip title="Add new question">
                        <IconButton
                          size="small"
                          onClick={openAddQuestionDialog}
                          disabled={isRecording}
                          color="primary"
                          aria-label="Add new question"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Typography variant="body1">
                  {questions[currentQuestionIndex]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Want a different question? Use the icons above to edit this one or add your own.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    startIcon={<PrevIcon />}
                    disabled={currentQuestionIndex === 0 || isRecording}
                    onClick={handlePrevQuestion}
                    size="small"
                  >
                    Previous
                  </Button>
                  <Button
                    endIcon={<NextIcon />}
                    disabled={currentQuestionIndex === questions.length - 1 || isRecording}
                    onClick={handleNextQuestion}
                    size="small"
                  >
                    Next
                  </Button>
                </Box>
              </Paper>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mb: 3, 
                p: 3, 
                borderRadius: 2,
                backgroundColor: 'action.hover' 
              }}>
                {isRecording ? (
                  <>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                      <CircularProgress variant="determinate" value={Math.min(recordingDuration * 100 / 120, 100)} color="error" size={80} />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {formatTime(recordingDuration)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 600 }}>
                      We're listening — take your time
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={handleStopRecording}
                    >
                      Stop Recording
                    </Button>
                    
                    {/* Real-time transcript display */}
                    {(transcript || interimTranscript) && (
                      <Paper elevation={0} sx={{ mt: 3, p: 2, width: '100%', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Real-time transcript:
                        </Typography>
                        <Typography variant="body2">
                          {transcript}
                          {interimTranscript && (
                            <span style={{ color: 'rgba(0,0,0,0.4)' }}> {interimTranscript}</span>
                          )}
                        </Typography>
                      </Paper>
                    )}
                  </>
                ) : (
                  <>
                    <IconButton 
                      aria-label="start recording"
                      color="primary" 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }} 
                      onClick={handleStartRecording}
                    >
                      <MicIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={500}>
                      {transcript ? "Ready to try again? Click to record a new response" : "Ready when you are — click the microphone to start"}
                    </Typography>
                  </>
                )}
              </Box>
              
              {audioBlob && !isRecording && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Your Recording
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <audio 
                          controls 
                          src={audioUrl} 
                          style={{ height: 40 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAnalyzeInterview}
                          disabled={isAnalyzing || !transcript}
                          startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <InsertChartIcon />}
                          fullWidth
                        >
                          {isAnalyzing ? 'Analyzing...' : 'Analyze Interview'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleRestartInterview}
                          startIcon={<RefreshIcon />}
                          fullWidth
                        >
                          Restart
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                  
                  {/* Interview Tips Section */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Interview Tips
                    </Typography>
                    <List dense sx={{ pl: 2 }}>
                      <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, mb: 0.5 }}>
                        <ListItemText 
                          primary="Use the STAR method for behavioral questions (Situation, Task, Action, Result)"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, mb: 0.5 }}>
                        <ListItemText 
                          primary="Maintain a clear and confident speaking voice"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0, mb: 0.5 }}>
                        <ListItemText 
                          primary="Include specific examples from your experience"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ display: 'list-item', listStyleType: 'disc', p: 0 }}>
                        <ListItemText 
                          primary="Keep responses concise (1-2 minutes per question)"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              )}
              
              {error && (
                <Box sx={{ mt: 2 }}>
                  {error.startsWith("Note:") ? (
                    <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="body2">
                        {error}
                      </Typography>
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <InterviewFeedback
            analysis={analysisResult}
            transcript={transcript}
            question={questions[currentQuestionIndex]}
            interviewId={savedInterviewId}
            isAuthenticated={isAuthenticated}
            onRestart={handleRestartInterview}
            onFollowUpGenerated={handleFollowUpGenerated}
          />
        </Grid>
      </Grid>

      {sessionAttempts.length >= 2 && (
        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Session Report ({sessionAttempts.length} questions answered)
          </Typography>
          <List dense>
            {sessionAttempts.map((attempt, index) => (
              <ListItem key={index}>
                <ListItemText primary={attempt.question} secondary={`Score: ${attempt.score}/100`} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Average score this session:{' '}
            {Math.round(sessionAttempts.reduce((sum, a) => sum + a.score, 0) / sessionAttempts.length)}/100
          </Typography>
        </Paper>
      )}

      {isAuthenticated && (
        <Box sx={{ mt: 4 }}>
          <InterviewHistory key={historyRefreshKey} />
        </Box>
      )}

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onClose={() => setShowQuestionDialog(false)}>
        <DialogTitle>{editMode ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editMode 
              ? 'Update the interview question below.' 
              : questions.length >= 9 
                ? 'You can add one more question (maximum 10 questions).'
                : 'Add a new interview question to your practice session.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Interview Question"
            type="text"
            fullWidth
            variant="outlined"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
          <Button 
            onClick={editMode ? handleUpdateQuestion : handleAddQuestion} 
            variant="contained" 
            color="primary"
            disabled={!newQuestion.trim()}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
        `}
      </style>
    </Box>
  );
};

export default MockInterviewPage; 