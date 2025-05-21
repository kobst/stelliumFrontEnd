import React, { useState } from 'react';
import { getDailyTransitInterpretationData } from '../../../Utilities/api';
import './TransitInterpretationTable.css'; // Create this CSS file

function TransitInterpretationTable() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitData, setTransitData] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleFetchTransits = async () => {
    if (!selectedMonth || !selectedYear) {
      alert('Please select both a month and a year');
      return;
    }

    const monthIndex = months.indexOf(selectedMonth) + 1;
    const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
    const firstDayOfMonth = `${selectedYear}-${formattedMonth}-01`;

    setLoading(true);
    try {
      const data = await getDailyTransitInterpretationData(firstDayOfMonth);
      setTransitData(data);
      console.log('Transit Interpretation Data:', data);
    } catch (error) {
      console.error('Error fetching transit data:', error);
      alert('Error fetching transit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transit-interpretation">
      <h2>Transit Interpretation</h2>
      <div className="controls">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <button onClick={handleFetchTransits} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Transit Interpretations'}
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Combined Description</th>
              <th>Daily Transit Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {transitData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.combinedDescription}</td>
                <td>{item.dailyTransitInterpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransitInterpretationTable;