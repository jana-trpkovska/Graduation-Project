import React, {useEffect, useState} from 'react';
import './MyDrugs.css';
import trashIcon from '../../assets/trash.png'
import drugService from '../../repository/Repository';
import { useNavigate } from 'react-router-dom';

const MyDrugs = () => {
    const [drugInput, setDrugInput] = useState('');
    const [drugs, setDrugs] = useState([]);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [headerHeight, setHeaderHeight] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (drugInput.length > 0) {
                try {
                    const data = await drugService.getDrugSuggestions(drugInput);
                    setSuggestions(data);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            } else {
                setSuggestions([]);
            }
        };
        const fetchUserDrugs = async () => {
            try {
                const userDrugs = await drugService.getMyDrugs();
                setDrugs(userDrugs);
            } catch (error) {
                console.error("Failed to load user drugs", error);
            }
        };

        fetchUserDrugs();
        fetchSuggestions();
    }, [drugInput]);

    useEffect(() => {
        const header = document.querySelector(".app-header");
        if (header) setHeaderHeight(header.offsetHeight);

        const handleResize = () => {
            if (header) setHeaderHeight(header.offsetHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleRowClick = (drugId) => {
        navigate(`/drugs/${drugId}`);
    };

    const handleAddDrug = async () => {
        if (!selectedSuggestion) {
            alert("Please select a valid drug from suggestions.");
            return;
        }

        try {
            const newDrug = await drugService.addDrugToUser(selectedSuggestion.id);
            setDrugs(prev => [...prev, newDrug]);
            setDrugInput('');
            setSuggestions([]);
            setSelectedSuggestion(null);
        } catch (error) {
            if (error.response && error.response.data.detail) {
                alert(`Error: ${error.response.data.detail}`);
            } else {
                console.error("Error adding drug:", error);
            }
        }
    };

    const handleRemoveSelectedDrug = (drugId) => {
        setSelectedDrugs(prev => prev.filter(d => d.id !== drugId));
    };

    const handleSelectDrug = (e) => {
        const name = e.target.value;
        const selected = drugs.find(d => d.name === name);
        if (selected && !selectedDrugs.some(d => d.id === selected.id)) {
            setSelectedDrugs([...selectedDrugs, selected]);
        }
    };

    const handleRemoveDrug = async (drugId) => {
        try {
            await drugService.removeDrugFromUser(drugId);
            setDrugs(prev => prev.filter(d => d.id !== drugId));
            setSelectedDrugs(prev => prev.filter(d => d.id !== drugId));
        } catch (error) {
            console.error("Failed to remove drug:", error);
            alert("Could not remove drug.");
        }
    };

    const handleCheckInteractions = () => {
        if (selectedDrugs.length <= 1) {
            setErrorMessage("Please select at least two drugs.");
            return;
        }
        else {
            setErrorMessage('')
        }

        const drugNames = selectedDrugs.map(d => d.name).join(', ');
        const question = `What happens if I mix ${drugNames}?`;

        navigate("/chatbot", {
            state: {
                prefillQuestion: question
            }
        });
    };


    return (
        <div className="my-drugs-container" style={{ paddingTop: `${headerHeight}px` }}>
            <h1 className="my-drugs-title"><span className="highlight">My Drugs</span></h1>
            <div className="my-drugs-input-row">
                <input
                    type="text"
                    placeholder="Enter a drug name to add it"
                    value={drugInput}
                    onChange={e => {
                        const value = e.target.value;
                        setDrugInput(value);

                        const match = suggestions.find(s => s.name.toLowerCase() === value.toLowerCase());
                        setSelectedSuggestion(match || null);
                    }}
                    list="drug-suggestions"
                    className="my-drugs-input"
                />
                <datalist id="drug-suggestions">
                    {suggestions.map((drug) => (
                        <option key={drug.id} value={drug.name} />
                    ))}
                </datalist>
                <button className="my-drugs-add-btn" onClick={handleAddDrug}>Add</button>
            </div>
            <div className="my-drugs-content">
                <div className="my-drugs-table-section">
                    <table className="my-drugs-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Drug name</th>
                                <th>Usage</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {drugs.length === 0 ? (
                            <tr>
                                <td className="add-drugs-text" colSpan="4">
                                    Add your drugs to see them here
                                </td>
                            </tr>
                        ) : (
                            drugs.map((drug, idx) => (
                                <tr key={idx} onClick={() => handleRowClick(drug.id)}
                                    className="my-drugs-row">
                                    <td>{idx + 1}</td>
                                    <td>{drug.name}</td>
                                    <td>{drug.usage || '—'}</td>
                                    <td>
                                        <img
                                            src={trashIcon}
                                            alt="Remove"
                                            className="my-drugs-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveDrug(drug.id);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>

                    </table>
                </div>
                <div className="my-drugs-interactions-section">
                    <div className="my-drugs-interactions-title">
                        Check for interactions of your drugs
                    </div>
                    <select className="my-drugs-select"
                            onChange={handleSelectDrug}
                            value=""
                            disabled={selectedDrugs.length >= 5}>
                        <option value="">Select drugs</option>
                        {drugs.map((drug, idx) => (
                            <option key={idx} value={drug.name}>{drug.name}</option>
                        ))}
                    </select>
                    <div className="my-drugs-selected-list">
                        {selectedDrugs.map((drug, idx) => (
                            <div key={idx} className="my-drugs-selected-item">
                                {drug.name}
                                <img
                                    src={trashIcon}
                                    alt="Remove"
                                    className="my-drugs-remove"
                                    onClick={() => handleRemoveSelectedDrug(drug.id)}
                                />
                            </div>
                        ))}
                    </div>
                    {selectedDrugs.length >= 5 && (
                        <p className="alert-message">
                            Maximum 5 drugs can be selected.
                        </p>
                    )}
                    <button
                        className="my-drugs-check-btn"
                        onClick={handleCheckInteractions}>
                        Check
                    </button>

                    {errorMessage &&
                        <p className="error-message">{errorMessage}</p>
                    }

                </div>
            </div>
        </div>
    );
};

export default MyDrugs;