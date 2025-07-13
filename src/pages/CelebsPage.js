import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CelebritiesTable from '../UI/prototype/CelebritiesTable';
import useStore from '../Utilities/store';
import lightLogo from '../assets/Light logo.png';
import './CelebsPage.css';

const CelebsPage = () => {
    const navigate = useNavigate();
    const switchUserContext = useStore(state => state.switchUserContext);
    const [genderFilter, setGenderFilter] = useState('all');

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleCelebritySelect = (celebrity) => {
        // Switch to celebrity context and navigate to their dashboard
        switchUserContext(celebrity);
        navigate(`/userDashboard/${celebrity._id}`);
    };

    return (
        <div className="celebs-page">
            <div className="celebs-container">
                {/* Back button */}
                <button className="back-button" onClick={handleBackToHome}>
                    ← Back to Home
                </button>

                {/* Header */}
                <div className="celebs-header">
                    <img className="celebs-logo" src={lightLogo} alt="Stellium logo" />
                    <h1 className="celebs-title">Celebrity Birth Charts</h1>
                    <p className="celebs-subtitle">
                        Explore the astrological profiles of famous personalities and discover their cosmic blueprints
                    </p>
                </div>

                {/* Gender Filter */}
                <div className="filter-section">
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${genderFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setGenderFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${genderFilter === 'male' ? 'active' : ''}`}
                            onClick={() => setGenderFilter('male')}
                        >
                            Male
                        </button>
                        <button 
                            className={`filter-btn ${genderFilter === 'female' ? 'active' : ''}`}
                            onClick={() => setGenderFilter('female')}
                        >
                            Female
                        </button>
                    </div>
                </div>

                {/* Celebrity Table */}
                <div className="celebs-table-container">
                    <CelebritiesTable 
                        onCelebritySelect={handleCelebritySelect}
                        genderFilter={genderFilter}
                        usePagination={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default CelebsPage;