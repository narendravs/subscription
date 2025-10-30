# Subscription App (Frontend + Backend)

Monorepo containing a Firebase-backed subscription app with separate Backend (Node/Express) and Frontend (React). This README provides high-level usage, while each package has its own README for details.

- Backend: Node.js/Express server integrating with Firebase Admin for authentication and data. See ./backend/README.md
- Frontend: React application integrating with Firebase client SDK. See ./frontend/README.md

## Prerequisites

- Node.js LTS (v18+) and npm
- A Firebase project with:
  - Web app configuration (for frontend)
  - Service Account credentials (for backend Admin SDK)

## Quick Start

1. Install dependencies

- Backend: `cd subscription/backend && npm install`
- Frontend: `cd subscription/frontend && npm install`

2. Configure environment

- Backend: Provide Firebase service account JSON and environment variables (see backend/README.md)
- Frontend: Provide Firebase web config (see frontend/README.md)

3. Run apps

- Backend: `npm start` (from backend directory)
- Frontend: `npm start` (from frontend directory)

## Development Tips

- Keep service account JSON out of version control. Use environment variables or secret managers.
- For local development, ensure CORS settings on the backend allow the frontend origin.
- Use `.env` files (with a .env.local for sensitive overrides). Do not commit them.

## Project Structure

- subscription/
  - backend/ (Express API + Firebase Admin)
  - frontend/ (React + Firebase client SDK)

## Scripts Reference

See individual package READMEs for available scripts and details.
