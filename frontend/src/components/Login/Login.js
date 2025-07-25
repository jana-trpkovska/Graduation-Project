import React, { useState } from 'react';
import './Login.css';
import showIcon from '../../assets/show.png';
import hideIcon from '../../assets/hide.png';
import bot from "../../assets/medical-robot.png";
import { Link, useNavigate } from "react-router-dom";
import drugService from '../../repository/Repository';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await drugService.login(username, password);
            localStorage.setItem('token', data.access_token);
            navigate('/');
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                <img src={bot} alt="Bot Logo" className="bot-icon"/>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="login-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="login-input"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        />
                        <button
                            type="button"
                            className="login-show-password"
                            onClick={() => setShowPassword(prev => !prev)}
                            tabIndex={-1}
                        >
                            <img
                                src={showPassword ? hideIcon : showIcon}
                                alt={showPassword ? 'Hide password' : 'Show password'}
                                className="login-eye-icon"
                            />
                        </button>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-submit">Submit</button>
                </form>
            </div>
            <div className="login-signup">
                Don&apos;t have an account? <Link to="/sign-up" className="login-signup-link">Sign Up</Link>
            </div>
        </div>
    );
};

export default Login;
