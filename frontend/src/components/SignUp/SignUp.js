import React, { useState } from 'react';
import '../Login/Login.css';
import showIcon from '../../assets/show.png'
import hideIcon from '../../assets/hide.png'
import bot from "../../assets/medical-robot.png";
import {Link} from "react-router-dom";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => setShowPassword((prev) => !prev);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const handleShowRepeatPassword = () => setShowRepeatPassword((prev) => !prev);

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Sign Up</h2>
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

                    <label htmlFor="repeatPassword" className="login-label">Repeat Password</label>
                    <div className="login-password-wrapper">
                        <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            id="repeatPassword"
                            className="login-input password-input"
                            placeholder="Enter repeat password"
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