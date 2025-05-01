require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51PpPmBP2WCmIMktqvXGUdLPlcTTPhjzXj0JfBq5sYnxeiR6iiqwcD5AI92KVkflw2V6Du0cjDKyAS743FBquUIFa00MxdRWMoL"
);
// const stripe = Stripe(
//   "sk_test_51PpPmBP2WCmIMktqvXGUdLPlcTTPhjzXj0JfBq5sYnxeiR6iiqwcD5AI92KVkflw2V6Du0cjDKyAS743FBquUIFa00MxdRWMoL"
// );
const express = require("express");
const admin = require("firebase-admin");
const moment = require("moment");
const cors = require("cors");
const bodyParser = require("body-parser");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const port = 5000;

app.use(express.json());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://subscription-42024-default-rtdb.asia-southeast1.firebasedatabase.app",
});

app.use(cors({ origin: "http://localhost:3000" }));

const stripeSession = async (plan) => {
  let planId = null;

  if (plan == 99) planId = "price_1PtPa6P2WCmIMktquQhQAbhC";
  else if (plan == 499) planId = "price_1PtPbMP2WCmIMktqdmIukZnC";
  else if (plan == 999) planId = "price_1PtPcGP2WCmIMktq2mEH1CRE";

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
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    return session;
  } catch (e) {
    return e;
  }
};
app.post("/api/v1/create-subscription-checkout-session", async (req, res) => {
  const { plan, customerId } = req.body;
  const basic = "price_1PtPa6P2WCmIMktquQhQAbhC";
  const pro = "price_1PtPbMP2WCmIMktqdmIukZnC";
  const business = "price_1PtPcGP2WCmIMktq2mEH1CRE";
  try {
    // const prices = await stripe.prices.list();
    // console.log(prices);
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
    // admin
    //   .auth()
    //   .updateUser(user.uid, {
    //     displayName: "narendra",
    //   })
    //   .then(function (userRecord) {
    //     // See the UserRecord reference doc for the contents of `userRecord`.
    //     console.log("Successfully updated user", userRecord.toJSON());
    //   })
    //   .catch(function (error) {
    //     console.log("Error updating user:", error);
    //   });

    res.json({ session });
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/api/v1/payment-success", async (req, res) => {
  const { sessionId, firebaseId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const subscriptionId = session.subscription;
      try {
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const user = await admin.auth().getUser(firebaseId);
        const planId = await admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get()
          .then((snapshot) => {
            const data = snapshot.data();
            const planId = data.subscription.planId;
            return planId;
          });
        const planType =
          session.amount_total == 9900
            ? "basic"
            : 9990
            ? "pro"
            : "business" || null;
        const startDate = moment.unix(session.created).format("YYYY-MM-DD");
        const endDate = moment.unix(session.expires_at).format("YYYY-MM-DD");

        let date1 = new Date(startDate);
        let date2 = new Date(endDate);

        const durationInSeconds = (date2.getTime() - date1.getTime()) / 1000;
        let Difference_In_Time = date2.getTime() - date1.getTime();
        let durationInDays = Math.round(
          Difference_In_Time / (1000 * 3600 * 24)
        );
        await admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set(
            {
              subscription: {
                planId: planId,
                planType: planType,
                planStartDate: startDate,
                planEndDate: endDate,
                planDuration: durationInDays,
              },
            },
            { merge: true }
          );
      } catch (error) {
        console.error("Error retrieving subscription:", error);
      }
      return res.json({ message: "Payment successfull" });
    } else {
      return res.json({ message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    return;
  }
});
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
