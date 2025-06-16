import React, { useState } from 'react';
import GuestSubjectsTable from './GuestSubjectsTable';
import AddGuestForm from './AddGuestForm';

function GuestsTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGuestAdded = () => {
    // Trigger refresh of the guest subjects table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="guests-tab">
      <GuestSubjectsTable key={refreshKey} />
      <AddGuestForm onGuestAdded={handleGuestAdded} />
    </div>
  );
}

export default GuestsTab;