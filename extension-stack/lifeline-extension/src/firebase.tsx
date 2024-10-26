
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//reference to the users 
const auth = getAuth(app);

export { auth };