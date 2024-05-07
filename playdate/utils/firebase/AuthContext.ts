import { createContext, useState } from 'react';

export const initialState = {
  isLoggedIn: false,
  user: null,
};

const AuthContext = createContext(initialState);

export default AuthContext;