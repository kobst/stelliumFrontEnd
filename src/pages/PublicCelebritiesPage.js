import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCelebrities } from '../Utilities/api';
import GuestChartCard from '../UI/dashboard/birthCharts/GuestChartCard';
import stelliumIcon from '../assets/StelliumIcon.svg';
import './CelebsPage.css';

const PublicCelebritiesPage = () => {
    const navigate = useNavigate();
    const [genderFilter, setGenderFilter] = useState('all');
    const [celebrities, setCelebrities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadCelebrities = async () => {
            try {
                setLoading(true);
                const data = await fetchCelebrities();
                setCelebrities(data || []);
            } catch (error) {
                console.error('Error fetching celebrities:', error);
            } finally {
                setLoading(false);
            }
        };
        loadCelebrities();
    }, []);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleCelebritySelect = (celebrity) => {
        navigate(`/celebrities/${celebrity._id}`);
    };

    const handleCreateChart = () => {
        navigate('/birthChartEntry');
    };

    // Filter celebrities by gender and search term
    const filteredCelebrities = celebrities.filter(celebrity => {
        const matchesGender = genderFilter === 'all' || celebrity.gender === genderFilter;
        const fullName = `${celebrity.firstName || ''} ${celebrity.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(searchTerm.toLowerCase());
        return matchesGender && matchesSearch;
    });

    // Map celebrity data to match GuestChartCard expected format
    const mapCelebrityToChart = (celebrity) => ({
        ...celebrity,
        birthDate: celebrity.dateOfBirth,
        profilePhotoUrl: celebrity.profilePhotoUrl || celebrity.photoUrl
    });

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

                {/* CTA Link */}
                <div className="public-cta-link">
                    <span onClick={handleCreateChart}>Sign Up For Your Free Account Today!</span>
                </div>

                {/* Search and Filter */}
                <div className="celebs-controls">
                    <input
                        type="text"
                        className="celebs-search"
                        placeholder="Search celebrities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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

                {/* Celebrity Cards Grid */}
                <div className="celebs-grid-container">
                    {loading ? (
                        <div className="celebs-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading celebrities...</p>
                        </div>
                    ) : filteredCelebrities.length === 0 ? (
                        <div className="celebs-empty">
                            <p>No celebrities found</p>
                        </div>
                    ) : (
                        <div className="celebs-grid">
                            {filteredCelebrities.map((celebrity) => (
                                <GuestChartCard
                                    key={celebrity._id}
                                    chart={mapCelebrityToChart(celebrity)}
                                    onClick={() => handleCelebritySelect(celebrity)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicCelebritiesPage;
