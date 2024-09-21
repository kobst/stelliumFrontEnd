import React, { useState, useEffect } from 'react';
import { getDailyTransitInterpretationData } from '../../Utilities/api';


const DailyReadingFromDb = () => {

    const [mostRelevantAspects, setMostRelevantAspects] = useState('');
    const [dailyTransitInterpretation, setDailyTransitInterpretation] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTodaysTransitData();
      }, []);
    
    const fetchTodaysTransitData = async () => {
    setLoading(true);
    setError(null);
    try {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const data = await getDailyTransitInterpretationData(today);
        
        if (data && data.length > 0) {
        const todayData = data.find(item => item.date === today) || data[0];
        const aspects = todayData.combinedDescription.split('\n').filter(aspect => aspect.trim() !== '');
        setMostRelevantAspects(aspects);
        setDailyTransitInterpretation(todayData.dailyTransitInterpretation);
        } else {
        setError('No data available for today');
        }
    } catch (err) {
        console.error('Error fetching transit data:', err);
        setError('Failed to fetch transit data');
    } finally {
        setLoading(false);
    }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
    <div style={{ color: 'white' }}>
      <h2>Today's Transit Interpretation</h2>
      <div className="most-relevant-aspect">
      <h3>Most Relevant Aspects</h3>
        <ul>
          {mostRelevantAspects.map((aspect, index) => (
            <li key={index}>{aspect}</li>
          ))}
        </ul>
      </div>
      <div className="daily-transit-interpretation">
        <h3>Daily Transit Interpretation</h3>
        <p>{dailyTransitInterpretation}</p>
      </div>
    </div>
  );

};

export default DailyReadingFromDb;

