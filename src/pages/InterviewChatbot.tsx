import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Add as AddIcon,
  History as HistoryIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { sendChatMessage, getChatbotFAQTopics, getChatSessions, getChatHistory, ChatSession } from '../services/resumeService';
import { fetchBookmarks, createBookmark, deleteBookmark, BookmarkedAnswer } from '../services/bookmarkService';
import { generateChatStudyGuidePdf } from '../utils/pdfReport';
import { useRecentActivity } from '../contexts/RecentActivityContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import PageHeader from '../components/common/PageHeader';

// Interface for chat messages
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const InterviewChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your Interview Preparation Assistant. How can I help you prepare for your interviews today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [faqQuestions, setFaqQuestions] = useState<string[]>([
    "How do I answer 'Tell me about yourself'?",
    "What are my greatest strengths?",
    "How to explain employment gaps?",
    "Tips for salary negotiation",
    "How to handle behavioral questions?",
    "Questions to ask the interviewer",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAnswer[]>([]);

  const { addActivity } = useRecentActivity();
  const { isAuthenticated } = useAuth();
  const { notify } = useNotification();

  const loadBookmarks = async () => {
    if (!isAuthenticated) return;
    const data = await fetchBookmarks();
    setBookmarks(data);
  };

  useEffect(() => {
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isBookmarked = (answer: string) => bookmarks.some((b) => b.answer === answer);

  const handleToggleBookmark = async (question: string, answer: string) => {
    const existing = bookmarks.find((b) => b.answer === answer);
    if (existing) {
      const ok = await deleteBookmark(existing.id);
      if (ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
        notify('Bookmark removed', 'info');
      }
    } else {
      const created = await createBookmark(question, answer);
      if (created) {
        setBookmarks((prev) => [created, ...prev]);
        notify('Answer bookmarked', 'success');
      }
    }
  };

  const handleRemoveBookmark = async (id: number) => {
    const ok = await deleteBookmark(id);
    if (ok) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      notify('Bookmark removed', 'info');
    }
  };

  const loadSessions = async () => {
    if (!isAuthenticated) return;
    setSessionsLoading(true);
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch (error) {
      // Session history is a convenience feature — a failed fetch just
      // means the list stays empty, the chat itself still works.
    } finally {
      setSessionsLoading(false);
    }
  };

  // Load past sessions on mount so returning users can pick up an old conversation.
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleNewChat = () => {
    setSessionId('');
    setMessages([
      {
        id: 1,
        text: "Hi there! I'm your Interview Preparation Assistant. How can I help you prepare for your interviews today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleExportConversation = () => {
    generateChatStudyGuidePdf(messages);
    notify('Study guide downloaded', 'success');
  };

  const handleSelectSession = async (session: ChatSession) => {
    setIsLoading(true);
    try {
      const history = await getChatHistory(session.session_id);
      setSessionId(session.session_id);
      setMessages(
        history.map((m) => ({
          id: m.id,
          text: m.message,
          sender: m.is_user ? 'user' : 'bot',
          timestamp: new Date(m.timestamp),
        }))
      );
    } catch (error) {
      // Leave the current conversation untouched if the history fails to load.
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch FAQ topics on component mount
  useEffect(() => {
    const fetchFAQTopics = async () => {
      try {
        const response = await getChatbotFAQTopics();
        if (response.topics && response.topics.length > 0) {
          // Format topics to be more user-friendly
          const formattedTopics = response.topics.map(topic => {
            // Convert "tell me about yourself" to "How do I answer 'Tell me about yourself'?"
            return `How do I answer '${topic.charAt(0).toUpperCase() + topic.slice(1)}'?`;
          });
          setFaqQuestions(formattedTopics);
        }
      } catch (error) {
        console.error('Error fetching FAQ topics:', error);
      }
    };

    fetchFAQTopics();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Record this activity in recent activities
      addActivity(
        'chatbot',
        `Chatbot: Asked about "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`
      );

      // Send to backend and get response
      const response = await sendChatMessage(text, sessionId);
      
      // Update session ID if returned from backend
      if (response.session_id) {
        setSessionId(response.session_id);
      }
      
      // Add bot response to messages
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      loadSessions();
    } catch (error) {
      console.error('Error getting response from chatbot:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleFAQClick = (question: string) => {
    setInputValue(question);
    handleSendMessage(question);
  };

  const isVoiceInputSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const handleToggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      notify('Voice input is not supported in this browser.', 'error');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => {
      notify('Could not hear that — please try again or type your question.', 'error');
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <PageHeader
            title="Interview Preparation Chatbot"
            subtitle="Get answers to common interview questions and personalized advice"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {messages.length > 1 && (
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportConversation}>
                Export as PDF
              </Button>
            )}
            {isAuthenticated && (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleNewChat}>
                New chat
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Chat interface */}
            <Paper 
              elevation={3} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '70vh',
                borderRadius: 2,
              }}
            >
              {/* Chat messages area */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 2,
                  backgroundColor: 'grey.50',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <List>
                  {messages.map((message, index) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', maxWidth: '80%', alignItems: 'flex-start' }}>
                        {message.sender === 'bot' && (
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              mr: 1,
                              width: 36,
                              height: 36,
                              mt: 0.5
                            }}
                          >
                            <BotIcon fontSize="small" />
                          </Avatar>
                        )}

                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                            color: message.sender === 'user' ? 'white' : 'text.primary',
                            ml: message.sender === 'user' ? 1 : 0,
                            mr: message.sender === 'bot' ? 1 : 0,
                            position: 'relative',
                          }}
                        >
                          <Typography variant="body1" sx={{ pr: message.sender === 'bot' && isAuthenticated ? 3 : 0 }}>
                            {message.text}
                          </Typography>
                          <Typography variant="caption" color={message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {message.sender === 'bot' && isAuthenticated && (
                            <Tooltip title={isBookmarked(message.text) ? 'Remove bookmark' : 'Bookmark this answer'}>
                              <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 4, right: 4 }}
                                onClick={() => handleToggleBookmark(messages[index - 1]?.text || '', message.text)}
                              >
                                {isBookmarked(message.text) ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Paper>

                        {message.sender === 'user' && (
                          <Avatar 
                            sx={{ 
                              bgcolor: 'secondary.main', 
                              ml: 1,
                              width: 36, 
                              height: 36,
                              mt: 0.5
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                  
                  {isTyping && (
                    <ListItem sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', maxWidth: '80%', alignItems: 'flex-start' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            mr: 1,
                            width: 36, 
                            height: 36,
                            mt: 0.5
                          }}
                        >
                          <BotIcon fontSize="small" />
                        </Avatar>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              <Typography variant="body2">Thinking...</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2">Typing<span className="typing-animation">...</span></Typography>
                          )}
                        </Paper>
                      </Box>
                    </ListItem>
                  )}
                  
                  <div ref={messagesEndRef} />
                </List>
              </Box>
              
              {/* Input area */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  backgroundColor: 'white',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={isListening ? 'Listening...' : 'Type your question here...'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    sx={{ mr: 1 }}
                    size="small"
                    disabled={isLoading}
                  />
                  {isVoiceInputSupported && (
                    <Tooltip title={isListening ? 'Stop listening' : 'Speak your question'}>
                      <IconButton
                        color={isListening ? 'error' : 'default'}
                        onClick={handleToggleVoiceInput}
                        disabled={isLoading}
                        sx={{ mr: 1 }}
                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      >
                        {isListening ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Button
                    variant="contained" 
                    color="primary" 
                    endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {isLoading ? 'Sending' : 'Send'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              {/* FAQ Section */}
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Common Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Click on any question to get an instant answer:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {faqQuestions.map((question, index) => (
                    <Button 
                      key={index} 
                      variant="outlined"
                      color="primary"
                      size="medium"
                      onClick={() => handleFAQClick(question)}
                      sx={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </Box>
              </Paper>

              {isAuthenticated && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <HistoryIcon color="primary" fontSize="small" />
                    <Typography variant="h6" component="h2">
                      Past Conversations
                    </Typography>
                  </Box>
                  {sessionsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : sessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Your past conversations will appear here.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 260, overflowY: 'auto' }}>
                      {sessions.map((session) => (
                        <Button
                          key={session.session_id}
                          variant={session.session_id === sessionId ? 'contained' : 'text'}
                          onClick={() => handleSelectSession(session)}
                          sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                          disabled={isLoading}
                        >
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                              {session.title}
                            </Typography>
                            <Typography variant="caption" color={session.session_id === sessionId ? 'inherit' : 'text.secondary'}>
                              {new Date(session.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

              {isAuthenticated && (
                <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="h6" component="h2">
                      Bookmarked Answers
                    </Typography>
                  </Box>
                  {bookmarks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Tap the star on any answer to save it here.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto' }}>
                      {bookmarks.map((bookmark) => (
                        <Box key={bookmark.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover', position: 'relative' }}>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 4, right: 4 }}
                            onClick={() => handleRemoveBookmark(bookmark.id)}
                            aria-label="Remove bookmark"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ pr: 3, whiteSpace: 'pre-wrap' }}>
                            {bookmark.answer}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default InterviewChatbot; 