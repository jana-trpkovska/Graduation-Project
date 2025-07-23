import React, { useEffect, useState } from 'react';
import './ExploreDrugs.css';
import filterIcon from '../../assets/filter.png';
import searchIcon from '../../assets/search-icon.png';
import drugService from '../../repository/Repository';

const ExploreDrugs = () => {
    const [drugs, setDrugs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const drugsPerPage = 18;

    useEffect(() => {
        const fetchDrugs = async () => {
            try {
                const data = await drugService.getAllDrugs();
                setDrugs(data);
            } catch (error) {
                console.error("Error fetching drugs:", error);
            }
        };

        fetchDrugs();
    }, []);

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

    return (
        <div className="explore-drugs-container">
            <h1 className="explore-drugs-title"><span className="highlight">Explore drugs</span></h1>
            <div className="explore-drugs-toolbar">
                <button className="filter-btn" aria-label="Filter">
                    <img src={filterIcon} alt="Filter" className="filter-img" />
                </button>
                <div className="explore-drugs-search">
                    <input type="text" placeholder="Search drugs here" />
                    <button className="search-btn" aria-label="Search">
                        <img src={searchIcon} alt="Search" className="search-img" />
                    </button>
                </div>
            </div>
            <div className="drugs-grid">
                {currentDrugs.map((drug) => (
                    <div className="drug-card" key={drug.id}>
                        <div className="drug-title">{drug.name}</div>
                        <hr className="drug-underline" />
                        <div className="drug-label">Generic name:</div>
                        <div className="drug-value">{drug.generic_name}</div>
                        <div className="drug-label">Drug class:</div>
                        <div className="drug-value">{drug.drug_class}</div>
                        <button className="view-details-btn">View Details</button>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}>
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
                            disabled={currentPage === page}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default ExploreDrugs;
