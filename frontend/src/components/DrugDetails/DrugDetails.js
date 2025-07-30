import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DrugDetails.css';
import drugService from '../../repository/Repository';

const DrugDetails = () => {
    const { id } = useParams();
    const [drug, setDrug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDrug = async () => {
            try {
                const data = await drugService.getDrugById(id);
                setDrug(data);
            } catch (err) {
                setError("Drug not found");
            } finally {
                setLoading(false);
            }
        };

        fetchDrug();
    }, [id]);

    if (loading) return <div className="drug-details">Loading...</div>;
    if (error) return <div className="drug-details error">{error}</div>;

    return (
        <div className="drug-details-container">
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
                                ? drug.side_effects.split(';').map((effect, index) => (
                                    <li key={index}>{effect.trim()}</li>
                                ))
                                : <li>No side effects listed.</li>}
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
                        <button className="check-button">Check</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrugDetails;
