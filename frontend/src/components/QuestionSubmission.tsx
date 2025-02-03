import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Autocomplete,
} from '@mui/material';
import { QuestionAnswer } from '@mui/icons-material';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
}

const QuestionSubmission: React.FC = () => {
  const [recipient, setRecipient] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [question, setQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users with token:', token);
        const response = await axios.get('http://localhost:8000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Users response:', response.data);
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !question.trim()) {
      setError('Please select a recipient and enter your question');
      return;
    }

    try {
      const requestData = {
        text: question,
      };
      
      console.log('Submitting question with data:', requestData);
      console.log('Recipient ID:', recipient.id);
      
      const response = await axios.post(
        `http://localhost:8000/api/questions/user-question?recipient_id=${recipient.id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Question submission successful:', response.data);
      setShowSuccess(true);
      setQuestion('');
      setRecipient(null);
      setError(null);
    } catch (err) {
      console.error('Error submitting question:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.detail || err.message;
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: errorMessage
        });
        setError(`Failed to submit question: ${errorMessage}`);
      } else {
        setError('Failed to submit question. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuestionAnswer color="primary" />
          <Typography variant="h5" component="h2">
            Ask a Question
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Autocomplete
            value={recipient}
            onChange={(_, newValue) => setRecipient(newValue)}
            options={users}
            getOptionLabel={(option) => `${option.full_name} (${option.email})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Recipient"
                required
                error={!recipient && error !== null}
              />
            )}
          />

          <TextField
            label="Your Question"
            multiline
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            error={!question.trim() && error !== null}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Submit Question
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Question submitted successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default QuestionSubmission;
