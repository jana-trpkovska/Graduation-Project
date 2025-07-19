import React, { useState } from 'react';
import './Login.css';
import showIcon from '../../assets/show.png'
import hideIcon from '../../assets/hide.png'
import bot from "../../assets/robotic.png";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => setShowPassword((prev) => !prev);

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                <img src={bot} alt="Bot Logo" className="bot-icon"/>
                <form className="login-form">
                    <label htmlFor="username" className="login-label">Username</label>
                    <input type="text" id="username" className="login-input" placeholder="Enter username" />

                    <label htmlFor="password" className="login-label">Password</label>
                    <div className="login-password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="login-input password-input"
                            placeholder="Enter password"
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

                    <div className="login-remember">
                        <input type="checkbox" id="remember" className="login-checkbox" />
                        <label htmlFor="remember" className="login-remember-label">Remember me?</label>
                    </div>

                    <button type="submit" className="login-submit">Submit</button>
                </form>
            </div>
            <div className="login-signup">
                Don&apos;t have an account? <a href="#" className="login-signup-link">Sign Up</a>
            </div>
        </div>
    );
};

export default Login;