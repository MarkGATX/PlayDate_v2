// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyBL5dWnLYW0_csHUt6KuhfFdDnPusBtI0w",
  // authDomain: "playdate-v2.firebaseapp.com",
  // projectId: "playdate-v2",
  // storageBucket: "playdate-v2.appspot.com",
  // messagingSenderId: "109508274123",
  // appId: "1:109508274123:web:c652e73d734c128f7f784e",
  // measurementId: "G-5CVNZJ2DZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export {auth}