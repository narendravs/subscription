const express = require("express");
const admin = require("firebase-admin");
const moment = require("moment");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(bodyParser.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!serviceAccount) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT is not defined in environment variables",
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL,
});

const corsOptions = {
  // Must match your Vite dev server URL exactly
  origin: [
    "http://localhost:5173",
    "https://subscription-dusky-eight.vercel.app",
    "https://subscription-6y7i1coxo-narendras-projects-120792d2.vercel.app/",
    "https://subscription-6y7i1coxo-narendras-projects-120792d2.vercel.app/",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

const stripeSession = async (plan) => {
  let planId = null;

  if (plan == 99) planId = process.env.basic;
  else if (plan == 499) planId = process.env.pro;
  else if (plan == 999) planId = process.env.business;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      success_url: process.env.success_url,
      cancel_url: process.env.cancel_url,
    });
    return session;
  } catch (e) {
    throw e; // Throw so the caller hits the catch block
  }
};
app.post("/api/v1/create-subscription-checkout-session", async (req, res) => {
  const { plan, customerId } = req.body;
  const basic = process.env.basic;

  const pro = process.env.pro;
  const business = process.env.business;
  try {
    const session = await stripeSession(plan);
    const user = await admin.auth().getUser(customerId);

    await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((snapshot) => {
        const data = snapshot.data();
        //console.log(data);
      })
      .catch((e) => console.log(e));

    if (session) {
      admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({ subscription: { sessionId: session.id } }, { merge: true });

      if (plan == 99) {
        admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set({ subscription: { planId: basic } }, { merge: true });
      } else if (plan == 499) {
        admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set({ subscription: { planId: pro } }, { merge: true });
      } else if (plan == 999) {
        admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set({ subscription: { planId: business } }, { merge: true });
      }
    }

    res.json({ session });
  } catch (error) {
    console.error("Stripe Error:", error);
    // Use res.status().json() so the client knows it's an error and gets a JSON object
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/api/v1/payment-success", async (req, res) => {
  const { sessionId, firebaseId } = req.body;

  if (!sessionId || !firebaseId) {
    return res.status(400).json({ message: "Missing sessionId or firebaseId" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not verified" });
    }

    const subscriptionId = session.subscription;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Use the firebaseId directly to get the user
    const userDocRef = admin.firestore().collection("users").doc(firebaseId);
    const snapshot = await userDocRef.get();

    if (!snapshot.exists) {
      throw new Error("User record not found in database");
    }

    const userData = snapshot.data();
    const planId = userData.subscription?.planId;

    // Fixed ternary logic (your original had a logic bug in the 'pro' check)
    const planType =
      session.amount_total === 9900
        ? "basic"
        : session.amount_total === 49900
          ? "pro"
          : "business";

    const startDate = moment.unix(session.created).format("YYYY-MM-DD");
    // Use subscription period end for accuracy instead of session expiry
    const endDate = moment
      .unix(subscription.current_period_end)
      .format("YYYY-MM-DD");

    const durationInDays = moment(endDate).diff(moment(startDate), "days");

    await userDocRef.set(
      {
        subscription: {
          planId,
          planType,
          planStartDate: startDate,
          planEndDate: endDate,
          planDuration: durationInDays,
          status: "active", // Good to track status
        },
      },
      { merge: true },
    );

    return res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error("Payment Success Error:", error);
    // Explicitly tell the client it failed
    return res.status(500).json({
      success: false,
      message: "Internal server error updating subscription",
    });
  }
});
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
