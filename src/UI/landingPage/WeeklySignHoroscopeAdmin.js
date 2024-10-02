import React from 'react';
import { Link } from 'react-router-dom';
import { zodiacIcons } from '../../Utilities/constants';
import './DailySignHoroscopeMenu.css';
import DailyReading from './DailyReading';
import { useState } from 'react';

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const WeeklySignHoroscopeAdmin = ({transitAspectObjects, transits}) => {
    const [selectedSign, setSelectedSign] = useState(null);

    const handleSignClick = (sign) => {
      setSelectedSign(sign);
    };
  
  return (
    <div className="daily-sign-horoscope-menu">
      <div className="zodiac-grid">
      {zodiacSigns.map((sign, index) => (
          <div 
            key={sign} 
            className="zodiac-square"
            onClick={() => handleSignClick(sign)}
          >
            <img 
              src={zodiacIcons[index]} 
              alt={sign} 
              className="zodiac-icon"
            />
            <span className="zodiac-name">{sign}</span>
          </div>
        ))}
      </div>
      {selectedSign && (
        <div className="daily-reading-container">
          <DailyReading transitAspectObjects={transitAspectObjects} transits={transits} risingSign={selectedSign} />
        </div>
      )}
    </div>
  );
};

export default WeeklySignHoroscopeAdmin;