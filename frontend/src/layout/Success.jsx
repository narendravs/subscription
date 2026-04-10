import React, { useState, useEffect } from "react";
import success from "../assets/success.png";
import { useNavigate } from "react-router-dom";
import firebase, { firestore } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Success = () => {
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(firebase, async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = await doc(firestore, "users", user.uid);
        await getDoc(docRef)
          .then((snapshot) => {
            const data = snapshot.data();
            setSessionId(data.subscription.sessionId);
            // console.log(sessionId);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }, [userId, sessionId]);

  const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:5000/api/";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${cleanBaseUrl}/v1/payment-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          sessionId: sessionId,
          firebaseId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Trigger the catch block with the error from the server
        throw new Error(data.message || "Payment verification failed");
      }

      console.log("Success:", data.message);
      navigate("/");
    } catch (err) {
      console.error("Payment Error:", err.message);
      // Add UI feedback here if needed, like a toast notification
    }
  };
  return (
    <div className="m-0 p-0">
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center">
        <div className="my-10 text-green-600 text-2xl mx-auto flex flex-col items-center justify-center">
          <img src={success} alt="" width={200} height={200} />
          <h3 className="text-4xl font-bold text-slate-500 pt-20 lg:pt-0 text-center">
            Payment Successful
          </h3>

          <button
            onClick={handlePayment}
            className="w-40 uppercase rounded bg-[#009C96] px-4 py-4 text-white my-16"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
