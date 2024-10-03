import { createContext } from "react";
import { User } from "firebase/auth";

// undefined: onAuthStateChanged hasn't been called
// null: user is not signed in
// User: user signed in
export type AuthContextType = {
  user: User | null | undefined;
};

export const AuthContext = createContext<AuthContextType>({ user: undefined });
