import React, { useState, useContext, createContext } from "react";

// Create a new context

const AuthContext = createContext();

// Provider component

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Return the context provider value

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
