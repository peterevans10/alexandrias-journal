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
  username: string;
  email: string;
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
        const response = await axios.get('http://localhost:8000/users/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !question.trim()) {
      setError('Please select a recipient and enter your question');
      return;
    }

    try {
      await axios.post('http://localhost:8000/questions/user-question', {
        text: question,
        recipient_id: recipient.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowSuccess(true);
      setQuestion('');
      setRecipient(null);
      setError(null);
    } catch (err) {
      setError('Failed to submit question. Please try again.');
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
            getOptionLabel={(option) => `${option.username} (${option.email})`}
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
