import React from 'react';
import './Header.css';
import logo from '../../assets/drugs.png';
import user from '../../assets/user.png';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="app-header">
            <nav className="navbar navbar-expand-lg text-light">
                <div className="container-fluid header-flex">
                    <div className="header-left">
                        <Link className="navbar-brand" to="/">
                            <img src={logo} alt="App Logo" className="logo" />
                            AppName
                        </Link>
                    </div>
                    <div className="header-center navbar-collapse justify-content-center">
                        <div className="navbar-nav">
                            <a className="nav-link me-4" href="/explore-drugs">Explore drugs</a>
                            <Link className="nav-link me-4" to="/chatbot">Chatbot</Link>
                            <Link className="nav-link" to="/my-drugs">My drugs</Link>
                        </div>
                    </div>
                    <div className="header-right d-flex align-items-center gap-2">
                        {isLoggedIn ? (
                            <>
                                <button className="logout-link" onClick={handleLogout}>Log Out</button>
                                <img src={user} alt="User Icon" className="user-icon" />
                            </>
                        ) : (
                            <Link className="login-link" to="/login">Log In</Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
