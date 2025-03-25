# GenaIGenesis - Green Receipt Analyzer

This application analyzes receipts and evaluates how eco-friendly your purchases are. It uses Claude AI to extract text from receipt images and provide environmental impact analysis.

## Features

- Upload receipt images
- Extract text using Claude Vision
- Analyze purchases for eco-friendliness
- Rate individual items on a green scale (1-5)
- Calculate overall green score
- Provide feedback on how to shop more sustainably

## Project Structure

- `/frontend` - React frontend application
- `/backend` - Express server for handling Claude API calls and Database actions

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install:all
```

This will install dependencies for the main project, frontend, and backend.

### Configuration

The backend uses a .env file with the Claude API key. You will have to set this up yourself to host it.

### Running the Application

To run both frontend and backend concurrently:

```bash
npm start
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3001 and http://localhost:3002

### Using the Application

1. Navigate to http://localhost:5173/login to login.
2. Then go to dashboard and click on upload
3. Upload a receipt image
4. The application will extract text from the image using Claude Vision
5. It will then analyze the purchases for eco-friendliness
6. View the detailed breakdown of your green score

## Technical Details

- Frontend: React with Vite
- Backend: Express.js
- AI: Claude API (via Anthropic)
- Image Processing: Claude Vision API

## Development

- Frontend code is in `/frontend/src`
- Backend code is in `/backend`
- API integration is in `/frontend/src/api/ai.js`
