import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  Container,
  Box,
  CssBaseline,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { LibraryBooks, QuestionAnswer, History } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from './config/api';
import QuestionSubmission from './components/QuestionSubmission';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';
import EditIcon from '@mui/icons-material/Edit';
import Profile from './components/Profile';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Question {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  recipient_id: string;
  author?: User;
}

interface Answer {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  question_id: string;
  question: Question;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B3D6D', // Alexandria Blue
      light: '#2C5C9E',
      dark: '#132B4D',
    },
    secondary: {
      main: '#C5A572', // Aged Gold
      light: '#D4BC94',
      dark: '#A88B54',
    },
    background: {
      default: '#F5F1E6', // Parchment White
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C', // Ink Black
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Lora", "Times New Roman", serif',
    h4: {
      fontFamily: '"Lora", "Times New Roman", serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontFamily: '"Lora", "Times New Roman", serif',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Inter", "Helvetica", sans-serif',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: '"Inter", "Helvetica", sans-serif',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'linear-gradient(to bottom right, #FFFFFF, #F8F6F0)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '12px',
            background: 'rgba(197, 165, 114, 0.03)', // Subtle gold tint
            pointerEvents: 'none',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 24px',
          transition: 'all 0.3s ease',
          fontFamily: '"Inter", "Helvetica", sans-serif',
          fontWeight: 500,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#F8F6F0',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
    },
  },
});

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function DailyQuestion() {
  const [dailyQuestion, setDailyQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [pastAnswers, setPastAnswers] = useState<Answer[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { user, token } = useAuth();

  const fetchDailyQuestion = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/daily`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDailyQuestion(response.data);
      setStatusMessage(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDailyQuestion(null);
        if (error.response?.data?.detail === "You have already answered today's question") {
          setStatusMessage("completed");
        } else {
          setStatusMessage("no-questions");
        }
      } else {
        console.error('Error fetching daily question:', error);
        setStatusMessage("error");
      }
    }
  };

  const fetchPastAnswers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/answers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPastAnswers(response.data);
    } catch (error) {
      console.error('Error fetching past answers:', error);
    }
  };

  useEffect(() => {
    fetchDailyQuestion();
    fetchPastAnswers();
  }, [token]);

  const handleSubmitAnswer = async () => {
    if (!dailyQuestion) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/questions/daily/${dailyQuestion.id}/answer`,
        {
          text: answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPastAnswers([...pastAnswers, response.data]);
      setAnswer('');
      setDailyQuestion(null);
      setStatusMessage("completed");
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleEditAnswer = async (answerId: string, newText: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/answers/${answerId}`,
        {
          text: newText,
          question_id: pastAnswers.find(a => a.id === answerId)?.question_id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the answers list with the edited answer
      setPastAnswers(pastAnswers.map(a => 
        a.id === answerId ? response.data : a
      ));
      setEditingAnswer(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating answer:', error);
    }
  };

  const renderContent = () => {
    if (statusMessage === "completed") {
      return (
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1B3D6D08 0%, #1B3D6D15 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderOpacity: 0.1,
              position: 'relative',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Daily Question
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'success.main',
                mb: 2,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              You've completed today's question! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Come back tomorrow for a new question to reflect on.
            </Typography>
          </Paper>
        </Box>
      );
    }

    if (statusMessage === "loading") {
      return (
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1B3D6D08 0%, #1B3D6D15 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderOpacity: 0.1,
              position: 'relative',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Daily Question
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body1" color="text.secondary">
                Loading your daily question... This might take a moment if the service is waking up.
              </Typography>
            </Box>
          </Paper>
        </Box>
      );
    }

    if (statusMessage === "error") {
      return (
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1B3D6D08 0%, #1B3D6D15 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderOpacity: 0.1,
              position: 'relative',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Daily Question
            </Typography>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              There was an error loading your daily question.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please try again later.
            </Typography>
          </Paper>
        </Box>
      );
    }

    if (!dailyQuestion) {
      return (
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1B3D6D08 0%, #1B3D6D15 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderOpacity: 0.1,
              position: 'relative',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Daily Question
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              No questions available at the moment.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for your next question!
            </Typography>
          </Paper>
        </Box>
      );
    }

    if (dailyQuestion) {
      return (
        <Box>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1B3D6D08 0%, #1B3D6D15 100%)',
              border: '1px solid',
              borderColor: 'primary.main',
              borderOpacity: 0.1,
              position: 'relative',
            }}
          >
            {/* Daily Question Label */}
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Daily Question
            </Typography>

            {/* Question Text */}
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                mb: 2,
                fontWeight: 500,
                lineHeight: 1.3,
                color: 'text.primary',
              }}
            >
              {dailyQuestion.text}
            </Typography>

            {/* Author Info */}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 3,
              }}
            >
              Asked by {dailyQuestion.author_id === user?.id ? 'you' : 
                dailyQuestion.author?.full_name || dailyQuestion.author?.email || 'another user'}
            </Typography>

            {/* Answer Section */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 2,
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                Your Answer
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim()}
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                Submit Answer
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ 
      mt: { xs: 2, sm: 3, md: 4 },
      px: { xs: 2, sm: 3, md: 0 },
      maxWidth: '800px',
      mx: 'auto',
    }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          color: 'primary.dark',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Daily Question
      </Typography>
      
      {renderContent()}

      <Box sx={{ mt: { xs: 4, sm: 5 } }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: 'primary.dark',
            mb: 3,
          }}
        >
          Past Answers
        </Typography>
        {pastAnswers.length > 0 ? (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 3, sm: 4 },
          }}>
            {pastAnswers.map((answer: Answer) => (
              <Card 
                key={answer.id} 
                sx={{ 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 2.5, sm: 3 },
                  '&:last-child': { pb: { xs: 2.5, sm: 3 } },
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      color="primary.main"
                      gutterBottom
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        lineHeight: 1.5,
                        fontWeight: 500,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {answer.question.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        display: 'block',
                        mt: 0.5,
                      }}
                    >
                      Asked by {answer.question.author_id === user?.id ? 'you' : 
                        answer.question.author?.full_name || answer.question.author?.email || 'another user'}
                    </Typography>
                  </Box>
                  {editingAnswer === answer.id ? (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{ 
                          mt: 2,
                          mb: 2.5,
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.975rem', sm: '1rem' },
                            lineHeight: 1.7,
                          },
                        }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                      }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEditAnswer(answer.id, editText)}
                          disabled={!editText.trim()}
                          fullWidth={true}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingAnswer(null);
                            setEditText('');
                          }}
                          fullWidth={true}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 2,
                          color: 'text.primary',
                          fontSize: { xs: '0.975rem', sm: '1rem' },
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.7,
                        }}
                      >
                        {answer.text}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.08)',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.5, sm: 0 },
                      }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          {new Date(answer.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingAnswer(answer.id);
                            setEditText(answer.text);
                          }}
                          sx={{
                            minWidth: { xs: '100%', sm: 'auto' },
                          }}
                          startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        >
                          Edit Answer
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.975rem', sm: '1rem' },
              textAlign: 'center',
              py: 4,
            }}
          >
            No past answers yet. Start answering daily questions to build your journal!
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DailyQuestion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ask"
        element={
          <ProtectedRoute>
            <QuestionSubmission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        backgroundImage: 'linear-gradient(to bottom right, rgba(27, 61, 109, 0.03), rgba(197, 165, 114, 0.05))',
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          <Router>
            <AuthProvider>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <NavBar />
                <AppRoutes />
              </Box>
            </AuthProvider>
          </Router>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
