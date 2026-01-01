import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CelebritiesTable from '../UI/prototype/CelebritiesTable';
import stelliumIcon from '../assets/StelliumIcon.svg';
import './CelebsPage.css';

const PublicCelebritiesPage = () => {
    const navigate = useNavigate();
    const [genderFilter, setGenderFilter] = useState('all');

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleCelebritySelect = (celebrity) => {
        // Navigate to public celebrity dashboard
        navigate(`/celebrities/${celebrity._id}`);
    };

    const handleCreateChart = () => {
        navigate('/birthChartEntry');
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
                    <img className="celebs-logo" src={stelliumIcon} alt="Stellium logo" />
                    <h1 className="celebs-title">Celebrity Birth Charts</h1>
                    <p className="celebs-subtitle">
                        Explore the astrological profiles of famous personalities and discover their cosmic blueprints
                    </p>
                </div>

                {/* CTA Banner */}
                <div className="public-cta-banner">
                    <span>Want to see your own birth chart?</span>
                    <button className="public-cta-btn" onClick={handleCreateChart}>
                        Create Your Chart →
                    </button>
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

export default PublicCelebritiesPage;
