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
import { API_BASE_URL } from '../config/api';

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
        const response = await axios.get(`${API_BASE_URL}/users`, {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!recipient) {
      console.error('No recipient selected');
      return;
    }

    try {
      const requestData = {
        text: question,
      };
      
      console.log('Submitting question with data:', requestData);
      console.log('Recipient ID:', recipient.id);
      
      const response = await axios.post(
        `${API_BASE_URL}/questions/user-question?recipient_id=${recipient.id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Question submitted successfully:', response.data);
      setQuestion('');
      setRecipient(null);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting question:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.detail
        });
        setError(`Failed to submit question: ${error.response?.data?.detail}`);
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
