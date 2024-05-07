'use client'

import { useState } from "react";
import AuthContext from "./AuthContext";
import { initialState } from "./AuthContext";

export const AuthProvider = ({ children }:{children:React.ReactNode}) => {
    const [authState, setAuthState] = useState(initialState);

  
    // Functions to update auth state (e.g., login, logout)
  
    return (
      <AuthContext.Provider value={authState}>
        {children}
      </AuthContext.Provider>
    );
  };