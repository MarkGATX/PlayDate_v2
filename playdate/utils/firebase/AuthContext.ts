import { createContext } from 'react';
import { User } from 'firebase/auth';

// undefined: onAuthStateChanged hasn't been called
// null: user is not signed in
// User: user signed in
export type AuthContextType = {
    user: User | null | undefined

  }
  
  export const AuthContext = createContext<AuthContextType> ({ user: undefined })

// export const initialState = {
//   isLoggedIn: false,
//   user: null as User | null,
// };

// const AuthContext = createContext(initialState);

// export default AuthContext;

// accessToken
// : 
// "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc2MDI3MTI2ODJkZjk5Y2ZiODkxYWEwMzdkNzNiY2M2YTM5NzAwODQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTWFyayBHYXJkbmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tCV3hvOUJpd0Iwc3ZEMXVOQW9jcVg5RDhIVFZBVWlvM2s2c2RyTENRRUw3LXZWbjRyTGc9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcGxheWRhdGUtdjIiLCJhdWQiOiJwbGF5ZGF0ZS12MiIsImF1dGhfdGltZSI6MTcxNTIwMjU3OSwidXNlcl9pZCI6IkVtTTV0Qk5hbTliRnQ1S3ZqOG5qVUFZSWo5dzEiLCJzdWIiOiJFbU01dEJOYW05YkZ0NUt2ajhualVBWUlqOXcxIiwiaWF0IjoxNzE1MjAyNTc5LCJleHAiOjE3MTUyMDYxNzksImVtYWlsIjoidGhlbWFya2dhcmRuZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTU1MzEwOTIyODU1MTExMzQ2MDEiXSwiZW1haWwiOlsidGhlbWFya2dhcmRuZXJAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.jhnwLTMY6nbMISzPhtzcehQTBT7t6VQZa_QvMRZdNiTO36IeyXb-VCvU0iXJ18RPS1YRN0LJEAxFoALU9YWbgB5xl7bjHz-WTCpd1nIQpeJO4wYaM-mEGt2SkEu8t51gpVEj9Wu2hviIeSin8d_gDscBQQv-hVpomQvJuec7S0dMie6BS3a5vKDgiIZqtCv_Q7IdV7KxWkPrxSsufByBR8adp9t1c3OGGmsZ-zvAsTwNc9ghaEKbZAueH-u3Tp2i7-AzUHWiNgf2-Q8MAfFN4XfrrcYfWLrDsNgwTVkFOuqx0kI-oNYqfg2NAKSUdMHQt4NgqT2PwRO4sTzjRVkpCQ"
// auth
// : 
// AuthImpl {app: FirebaseAppImpl, heartbeatServiceProvider: Provider, appCheckServiceProvider: Provider, config: {…}, currentUser: UserImpl, …}
// displayName
// : 
// "Mark Gardner"
// email
// : 
// "themarkgardner@gmail.com"
// emailVerified
// : 
// true
// isAnonymous
// : 
// false
// metadata
// : 
// UserMetadata {createdAt: '1715202469419', lastLoginAt: '1715202469419', lastSignInTime: 'Wed, 08 May 2024 21:07:49 GMT', creationTime: 'Wed, 08 May 2024 21:07:49 GMT'}
// phoneNumber
// : 
// null
// photoURL
// : 
// "https://lh3.googleusercontent.com/a/ACg8ocKBWxo9BiwB0svD1uNAocqX9D8HTVAUio3k6sdrLCQEL7-vVn4rLg=s96-c"
// proactiveRefresh
// : 
// ProactiveRefresh {user: UserImpl, isRunning: false, timerId: null, errorBackoff: 30000}
// providerData
// : 
// [{…}]
// providerId
// : 
// "firebase"
// reloadListener
// : 
// null
// reloadUserInfo
// : 
// {localId: 'EmM5tBNam9bFt5Kvj8njUAYIj9w1', email: 'themarkgardner@gmail.com', displayName: 'Mark Gardner', photoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocKBWxo9BiwB0svD1uNAocqX9D8HTVAUio3k6sdrLCQEL7-vVn4rLg=s96-c', emailVerified: true, …}
// stsTokenManager
// : 
// StsTokenManager {refreshToken: 'AMf-vBy8QeO8UqiHCYYMudKDPAztXJatFcR7SRuQfQ5tPLnlD3…CisIGFewTCDqdT7z_QAaP3EBXDbaBb1X9hZUncUs1kEMkDuug', accessToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc2MDI3MTI2ODJkZjk5Y2…VkFOuqx0kI-oNYqfg2NAKSUdMHQt4NgqT2PwRO4sTzjRVkpCQ', expirationTime: 1715206181375}
// tenantId
// : 
// null
// uid
// : 
// "EmM5tBNam9bFt5Kvj8njUAYIj9w1"
// refreshToken
// : 
// (...)
// [[Prototype]]
// : 
// Object