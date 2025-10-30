# Subscription Backend (Node/Express + Firebase Admin + Stripe)

Express server that manages subscription checkout sessions with Stripe, user records in Firebase (Authentication + Firestore), and payment confirmation web flow.

## Tech Stack
- Node.js, Express
- Firebase Admin SDK (Auth + Firestore)
- Stripe (Checkout + Subscriptions)
- CORS, body-parser, dotenv, moment

Main entry: server.js

## Prerequisites
- Node.js v18+
- A Firebase project and Service Account with permissions to access Auth and Firestore
- A Stripe account with product/price IDs created for your subscription plans

## Configuration
Create a .env file in backend/ with the following variables:

# Stripe
STRIPE_PRIVATE_KEY=sk_live_or_test_key

# Firebase Admin
# Note: server.js loads ./serviceAccountKey.json; keep this file secure and out of VCS
# Optionally, set the databaseURL used by Admin SDK
databaseURL=https://<your-project-id>.firebaseio.com

# Stripe Checkout Price IDs
basic=price_XXXX_basic
pro=price_XXXX_pro
business=price_XXXX_business

# Success/Cancel URLs for checkout redirect
success_url=http://localhost:3000/success
cancel_url=http://localhost:3000/cancel

Also ensure a service account JSON file exists at backend/serviceAccountKey.json. Do not commit it to version control.

## Installation
npm install

## Running
- Development: npm run dev
- Production: npm start

By default, the server listens on port 5000 and enables CORS for http://localhost:3000.

## API Endpoints
1) POST /api/v1/create-subscription-checkout-session
Request body:
{
  "plan": 99 | 499 | 999,
  "customerId": "<firebase-uid>"
}
Behavior:
- Chooses the Stripe price based on plan amount
- Creates a Stripe Checkout session (mode: subscription)
- Persists sessionId and planId under users/{uid}/subscription in Firestore
Response:
{
  "session": { ...Stripe session object }
}

2) POST /api/v1/payment-success
Request body:
{
  "sessionId": "<stripe-session-id>",
  "firebaseId": "<firebase-uid>"
}
Behavior:
- Retrieves the session
- If paid, retrieves the Stripe subscription and updates user subscription document with plan details and dates
Response:
{ "message": "Payment successfull" } or { "message": "Payment failed" }

Note: The plan type inference in server.js checks session.amount_total; ensure amounts reflect your price configuration.

## Firestore Structure (example)
users/{uid}/subscription: {
  sessionId: string,
  planId: string,
  planType: "basic" | "pro" | "business",
  planStartDate: YYYY-MM-DD,
  planEndDate: YYYY-MM-DD,
  planDuration: number
}

## Security Notes
- Never commit serviceAccountKey.json or .env files
- Lock down Firestore security rules according to your needs
- Consider verifying Firebase ID tokens on protected endpoints

## Common Issues
- CORS: Update allowed origin if frontend runs on a different host/port
- Stripe price IDs: Ensure correct environment (test vs live) and that price IDs match plan mapping
- Firebase Admin initialization: databaseURL must match your Firebase project and service account permissions

## Deployment
- Set all environment variables on your hosting platform (no JSON secrets in repo)
- Provide the service account credentials via environment or secret manager; if mounting a file, update server.js path accordingly
- Use HTTPS in production for Stripe redirects and frontend
