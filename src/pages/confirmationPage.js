import React from 'react';
import useStore from '../Utilities/store';
import Ephemeris from '../UI/shared/Ephemeris';


const Confirmation = () => {
    const userId = useStore(state => state.userId);
    const rawBirthData = useStore(state => state.rawBirthData);
    const ascendantDegree = useStore(state => state.ascendantDegree);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'white' }}>Thank you for signing up!</h1>
            <p style={{ color: 'white' }}>Your profile has been created successfully.</p>
            {rawBirthData.planets && rawBirthData.houses && ascendantDegree && (
                <Ephemeris 
                    planets={rawBirthData.planets} 
                    houses={rawBirthData.houses} 
                    transits={[]} 
                    ascendantDegree={ascendantDegree} 
                />
            )}
        </div>
    );
};

export default Confirmation;