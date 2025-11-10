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

  const hanldePayment = async (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/v1/payment-success", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ sessionId: sessionId, firebaseId: userId }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => PromiseRejectionEvent(json));
      })
      .then((data) => {
        console.log(data.message);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
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
            onClick={hanldePayment}
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
