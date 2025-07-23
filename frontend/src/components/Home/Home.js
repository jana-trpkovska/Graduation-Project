import React, { useState, useEffect } from 'react';
import './Home.css';
import search from '../../assets/search.png';
import interactions from '../../assets/pills.png';
import drugs from '../../assets/my_drugs.png';
import chatbot from '../../assets/chatbot.png';
import { Link } from "react-router-dom";
import drugService from "../../repository/Repository";  // Import the drugService

const featureButtons = [
    { label: 'Search drugs', img: search, path: '/explore-drugs' },
    { label: 'Check interactions', img: interactions, path: '/chatbot' },
    { label: 'Save your drugs', img: drugs, path: '/my-drugs' },
    { label: 'Chat with assistant', img: chatbot, path: '/chatbot' },
];

const Home = () => {
    const [popularDrugs, setPopularDrugs] = useState([]);

    useEffect(() => {
        const fetchPopularDrugs = async () => {
            try {
                const data = await drugService.getPopularDrugs();
                setPopularDrugs(data);
            } catch (error) {
                console.error("Error fetching popular drugs:", error);
            }
        };

        fetchPopularDrugs();
    }, []);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1><span className="highlight">Welcome to AppName</span></h1>
                <p className="subtitle">Your Personal Drug Info Assistant!</p>
            </div>

            <div className="features-card">
                {featureButtons.map((btn, idx) => (
                    <Link to={btn.path} className="feature-btn" key={idx}>
                        <img src={btn.img} alt={btn.label} className="feature-img" />
                        <div className="feature-label">{btn.label}</div>
                    </Link>
                ))}
            </div>

            <div className="popular-section">
                <span className="popular-title">Most popular drugs</span>
                <Link to="/explore-drugs" className="view-all">View all</Link>
            </div>

            <div className="popular-drugs-card">
                {popularDrugs.map((drug, idx) => (
                    <Link to="/#" className="popular-drug-btn" key={idx}>
                        <div className="drug-item" key={idx}>
                            <span className="arrow">→</span> {drug.name}
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
};

export default Home;
