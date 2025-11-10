import React, { useEffect, useState } from "react";
import basic from "../assets/basic.svg";
import pro from "../assets/pro.svg";
import business from "../assets/business.svg";
import { onAuthStateChanged } from "firebase/auth";
import firebase, { firestore } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const data = [
  {
    id: 1,
    src: basic,
    title: "Basic",
    price: "99",
  },
  {
    id: 2,
    src: pro,
    title: "Pro",
    price: "499",
  },
  {
    id: 3,
    src: business,
    title: "Business",
    price: "999",
  },
];

const Home = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [planType, setPlanType] = useState("");
  //const user = localStorage.getItem("user");
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(firebase, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName);

        const docRef = await doc(firestore, "users", user.uid);
        await getDoc(docRef)
          .then((snapshot) => {
            const data = snapshot.data();
            setPlanType(data.subscription.planType);
            console.log(planType);
          })
          .catch((e) => console.log(e));
      } else {
        // User is signed out
        // ...
        console.log("user is logged out");
        navigate("/login");
      }
    });
  }, [userId, planType, navigate]);

  const checkout = async (plan) => {
    fetch("http://localhost:5000/api/v1/create-subscription-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ plan: plan, customerId: userId }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        console.log(res);
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ session }) => {
        window.location = session.url;
      })
      .catch((e) => {
        console.log(e.error);
      });
  };

  const handleLogout = () => {
    signOut(firebase);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto min-h-screen diagonal-background overflow-x-hidden">
      <div className="flex items-center justify-between w-full px-6 h-20 bg-[#00000012]">
        <div className="text-4xl font-bold text-white">serVices</div>
        <div className="flex items-center justify-center gap-2">
          {false ? (
            <a
              href="/login"
              className="bg-white rounded-lg text-xl px-4 py-2 uppercase text-[#4f7cff] font-semibold w-auto"
            >
              Login
            </a>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <span className="text-white text-xl">{userName}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-xl rounded-lg text-[#4f7cff] font-semibold w-auto px-4 py-2 uppercase"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2  gap-5 z-50 place-items-center w-9/12 mx-auto mt-20">
        {data.map((item, indx) => (
          <div
            key={indx}
            className={`bg-white px-6 py-8 rounded-xl text-[#4f7cff] w-full mx-auto grid 
            place-items-center ${
              planType === item.title.toLowerCase() &&
              "border-[16px] border-green-400"
            }`}
          >
            <img
              src={item.src}
              alt=""
              width={200}
              height={200}
              className="h-40"
            />
            <div className="text-4xl text-slate-700 text-center py-4 font-bold">
              {item.title}
            </div>
            <p className="lg:text-sm text-xs text-center px-6 text-slate-500">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Dignissimos quaerat dolore sit eum quas non mollitia reprehenderit
              repudiandae debitis tenetur?
            </p>
            <div className="text-4xl text-center font-bold py-4">
              ₹{item.price}
            </div>
            <div className="flex items-center justify-center mx-auto my-3 ">
              {planType === item.title.toLowerCase() ? (
                <div className="bg-green-600 text-white rounded-md text-base uppercase py-2 px-4 w-auto font-bold">
                  Subscribed
                </div>
              ) : (
                <div
                  onClick={() => checkout(Number(item.price))}
                  className="bg-[#3d5fc4] text-white rounded-md text-base uppercase w-24 py-2 font-bold text-center hover:cursor-pointer "
                >
                  Start
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
