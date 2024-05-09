'use client'

import { useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "./AuthContext";
import { auth, app } from "./firebaseConfig";
import { User } from "firebase/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // auth.onAuthStateChanged(() => setUser(user))
    auth.onAuthStateChanged(setUser) 
  }, [])

  return (
    <AuthContext.Provider value={{user}}>
      {children}
    </AuthContext.Provider>
  );
};