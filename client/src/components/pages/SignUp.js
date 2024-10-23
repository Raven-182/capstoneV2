import React, { useState, useEffect } from "react";
import { auth, db } from '../../firebaseConfig'; // Adjust the path to firebaseConfig
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import '../../App.css';

export default function SignUpSignIn() {
    const [isSignUp, setIsSignUp] = useState(true); // Track whether to show sign-up or sign-in form
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [userEmail, setUserEmail] = useState(null); // State to hold the signed-in user's email

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                // Sign up the user
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Debugging: Log user object after sign-up
                console.log("User signed up:", user);

                // Save additional user data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    moodSurveys: [] // Initialize with an empty array for mood surveys
                });

                // Update user email state
                setUserEmail(user.email); // Set user email after sign up
            } else {
                // Sign in the user
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Debugging: Log user object after sign-in
                console.log("User signed in:", user);

                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    console.log("User document:", userDoc.data());
                    setUserEmail(userDoc.data().email); // Set user email after sign in
                } else {
                    console.error("User document does not exist.");
                }
            }
            setFormData({ email: "", password: "" }); // Reset form data

        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            setUserEmail(null); // Clear user email on sign out
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Debugging useEffect to check if userEmail is updating correctly
    useEffect(() => {
        console.log("Current signed in user email:", userEmail);
    }, [userEmail]);

    return (
        <div className="sign-up-container">
            {userEmail ? ( // Check if userEmail is set
                <div>
                    <h1>Welcome, {userEmail}!</h1>
                    <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
                </div>
            ) : (
                <>
                    <h1 className="sign-up-title">{isSignUp ? "Sign Up" : "Sign In"}</h1>

                    <form onSubmit={handleSubmit} className="sign-up-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button type="submit" className="sign-up-btn">
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>

                        {userEmail && !isSignUp && (
                            <p className="user-email-display">Signed in as: {userEmail}</p>
                        )}
                    </form>

                    <div className="toggle-form">
                        <p>
                            {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="toggle-btn">
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
