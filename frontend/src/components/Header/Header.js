import React, { useContext, useState } from 'react';
import './Header.css';
import logo from '../../assets/drugs.png';
import userIcon from '../../assets/user.png';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const isAuthenticated = !!user;
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        setIsOpen(false);
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    };

    const handleNavClick = () => setIsOpen(false);

    return (
        <header className="app-header">
            <nav className="navbar navbar-expand-lg text-light">
                <div className="container-fluid header-flex">
                    <div className="header-left">
                        <Link className="navbar-brand" to="/" onClick={handleNavClick}>
                            <img src={logo} alt="App Logo" className="logo" />
                            AppName
                        </Link>
                    </div>

                    <button
                        className="collapse-button"
                        onClick={toggleMenu}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        type="button"
                    >
                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <rect x="0" y="1" width="22" height="2" rx="1" />
                            <rect x="0" y="7" width="22" height="2" rx="1" />
                            <rect x="0" y="13" width="22" height="2" rx="1" />
                        </svg>
                    </button>

                    <div className={`collapsible ${isOpen ? 'open' : ''}`}>
                        <div className="header-center navbar-collapse justify-content-center">
                            <div className="navbar-nav">
                                <Link className="nav-link me-4" to="/explore-drugs" onClick={handleNavClick}>Explore drugs</Link>
                                <Link className="nav-link me-4" to="/chatbot" onClick={handleNavClick}>Chatbot</Link>
                                <Link className="nav-link" to="/my-drugs" onClick={handleNavClick}>My drugs</Link>
                            </div>
                        </div>

                        <div className="header-right d-flex align-items-center gap-2">
                            {isAuthenticated ? (
                                <>
                                    <button className="logout-link" onClick={handleLogout}>Log Out</button>
                                    <img src={userIcon} alt="User Icon" className="user-icon" />
                                </>
                            ) : (
                                <Link className="login-link" to="/login" onClick={handleNavClick}>Log In</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
