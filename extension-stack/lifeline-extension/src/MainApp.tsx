import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginPage from './components/Login';
import './components/Login.css'
import App from './components/App';

function MainApp() {
const [user, setUser] = useState<User | null>(null); // State to track user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set user state
        setUser(user);
      } else {
        // User is signed out, clear user state
        setUser(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div className="app">
      {user ? <App /> : <LoginPage />} 
    </div>
  );
}

export default MainApp;
