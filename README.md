# Alexandria's Journal

A digital platform for preserving life stories, one question at a time. Inspired by the great Library of Alexandria, this app helps families capture and preserve their personal histories through daily questions and answers.

## Features

- Daily questions delivered via email notifications
- Custom questions from family and friends
- AI-generated questions when needed
- Beautiful, stress-free interface inspired by ancient libraries
- Secure storage of personal memories
- Easy browsing of past entries

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React with Material-UI
- Database: PostgreSQL
- Email: SendGrid
- AI: OpenAI for question generation

## Quick Start

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with your configuration

5. Run the development servers:
   - Backend: `uvicorn main:app --reload`
   - Frontend: `npm start`

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.
