import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebaseConfig";

  // Functions to update auth state (e.g., login, logout)
  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({
    prompt: 'select_account'
  });

  export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user
      setAuthState({ ...authState, isLoggedIn: true, user: user })
      console.log(user)
    } catch (error: any) {
      console.log(error)
      // The AuthCredential type that was used.          
      const credentialError = GoogleAuthProvider.credentialFromError(error);
    }
  };

  const signOutWithGoogle = () => {
    try {
      signOut(auth);
    } catch (error) {
      console.log(error)
    }
  }