import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserInteractionStats {
  user_id: string;
  name: string;
  count: number;
}

interface UserStats {
  questions_asked: number;
  questions_answered: number;
  top_asked: UserInteractionStats[];
  top_received: UserInteractionStats[];
}

interface Answer {
  id: string;
  text: string;
  created_at: string;
  question: {
    text: string;
    author?: {
      full_name?: string;
      email: string;
    };
  };
}

export default function Profile() {
  const theme = useTheme();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pastAnswers, setPastAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, answersResponse] = await Promise.all([
          axios.get<UserStats>('http://localhost:8000/api/users/me/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Answer[]>('http://localhost:8000/api/answers/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsResponse.data);
        setPastAnswers(answersResponse.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom color="primary.dark" sx={{ mb: 4 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      Questions Asked: <strong>{stats?.questions_asked || 0}</strong>
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      Questions Answered: <strong>{stats?.questions_answered || 0}</strong>
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Top Interactions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Top Interactions
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              People you ask questions to most:
            </Typography>
            <List dense>
              {stats?.top_asked.map((stat, index) => (
                <ListItem key={stat.user_id}>
                  <ListItemText
                    primary={`${index + 1}. ${stat.name}`}
                    secondary={`${stat.count} question${stat.count !== 1 ? 's' : ''}`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              People who ask you questions most:
            </Typography>
            <List dense>
              {stats?.top_received.map((stat, index) => (
                <ListItem key={stat.user_id}>
                  <ListItemText
                    primary={`${index + 1}. ${stat.name}`}
                    secondary={`${stat.count} question${stat.count !== 1 ? 's' : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Past Answers */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Your Past Answers
            </Typography>
            <Box sx={{ mt: 2 }}>
              {pastAnswers.map((answer) => (
                <Card 
                  key={answer.id} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {answer.question.text}
                    </Typography>
                    {answer.question.author && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Asked by {answer.question.author.full_name || answer.question.author.email}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {answer.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {new Date(answer.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
