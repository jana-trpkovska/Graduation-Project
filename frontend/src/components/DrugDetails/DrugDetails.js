import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DrugDetails.css';
import drugService from '../../repository/Repository';
import medicalRobot from '../../assets/medical-robot.png';
import { Link } from "react-router-dom";

const DrugDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [drug, setDrug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const fetchDrug = async () => {
            try {
                const data = await drugService.getDrugById(id);
                setDrug(data);
                await drugService.incrementPopularity(id);
            } catch (err) {
                setError("Drug not found");
            } finally {
                setLoading(false);
            }
        };

        fetchDrug();
    }, [id]);

    useEffect(() => {
        const header = document.querySelector(".app-header");
        if (header) setHeaderHeight(header.offsetHeight);

        const handleResize = () => {
            if (header) setHeaderHeight(header.offsetHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (loading) return <div className="drug-details">Loading...</div>;
    if (error) return <div className="drug-details error">{error}</div>;

    const handleCheckClick = () => {
        if (drug) {
            navigate("/chatbot", {
                state: {
                    prefillQuestion: `Give me all the drugs that interact with ${drug.name}`
                }
            });
        }
    };

    return (
        <div className="drug-details-container" style={{ paddingTop: `${headerHeight}px` }}>
            <h1 className="drug-details-title"><span className="highlight">Drug Details</span></h1>

            <div className="drug-details-content">
                <div className="drug-info-section">
                    <h2 className="drug-name">{drug.name}</h2>
                    <p className="drug-detail"><strong>Generic name:</strong> {drug.generic_name || "N/A"}</p>
                    <p className="drug-detail"><strong>Drug class:</strong> {drug.drug_class || "N/A"}</p>

                    <div className="drug-section">
                        <h3 className="section-title">Usage</h3>
                        <p className="section-content">{drug.usage || "N/A"}</p>
                    </div>

                    <div className="drug-section">
                        <h3 className="section-title">Side effects</h3>
                        <ul className="side-effects-list">
                            {drug.side_effects
                                ? drug.side_effects
                                    .split(';')
                                    .map(effect => effect.trim())
                                    .filter(effect => effect && effect.toLowerCase() !== "or")
                                    .map((effect, index) => (
                                        <li key={index}>{effect}</li>
                                    ))
                                : <li>No side effects listed.</li>
                            }
                        </ul>
                    </div>


                    <div className="drug-section">
                        <h3 className="section-title">Warnings</h3>
                        <div className="warnings-box">
                            <p>{drug.warnings || "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="interaction-section">
                    <div className="interaction-box">
                        <p className="interaction-text">
                            Want to know more about the drugs that interact with {drug.name}?
                        </p>
                        <button className="check-button" onClick={handleCheckClick}>
                            Check
                        </button>
                    </div>
                </div>
            </div>
            <Link to="/chatbot" className="fixed-chatbot">
                <img src={medicalRobot} alt="Chat with assistant" />
            </Link>
        </div>
    );
};

export default DrugDetails;
