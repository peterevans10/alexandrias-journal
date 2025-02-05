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
  const { token } = useAuth();

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/questions/daily', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDailyQuestion(response.data);
      } catch (error) {
        console.error('Error fetching daily question:', error);
      }
    };

    fetchDailyQuestion();
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
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      {dailyQuestion && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Daily Question
          </Typography>
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
      )}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Past Answers
        </Typography>
        {pastAnswers.map((answer: Answer) => (
          <Card key={answer.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">{answer.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(answer.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
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
