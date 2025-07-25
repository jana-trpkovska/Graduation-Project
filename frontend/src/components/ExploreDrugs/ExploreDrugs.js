import React, { useEffect, useState } from 'react';
import './ExploreDrugs.css';
import filterIcon from '../../assets/filter.png';
import searchIcon from '../../assets/search-icon.png';
import drugService from '../../repository/Repository';

const ExploreDrugs = () => {
    const [drugs, setDrugs] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [drugClassInput, setDrugClassInput] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandFirstLetter, setExpandFirstLetter] = useState(false);
    const [expandDrugClass, setExpandDrugClass] = useState(false);
    const drugsPerPage = 18;

    const fetchFilteredDrugs = async (newFilters = {}) => {
        const params = {
            query: newFilters.query !== undefined ? newFilters.query : searchTerm,
            drug_class: newFilters.drug_class !== undefined ? newFilters.drug_class : drugClassInput,
            letter: newFilters.letter !== undefined ? newFilters.letter : selectedLetter
        };

        try {
            const result = await drugService.getAllDrugs(params);
            setDrugs(result);
            setCurrentPage(1);
        } catch (err) {
            console.error("Failed to fetch drugs", err);
        }
    };

    useEffect(() => {
        fetchFilteredDrugs(); // Initial fetch with no filters
    }, []);

    const handleSearch = () => {
        setSearchTerm(inputValue);
        fetchFilteredDrugs({ query: inputValue });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleDrugClassKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchFilteredDrugs({ drug_class: drugClassInput });
        }
    };

    const handleLetterClick = (letter) => {
        const newLetter = selectedLetter === letter ? '' : letter;
        setSelectedLetter(newLetter);
        fetchFilteredDrugs({ letter: newLetter });
    };

    const handleClearFilters = () => {
        setInputValue('');
        setSearchTerm('');
        setDrugClassInput('');
        setSelectedLetter('');
        fetchFilteredDrugs({ query: '', drug_class: '', letter: '' });
    };

    const indexOfLastDrug = currentPage * drugsPerPage;
    const indexOfFirstDrug = indexOfLastDrug - drugsPerPage;
    const currentDrugs = drugs.slice(indexOfFirstDrug, indexOfLastDrug);
    const totalPages = Math.ceil(drugs.length / drugsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 9) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let left = Math.max(2, currentPage - 2);
            let right = Math.min(totalPages - 1, currentPage + 2);
            if (left > 2) pages.push('left-ellipsis');
            for (let i = left; i <= right; i++) pages.push(i);
            if (right < totalPages - 1) pages.push('right-ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    const uniqueClasses = [...new Set(drugs.map(d => d.drug_class).filter(Boolean))];

    return (
        <div className="explore-drugs-container">
            <h1 className="explore-drugs-title"><span className="highlight">Explore drugs</span></h1>
            <div className="explore-drugs-toolbar">
                <button className="filter-btn" onClick={() => setSidebarOpen(s => !s)}>
                    <img src={filterIcon} alt="Filter" className="filter-img" />
                </button>
                <div className="explore-drugs-search">
                    <input
                        type="text"
                        placeholder="Search drugs here"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="search-btn" onClick={handleSearch}>
                        <img src={searchIcon} alt="Search" className="search-img" />
                    </button>
                </div>
            </div>

            <div className="explore-drugs-page-layout">
                <div className={`sidebar-filter${sidebarOpen ? ' open' : ''}`}>
                    <div className="sidebar-section">
                        <button className="sidebar-section-header" onClick={() => setExpandFirstLetter(e => !e)}>
                            First Letter
                        </button>
                        {expandFirstLetter && (
                            <div className="sidebar-section-content">
                                {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
                                    .concat('0-9')
                                    .reduce((rows, letter, index) => {
                                        const rowIndex = Math.floor(index / 4);
                                        if (!rows[rowIndex]) rows[rowIndex] = [];
                                        rows[rowIndex].push(letter);
                                        return rows;
                                    }, [])
                                    .map((row, idx) => (
                                        <div className="sidebar-btn-row" key={`row-${idx}`}>
                                            {row.map((letter) => (
                                                <button
                                                    className={`sidebar-circle-btn${selectedLetter === letter ? ' active' : ''}`}
                                                    key={letter}
                                                    onClick={() => handleLetterClick(letter)}
                                                >
                                                    {letter}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="sidebar-section">
                        <button className="sidebar-section-header" onClick={() => setExpandDrugClass(e => !e)}>
                            Drug Class
                        </button>
                        {expandDrugClass && (
                            <div className="sidebar-section-content">
                                <input
                                    list="drug-class-options"
                                    className="sidebar-autocomplete-input"
                                    placeholder="Type a drug class..."
                                    value={drugClassInput}
                                    onChange={(e) => setDrugClassInput(e.target.value)}
                                    onKeyDown={handleDrugClassKeyDown}
                                />
                                <datalist id="drug-class-options">
                                    {uniqueClasses.map((cls, idx) => (
                                        <option key={idx} value={cls} />
                                    ))}
                                </datalist>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-section">
                        <button className="sidebar-section-header" onClick={handleClearFilters}>
                            Clear All Filters
                        </button>
                    </div>
                </div>

                <div className={`explore-drugs-main${sidebarOpen ? ' sidebar-open' : ''}`}>
                    <div className="drugs-grid">
                        {currentDrugs.length === 0 ? (
                            <div className="no-results">No results found</div>
                        ) : (
                            currentDrugs.map((drug) => (
                                <div className="drug-card" key={drug.id}>
                                    <div className="drug-title">{drug.name}</div>
                                    <hr className="drug-underline" />
                                    <div className="drug-label">Generic name:</div>
                                    <div className="drug-value">{drug.generic_name}</div>
                                    <div className="drug-label">Drug class:</div>
                                    <div className="drug-value">{drug.drug_class}</div>
                                    <button className="view-details-btn">View Details</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {getPageNumbers().map((page, idx) =>
                            page === 'left-ellipsis' || page === 'right-ellipsis' ? (
                                <span className="pagination-ellipsis" key={page + idx}>...</span>
                            ) : (
                                <button
                                    key={page}
                                    className={`pagination-page-btn${currentPage === page ? ' active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            )
                        )}
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreDrugs;
