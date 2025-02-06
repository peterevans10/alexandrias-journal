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
  Link as MuiLink
} from '@mui/material';
import { LibraryBooks, QuestionAnswer, History } from '@mui/icons-material';
import axios from 'axios';
import QuestionSubmission from './components/QuestionSubmission';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';

interface Question {
  id: string;
  text: string;
  created_at: string;
}

interface Answer {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  question_id: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#FDF5E6',
      paper: '#FFFAF0',
    },
  },
  typography: {
    fontFamily: '"Crimson Text", "Times New Roman", serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#8B4513',
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'none',
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
  const { token } = useAuth();

  const fetchDailyQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/questions/daily', {
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
      const response = await axios.get('http://localhost:8000/api/answers/me', {
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
        `http://localhost:8000/api/questions/daily/${dailyQuestion.id}/answer`,
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
        `http://localhost:8000/api/answers/${answerId}`,
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
          <Typography variant="h6" color="primary" gutterBottom>
            You've completed today's question! 🎉
          </Typography>
          <Typography variant="body1">
            Come back tomorrow for a new question.
          </Typography>
        </Box>
      );
    }

    if (statusMessage === "no-questions") {
      return (
        <Box>
          <Typography variant="body1">
            No questions available at the moment. Check back later!
          </Typography>
        </Box>
      );
    }

    if (statusMessage === "error") {
      return (
        <Box>
          <Typography variant="body1" color="error">
            There was an error loading your daily question. Please try again later.
          </Typography>
        </Box>
      );
    }

    if (dailyQuestion) {
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            {dailyQuestion.text}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            sx={{ mt: 2, mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAnswer}
            disabled={!answer.trim()}
          >
            Submit Answer
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Daily Question
      </Typography>
      
      {renderContent()}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Past Answers
        </Typography>
        {pastAnswers.length > 0 ? (
          pastAnswers.map((answer: Answer) => (
            <Card key={answer.id} sx={{ mb: 2 }}>
              <CardContent>
                {editingAnswer === answer.id ? (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditAnswer(answer.id, editText)}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingAnswer(null);
                          setEditText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body1">{answer.text}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(answer.created_at).toLocaleDateString()}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingAnswer(answer.id);
                          setEditText(answer.text);
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
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
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <AppRoutes />
            </Container>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
