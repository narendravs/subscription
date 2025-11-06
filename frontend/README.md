# Subscription Frontend (React + Firebase)

React app that provides a subscription UI, authenticates users with Firebase, and integrates with the backend for Stripe Checkout.

## Tech Stack
- React 18 (Create React App tooling)
- Firebase Web SDK (Auth, Firestore, Realtime Database)
- React Router

Entry: src/index.js, src/App.js
Firebase config: src/firebase/firebaseConfig.js

## Prerequisites
- Node.js v18+
- A Firebase project with a Web App created
- Backend API running (default at http://localhost:5000) with CORS allowing the frontend origin

## Configuration
Edit src/firebase/firebaseConfig.js and set your Firebase web config. Example:
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<PROJECT_ID>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
  measurementId: "<MEASUREMENT_ID>"
};

Ensure you do not commit secrets you do not wish to expose. Consider using environment variables with CRA if needed (REACT_APP_*).

## Installation
npm install

## Running
- Development: npm start (serves at http://localhost:3000)
- Build: npm run build
- Test: npm test

## Integration with Backend/Stripe
Typical flow:
1) User signs in via Firebase Auth
2) Call backend POST /api/v1/create-subscription-checkout-session with body:
   { plan: 99 | 499 | 999, customerId: <firebase-uid> }
3) Redirect the user to session.url or handle via Stripe.js as desired
4) On success redirect, call backend POST /api/v1/payment-success with:
   { sessionId, firebaseId: <firebase-uid> }
5) Read subscription details from Firestore to display status

## Environment Variables (optional)
If you prefer not to hardcode Firebase values, add a .env file in the project root and reference with REACT_APP_*:
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_STORAGE_BUCKET
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- REACT_APP_FIREBASE_APP_ID
- REACT_APP_FIREBASE_MEASUREMENT_ID

Then load them in src/firebase/firebaseConfig.js.

## Common Issues
- Mixed environments (test vs live) for Stripe: ensure backend and frontend targets the same environment
- CORS: backend must allow http://localhost:3000 in development
- Authentication state: ensure you pass the correct Firebase UID to backend endpoints

## Deployment
- Build with npm run build and serve the static files via your preferred host
- Set environment variables via the hosting platform (if using REACT_APP_*)
- Use HTTPS for production
