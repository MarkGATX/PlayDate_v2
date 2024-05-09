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

  // // Functions to update auth state (e.g., login, logout)
  // const googleAuthProvider = new GoogleAuthProvider();
  // googleAuthProvider.setCustomParameters({
  //   prompt: 'select_account'
  // });

  // const signInWithGoogle = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleAuthProvider);
  //     const user = result.user
  //     setAuthState({ ...authState, isLoggedIn: true, user: user })
  //     console.log(user)
  //   } catch (error: any) {
  //     console.log(error)
  //     // The AuthCredential type that was used.          
  //     const credentialError = GoogleAuthProvider.credentialFromError(error);
  //   }
  // };

  // const signOutWithGoogle = () => {
  //   try {
  //     signOut(auth);
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  return (
    <AuthContext.Provider value={{user}}>
      {children}
    </AuthContext.Provider>
  );
};