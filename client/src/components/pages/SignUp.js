import React, { useState, useEffect } from "react";
import { auth, db } from '../../firebaseConfig'; // Adjust the path to firebaseConfig
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../signup.css';

export default function SignUpSignIn() {
    const [isSignUp, setIsSignUp] = useState(true); // Track whether to show sign-up or sign-in form
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [userEmail, setUserEmail] = useState(null); // State to hold the signed-in user's email
    const [errorMessage, setErrorMessage] = useState(""); // State to hold error messages
    const navigate = useNavigate(); // Initialize navigate

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrorMessage(""); // Clear the error message on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous error messages
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    moodSurveys: []
                });
                setUserEmail(user.email);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserEmail(userDoc.data().email);
                } else {
                    console.error("User document does not exist.");
                }
            }
            setFormData({ email: "", password: "" });
            navigate("/"); // Redirect to home page

        } catch (error) {
            if (error.code === "auth/user-not-found") {
                setErrorMessage("No account found with this email. Please sign up.");
            } else if (error.code === "auth/wrong-password") {
                setErrorMessage("Incorrect password. Please try again.");
            } else {
                setErrorMessage("Error: " + error.message);
            }
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

    useEffect(() => {
        console.log("Current signed in user email:", userEmail);
    }, [userEmail]);

    return (
        <div className="sign-up-container">
            {userEmail ? (
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

                        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}

                        <button type="submit" className="sign-up-btn">
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    <p class="sigup-divider">___________________________________________</p>

                    <div className="toggle-form">
                        <p class="haveaccount-label">
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
