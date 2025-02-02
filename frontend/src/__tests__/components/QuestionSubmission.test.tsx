import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestionSubmission from '../../components/QuestionSubmission';
import { AuthProvider } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the auth context
const mockAuthContext = {
  token: 'fake-token',
  user: {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User'
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: true
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

const mockUsers = [
  { id: '2', username: 'user2', email: 'user2@example.com' },
  { id: '3', username: 'user3', email: 'user3@example.com' }
];

describe('QuestionSubmission Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the users endpoint
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
  });

  const renderQuestionSubmission = () => {
    return render(
      <AuthProvider>
        <QuestionSubmission />
      </AuthProvider>
    );
  };

  test('renders question submission form', async () => {
    renderQuestionSubmission();

    expect(screen.getByText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit question/i })).toBeInTheDocument();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8000/users/',
        expect.any(Object)
      );
    });
  });

  test('validates required fields', async () => {
    renderQuestionSubmission();

    const submitButton = screen.getByRole('button', { name: /submit question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please select a recipient and enter your question/i)).toBeInTheDocument();
    });
  });

  test('handles successful question submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: '1', text: 'Test question?' } });
    
    renderQuestionSubmission();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    // Fill in the form
    const recipientInput = screen.getByLabelText(/select recipient/i);
    const questionInput = screen.getByLabelText(/your question/i);
    
    fireEvent.change(recipientInput, { target: { value: 'user2@example.com' } });
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/questions/user-question',
        expect.any(Object),
        expect.any(Object)
      );
      expect(screen.getByText(/question submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('handles submission error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to submit question'));
    
    renderQuestionSubmission();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    // Fill in the form
    const recipientInput = screen.getByLabelText(/select recipient/i);
    const questionInput = screen.getByLabelText(/your question/i);
    
    fireEvent.change(recipientInput, { target: { value: 'user2@example.com' } });
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to submit question/i)).toBeInTheDocument();
    });
  });

  test('clears form after successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: '1', text: 'Test question?' } });
    
    renderQuestionSubmission();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    // Fill in the form
    const recipientInput = screen.getByLabelText(/select recipient/i);
    const questionInput = screen.getByLabelText(/your question/i);
    
    fireEvent.change(recipientInput, { target: { value: 'user2@example.com' } });
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(questionInput).toHaveValue('');
      expect(recipientInput).toHaveValue('');
    });
  });
});
