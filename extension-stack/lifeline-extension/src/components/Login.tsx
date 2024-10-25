import  { useState } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css'; 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault(); 

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful!");
        } catch (err) {
            setError("Incorrect username or password. If you dont have an account, please create an account in the lifeline application."); 
        }
    };

    return (
        <div className="login-card">
            <h1>Lifeline Meeting Recorder</h1>
            <img src="/icons/heart.gif" alt="Heart Icon" className="heart-icon" />
            <h2>Log in to your account</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>} {/* Display error message */}
        </div>
    );
}

export default LoginPage;
