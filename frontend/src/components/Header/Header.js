import React from 'react';
import './Header.css';
import logo from '../../assets/drugs.png'
import user from '../../assets/user.png'

const Header = () => {
    return (
        <header className="app-header">
            <nav className="navbar navbar-expand-lg text-light">
                <div className="container-fluid header-flex">
                    <div className="header-left">
                        <a className="navbar-brand" href="#">
                            <img src={logo} alt="App Logo" className="logo"/>
                            AppName
                        </a>
                    </div>
                    <div className="header-center navbar-collapse justify-content-center">
                        <div className="navbar-nav">
                            <a className="nav-link me-4" href="#">Explore drugs</a>
                            <a className="nav-link me-4" href="#">Chatbot</a>
                            <a className="nav-link" href="#">My drugs</a>
                        </div>
                    </div>
                    <div className="header-right">
                        <a className="login-link" href="#">Log In</a>
                        <img src={user} alt="App Logo" className="user-icon"/>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;