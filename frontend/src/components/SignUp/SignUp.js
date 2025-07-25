import React, { useState } from 'react';
import '../Login/Login.css';
import showIcon from '../../assets/show.png';
import hideIcon from '../../assets/hide.png';
import bot from "../../assets/medical-robot.png";
import { Link, useNavigate } from "react-router-dom";
import drugService from '../../repository/Repository';

const SignUp = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');

    const handleShowPassword = () => setShowPassword(prev => !prev);
    const handleShowRepeatPassword = () => setShowRepeatPassword(prev => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== repeatPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await drugService.signUp(username, password);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError("Registration failed. Try a different username.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Sign Up</h2>
                <img src={bot} alt="Bot Logo" className="bot-icon" />
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="login-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="login-input"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label htmlFor="password" className="login-label">Password</label>
                    <div className="login-password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="login-input password-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="login-show-password"
                            onClick={handleShowPassword}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <img
                                src={showPassword ? hideIcon : showIcon}
                                alt={showPassword ? 'Hide password' : 'Show password'}
                                className="login-eye-icon"
                            />
                        </button>
                    </div>

                    <label htmlFor="repeatPassword" className="login-label">Repeat Password</label>
                    <div className="login-password-wrapper">
                        <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            id="repeatPassword"
                            className="login-input password-input"
                            placeholder="Enter repeat password"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="login-show-password"
                            onClick={handleShowRepeatPassword}
                            tabIndex={-1}
                            aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                        >
                            <img
                                src={showRepeatPassword ? hideIcon : showIcon}
                                alt={showRepeatPassword ? 'Hide password' : 'Show password'}
                                className="login-eye-icon"
                            />
                        </button>
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" className="login-submit">Submit</button>
                </form>
            </div>
            <div className="login-signup">
                Already have an account? <Link to="/login" className="login-signup-link">Login</Link>
            </div>
        </div>
    );
};

export default SignUp;
